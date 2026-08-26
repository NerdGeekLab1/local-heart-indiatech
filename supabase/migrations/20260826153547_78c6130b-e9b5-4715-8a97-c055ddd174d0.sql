CREATE TABLE public.destinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  state text NOT NULL DEFAULT '',
  tagline text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  highlights text[] NOT NULL DEFAULT '{}',
  best_season text,
  avg_temp text,
  hero_images text[] NOT NULL DEFAULT '{}',
  experience_tags text[] NOT NULL DEFAULT '{}',
  itinerary jsonb NOT NULL DEFAULT '[]'::jsonb,
  latitude numeric,
  longitude numeric,
  is_published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.destinations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.destinations TO authenticated;
GRANT ALL ON public.destinations TO service_role;
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published destinations are viewable by everyone"
ON public.destinations FOR SELECT
USING (is_published OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage destinations"
ON public.destinations FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.destination_sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_id uuid NOT NULL REFERENCES public.destinations(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'monument',
  description text NOT NULL DEFAULT '',
  entry_fee text,
  best_time text,
  duration text,
  latitude numeric,
  longitude numeric,
  image_url text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.destination_sites TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.destination_sites TO authenticated;
GRANT ALL ON public.destination_sites TO service_role;
ALTER TABLE public.destination_sites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Destination sites are viewable by everyone"
ON public.destination_sites FOR SELECT
USING (EXISTS (SELECT 1 FROM public.destinations d WHERE d.id = destination_id AND (d.is_published OR public.has_role(auth.uid(), 'admin'))));

CREATE POLICY "Admins manage destination sites"
ON public.destination_sites FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX destination_sites_destination_idx ON public.destination_sites(destination_id);

CREATE TRIGGER update_destinations_updated_at BEFORE UPDATE ON public.destinations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_destination_sites_updated_at BEFORE UPDATE ON public.destination_sites
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.get_destination_public(_identifier text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  d public.destinations;
  result jsonb;
BEGIN
  SELECT * INTO d FROM public.destinations
  WHERE is_published AND (slug = lower(_identifier) OR lower(name) = lower(_identifier))
  LIMIT 1;

  IF d.id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT jsonb_build_object(
    'destination', to_jsonb(d),
    'sites', COALESCE((
      SELECT jsonb_agg(to_jsonb(s) ORDER BY s.sort_order, s.name)
      FROM public.destination_sites s WHERE s.destination_id = d.id
    ), '[]'::jsonb),
    'host_count', COALESCE((
      SELECT count(*) FROM public.profiles p
      WHERE p.is_public AND p.city IS NOT NULL AND lower(p.city) = lower(d.name)
        AND public.has_role(p.id, 'host')
    ), 0),
    'hosts', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', p.id, 'username', p.username, 'first_name', p.first_name, 'last_name', p.last_name,
        'avatar_url', p.avatar_url, 'tagline', p.tagline, 'services', p.services,
        'price_per_day', p.price_per_day, 'verification_status', p.verification_status
      ))
      FROM public.profiles p
      WHERE p.is_public AND p.city IS NOT NULL AND lower(p.city) = lower(d.name)
        AND public.has_role(p.id, 'host')
    ), '[]'::jsonb),
    'experiences', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', e.id, 'title', e.title, 'category', e.category, 'image_url', e.image_url,
        'price', e.price, 'duration', e.duration, 'location', e.location,
        'host_name', e.host_name, 'rating', e.rating, 'review_count', e.review_count
      ))
      FROM public.experiences e
      WHERE e.status = 'approved'
        AND (lower(COALESCE(e.destination, '')) = lower(d.name)
             OR lower(COALESCE(e.location, '')) LIKE '%' || lower(d.name) || '%'
             OR lower(COALESCE(e.host_city, '')) = lower(d.name))
    ), '[]'::jsonb)
  ) INTO result;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_destination_public(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.import_destinations(_payload jsonb)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  item jsonb;
  site jsonb;
  dest_id uuid;
  imported integer := 0;
  idx integer;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can import destinations';
  END IF;

  FOR item IN SELECT * FROM jsonb_array_elements(_payload)
  LOOP
    INSERT INTO public.destinations (slug, name, state, tagline, description, highlights, best_season, avg_temp, hero_images, experience_tags, itinerary, created_by)
    VALUES (
      lower(item->>'slug'),
      item->>'name',
      COALESCE(item->>'state', ''),
      COALESCE(item->>'tagline', ''),
      COALESCE(item->>'description', ''),
      COALESCE((SELECT array_agg(x) FROM jsonb_array_elements_text(COALESCE(item->'highlights','[]'::jsonb)) x), '{}'),
      item->>'best_season',
      item->>'avg_temp',
      COALESCE((SELECT array_agg(x) FROM jsonb_array_elements_text(COALESCE(item->'hero_images','[]'::jsonb)) x), '{}'),
      COALESCE((SELECT array_agg(x) FROM jsonb_array_elements_text(COALESCE(item->'experience_tags','[]'::jsonb)) x), '{}'),
      COALESCE(item->'itinerary', '[]'::jsonb),
      auth.uid()
    )
    ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO dest_id;

    IF dest_id IS NULL THEN
      CONTINUE;
    END IF;

    imported := imported + 1;
    idx := 0;
    FOR site IN SELECT * FROM jsonb_array_elements(COALESCE(item->'sites', '[]'::jsonb))
    LOOP
      INSERT INTO public.destination_sites (destination_id, name, type, description, entry_fee, best_time, duration, latitude, longitude, sort_order)
      VALUES (
        dest_id,
        site->>'name',
        COALESCE(site->>'type', 'monument'),
        COALESCE(site->>'description', ''),
        site->>'entry_fee',
        site->>'best_time',
        site->>'duration',
        NULLIF(site->>'latitude', '')::numeric,
        NULLIF(site->>'longitude', '')::numeric,
        idx
      );
      idx := idx + 1;
    END LOOP;
  END LOOP;

  RETURN imported;
END;
$$;

GRANT EXECUTE ON FUNCTION public.import_destinations(jsonb) TO authenticated;