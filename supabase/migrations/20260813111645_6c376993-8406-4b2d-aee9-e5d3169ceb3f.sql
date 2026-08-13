CREATE OR REPLACE FUNCTION public.enforce_approved_host_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role <> 'host'::public.app_role
     AND (
       EXISTS (
         SELECT 1 FROM public.host_applications ha
         WHERE ha.user_id = NEW.user_id AND ha.status = 'approved'
       )
       OR EXISTS (
         SELECT 1 FROM public.host_eligibility he
         WHERE he.user_id = NEW.user_id AND he.status = 'approved'
       )
     ) THEN
    NEW.role := 'host'::public.app_role;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.repair_my_host_role()
RETURNS TABLE(repaired boolean, assigned_role text, message text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _approved boolean;
  _previous_role text;
  _role text;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'You must be signed in to repair your role.';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.host_applications
    WHERE user_id = _uid AND status = 'approved'
  ) OR EXISTS (
    SELECT 1 FROM public.host_eligibility
    WHERE user_id = _uid AND status = 'approved'
  ) INTO _approved;

  SELECT role::text INTO _previous_role
  FROM public.user_roles
  WHERE user_id = _uid
  LIMIT 1;

  IF NOT _approved THEN
    RETURN QUERY SELECT false, _previous_role, 'No approved host application was found for this account.';
    RETURN;
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (_uid, 'host'::public.app_role)
  ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;

  INSERT INTO public.admin_audit_log
    (admin_id, entity_type, entity_id, action, previous_status, new_status, notes)
  VALUES
    (_uid, 'user_role', _uid, 'self_role_repair', _previous_role, 'host',
     'Host ran the self-service role synchronization from onboarding.');

  SELECT role::text INTO _role
  FROM public.user_roles
  WHERE user_id = _uid
  LIMIT 1;

  RETURN QUERY SELECT _previous_role IS DISTINCT FROM _role, _role,
    CASE WHEN _previous_role IS DISTINCT FROM _role
      THEN 'Your account now has the host role.'
      ELSE 'Your account already has the host role.'
    END;
END;
$$;

REVOKE ALL ON FUNCTION public.repair_my_host_role() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.repair_my_host_role() TO authenticated, service_role;

ALTER PUBLICATION supabase_realtime ADD TABLE public.user_roles;