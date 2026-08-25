-- ============================================================
-- 1. EXPERIENCE CATALOG (admin-owned generic experience)
-- ============================================================
CREATE TABLE public.experience_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  category text NOT NULL,
  sub_category text,
  summary text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  includes text[] NOT NULL DEFAULT '{}',
  highlights text[] NOT NULL DEFAULT '{}',
  hero_image_url text,
  gallery text[] NOT NULL DEFAULT '{}',
  typical_duration text,
  difficulty text,
  price_min numeric NOT NULL DEFAULT 0,
  price_max numeric NOT NULL DEFAULT 0,
  season_months int[] NOT NULL DEFAULT '{}',
  season_label text,
  occasion_type text,
  is_featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft',
  submitted_by uuid,
  reviewed_by uuid,
  reviewed_at timestamptz,
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT experience_catalog_status_check CHECK (status IN ('draft','pending','published','rejected'))
);

GRANT SELECT ON public.experience_catalog TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.experience_catalog TO authenticated;
GRANT ALL ON public.experience_catalog TO service_role;

ALTER TABLE public.experience_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published catalog is public"
  ON public.experience_catalog FOR SELECT
  USING (status = 'published');

CREATE POLICY "Admins read all catalog"
  ON public.experience_catalog FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Hosts read own catalog proposals"
  ON public.experience_catalog FOR SELECT TO authenticated
  USING (submitted_by = auth.uid());

CREATE POLICY "Hosts propose catalog entries"
  ON public.experience_catalog FOR INSERT TO authenticated
  WITH CHECK (
    submitted_by = auth.uid()
    AND status = 'pending'
    AND public.has_role(auth.uid(), 'host'::public.app_role)
  );

CREATE POLICY "Hosts edit own pending proposals"
  ON public.experience_catalog FOR UPDATE TO authenticated
  USING (submitted_by = auth.uid() AND status = 'pending')
  WITH CHECK (submitted_by = auth.uid() AND status = 'pending');

CREATE POLICY "Admins manage catalog"
  ON public.experience_catalog FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER experience_catalog_updated_at
  BEFORE UPDATE ON public.experience_catalog
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX experience_catalog_status_idx ON public.experience_catalog (status, sort_order);
CREATE INDEX experience_catalog_category_idx ON public.experience_catalog (category);

-- ============================================================
-- 2. HOST OFFERINGS (host-specific details mapped to catalog)
-- ============================================================
CREATE TABLE public.catalog_host_offerings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  catalog_id uuid NOT NULL REFERENCES public.experience_catalog(id) ON DELETE CASCADE,
  host_id uuid NOT NULL,
  experience_id uuid REFERENCES public.experiences(id) ON DELETE SET NULL,
  headline text NOT NULL DEFAULT '',
  host_notes text NOT NULL DEFAULT '',
  price numeric NOT NULL DEFAULT 0,
  price_unit text NOT NULL DEFAULT 'per_person',
  city text NOT NULL DEFAULT '',
  meeting_point text,
  latitude numeric,
  longitude numeric,
  max_guests integer NOT NULL DEFAULT 1,
  duration text,
  available_from date,
  available_to date,
  season_months int[] NOT NULL DEFAULT '{}',
  photos text[] NOT NULL DEFAULT '{}',
  addon_notes text,
  is_active boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT catalog_host_offerings_status_check CHECK (status IN ('pending','approved','rejected')),
  CONSTRAINT catalog_host_offerings_unique UNIQUE (catalog_id, host_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.catalog_host_offerings TO authenticated;
GRANT ALL ON public.catalog_host_offerings TO service_role;

ALTER TABLE public.catalog_host_offerings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Signed-in users read approved offerings"
  ON public.catalog_host_offerings FOR SELECT TO authenticated
  USING (
    status = 'approved' AND is_active
    AND EXISTS (
      SELECT 1 FROM public.experience_catalog c
      WHERE c.id = catalog_id AND c.status = 'published'
    )
  );

CREATE POLICY "Hosts read own offerings"
  ON public.catalog_host_offerings FOR SELECT TO authenticated
  USING (host_id = auth.uid());

CREATE POLICY "Hosts create own offerings"
  ON public.catalog_host_offerings FOR INSERT TO authenticated
  WITH CHECK (host_id = auth.uid() AND public.has_role(auth.uid(), 'host'::public.app_role));

CREATE POLICY "Hosts update own offerings"
  ON public.catalog_host_offerings FOR UPDATE TO authenticated
  USING (host_id = auth.uid())
  WITH CHECK (host_id = auth.uid());

CREATE POLICY "Hosts delete own offerings"
  ON public.catalog_host_offerings FOR DELETE TO authenticated
  USING (host_id = auth.uid());

CREATE POLICY "Admins manage offerings"
  ON public.catalog_host_offerings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER catalog_host_offerings_updated_at
  BEFORE UPDATE ON public.catalog_host_offerings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX catalog_host_offerings_catalog_idx ON public.catalog_host_offerings (catalog_id, status, is_active);
CREATE INDEX catalog_host_offerings_host_idx ON public.catalog_host_offerings (host_id);

-- ============================================================
-- 3. HOST SCHEDULE (occasions + seasonal windows)
-- ============================================================
CREATE TABLE public.host_schedule_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id uuid NOT NULL,
  kind text NOT NULL DEFAULT 'occasion',
  title text NOT NULL,
  event_type text,
  description text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  venue text,
  start_date date,
  end_date date,
  recurring_months int[] NOT NULL DEFAULT '{}',
  cover_image_url text,
  guest_capacity integer,
  is_public boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'upcoming',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT host_schedule_events_kind_check CHECK (kind IN ('occasion','season')),
  CONSTRAINT host_schedule_events_status_check CHECK (status IN ('upcoming','ongoing','completed','cancelled'))
);

GRANT SELECT ON public.host_schedule_events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.host_schedule_events TO authenticated;
GRANT ALL ON public.host_schedule_events TO service_role;

ALTER TABLE public.host_schedule_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public schedule entries are visible"
  ON public.host_schedule_events FOR SELECT
  USING (is_public AND status IN ('upcoming','ongoing'));

CREATE POLICY "Hosts read own schedule"
  ON public.host_schedule_events FOR SELECT TO authenticated
  USING (host_id = auth.uid());

CREATE POLICY "Hosts manage own schedule"
  ON public.host_schedule_events FOR ALL TO authenticated
  USING (host_id = auth.uid())
  WITH CHECK (host_id = auth.uid());

CREATE POLICY "Admins manage schedule"
  ON public.host_schedule_events FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER host_schedule_events_updated_at
  BEFORE UPDATE ON public.host_schedule_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX host_schedule_events_host_idx ON public.host_schedule_events (host_id, start_date);

CREATE TABLE public.host_schedule_experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id uuid NOT NULL REFERENCES public.host_schedule_events(id) ON DELETE CASCADE,
  catalog_id uuid REFERENCES public.experience_catalog(id) ON DELETE CASCADE,
  offering_id uuid REFERENCES public.catalog_host_offerings(id) ON DELETE CASCADE,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT host_schedule_experiences_unique UNIQUE (schedule_id, catalog_id)
);

GRANT SELECT ON public.host_schedule_experiences TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.host_schedule_experiences TO authenticated;
GRANT ALL ON public.host_schedule_experiences TO service_role;

ALTER TABLE public.host_schedule_experiences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Schedule mappings follow their event"
  ON public.host_schedule_experiences FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.host_schedule_events e
    WHERE e.id = schedule_id AND e.is_public AND e.status IN ('upcoming','ongoing')
  ));

CREATE POLICY "Hosts manage own schedule mappings"
  ON public.host_schedule_experiences FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.host_schedule_events e WHERE e.id = schedule_id AND e.host_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.host_schedule_events e WHERE e.id = schedule_id AND e.host_id = auth.uid()));

CREATE POLICY "Admins manage schedule mappings"
  ON public.host_schedule_experiences FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE INDEX host_schedule_experiences_schedule_idx ON public.host_schedule_experiences (schedule_id);

-- ============================================================
-- 4. PUBLIC / GATED READ FUNCTIONS
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_catalog_public()
RETURNS TABLE(
  id uuid, slug text, title text, category text, sub_category text,
  summary text, hero_image_url text, typical_duration text, difficulty text,
  price_min numeric, price_max numeric, season_months int[], season_label text,
  occasion_type text, is_featured boolean, highlights text[],
  host_count bigint, offered_price_min numeric, offered_price_max numeric,
  cities text[], avg_rating numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.id, c.slug, c.title, c.category, c.sub_category,
         c.summary, c.hero_image_url, c.typical_duration, c.difficulty,
         c.price_min, c.price_max, c.season_months, c.season_label,
         c.occasion_type, c.is_featured, c.highlights,
         COALESCE(o.host_count, 0),
         COALESCE(o.price_min, c.price_min),
         COALESCE(o.price_max, c.price_max),
         COALESCE(o.cities, '{}'::text[]),
         COALESCE(o.avg_rating, 0)::numeric(3,2)
  FROM public.experience_catalog c
  LEFT JOIN (
    SELECT ho.catalog_id,
           count(DISTINCT ho.host_id) AS host_count,
           min(ho.price) AS price_min,
           max(ho.price) AS price_max,
           array_agg(DISTINCT ho.city) FILTER (WHERE ho.city <> '') AS cities,
           avg(rv.rating) AS avg_rating
    FROM public.catalog_host_offerings ho
    LEFT JOIN public.reviews rv ON rv.host_id = ho.host_id
    WHERE ho.status = 'approved' AND ho.is_active
    GROUP BY ho.catalog_id
  ) o ON o.catalog_id = c.id
  WHERE c.status = 'published'
  ORDER BY c.is_featured DESC, c.sort_order, c.title;
$$;

CREATE OR REPLACE FUNCTION public.get_catalog_detail(_identifier text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_catalog public.experience_catalog%ROWTYPE;
  v_authed boolean := auth.uid() IS NOT NULL;
  v_result jsonb;
BEGIN
  SELECT * INTO v_catalog FROM public.experience_catalog
   WHERE status = 'published' AND (lower(slug) = lower(_identifier) OR id::text = _identifier)
   LIMIT 1;

  IF v_catalog.id IS NULL THEN
    RETURN jsonb_build_object('found', false);
  END IF;

  SELECT jsonb_build_object(
    'found', true,
    'gated', NOT v_authed,
    'catalog', to_jsonb(v_catalog) - 'admin_notes' - 'submitted_by' - 'reviewed_by' - 'reviewed_at',
    'host_count', (
      SELECT count(*) FROM public.catalog_host_offerings ho
      WHERE ho.catalog_id = v_catalog.id AND ho.status = 'approved' AND ho.is_active
    ),
    'price_range', (
      SELECT jsonb_build_object('min', COALESCE(min(ho.price), v_catalog.price_min), 'max', COALESCE(max(ho.price), v_catalog.price_max))
      FROM public.catalog_host_offerings ho
      WHERE ho.catalog_id = v_catalog.id AND ho.status = 'approved' AND ho.is_active
    ),
    'cities', COALESCE((
      SELECT jsonb_agg(DISTINCT ho.city) FROM public.catalog_host_offerings ho
      WHERE ho.catalog_id = v_catalog.id AND ho.status = 'approved' AND ho.is_active AND ho.city <> ''
    ), '[]'::jsonb),
    'hosts', COALESCE((
      SELECT jsonb_agg(
        CASE WHEN v_authed THEN jsonb_build_object(
          'offering_id', ho.id,
          'host_id', ho.host_id,
          'username', p.username,
          'full_name', trim(concat_ws(' ', p.first_name, p.last_name)),
          'avatar_url', p.avatar_url,
          'city', ho.city,
          'headline', ho.headline,
          'host_notes', ho.host_notes,
          'price', ho.price,
          'price_unit', ho.price_unit,
          'max_guests', ho.max_guests,
          'duration', ho.duration,
          'meeting_point', ho.meeting_point,
          'photos', ho.photos,
          'available_from', ho.available_from,
          'available_to', ho.available_to,
          'verification_status', p.verification_status,
          'rating', COALESCE((SELECT avg(r.rating)::numeric(3,2) FROM public.reviews r WHERE r.host_id = ho.host_id), 0),
          'review_count', (SELECT count(*) FROM public.reviews r WHERE r.host_id = ho.host_id)
        ) ELSE jsonb_build_object(
          'offering_id', ho.id,
          'masked', true,
          'display_name', COALESCE(left(NULLIF(p.first_name, ''), 1) || '••••••', 'Local host'),
          'city_region', split_part(ho.city, ',', greatest(array_length(string_to_array(ho.city, ','), 1), 1)),
          'headline', ho.headline,
          'price_band', CASE WHEN ho.price < 2000 THEN 'Budget friendly' WHEN ho.price < 6000 THEN 'Mid range' ELSE 'Premium' END,
          'verification_status', p.verification_status,
          'rating', COALESCE((SELECT avg(r.rating)::numeric(3,2) FROM public.reviews r WHERE r.host_id = ho.host_id), 0),
          'review_count', (SELECT count(*) FROM public.reviews r WHERE r.host_id = ho.host_id)
        ) END
        ORDER BY ho.created_at
      )
      FROM public.catalog_host_offerings ho
      JOIN public.profiles p ON p.id = ho.host_id
      WHERE ho.catalog_id = v_catalog.id AND ho.status = 'approved' AND ho.is_active
    ), '[]'::jsonb),
    'occasions', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', e.id, 'kind', e.kind, 'title', e.title, 'event_type', e.event_type,
        'city', e.city, 'start_date', e.start_date, 'end_date', e.end_date,
        'recurring_months', e.recurring_months, 'cover_image_url', e.cover_image_url,
        'description', e.description
      ) ORDER BY e.start_date NULLS LAST)
      FROM public.host_schedule_events e
      JOIN public.host_schedule_experiences se ON se.schedule_id = e.id
      WHERE se.catalog_id = v_catalog.id AND e.is_public AND e.status IN ('upcoming','ongoing')
    ), '[]'::jsonb)
  ) INTO v_result;

  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_host_schedule_public(_host uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', e.id, 'kind', e.kind, 'title', e.title, 'event_type', e.event_type,
    'description', e.description, 'city', e.city, 'venue', e.venue,
    'start_date', e.start_date, 'end_date', e.end_date,
    'recurring_months', e.recurring_months, 'cover_image_url', e.cover_image_url,
    'guest_capacity', e.guest_capacity,
    'experiences', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('catalog_id', c.id, 'slug', c.slug, 'title', c.title, 'category', c.category, 'hero_image_url', c.hero_image_url))
      FROM public.host_schedule_experiences se
      JOIN public.experience_catalog c ON c.id = se.catalog_id AND c.status = 'published'
      WHERE se.schedule_id = e.id
    ), '[]'::jsonb)
  ) ORDER BY e.start_date NULLS LAST), '[]'::jsonb)
  FROM public.host_schedule_events e
  WHERE e.host_id = _host AND e.is_public AND e.status IN ('upcoming','ongoing');
$$;

GRANT EXECUTE ON FUNCTION public.get_catalog_public() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_catalog_detail(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_host_schedule_public(uuid) TO anon, authenticated;
