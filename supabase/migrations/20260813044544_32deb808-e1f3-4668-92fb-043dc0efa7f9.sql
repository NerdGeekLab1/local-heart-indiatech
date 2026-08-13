-- 1) Backfill: approved host applications must carry the host role
UPDATE public.user_roles ur
SET role = 'host'::public.app_role
WHERE ur.role <> 'host'::public.app_role
  AND EXISTS (
    SELECT 1 FROM public.host_applications ha
    WHERE ha.status = 'approved' AND ha.user_id = ur.user_id
  );

INSERT INTO public.user_roles (user_id, role)
SELECT DISTINCT ha.user_id, 'host'::public.app_role
FROM public.host_applications ha
WHERE ha.status = 'approved'
  AND ha.user_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = ha.user_id)
ON CONFLICT (user_id) DO UPDATE SET role = 'host'::public.app_role;

-- 2) Constraint/validation: an approved host can never hold a traveler role
CREATE OR REPLACE FUNCTION public.enforce_approved_host_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.role <> 'host'::public.app_role
     AND EXISTS (
       SELECT 1 FROM public.host_applications ha
       WHERE ha.user_id = NEW.user_id AND ha.status = 'approved'
     ) THEN
    NEW.role := 'host'::public.app_role;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_approved_host_role ON public.user_roles;
CREATE TRIGGER trg_enforce_approved_host_role
BEFORE INSERT OR UPDATE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.enforce_approved_host_role();

-- 3) Onboarding status now reports the role actually assigned to the account
DROP FUNCTION IF EXISTS public.get_host_onboarding_status();
CREATE OR REPLACE FUNCTION public.get_host_onboarding_status()
RETURNS TABLE(application_status text, application_submitted boolean, email_confirmed boolean, admin_approved boolean, onboarding_complete boolean, submitted_at timestamp with time zone, reviewed_at timestamp with time zone, assigned_role text, role_matches_approval boolean)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
  SELECT
    ha.status,
    ha.id IS NOT NULL,
    u.email_confirmed_at IS NOT NULL,
    ha.status = 'approved',
    COALESCE('onboarding_complete' = ANY(uop.completed_steps), false),
    ha.created_at,
    ha.reviewed_at,
    ur.role::text,
    CASE WHEN ha.status = 'approved' THEN ur.role = 'host'::public.app_role ELSE true END
  FROM auth.users u
  LEFT JOIN public.host_applications ha
    ON ha.user_id = u.id OR lower(ha.email) = lower(u.email)
  LEFT JOIN public.user_onboarding_progress uop
    ON uop.user_id = u.id AND uop.role = 'host'
  LEFT JOIN public.user_roles ur ON ur.user_id = u.id
  WHERE u.id = auth.uid()
  ORDER BY ha.created_at DESC NULLS LAST
  LIMIT 1;
$$;