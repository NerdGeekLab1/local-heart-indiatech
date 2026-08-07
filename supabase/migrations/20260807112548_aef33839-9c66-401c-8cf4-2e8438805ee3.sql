CREATE TABLE public.form_controls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_key text NOT NULL UNIQUE CHECK (form_key ~ '^[a-z0-9_]+$'),
  label text NOT NULL CHECK (char_length(label) BETWEEN 2 AND 100),
  route text NOT NULL CHECK (route LIKE '/%'),
  category text NOT NULL CHECK (category IN ('authentication','application','community','booking','support','content')),
  audience text NOT NULL CHECK (audience IN ('public','traveler','host','admin','beta')),
  description text,
  enabled boolean NOT NULL DEFAULT true,
  disabled_message text NOT NULL DEFAULT 'This form is temporarily unavailable. Please try again later.',
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.form_controls TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.form_controls TO authenticated;
GRANT ALL ON public.form_controls TO service_role;
ALTER TABLE public.form_controls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read form availability" ON public.form_controls FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage form availability" ON public.form_controls FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE TRIGGER update_form_controls_updated_at BEFORE UPDATE ON public.form_controls FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.form_controls (form_key, label, route, category, audience, description) VALUES
('account_signup','Account sign up','/signup','authentication','public','Traveler account registration'),
('traveler_login','Traveler sign in','/login/traveler','authentication','public','Traveler portal sign in'),
('host_login','Host sign in','/login/host','authentication','public','Host portal sign in'),
('admin_login','Admin sign in','/admin-login','authentication','admin','Administrator portal sign in'),
('password_recovery','Password recovery','/forgot-password','authentication','public','Password reset request and update'),
('become_host','Become a Host','/become-host','application','public','Standard host profile and service registration'),
('host_eligibility_beta','Host Foreign Travelers','/host-eligibility','application','beta','Beta global-host eligibility and credibility program'),
('beta_wanderer','Beta Wanderer application','/beta-wanderer-apply','application','traveler','Creator program application'),
('beta_waitlist','Beta waitlist','/beta-waitlist','application','public','Public beta waitlist registration'),
('booking','Experience booking','/book/:id','booking','traveler','Traveler booking checkout'),
('host_trip','Host trip','/host-trip','content','host','Trip listing creation'),
('feed_post','Traveler feed post','/feed','community','traveler','Traveler story and media publishing'),
('grievance','Grievance submission','/grievances','support','traveler','Support and dispute ticket submission')
ON CONFLICT (form_key) DO NOTHING;

CREATE OR REPLACE FUNCTION public.approve_host_profile_application(_application_id uuid)
RETURNS public.host_applications
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_application public.host_applications%ROWTYPE;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Only admins can approve host profile applications';
  END IF;

  UPDATE public.host_applications
  SET status = 'approved', reviewed_by = auth.uid(), reviewed_at = now(), updated_at = now()
  WHERE id = _application_id
  RETURNING * INTO v_application;

  IF v_application.id IS NULL THEN
    RAISE EXCEPTION 'Host profile application not found';
  END IF;

  IF v_application.user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_application.user_id, 'host'::public.app_role)
    ON CONFLICT (user_id) DO UPDATE SET role = 'host'::public.app_role;
  END IF;

  INSERT INTO public.admin_audit_log (admin_id, entity_type, entity_id, action, previous_status, new_status, metadata)
  VALUES (auth.uid(), 'host_application', v_application.id, 'approve', 'pending', 'approved', jsonb_build_object('user_id', v_application.user_id, 'email', v_application.email));

  RETURN v_application;
END;
$$;
GRANT EXECUTE ON FUNCTION public.approve_host_profile_application(uuid) TO authenticated;

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
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_template := 'host_application_received';
    v_event := 'host_application_submitted';
    v_subject := 'We received your Travelista host registration';
    v_message := '<p>Hi ' || COALESCE(NEW.full_name, 'there') || ',</p><p>We received your Become a Host registration. Your application is pending review.</p><p>We will email you whenever the review status changes.</p><p>— The Travelista Team</p>';
  ELSIF OLD.status IS DISTINCT FROM NEW.status THEN
    v_template := 'host_application_status_update';
    v_event := 'host_application_status_' || NEW.status;
    v_subject := 'Your Travelista host registration is ' || replace(NEW.status, '_', ' ');
    v_message := '<p>Hi ' || COALESCE(NEW.full_name, 'there') || ',</p><p>Your Become a Host application status is now <strong>' || replace(NEW.status, '_', ' ') || '</strong>.</p><p>— The Travelista Team</p>';
  ELSE
    RETURN NEW;
  END IF;

  INSERT INTO public.email_notifications (template_name, recipient_email, recipient_user_id, subject, body_html, trigger_event, payload)
  VALUES (v_template, NEW.email, NEW.user_id, v_subject, v_message, v_event, jsonb_build_object('application_id', NEW.id, 'status', NEW.status, 'program', 'become_host'));
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_host_eligibility_change()
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
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_template := 'host_eligibility_received';
    v_event := 'host_eligibility_submitted';
    v_subject := 'We received your Host Foreign Travelers beta application';
    v_message := '<p>Hi ' || COALESCE(NEW.full_name, 'there') || ',</p><p>We received your application for the Host Foreign Travelers beta program. Your eligibility score is <strong>' || NEW.eligibility_score || '/100</strong>.</p><p>— The Travelista Team</p>';
  ELSIF OLD.status IS DISTINCT FROM NEW.status THEN
    v_template := 'host_eligibility_status_update';
    v_event := 'host_eligibility_status_' || NEW.status;
    v_subject := 'Your Host Foreign Travelers beta status is ' || replace(NEW.status, '_', ' ');
    v_message := '<p>Hi ' || COALESCE(NEW.full_name, 'there') || ',</p><p>Your Host Foreign Travelers beta application status is now <strong>' || replace(NEW.status, '_', ' ') || '</strong>.</p><p>— The Travelista Team</p>';
  ELSE
    RETURN NEW;
  END IF;

  INSERT INTO public.email_notifications (template_name, recipient_email, recipient_user_id, subject, body_html, trigger_event, payload)
  VALUES (v_template, NEW.email, NEW.user_id, v_subject, v_message, v_event, jsonb_build_object('application_id', NEW.id, 'status', NEW.status, 'program', 'host_eligibility_beta', 'score', NEW.eligibility_score));
  RETURN NEW;
END;
$$;