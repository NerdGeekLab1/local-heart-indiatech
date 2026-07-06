
-- ============ PROFILES ============
DROP POLICY IF EXISTS "Users can view all profiles basic info" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE VIEW public.profiles_public
WITH (security_invoker = off) AS
SELECT id, first_name, last_name, avatar_url, bio, nationality, travel_styles, interests
FROM public.profiles;

GRANT SELECT ON public.profiles_public TO anon, authenticated;

-- ============ BETA_WANDERERS ============
DROP POLICY IF EXISTS "Authenticated can view approved wanderers" ON public.beta_wanderers;

CREATE POLICY "Owners can view own wanderer application"
  ON public.beta_wanderers FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all wanderers"
  ON public.beta_wanderers FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE VIEW public.beta_wanderers_public
WITH (security_invoker = off) AS
SELECT
  id, user_id, full_name, city, bio,
  travel_styles, preferred_destinations, social_links, video_url,
  score, missions_completed, total_videos, badge, status, created_at
FROM public.beta_wanderers
WHERE status = 'approved';

GRANT SELECT ON public.beta_wanderers_public TO anon, authenticated;

-- ============ TRIP_PARTICIPANTS ============
DROP POLICY IF EXISTS "Anyone can view trip participants" ON public.trip_participants;

CREATE POLICY "Participants can view own participation"
  ON public.trip_participants FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Trip creators can view participants"
  ON public.trip_participants FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.trip_listings tl
    WHERE tl.id = trip_participants.trip_id AND tl.creator_id = auth.uid()
  ));

CREATE POLICY "Admins can view all trip participants"
  ON public.trip_participants FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ============ STORAGE: restrict feed-media listing ============
DROP POLICY IF EXISTS "Feed media public read" ON storage.objects;

CREATE POLICY "Feed media authenticated read"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'feed-media');
