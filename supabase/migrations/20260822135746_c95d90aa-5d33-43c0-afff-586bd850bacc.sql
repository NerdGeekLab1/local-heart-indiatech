CREATE TABLE public.platform_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  singleton boolean NOT NULL DEFAULT true UNIQUE,
  gst_percent numeric NOT NULL DEFAULT 18,
  platform_fee_percent numeric NOT NULL DEFAULT 5,
  handling_charge numeric NOT NULL DEFAULT 49,
  verification_min_profile_score integer NOT NULL DEFAULT 80,
  verification_min_listings integer NOT NULL DEFAULT 1,
  verification_min_completed_bookings integer NOT NULL DEFAULT 3,
  verification_min_rating numeric NOT NULL DEFAULT 4.5,
  verification_auto_approve boolean NOT NULL DEFAULT false,
  verification_applications_enabled boolean NOT NULL DEFAULT true,
  updated_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.platform_settings TO anon;
GRANT SELECT ON public.platform_settings TO authenticated;
GRANT INSERT, UPDATE ON public.platform_settings TO authenticated;
GRANT ALL ON public.platform_settings TO service_role;

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read platform settings"
ON public.platform_settings FOR SELECT USING (true);

CREATE POLICY "Admins manage platform settings"
ON public.platform_settings FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER update_platform_settings_updated_at
BEFORE UPDATE ON public.platform_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.platform_settings (singleton) VALUES (true);

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS traveler_status text NOT NULL DEFAULT 'not_started',
  ADD COLUMN IF NOT EXISTS traveler_status_updated_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS gst_amount numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS platform_fee numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS handling_charge numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS commission_amount numeric NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.apply_for_host_verification()
 RETURNS public.host_verification_applications
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_profile public.profiles%ROWTYPE;
  v_settings public.platform_settings%ROWTYPE;
  v_score integer := 0;
  v_listings integer := 0;
  v_completed integer := 0;
  v_rating numeric := 0;
  v_reviews integer := 0;
  v_status text := 'pending';
  v_result public.host_verification_applications%ROWTYPE;
BEGIN
  IF v_uid IS NULL OR NOT public.has_role(v_uid, 'host'::public.app_role) THEN RAISE EXCEPTION 'An approved host account is required'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.host_applications WHERE user_id=v_uid AND status IN ('approved','verified')) THEN RAISE EXCEPTION 'Host approval is required'; END IF;

  SELECT * INTO v_settings FROM public.platform_settings ORDER BY created_at LIMIT 1;
  IF NOT COALESCE(v_settings.verification_applications_enabled, true) THEN
    RAISE EXCEPTION 'Verification applications are currently closed';
  END IF;

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

  IF v_score < COALESCE(v_settings.verification_min_profile_score, 80)
     OR v_listings < COALESCE(v_settings.verification_min_listings, 1)
     OR v_completed < COALESCE(v_settings.verification_min_completed_bookings, 3)
     OR (v_reviews > 0 AND v_rating < COALESCE(v_settings.verification_min_rating, 4.5)) THEN
    RAISE EXCEPTION 'Verification milestones are not complete';
  END IF;

  IF COALESCE(v_settings.verification_auto_approve, false) THEN v_status := 'verified'; END IF;

  INSERT INTO public.host_verification_applications(host_id, status, milestone_snapshot)
  VALUES (v_uid, v_status, jsonb_build_object('profile_score',v_score,'approved_listings',v_listings,'completed_bookings',v_completed,'rating',v_rating,'review_count',v_reviews,'auto_approved',v_status='verified'))
  ON CONFLICT (host_id) DO UPDATE SET status=EXCLUDED.status, milestone_snapshot=EXCLUDED.milestone_snapshot, review_notes=NULL, reviewed_by=NULL, reviewed_at=CASE WHEN EXCLUDED.status='verified' THEN now() ELSE NULL END, updated_at=now()
  RETURNING * INTO v_result;

  UPDATE public.profiles SET verification_status=v_status WHERE id=v_uid;
  RETURN v_result;
END;
$function$;