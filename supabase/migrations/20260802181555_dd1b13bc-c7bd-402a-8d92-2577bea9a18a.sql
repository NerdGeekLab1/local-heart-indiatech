-- Website CMS settings (single row, draft + published)
CREATE TABLE public.site_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  singleton boolean NOT NULL DEFAULT true UNIQUE,
  published jsonb NOT NULL DEFAULT '{}'::jsonb,
  draft jsonb NOT NULL DEFAULT '{}'::jsonb,
  version integer NOT NULL DEFAULT 1,
  published_at timestamptz,
  published_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read site settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins can insert site settings" ON public.site_settings FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update site settings" ON public.site_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.site_settings_versions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  version integer NOT NULL,
  snapshot jsonb NOT NULL,
  note text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.site_settings_versions TO authenticated;
GRANT ALL ON public.site_settings_versions TO service_role;
ALTER TABLE public.site_settings_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read setting versions" ON public.site_settings_versions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can create setting versions" ON public.site_settings_versions FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Generic content tables
CREATE TABLE public.cms_blogs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text,
  body text,
  image_url text,
  category text,
  author text,
  tags text[] NOT NULL DEFAULT '{}',
  read_time text,
  is_published boolean NOT NULL DEFAULT false,
  is_featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.cms_stories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text,
  body text,
  image_url text,
  video_url text,
  location text,
  author text,
  tags text[] NOT NULL DEFAULT '{}',
  is_published boolean NOT NULL DEFAULT false,
  is_featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.cms_tips (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  body text,
  category text,
  icon text,
  is_published boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.cms_channels (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  icon text,
  color text,
  member_count integer NOT NULL DEFAULT 0,
  external_url text,
  is_published boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.cms_blogs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cms_blogs TO authenticated;
GRANT ALL ON public.cms_blogs TO service_role;
GRANT SELECT ON public.cms_stories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cms_stories TO authenticated;
GRANT ALL ON public.cms_stories TO service_role;
GRANT SELECT ON public.cms_tips TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cms_tips TO authenticated;
GRANT ALL ON public.cms_tips TO service_role;
GRANT SELECT ON public.cms_channels TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cms_channels TO authenticated;
GRANT ALL ON public.cms_channels TO service_role;

ALTER TABLE public.cms_blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published blogs" ON public.cms_blogs FOR SELECT USING (is_published OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage blogs" ON public.cms_blogs FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public can read published stories" ON public.cms_stories FOR SELECT USING (is_published OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage stories" ON public.cms_stories FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public can read published tips" ON public.cms_tips FOR SELECT USING (is_published OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage tips" ON public.cms_tips FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public can read published channels" ON public.cms_channels FOR SELECT USING (is_published OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage channels" ON public.cms_channels FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cms_blogs_updated_at BEFORE UPDATE ON public.cms_blogs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cms_stories_updated_at BEFORE UPDATE ON public.cms_stories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cms_tips_updated_at BEFORE UPDATE ON public.cms_tips FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cms_channels_updated_at BEFORE UPDATE ON public.cms_channels FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed the settings singleton
INSERT INTO public.site_settings (published, draft, published_at)
VALUES (
  jsonb_build_object(
    'site_title', 'Travelista — Authentic India, hosted by locals',
    'tagline', 'Travel India like a local',
    'meta_description', 'Discover India through local hosts: curated trips, homestays, food experiences and traveler stories.',
    'meta_keywords', 'India travel, local hosts, homestays, trips, experiences',
    'favicon_url', '/favicon.ico',
    'logo_url', '',
    'og_image_url', '',
    'base_url', 'https://local-heart-indiatech.lovable.app',
    'twitter_handle', '',
    'instagram_url', '',
    'youtube_url', '',
    'contact_email', '',
    'contact_phone', '',
    'footer_note', '',
    'robots_allow_all', true,
    'robots_disallowed_paths', '/admin,/dashboard',
    'robots_extra', '',
    'sitemap_include_blogs', true,
    'sitemap_include_stories', true
  ),
  '{}'::jsonb,
  now()
);

UPDATE public.site_settings SET draft = published;