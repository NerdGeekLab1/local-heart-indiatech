
-- Replace views with SECURITY DEFINER functions (linter-safe)
DROP VIEW IF EXISTS public.profiles_public;
DROP VIEW IF EXISTS public.beta_wanderers_public;

CREATE OR REPLACE FUNCTION public.get_public_profile(_id uuid)
RETURNS TABLE(id uuid, first_name text, last_name text, avatar_url text, bio text, nationality text, travel_styles text[], interests text[])
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT id, first_name, last_name, avatar_url, bio, nationality, travel_styles, interests
  FROM public.profiles WHERE id = _id;
$$;

CREATE OR REPLACE FUNCTION public.get_public_profiles(_ids uuid[])
RETURNS TABLE(id uuid, first_name text, last_name text, avatar_url text, bio text, nationality text, travel_styles text[], interests text[])
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT id, first_name, last_name, avatar_url, bio, nationality, travel_styles, interests
  FROM public.profiles WHERE id = ANY(_ids);
$$;

CREATE OR REPLACE FUNCTION public.get_public_wanderers()
RETURNS TABLE(id uuid, user_id uuid, full_name text, city text, bio text, travel_styles text[], preferred_destinations text[], social_links jsonb, video_url text, score integer, missions_completed integer, total_videos integer, badge text, status text, created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT id, user_id, full_name, city, bio, travel_styles, preferred_destinations, social_links, video_url, score, missions_completed, total_videos, badge, status, created_at
  FROM public.beta_wanderers WHERE status = 'approved' ORDER BY score DESC;
$$;

CREATE OR REPLACE FUNCTION public.get_public_wanderer(_id uuid)
RETURNS TABLE(id uuid, user_id uuid, full_name text, city text, bio text, travel_styles text[], preferred_destinations text[], social_links jsonb, video_url text, score integer, missions_completed integer, total_videos integer, badge text, status text, created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT id, user_id, full_name, city, bio, travel_styles, preferred_destinations, social_links, video_url, score, missions_completed, total_videos, badge, status, created_at
  FROM public.beta_wanderers WHERE id = _id AND status = 'approved';
$$;

GRANT EXECUTE ON FUNCTION public.get_public_profile(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_profiles(uuid[]) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_wanderers() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_wanderer(uuid) TO anon, authenticated;

-- Drop the remaining feed-media SELECT policy; public URLs still resolve via bucket public flag.
DROP POLICY IF EXISTS "Feed media authenticated read" ON storage.objects;
