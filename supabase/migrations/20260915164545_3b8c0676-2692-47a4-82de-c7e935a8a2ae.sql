CREATE OR REPLACE FUNCTION public.get_public_wanderers_showcase()
RETURNS TABLE(
  id uuid,
  user_id uuid,
  full_name text,
  city text,
  bio text,
  travel_styles text[],
  preferred_destinations text[],
  social_links jsonb,
  video_url text,
  score integer,
  missions_completed integer,
  total_videos integer,
  badge text,
  status text,
  created_at timestamptz,
  avatar_url text,
  stamps jsonb,
  stamp_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    w.id, w.user_id, w.full_name, w.city, w.bio, w.travel_styles,
    w.preferred_destinations, w.social_links, w.video_url, w.score,
    w.missions_completed, w.total_videos, w.badge, w.status, w.created_at,
    p.avatar_url,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'stamp_key', s.stamp_key,
          'tier', s.tier,
          'category', s.category,
          'earned_at', s.earned_at
        ) ORDER BY s.earned_at DESC
      ) FILTER (WHERE s.id IS NOT NULL),
      '[]'::jsonb
    ) AS stamps,
    COUNT(s.id) AS stamp_count
  FROM public.beta_wanderers w
  LEFT JOIN public.profiles p ON p.id = w.user_id
  LEFT JOIN public.traveler_stamps s ON s.user_id = w.user_id
  WHERE w.status = 'approved'
  GROUP BY w.id, p.avatar_url
  ORDER BY w.score DESC;
$$;

CREATE OR REPLACE FUNCTION public.get_public_wanderer_showcase(_id uuid)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  full_name text,
  city text,
  bio text,
  travel_styles text[],
  preferred_destinations text[],
  social_links jsonb,
  video_url text,
  score integer,
  missions_completed integer,
  total_videos integer,
  badge text,
  status text,
  created_at timestamptz,
  avatar_url text,
  stamps jsonb,
  stamp_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.get_public_wanderers_showcase() WHERE id = _id;
$$;

REVOKE ALL ON FUNCTION public.get_public_wanderers_showcase() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_public_wanderer_showcase(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_wanderers_showcase() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_wanderer_showcase(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_wanderers_showcase() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_public_wanderer_showcase(uuid) TO service_role;