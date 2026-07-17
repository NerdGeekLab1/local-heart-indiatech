
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS social_links jsonb NOT NULL DEFAULT '{}'::jsonb;

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP FUNCTION IF EXISTS public.get_public_profile(uuid);
DROP FUNCTION IF EXISTS public.get_public_profiles(uuid[]);

CREATE FUNCTION public.get_public_profile(_id uuid)
 RETURNS TABLE(id uuid, first_name text, last_name text, avatar_url text, bio text, nationality text, travel_styles text[], interests text[], social_links jsonb)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT id, first_name, last_name, avatar_url, bio, nationality, travel_styles, interests, social_links
  FROM public.profiles WHERE id = _id;
$function$;

CREATE FUNCTION public.get_public_profiles(_ids uuid[])
 RETURNS TABLE(id uuid, first_name text, last_name text, avatar_url text, bio text, nationality text, travel_styles text[], interests text[], social_links jsonb)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT id, first_name, last_name, avatar_url, bio, nationality, travel_styles, interests, social_links
  FROM public.profiles WHERE id = ANY(_ids);
$function$;
