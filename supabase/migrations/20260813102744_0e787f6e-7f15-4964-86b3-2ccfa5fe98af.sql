ALTER TABLE public.admin_audit_log REPLICA IDENTITY FULL;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'admin_audit_log'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_audit_log;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.repair_my_host_role()
RETURNS TABLE(repaired boolean, assigned_role text, message text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _approved boolean;
  _role text;
BEGIN
  IF _uid IS NULL THEN
    RETURN QUERY SELECT false, NULL::text, 'You must be signed in to repair your role.';
    RETURN;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.host_applications
    WHERE user_id = _uid AND status = 'approved'
  ) OR EXISTS (
    SELECT 1 FROM public.host_eligibility
    WHERE user_id = _uid AND status = 'approved'
  ) INTO _approved;

  IF NOT _approved THEN
    SELECT role::text INTO _role FROM public.user_roles WHERE user_id = _uid LIMIT 1;
    RETURN QUERY SELECT false, _role, 'No approved host application found for your account, so no repair was needed.';
    RETURN;
  END IF;

  DELETE FROM public.user_roles WHERE user_id = _uid AND role <> 'host'::app_role;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_uid, 'host'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  INSERT INTO public.admin_audit_log (admin_id, entity_type, entity_id, action, new_status, notes)
  VALUES (_uid, 'user_role', _uid, 'self_role_repair', 'host', 'Host ran the self-serve role repair from the onboarding page.');

  SELECT role::text INTO _role FROM public.user_roles WHERE user_id = _uid LIMIT 1;
  RETURN QUERY SELECT true, _role, 'Your account now holds the host role. Sign out and back in if the dashboard still looks wrong.';
END;
$$;

GRANT EXECUTE ON FUNCTION public.repair_my_host_role() TO authenticated;