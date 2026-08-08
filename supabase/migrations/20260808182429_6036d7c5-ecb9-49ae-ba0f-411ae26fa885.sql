ALTER PUBLICATION supabase_realtime ADD TABLE public.host_applications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.host_eligibility;
ALTER PUBLICATION supabase_realtime ADD TABLE public.beta_wanderers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;

CREATE OR REPLACE FUNCTION public.approve_host_profile_application(_application_id uuid)
RETURNS public.host_applications
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_application public.host_applications%ROWTYPE;
  v_user_id uuid;
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

  UPDATE public.host_applications
  SET user_id = v_user_id,
      status = 'approved',
      reviewed_by = auth.uid(),
      reviewed_at = now(),
      updated_at = now()
  WHERE id = _application_id
  RETURNING * INTO v_application;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'host'::public.app_role)
  ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;

  INSERT INTO public.admin_audit_log
    (admin_id, entity_type, entity_id, action, previous_status, new_status, metadata)
  VALUES
    (auth.uid(), 'host_application', v_application.id, 'approve',
     COALESCE(v_application.status, 'pending'), 'approved',
     jsonb_build_object('user_id', v_user_id, 'email', v_application.email));

  RETURN v_application;
END;
$$;

REVOKE ALL ON FUNCTION public.approve_host_profile_application(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.approve_host_profile_application(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_host_profile_application(uuid) TO service_role;