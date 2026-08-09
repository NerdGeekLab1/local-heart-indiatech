CREATE UNIQUE INDEX IF NOT EXISTS host_applications_email_unique
ON public.host_applications (lower(email));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requested_role text := COALESCE(NEW.raw_user_meta_data->>'role', 'traveler');
BEGIN
  INSERT INTO public.profiles (id, email, first_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'first_name', ''))
  ON CONFLICT (id) DO NOTHING;

  IF requested_role <> 'host' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'traveler'::public.app_role)
    ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;
  END IF;

  IF requested_role = 'host' THEN
    UPDATE public.host_applications
    SET user_id = NEW.id,
        updated_at = now()
    WHERE lower(email) = lower(NEW.email)
      AND user_id IS NULL;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.approve_host_profile_application(_application_id uuid)
RETURNS public.host_applications
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_application public.host_applications%ROWTYPE;
  v_user_id uuid;
  v_previous_status text;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Only admins can approve host profile applications';
  END IF;

  SELECT * INTO v_application
  FROM public.host_applications
  WHERE id = _application_id
  FOR UPDATE;

  IF v_application.id IS NULL THEN
    RAISE EXCEPTION 'Host profile application not found';
  END IF;

  v_previous_status := v_application.status;
  v_user_id := v_application.user_id;

  IF v_user_id IS NULL THEN
    SELECT u.id INTO v_user_id
    FROM auth.users u
    WHERE lower(u.email) = lower(v_application.email)
      AND u.email_confirmed_at IS NOT NULL
    ORDER BY u.created_at DESC
    LIMIT 1;
  END IF;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'The host must create an account and confirm their email before approval';
  END IF;

  DELETE FROM public.user_roles WHERE user_id = v_user_id;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'host'::public.app_role);

  UPDATE public.host_applications
  SET user_id = v_user_id,
      status = 'approved',
      reviewed_by = auth.uid(),
      reviewed_at = now(),
      updated_at = now()
  WHERE id = _application_id
  RETURNING * INTO v_application;

  INSERT INTO public.user_onboarding_progress (user_id, role, completed_steps)
  VALUES (v_user_id, 'host', ARRAY['application_submitted', 'email_confirmed', 'admin_approved']::text[])
  ON CONFLICT (user_id) DO UPDATE
  SET role = 'host',
      completed_steps = ARRAY(
        SELECT DISTINCT step
        FROM unnest(public.user_onboarding_progress.completed_steps || ARRAY['application_submitted', 'email_confirmed', 'admin_approved']::text[]) AS step
      ),
      updated_at = now();

  INSERT INTO public.admin_audit_log
    (admin_id, entity_type, entity_id, action, previous_status, new_status, metadata)
  VALUES
    (auth.uid(), 'host_application', v_application.id, 'approve',
     v_previous_status, 'approved',
     jsonb_build_object('user_id', v_user_id, 'email', v_application.email));

  RETURN v_application;
END;
$$;

REVOKE ALL ON FUNCTION public.approve_host_profile_application(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.approve_host_profile_application(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_host_profile_application(uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.get_host_onboarding_status()
RETURNS TABLE(
  application_status text,
  application_submitted boolean,
  email_confirmed boolean,
  admin_approved boolean,
  onboarding_complete boolean,
  submitted_at timestamptz,
  reviewed_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT
    ha.status,
    true,
    u.email_confirmed_at IS NOT NULL,
    ha.status = 'approved',
    COALESCE('onboarding_complete' = ANY(uop.completed_steps), false),
    ha.created_at,
    ha.reviewed_at
  FROM auth.users u
  LEFT JOIN public.host_applications ha
    ON ha.user_id = u.id OR lower(ha.email) = lower(u.email)
  LEFT JOIN public.user_onboarding_progress uop
    ON uop.user_id = u.id AND uop.role = 'host'
  WHERE u.id = auth.uid()
  ORDER BY ha.created_at DESC NULLS LAST
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_host_onboarding_status() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_host_onboarding_status() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_host_onboarding_status() TO service_role;

CREATE OR REPLACE FUNCTION public.notify_host_application_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_subject text;
  v_message text;
  v_template text;
  v_event text;
  v_login_url text := 'https://roamyoo.lovable.app/login/host';
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_template := 'host_application_received';
    v_event := 'host_application_submitted';
    v_subject := 'We received your Travelista host registration';
    v_message := '<p>Hi ' || COALESCE(NEW.full_name, 'there') || ',</p><p>We received your Become a Host registration. Confirm your email, then track your review status in Travelista.</p><p>— The Travelista Team</p>';
  ELSIF OLD.status IS DISTINCT FROM NEW.status THEN
    v_template := 'host_application_status_update';
    v_event := 'host_application_status_' || NEW.status;
    v_subject := 'Your Travelista host registration is ' || replace(NEW.status, '_', ' ');
    IF NEW.status = 'approved' THEN
      v_message := '<p>Hi ' || COALESCE(NEW.full_name, 'there') || ',</p><p>Your host application is approved. You can now sign in to your Host portal and complete onboarding.</p><p><a href="' || v_login_url || '">Open Host login</a></p><p>— The Travelista Team</p>';
    ELSIF NEW.status = 'rejected' THEN
      v_message := '<p>Hi ' || COALESCE(NEW.full_name, 'there') || ',</p><p>We could not approve your host application at this time. Review the application requirements before submitting a future application.</p><p>— The Travelista Team</p>';
    ELSE
      v_message := '<p>Hi ' || COALESCE(NEW.full_name, 'there') || ',</p><p>Your host application status is now <strong>' || replace(NEW.status, '_', ' ') || '</strong>.</p><p>— The Travelista Team</p>';
    END IF;
  ELSE
    RETURN NEW;
  END IF;

  INSERT INTO public.email_notifications (template_name, recipient_email, recipient_user_id, subject, body_html, trigger_event, payload)
  VALUES (v_template, NEW.email, NEW.user_id, v_subject, v_message, v_event,
    jsonb_build_object('application_id', NEW.id, 'status', NEW.status, 'program', 'become_host', 'login_url', v_login_url));
  RETURN NEW;
END;
$$;