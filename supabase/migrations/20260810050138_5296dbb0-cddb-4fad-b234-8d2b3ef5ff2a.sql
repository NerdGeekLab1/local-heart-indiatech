-- 1. Case-insensitive uniqueness for profile emails (one account per address)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_lower_unique
  ON public.profiles (lower(email)) WHERE email IS NOT NULL;

-- 2. Helper: is this email already registered anywhere? (returns boolean only)
CREATE OR REPLACE FUNCTION public.email_already_registered(_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users u WHERE lower(u.email) = lower(trim(_email))
  ) OR EXISTS (
    SELECT 1 FROM public.host_applications ha WHERE lower(ha.email) = lower(trim(_email))
  );
$$;

REVOKE ALL ON FUNCTION public.email_already_registered(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.email_already_registered(text) TO anon, authenticated;

-- 3. Reject host applications from emails that already belong to a traveler account
CREATE OR REPLACE FUNCTION public.enforce_unique_host_application_identity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id uuid;
  v_role public.app_role;
BEGIN
  SELECT u.id INTO v_user_id
  FROM auth.users u
  WHERE lower(u.email) = lower(trim(NEW.email))
  ORDER BY u.created_at DESC
  LIMIT 1;

  IF v_user_id IS NOT NULL THEN
    SELECT ur.role INTO v_role FROM public.user_roles ur WHERE ur.user_id = v_user_id;
    IF v_role IS NOT NULL AND v_role <> 'host'::public.app_role THEN
      RAISE EXCEPTION 'This email is already registered as a % account. Each email can hold only one role.', v_role;
    END IF;
    NEW.user_id := COALESCE(NEW.user_id, v_user_id);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_unique_host_application_identity ON public.host_applications;
CREATE TRIGGER trg_unique_host_application_identity
  BEFORE INSERT ON public.host_applications
  FOR EACH ROW EXECUTE FUNCTION public.enforce_unique_host_application_identity();