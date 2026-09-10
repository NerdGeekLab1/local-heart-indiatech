-- ============ HOTEL PARTNER PROGRAM ============
CREATE TABLE public.hotel_partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  hotel_name text NOT NULL,
  contact_name text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text,
  city text NOT NULL,
  state text,
  country text NOT NULL DEFAULT 'India',
  property_type text NOT NULL DEFAULT 'hotel',
  room_count integer NOT NULL DEFAULT 0,
  website text,
  description text,
  logo_url text,
  cover_url text,
  amenities text[] NOT NULL DEFAULT '{}',
  languages text[] NOT NULL DEFAULT '{}',
  commission_pct numeric NOT NULL DEFAULT 12,
  status text NOT NULL DEFAULT 'pending',
  review_notes text,
  reviewed_at timestamptz,
  reviewed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX hotel_partners_user_unique ON public.hotel_partners(user_id);

GRANT SELECT, INSERT, UPDATE ON public.hotel_partners TO authenticated;
GRANT SELECT ON public.hotel_partners TO anon;
GRANT ALL ON public.hotel_partners TO service_role;
ALTER TABLE public.hotel_partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved hotels are public" ON public.hotel_partners
  FOR SELECT USING (status = 'approved');
CREATE POLICY "Owners read own hotel" ON public.hotel_partners
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owners create own hotel" ON public.hotel_partners
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND status = 'pending');
CREATE POLICY "Owners update own hotel" ON public.hotel_partners
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage hotels" ON public.hotel_partners
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER hotel_partners_updated_at BEFORE UPDATE ON public.hotel_partners
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.hotel_rate_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid NOT NULL REFERENCES public.hotel_partners(id) ON DELETE CASCADE,
  room_type text NOT NULL,
  occupancy integer NOT NULL DEFAULT 2,
  rate_inr numeric NOT NULL DEFAULT 0,
  net_rate_inr numeric,
  meal_plan text NOT NULL DEFAULT 'room_only',
  cancellation_policy text,
  min_nights integer NOT NULL DEFAULT 1,
  valid_from date,
  valid_to date,
  terms text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX hotel_rate_plans_hotel_idx ON public.hotel_rate_plans(hotel_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.hotel_rate_plans TO authenticated;
GRANT ALL ON public.hotel_rate_plans TO service_role;
ALTER TABLE public.hotel_rate_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hotels manage own rates" ON public.hotel_rate_plans
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.hotel_partners h WHERE h.id = hotel_id AND h.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.hotel_partners h WHERE h.id = hotel_id AND h.user_id = auth.uid()));
CREATE POLICY "Admins manage rates" ON public.hotel_rate_plans
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER hotel_rate_plans_updated_at BEFORE UPDATE ON public.hotel_rate_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.hotel_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid NOT NULL REFERENCES public.hotel_partners(id) ON DELETE CASCADE,
  guest_name text NOT NULL,
  guest_country text,
  check_in date,
  nights integer NOT NULL DEFAULT 1,
  guests integer NOT NULL DEFAULT 1,
  room_type text,
  value_inr numeric NOT NULL DEFAULT 0,
  commission_inr numeric NOT NULL DEFAULT 0,
  source text NOT NULL DEFAULT 'roamyoo',
  status text NOT NULL DEFAULT 'enquiry',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX hotel_leads_hotel_idx ON public.hotel_leads(hotel_id);

GRANT SELECT, INSERT, UPDATE ON public.hotel_leads TO authenticated;
GRANT ALL ON public.hotel_leads TO service_role;
ALTER TABLE public.hotel_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hotels read own leads" ON public.hotel_leads
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.hotel_partners h WHERE h.id = hotel_id AND h.user_id = auth.uid()));
CREATE POLICY "Hotels update own leads" ON public.hotel_leads
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.hotel_partners h WHERE h.id = hotel_id AND h.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.hotel_partners h WHERE h.id = hotel_id AND h.user_id = auth.uid()));
CREATE POLICY "Admins manage leads" ON public.hotel_leads
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER hotel_leads_updated_at BEFORE UPDATE ON public.hotel_leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ CREATOR PROGRAM ============
CREATE TABLE public.creator_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  city text,
  country text NOT NULL DEFAULT 'India',
  niche text,
  bio text,
  avatar_url text,
  platforms jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_followers integer NOT NULL DEFAULT 0,
  avg_views integer NOT NULL DEFAULT 0,
  portfolio_links text[] NOT NULL DEFAULT '{}',
  languages text[] NOT NULL DEFAULT '{}',
  audience_countries text[] NOT NULL DEFAULT '{}',
  payout_method text,
  payout_details text,
  tier text NOT NULL DEFAULT 'rising',
  status text NOT NULL DEFAULT 'pending',
  review_notes text,
  reviewed_at timestamptz,
  reviewed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX creator_applications_user_unique ON public.creator_applications(user_id);

GRANT SELECT, INSERT, UPDATE ON public.creator_applications TO authenticated;
GRANT SELECT ON public.creator_applications TO anon;
GRANT ALL ON public.creator_applications TO service_role;
ALTER TABLE public.creator_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved creators are public" ON public.creator_applications
  FOR SELECT USING (status = 'approved');
CREATE POLICY "Creators read own application" ON public.creator_applications
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Creators create own application" ON public.creator_applications
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND status = 'pending');
CREATE POLICY "Creators update own application" ON public.creator_applications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage creator applications" ON public.creator_applications
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER creator_applications_updated_at BEFORE UPDATE ON public.creator_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.creator_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES public.creator_applications(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  platform text NOT NULL DEFAULT 'instagram',
  title text NOT NULL,
  url text NOT NULL,
  campaign text,
  posted_at date,
  views integer NOT NULL DEFAULT 0,
  likes integer NOT NULL DEFAULT 0,
  clicks integer NOT NULL DEFAULT 0,
  bookings_attributed integer NOT NULL DEFAULT 0,
  reward_points integer NOT NULL DEFAULT 0,
  payout_amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'submitted',
  review_notes text,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX creator_content_creator_idx ON public.creator_content(creator_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.creator_content TO authenticated;
GRANT SELECT ON public.creator_content TO anon;
GRANT ALL ON public.creator_content TO service_role;
ALTER TABLE public.creator_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved content is public" ON public.creator_content
  FOR SELECT USING (status = 'approved');
CREATE POLICY "Creators read own content" ON public.creator_content
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Creators submit own content" ON public.creator_content
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = user_id AND status = 'submitted'
    AND EXISTS (SELECT 1 FROM public.creator_applications c WHERE c.id = creator_id AND c.user_id = auth.uid() AND c.status = 'approved')
  );
CREATE POLICY "Creators edit own pending content" ON public.creator_content
  FOR UPDATE TO authenticated USING (auth.uid() = user_id AND status = 'submitted') WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage creator content" ON public.creator_content
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER creator_content_updated_at BEFORE UPDATE ON public.creator_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.creator_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES public.creator_applications(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  amount_inr numeric NOT NULL DEFAULT 0,
  period text,
  method text,
  reference text,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX creator_payouts_creator_idx ON public.creator_payouts(creator_id);

GRANT SELECT ON public.creator_payouts TO authenticated;
GRANT ALL ON public.creator_payouts TO service_role;
ALTER TABLE public.creator_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creators read own payouts" ON public.creator_payouts
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage payouts" ON public.creator_payouts
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER creator_payouts_updated_at BEFORE UPDATE ON public.creator_payouts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ ADMIN REVIEW RPCS ============
CREATE OR REPLACE FUNCTION public.review_hotel_partner(_hotel_id uuid, _status text, _notes text DEFAULT NULL, _commission numeric DEFAULT NULL)
RETURNS public.hotel_partners
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE row public.hotel_partners;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Admins only'; END IF;
  IF _status NOT IN ('pending','under_review','approved','rejected','suspended') THEN RAISE EXCEPTION 'Invalid status'; END IF;
  UPDATE public.hotel_partners
     SET status = _status,
         review_notes = COALESCE(_notes, review_notes),
         commission_pct = COALESCE(_commission, commission_pct),
         reviewed_at = now(),
         reviewed_by = auth.uid()
   WHERE id = _hotel_id
   RETURNING * INTO row;
  IF row.id IS NULL THEN RAISE EXCEPTION 'Hotel not found'; END IF;
  RETURN row;
END; $$;

REVOKE ALL ON FUNCTION public.review_hotel_partner(uuid, text, text, numeric) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.review_hotel_partner(uuid, text, text, numeric) TO authenticated;

CREATE OR REPLACE FUNCTION public.review_creator_application(_application_id uuid, _status text, _notes text DEFAULT NULL, _tier text DEFAULT NULL)
RETURNS public.creator_applications
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE row public.creator_applications;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Admins only'; END IF;
  IF _status NOT IN ('pending','under_review','approved','rejected','paused') THEN RAISE EXCEPTION 'Invalid status'; END IF;
  UPDATE public.creator_applications
     SET status = _status,
         review_notes = COALESCE(_notes, review_notes),
         tier = COALESCE(_tier, tier),
         reviewed_at = now(),
         reviewed_by = auth.uid()
   WHERE id = _application_id
   RETURNING * INTO row;
  IF row.id IS NULL THEN RAISE EXCEPTION 'Application not found'; END IF;
  RETURN row;
END; $$;

REVOKE ALL ON FUNCTION public.review_creator_application(uuid, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.review_creator_application(uuid, text, text, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.review_creator_content(_content_id uuid, _status text, _reward_points integer DEFAULT NULL, _payout numeric DEFAULT NULL, _notes text DEFAULT NULL)
RETURNS public.creator_content
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE row public.creator_content;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Admins only'; END IF;
  IF _status NOT IN ('submitted','approved','rejected','paid') THEN RAISE EXCEPTION 'Invalid status'; END IF;
  UPDATE public.creator_content
     SET status = _status,
         reward_points = COALESCE(_reward_points, reward_points),
         payout_amount = COALESCE(_payout, payout_amount),
         review_notes = COALESCE(_notes, review_notes),
         reviewed_at = now()
   WHERE id = _content_id
   RETURNING * INTO row;
  IF row.id IS NULL THEN RAISE EXCEPTION 'Content not found'; END IF;
  RETURN row;
END; $$;

REVOKE ALL ON FUNCTION public.review_creator_content(uuid, text, integer, numeric, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.review_creator_content(uuid, text, integer, numeric, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.record_creator_payout(_creator_id uuid, _amount numeric, _period text DEFAULT NULL, _method text DEFAULT NULL, _reference text DEFAULT NULL, _status text DEFAULT 'paid', _notes text DEFAULT NULL)
RETURNS public.creator_payouts
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE row public.creator_payouts; owner uuid;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Admins only'; END IF;
  IF _status NOT IN ('pending','approved','paid','failed') THEN RAISE EXCEPTION 'Invalid status'; END IF;
  SELECT user_id INTO owner FROM public.creator_applications WHERE id = _creator_id;
  IF owner IS NULL THEN RAISE EXCEPTION 'Creator not found'; END IF;
  INSERT INTO public.creator_payouts (creator_id, user_id, amount_inr, period, method, reference, status, notes, paid_at)
  VALUES (_creator_id, owner, _amount, _period, _method, _reference, _status, _notes, CASE WHEN _status = 'paid' THEN now() ELSE NULL END)
  RETURNING * INTO row;
  RETURN row;
END; $$;

REVOKE ALL ON FUNCTION public.record_creator_payout(uuid, numeric, text, text, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_creator_payout(uuid, numeric, text, text, text, text, text) TO authenticated;