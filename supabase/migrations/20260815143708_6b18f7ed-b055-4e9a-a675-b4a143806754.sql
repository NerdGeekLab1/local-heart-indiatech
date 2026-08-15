ALTER TABLE public.feed_posts
  ADD COLUMN IF NOT EXISTS reel_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS reel_reviewed_by uuid,
  ADD COLUMN IF NOT EXISTS reel_reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS reel_review_notes text;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'feed_posts_reel_status_check') THEN
    ALTER TABLE public.feed_posts
      ADD CONSTRAINT feed_posts_reel_status_check
      CHECK (reel_status IN ('pending','approved','rejected'));
  END IF;
END $$;

UPDATE public.feed_posts SET reel_status = 'approved' WHERE status = 'active' AND reel_status = 'pending';

CREATE OR REPLACE FUNCTION public.guard_feed_post_reel_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.reel_status IS DISTINCT FROM OLD.reel_status
     AND NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    NEW.reel_status := OLD.reel_status;
    NEW.reel_reviewed_by := OLD.reel_reviewed_by;
    NEW.reel_reviewed_at := OLD.reel_reviewed_at;
    NEW.reel_review_notes := OLD.reel_review_notes;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_feed_post_reel_status ON public.feed_posts;
CREATE TRIGGER trg_guard_feed_post_reel_status
BEFORE UPDATE ON public.feed_posts
FOR EACH ROW EXECUTE FUNCTION public.guard_feed_post_reel_status();

CREATE OR REPLACE FUNCTION public.get_public_host(_identifier text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_id uuid; v_result jsonb;
BEGIN
  SELECT p.id INTO v_id FROM public.profiles p
  JOIN public.user_roles ur ON ur.user_id=p.id AND ur.role='host'::public.app_role
  JOIN public.host_applications ha ON ha.user_id=p.id AND ha.status IN ('approved','verified')
  WHERE p.is_public AND (lower(p.username)=lower(_identifier) OR p.id::text=_identifier) LIMIT 1;
  IF v_id IS NULL THEN RETURN NULL; END IF;
  SELECT jsonb_build_object(
    'profile', jsonb_build_object('id',p.id,'username',p.username,'full_name',trim(concat_ws(' ',p.first_name,p.last_name)),'city',p.city,'tagline',p.tagline,'bio',p.bio,'avatar_url',p.avatar_url,'cover_url',p.cover_url,'services',p.services,'specialties',p.specialties,'languages',p.languages,'response_time',p.response_time,'years_hosting',p.years_hosting,'social_links',p.social_links,'price_per_day',p.price_per_day,'host_since',p.host_since),
    'experiences', COALESCE((SELECT jsonb_agg(to_jsonb(e) ORDER BY e.created_at DESC) FROM public.experiences e WHERE e.host_id=v_id AND e.status='approved'),'[]'::jsonb),
    'reviews', COALESCE((SELECT jsonb_agg(to_jsonb(r) ORDER BY r.created_at DESC) FROM public.reviews r WHERE r.host_id=v_id),'[]'::jsonb),
    'properties', COALESCE((SELECT jsonb_agg(to_jsonb(x) ORDER BY x.created_at DESC) FROM public.host_properties x WHERE x.host_id=v_id AND x.status='approved'),'[]'::jsonb),
    'dishes', COALESCE((SELECT jsonb_agg(to_jsonb(x) ORDER BY x.created_at DESC) FROM public.host_dishes x WHERE x.host_id=v_id AND x.status='approved'),'[]'::jsonb),
    'transports', COALESCE((SELECT jsonb_agg(to_jsonb(x) ORDER BY x.created_at DESC) FROM public.host_transports x WHERE x.host_id=v_id AND x.status='approved'),'[]'::jsonb),
    'reels', COALESCE((SELECT jsonb_agg(jsonb_build_object('id',f.id,'media_url',f.media_url,'media_type',f.media_type,'caption',f.caption,'location',f.location,'likes_count',f.likes_count,'created_at',f.created_at) ORDER BY f.created_at DESC) FROM public.feed_posts f WHERE f.user_id=v_id AND f.status='active' AND f.reel_status='approved'),'[]'::jsonb)
  ) INTO v_result FROM public.profiles p WHERE p.id=v_id;
  RETURN v_result;
END;
$function$;