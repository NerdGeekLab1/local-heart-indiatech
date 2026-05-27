GRANT SELECT ON public.feature_flags TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.feature_flags TO authenticated;
GRANT ALL ON public.feature_flags TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_feature_flags TO authenticated;
GRANT ALL ON public.user_feature_flags TO service_role;

GRANT INSERT ON public.beta_waitlist TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.beta_waitlist TO authenticated;
GRANT ALL ON public.beta_waitlist TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.host_eligibility TO authenticated;
GRANT ALL ON public.host_eligibility TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_permissions TO authenticated;
GRANT ALL ON public.user_permissions TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_notifications TO authenticated;
GRANT ALL ON public.email_notifications TO service_role;

GRANT SELECT, INSERT ON public.admin_audit_log TO authenticated;
GRANT ALL ON public.admin_audit_log TO service_role;

DROP POLICY IF EXISTS "Admins manage waitlist" ON public.beta_waitlist;
CREATE POLICY "Admins update waitlist"
  ON public.beta_waitlist
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Users update own pending application" ON public.host_eligibility;
CREATE POLICY "Users update own pending host application"
  ON public.host_eligibility
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status IN ('pending', 'under_review', 'waitlisted'))
  WITH CHECK (auth.uid() = user_id AND status IN ('pending', 'under_review', 'waitlisted'));

CREATE POLICY "Admins update host applications"
  ON public.host_eligibility
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can manage permissions" ON public.user_permissions;
CREATE POLICY "Admins can manage permissions"
  ON public.user_permissions
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles"
  ON public.user_roles
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.approve_host_application(_application_id uuid)
RETURNS public.host_eligibility
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_application public.host_eligibility%ROWTYPE;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can approve host applications';
  END IF;

  UPDATE public.host_eligibility
  SET status = 'approved', reviewed_by = auth.uid(), reviewed_at = now(), updated_at = now()
  WHERE id = _application_id
  RETURNING * INTO v_application;

  IF v_application.id IS NULL THEN
    RAISE EXCEPTION 'Host application not found';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_application.user_id, 'host'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  INSERT INTO public.admin_audit_log(admin_id, entity_type, entity_id, action, new_status, metadata)
  VALUES (auth.uid(), 'host_eligibility', v_application.id, 'approve', 'approved', jsonb_build_object('user_id', v_application.user_id, 'email', v_application.email));

  RETURN v_application;
END;
$$;

REVOKE ALL ON FUNCTION public.approve_host_application(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.approve_host_application(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_host_application(uuid) TO service_role;