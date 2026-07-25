
-- Collapse users with multiple roles to their highest-priority role
WITH ranked AS (
  SELECT id, user_id, role,
    ROW_NUMBER() OVER (
      PARTITION BY user_id
      ORDER BY CASE role
        WHEN 'admin'::app_role THEN 1
        WHEN 'host'::app_role THEN 2
        WHEN 'traveler'::app_role THEN 3
        ELSE 4 END
    ) AS rn
  FROM public.user_roles
)
DELETE FROM public.user_roles ur
USING ranked r
WHERE ur.id = r.id AND r.rn > 1;

-- Enforce a single role per user
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_key;
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_key UNIQUE (user_id);

-- Update new-user trigger so it upserts a single role (defensive)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, first_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'first_name', ''))
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'traveler'::app_role))
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$function$;
