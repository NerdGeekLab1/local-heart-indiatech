ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS verification_status text NOT NULL DEFAULT 'not_applied'
CHECK (verification_status IN ('not_applied','pending','verified','rejected'));

CREATE TABLE public.host_verification_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id uuid NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','verified','rejected')),
  milestone_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  review_notes text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.host_verification_applications TO authenticated;
GRANT UPDATE ON public.host_verification_applications TO authenticated;
GRANT ALL ON public.host_verification_applications TO service_role;
ALTER TABLE public.host_verification_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Hosts view own verification application"
ON public.host_verification_applications FOR SELECT TO authenticated
USING (host_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Hosts submit own verification application"
ON public.host_verification_applications FOR INSERT TO authenticated
WITH CHECK (host_id = auth.uid());
CREATE POLICY "Admins review verification applications"
ON public.host_verification_applications FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE TRIGGER update_host_verification_applications_updated_at
BEFORE UPDATE ON public.host_verification_applications
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.apply_for_host_verification()
RETURNS public.host_verification_applications
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_profile public.profiles%ROWTYPE;
  v_score integer := 0;
  v_listings integer := 0;
  v_completed integer := 0;
  v_rating numeric := 0;
  v_reviews integer := 0;
  v_result public.host_verification_applications%ROWTYPE;
BEGIN
  IF v_uid IS NULL OR NOT public.has_role(v_uid, 'host'::public.app_role) THEN RAISE EXCEPTION 'An approved host account is required'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.host_applications WHERE user_id=v_uid AND status IN ('approved','verified')) THEN RAISE EXCEPTION 'Host approval is required'; END IF;
  SELECT * INTO v_profile FROM public.profiles WHERE id=v_uid;
  v_score := round((
    (CASE WHEN v_profile.cover_url IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN v_profile.avatar_url IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN v_profile.bio <> '' AND v_profile.tagline <> '' AND v_profile.city <> '' THEN 1 ELSE 0 END) +
    (CASE WHEN cardinality(v_profile.languages)>0 AND v_profile.response_time IS NOT NULL AND v_profile.years_hosting>0 THEN 1 ELSE 0 END) +
    (CASE WHEN cardinality(v_profile.services)>0 THEN 1 ELSE 0 END) +
    (CASE WHEN cardinality(v_profile.specialties)>0 THEN 1 ELSE 0 END) +
    (CASE WHEN EXISTS (SELECT 1 FROM public.feed_posts WHERE user_id=v_uid AND reel_status='approved') THEN 1 ELSE 0 END) +
    (CASE WHEN EXISTS (SELECT 1 FROM public.host_properties WHERE host_id=v_uid AND cardinality(amenities)>0) OR EXISTS (SELECT 1 FROM public.host_transports WHERE host_id=v_uid AND cardinality(amenities)>0) OR EXISTS (SELECT 1 FROM public.host_dishes WHERE host_id=v_uid AND cardinality(dietary_tags)>0) THEN 1 ELSE 0 END)
  ) * 100.0 / 8);
  SELECT count(*) INTO v_listings FROM (
    SELECT id FROM public.experiences WHERE host_id=v_uid AND status='approved'
    UNION ALL SELECT id FROM public.host_properties WHERE host_id=v_uid AND status='approved'
    UNION ALL SELECT id FROM public.host_dishes WHERE host_id=v_uid AND status='approved'
    UNION ALL SELECT id FROM public.host_transports WHERE host_id=v_uid AND status='approved'
  ) x;
  SELECT count(*) INTO v_completed FROM public.bookings WHERE host_id=v_uid AND status='completed';
  SELECT count(*), COALESCE(avg(rating),0) INTO v_reviews, v_rating FROM public.reviews WHERE host_id=v_uid;
  IF v_score < 80 OR v_listings < 1 OR v_completed < 3 OR (v_reviews > 0 AND v_rating < 4.5) THEN RAISE EXCEPTION 'Verification milestones are not complete'; END IF;
  INSERT INTO public.host_verification_applications(host_id, milestone_snapshot)
  VALUES (v_uid, jsonb_build_object('profile_score',v_score,'approved_listings',v_listings,'completed_bookings',v_completed,'rating',v_rating,'review_count',v_reviews))
  ON CONFLICT (host_id) DO UPDATE SET status='pending', milestone_snapshot=EXCLUDED.milestone_snapshot, review_notes=NULL, reviewed_by=NULL, reviewed_at=NULL, updated_at=now()
  RETURNING * INTO v_result;
  UPDATE public.profiles SET verification_status='pending' WHERE id=v_uid;
  RETURN v_result;
END;
$$;
REVOKE ALL ON FUNCTION public.apply_for_host_verification() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.apply_for_host_verification() TO authenticated;
GRANT EXECUTE ON FUNCTION public.apply_for_host_verification() TO service_role;

CREATE OR REPLACE FUNCTION public.review_host_verification(_application_id uuid, _status text, _notes text DEFAULT NULL)
RETURNS public.host_verification_applications
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v_result public.host_verification_applications%ROWTYPE;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN RAISE EXCEPTION 'Only admins can review verification applications'; END IF;
  IF _status NOT IN ('verified','rejected') THEN RAISE EXCEPTION 'Invalid verification status'; END IF;
  UPDATE public.host_verification_applications SET status=_status, review_notes=_notes, reviewed_by=auth.uid(), reviewed_at=now(), updated_at=now() WHERE id=_application_id RETURNING * INTO v_result;
  IF v_result.id IS NULL THEN RAISE EXCEPTION 'Verification application not found'; END IF;
  UPDATE public.profiles SET verification_status=_status WHERE id=v_result.host_id;
  INSERT INTO public.admin_audit_log(admin_id, entity_type, entity_id, action, new_status, notes, metadata)
  VALUES(auth.uid(),'host_verification',v_result.id,'review',_status,_notes,jsonb_build_object('host_id',v_result.host_id));
  RETURN v_result;
END;
$$;
REVOKE ALL ON FUNCTION public.review_host_verification(uuid,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.review_host_verification(uuid,text,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.review_host_verification(uuid,text,text) TO service_role;

CREATE OR REPLACE FUNCTION public.get_public_host(_identifier text)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v_id uuid; v_result jsonb;
BEGIN
  SELECT p.id INTO v_id FROM public.profiles p
  JOIN public.user_roles ur ON ur.user_id=p.id AND ur.role='host'::public.app_role
  JOIN public.host_applications ha ON ha.user_id=p.id AND ha.status IN ('approved','verified')
  WHERE p.is_public AND (lower(p.username)=lower(_identifier) OR p.id::text=_identifier) LIMIT 1;
  IF v_id IS NULL THEN RETURN NULL; END IF;
  SELECT jsonb_build_object(
    'profile', jsonb_build_object('id',p.id,'username',p.username,'full_name',trim(concat_ws(' ',p.first_name,p.last_name)),'city',p.city,'tagline',p.tagline,'bio',p.bio,'avatar_url',p.avatar_url,'cover_url',p.cover_url,'services',p.services,'specialties',p.specialties,'languages',p.languages,'response_time',p.response_time,'years_hosting',p.years_hosting,'social_links',p.social_links,'price_per_day',p.price_per_day,'host_since',p.host_since,'presence_status',p.presence_status,'verification_status',p.verification_status),
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
$$;