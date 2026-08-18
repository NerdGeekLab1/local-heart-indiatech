-- 1. Bookings: persist the traveler's chosen special requests / add-ons
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS special_requests text[] NOT NULL DEFAULT '{}'::text[];

-- 2. Host-managed add-ons (e.g. wine bottle, birthday cake)
CREATE TABLE IF NOT EXISTS public.host_addons (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  host_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  emoji text NOT NULL DEFAULT '✨',
  description text,
  price numeric NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.host_addons TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.host_addons TO authenticated;
GRANT ALL ON public.host_addons TO service_role;

ALTER TABLE public.host_addons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Active add-ons are publicly viewable" ON public.host_addons;
CREATE POLICY "Active add-ons are publicly viewable" ON public.host_addons
  FOR SELECT USING (is_active = true OR auth.uid() = host_id);

DROP POLICY IF EXISTS "Hosts manage their own add-ons" ON public.host_addons;
CREATE POLICY "Hosts manage their own add-ons" ON public.host_addons
  FOR ALL TO authenticated USING (auth.uid() = host_id) WITH CHECK (auth.uid() = host_id);

DROP TRIGGER IF EXISTS host_addons_updated_at ON public.host_addons;
CREATE TRIGGER host_addons_updated_at BEFORE UPDATE ON public.host_addons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS host_addons_host_id_idx ON public.host_addons(host_id);

-- 3. Chat presence status shown in live chat threads
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS presence_status text NOT NULL DEFAULT 'offline';

-- 4. Expose host add-ons on the public host payload used by the booking page
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
    'profile', jsonb_build_object('id',p.id,'username',p.username,'full_name',trim(concat_ws(' ',p.first_name,p.last_name)),'city',p.city,'tagline',p.tagline,'bio',p.bio,'avatar_url',p.avatar_url,'cover_url',p.cover_url,'services',p.services,'specialties',p.specialties,'languages',p.languages,'response_time',p.response_time,'years_hosting',p.years_hosting,'social_links',p.social_links,'price_per_day',p.price_per_day,'host_since',p.host_since,'presence_status',p.presence_status),
    'experiences', COALESCE((SELECT jsonb_agg(to_jsonb(e) ORDER BY e.created_at DESC) FROM public.experiences e WHERE e.host_id=v_id AND e.status='approved'),'[]'::jsonb),
    'reviews', COALESCE((SELECT jsonb_agg(to_jsonb(r) ORDER BY r.created_at DESC) FROM public.reviews r WHERE r.host_id=v_id),'[]'::jsonb),
    'properties', COALESCE((SELECT jsonb_agg(to_jsonb(x) ORDER BY x.created_at DESC) FROM public.host_properties x WHERE x.host_id=v_id AND x.status='approved'),'[]'::jsonb),
    'dishes', COALESCE((SELECT jsonb_agg(to_jsonb(x) ORDER BY x.created_at DESC) FROM public.host_dishes x WHERE x.host_id=v_id AND x.status='approved'),'[]'::jsonb),
    'transports', COALESCE((SELECT jsonb_agg(to_jsonb(x) ORDER BY x.created_at DESC) FROM public.host_transports x WHERE x.host_id=v_id AND x.status='approved'),'[]'::jsonb),
    'addons', COALESCE((SELECT jsonb_agg(jsonb_build_object('id',a.id,'name',a.name,'emoji',a.emoji,'description',a.description,'price',a.price) ORDER BY a.created_at) FROM public.host_addons a WHERE a.host_id=v_id AND a.is_active),'[]'::jsonb),
    'reels', COALESCE((SELECT jsonb_agg(jsonb_build_object('id',f.id,'media_url',f.media_url,'media_type',f.media_type,'caption',f.caption,'location',f.location,'likes_count',f.likes_count,'created_at',f.created_at) ORDER BY f.created_at DESC) FROM public.feed_posts f WHERE f.user_id=v_id AND f.status='active' AND f.reel_status='approved'),'[]'::jsonb)
  ) INTO v_result FROM public.profiles p WHERE p.id=v_id;
  RETURN v_result;
END;
$function$;