ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS tagline text,
  ADD COLUMN IF NOT EXISTS services text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS specialties text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS price_per_day numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS host_since timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_lower_unique
  ON public.profiles (lower(username)) WHERE username IS NOT NULL;

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_username_format;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_username_format
  CHECK (username IS NULL OR username ~ '^[a-z0-9][a-z0-9_-]{2,29}$');

CREATE TABLE public.host_properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id uuid NOT NULL,
  property_name text NOT NULL,
  property_type text NOT NULL,
  description text NOT NULL,
  location text NOT NULL,
  amenities text[] NOT NULL DEFAULT '{}'::text[],
  house_rules text,
  nightly_rate numeric NOT NULL DEFAULT 0,
  weekly_rate numeric NOT NULL DEFAULT 0,
  max_guests integer NOT NULL DEFAULT 1,
  check_in time,
  check_out time,
  availability text,
  photos text[] NOT NULL DEFAULT '{}'::text[],
  status text NOT NULL DEFAULT 'approved' CHECK (status IN ('pending','approved','rejected','suspended')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.host_properties TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.host_properties TO authenticated;
GRANT ALL ON public.host_properties TO service_role;
ALTER TABLE public.host_properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view approved host properties" ON public.host_properties FOR SELECT TO anon, authenticated
  USING (status = 'approved' AND EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.user_roles ur ON ur.user_id = p.id AND ur.role = 'host'::public.app_role
    JOIN public.host_applications ha ON ha.user_id = p.id AND ha.status IN ('approved','verified')
    WHERE p.id = host_id AND p.is_public
  ) OR auth.uid() = host_id OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Hosts create own properties" ON public.host_properties FOR INSERT TO authenticated WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Hosts update own properties" ON public.host_properties FOR UPDATE TO authenticated USING (auth.uid() = host_id OR public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (auth.uid() = host_id OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Hosts delete own properties" ON public.host_properties FOR DELETE TO authenticated USING (auth.uid() = host_id OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE TRIGGER host_properties_updated_at BEFORE UPDATE ON public.host_properties FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.host_dishes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id uuid NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  cuisine text NOT NULL,
  meal_type text NOT NULL,
  dietary_tags text[] NOT NULL DEFAULT '{}'::text[],
  serves integer NOT NULL DEFAULT 1,
  prep_time text,
  price_per_plate numeric NOT NULL DEFAULT 0,
  allergen_notes text,
  availability text,
  photos text[] NOT NULL DEFAULT '{}'::text[],
  status text NOT NULL DEFAULT 'approved' CHECK (status IN ('pending','approved','rejected','suspended')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.host_dishes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.host_dishes TO authenticated;
GRANT ALL ON public.host_dishes TO service_role;
ALTER TABLE public.host_dishes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view approved host dishes" ON public.host_dishes FOR SELECT TO anon, authenticated
  USING (status = 'approved' AND EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.user_roles ur ON ur.user_id = p.id AND ur.role = 'host'::public.app_role
    JOIN public.host_applications ha ON ha.user_id = p.id AND ha.status IN ('approved','verified')
    WHERE p.id = host_id AND p.is_public
  ) OR auth.uid() = host_id OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Hosts create own dishes" ON public.host_dishes FOR INSERT TO authenticated WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Hosts update own dishes" ON public.host_dishes FOR UPDATE TO authenticated USING (auth.uid() = host_id OR public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (auth.uid() = host_id OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Hosts delete own dishes" ON public.host_dishes FOR DELETE TO authenticated USING (auth.uid() = host_id OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE TRIGGER host_dishes_updated_at BEFORE UPDATE ON public.host_dishes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.host_transports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id uuid NOT NULL,
  vehicle_type text NOT NULL,
  model text NOT NULL,
  description text NOT NULL,
  capacity integer NOT NULL DEFAULT 1,
  price_per_day numeric NOT NULL DEFAULT 0,
  price_per_km numeric NOT NULL DEFAULT 0,
  service_radius_km integer NOT NULL DEFAULT 0,
  amenities text[] NOT NULL DEFAULT '{}'::text[],
  availability text,
  photos text[] NOT NULL DEFAULT '{}'::text[],
  status text NOT NULL DEFAULT 'approved' CHECK (status IN ('pending','approved','rejected','suspended')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.host_transports TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.host_transports TO authenticated;
GRANT ALL ON public.host_transports TO service_role;
ALTER TABLE public.host_transports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view approved host transports" ON public.host_transports FOR SELECT TO anon, authenticated
  USING (status = 'approved' AND EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.user_roles ur ON ur.user_id = p.id AND ur.role = 'host'::public.app_role
    JOIN public.host_applications ha ON ha.user_id = p.id AND ha.status IN ('approved','verified')
    WHERE p.id = host_id AND p.is_public
  ) OR auth.uid() = host_id OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Hosts create own transports" ON public.host_transports FOR INSERT TO authenticated WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Hosts update own transports" ON public.host_transports FOR UPDATE TO authenticated USING (auth.uid() = host_id OR public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (auth.uid() = host_id OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Hosts delete own transports" ON public.host_transports FOR DELETE TO authenticated USING (auth.uid() = host_id OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE TRIGGER host_transports_updated_at BEFORE UPDATE ON public.host_transports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.approve_host_profile_application(_application_id uuid)
RETURNS public.host_applications
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth
AS $$
DECLARE
  v_application public.host_applications%ROWTYPE;
  v_user_id uuid;
  v_previous_status text;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Only admins can approve host profile applications';
  END IF;
  SELECT * INTO v_application FROM public.host_applications WHERE id = _application_id FOR UPDATE;
  IF v_application.id IS NULL THEN RAISE EXCEPTION 'Host profile application not found'; END IF;
  v_previous_status := v_application.status;
  SELECT u.id INTO v_user_id FROM auth.users u
  WHERE (u.id = v_application.user_id OR lower(u.email) = lower(trim(v_application.email)))
    AND u.email_confirmed_at IS NOT NULL
  ORDER BY (u.id = v_application.user_id) DESC, u.created_at DESC LIMIT 1;
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'The host must create an account and confirm their email before approval';
  END IF;
  DELETE FROM public.user_roles WHERE user_id = v_user_id;
  INSERT INTO public.user_roles (user_id, role) VALUES (v_user_id, 'host'::public.app_role);
  UPDATE public.host_applications SET user_id = v_user_id, status = 'approved', reviewed_by = auth.uid(), reviewed_at = now(), updated_at = now()
  WHERE id = _application_id RETURNING * INTO v_application;
  UPDATE public.profiles SET
    city = COALESCE(NULLIF(city, ''), v_application.city),
    tagline = COALESCE(NULLIF(tagline, ''), v_application.tagline),
    bio = COALESCE(NULLIF(bio, ''), v_application.bio),
    services = CASE WHEN cardinality(services) = 0 THEN v_application.services ELSE services END,
    specialties = CASE WHEN cardinality(specialties) = 0 THEN v_application.specialties ELSE specialties END,
    price_per_day = CASE WHEN price_per_day = 0 THEN COALESCE(v_application.price_per_day, 0) ELSE price_per_day END,
    host_since = COALESCE(host_since, now())
  WHERE id = v_user_id;
  INSERT INTO public.user_onboarding_progress (user_id, role, completed_steps)
  VALUES (v_user_id, 'host', ARRAY['application_submitted','email_confirmed','admin_approved']::text[])
  ON CONFLICT (user_id) DO UPDATE SET role='host', completed_steps = ARRAY(
    SELECT DISTINCT step FROM unnest(public.user_onboarding_progress.completed_steps || EXCLUDED.completed_steps) step
  ), updated_at=now();
  INSERT INTO public.admin_audit_log (admin_id, entity_type, entity_id, action, previous_status, new_status, metadata)
  VALUES (auth.uid(), 'host_application', v_application.id, 'approve', v_previous_status, 'approved', jsonb_build_object('user_id',v_user_id,'email',v_application.email));
  RETURN v_application;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_public_host_directory()
RETURNS TABLE(id uuid, username text, full_name text, city text, tagline text, bio text, avatar_url text, services text[], specialties text[], social_links jsonb, price_per_day numeric, host_since timestamptz, rating numeric, review_count bigint, experiences_count bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT p.id, p.username, trim(concat_ws(' ',p.first_name,p.last_name)), p.city, p.tagline, p.bio, p.avatar_url,
    p.services, p.specialties, p.social_links, p.price_per_day, p.host_since,
    COALESCE(avg(r.rating),0)::numeric(3,2), count(DISTINCT r.id), count(DISTINCT e.id)
  FROM public.profiles p
  JOIN public.user_roles ur ON ur.user_id=p.id AND ur.role='host'::public.app_role
  JOIN public.host_applications ha ON ha.user_id=p.id AND ha.status IN ('approved','verified')
  LEFT JOIN public.reviews r ON r.host_id=p.id
  LEFT JOIN public.experiences e ON e.host_id=p.id AND e.status='approved'
  WHERE p.is_public
  GROUP BY p.id;
$$;
GRANT EXECUTE ON FUNCTION public.get_public_host_directory() TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_public_host(_identifier text)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_id uuid; v_result jsonb;
BEGIN
  SELECT p.id INTO v_id FROM public.profiles p
  JOIN public.user_roles ur ON ur.user_id=p.id AND ur.role='host'::public.app_role
  JOIN public.host_applications ha ON ha.user_id=p.id AND ha.status IN ('approved','verified')
  WHERE p.is_public AND (lower(p.username)=lower(_identifier) OR p.id::text=_identifier) LIMIT 1;
  IF v_id IS NULL THEN RETURN NULL; END IF;
  SELECT jsonb_build_object(
    'profile', jsonb_build_object('id',p.id,'username',p.username,'full_name',trim(concat_ws(' ',p.first_name,p.last_name)),'city',p.city,'tagline',p.tagline,'bio',p.bio,'avatar_url',p.avatar_url,'services',p.services,'specialties',p.specialties,'social_links',p.social_links,'price_per_day',p.price_per_day,'host_since',p.host_since),
    'experiences', COALESCE((SELECT jsonb_agg(to_jsonb(e) ORDER BY e.created_at DESC) FROM public.experiences e WHERE e.host_id=v_id AND e.status='approved'),'[]'::jsonb),
    'reviews', COALESCE((SELECT jsonb_agg(to_jsonb(r) ORDER BY r.created_at DESC) FROM public.reviews r WHERE r.host_id=v_id),'[]'::jsonb),
    'properties', COALESCE((SELECT jsonb_agg(to_jsonb(x) ORDER BY x.created_at DESC) FROM public.host_properties x WHERE x.host_id=v_id AND x.status='approved'),'[]'::jsonb),
    'dishes', COALESCE((SELECT jsonb_agg(to_jsonb(x) ORDER BY x.created_at DESC) FROM public.host_dishes x WHERE x.host_id=v_id AND x.status='approved'),'[]'::jsonb),
    'transports', COALESCE((SELECT jsonb_agg(to_jsonb(x) ORDER BY x.created_at DESC) FROM public.host_transports x WHERE x.host_id=v_id AND x.status='approved'),'[]'::jsonb)
  ) INTO v_result FROM public.profiles p WHERE p.id=v_id;
  RETURN v_result;
END;
$$;
GRANT EXECUTE ON FUNCTION public.get_public_host(text) TO anon, authenticated;

DO $$
DECLARE rec record; v_uid uuid;
BEGIN
  FOR rec IN SELECT * FROM public.host_applications WHERE status IN ('verified','approved') LOOP
    SELECT u.id INTO v_uid FROM auth.users u
    WHERE (u.id=rec.user_id OR lower(u.email)=lower(trim(rec.email))) AND u.email_confirmed_at IS NOT NULL
    ORDER BY (u.id=rec.user_id) DESC, u.created_at DESC LIMIT 1;
    IF v_uid IS NOT NULL THEN
      DELETE FROM public.user_roles WHERE user_id=v_uid;
      INSERT INTO public.user_roles(user_id,role) VALUES(v_uid,'host'::public.app_role);
      UPDATE public.host_applications SET user_id=v_uid,status='approved',updated_at=now() WHERE id=rec.id;
      UPDATE public.profiles SET city=COALESCE(NULLIF(city,''),rec.city), tagline=COALESCE(NULLIF(tagline,''),rec.tagline), bio=COALESCE(NULLIF(bio,''),rec.bio), services=CASE WHEN cardinality(services)=0 THEN rec.services ELSE services END, specialties=CASE WHEN cardinality(specialties)=0 THEN rec.specialties ELSE specialties END, price_per_day=CASE WHEN price_per_day=0 THEN COALESCE(rec.price_per_day,0) ELSE price_per_day END, host_since=COALESCE(host_since,rec.reviewed_at,rec.created_at) WHERE id=v_uid;
    END IF;
  END LOOP;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.host_properties;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.host_dishes;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.host_transports;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.experiences;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;