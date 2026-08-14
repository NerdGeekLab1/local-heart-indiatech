ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS cover_url text,
  ADD COLUMN IF NOT EXISTS languages text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS response_time text,
  ADD COLUMN IF NOT EXISTS years_hosting integer NOT NULL DEFAULT 0;

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
    'reels', COALESCE((SELECT jsonb_agg(jsonb_build_object('id',f.id,'media_url',f.media_url,'media_type',f.media_type,'caption',f.caption,'location',f.location,'likes_count',f.likes_count,'created_at',f.created_at) ORDER BY f.created_at DESC) FROM public.feed_posts f WHERE f.user_id=v_id AND f.status='active'),'[]'::jsonb)
  ) INTO v_result FROM public.profiles p WHERE p.id=v_id;
  RETURN v_result;
END;
$function$;