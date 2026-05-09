
-- Add template_data jsonb to experiences and experience_requests for structured custom fields (e.g. wedding date, couple names, highlights)
ALTER TABLE public.experiences ADD COLUMN IF NOT EXISTS template_data jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.experience_requests ADD COLUMN IF NOT EXISTS template_data jsonb DEFAULT '{}'::jsonb;

-- Seed tracking category configuration entries for analytics/pixels (admins can fill values via Configuration UI)
INSERT INTO public.app_configuration (key, value, category, description, is_secret)
VALUES
  ('GOOGLE_ANALYTICS_ID', NULL, 'tracking', 'Google Analytics 4 Measurement ID (e.g. G-XXXXXXXXXX). Auto-injects gtag script.', false),
  ('FACEBOOK_PIXEL_ID', NULL, 'tracking', 'Facebook Pixel ID. Auto-injects pixel script.', false),
  ('GOOGLE_TAG_MANAGER_ID', NULL, 'tracking', 'Google Tag Manager container ID (e.g. GTM-XXXXXXX).', false),
  ('CUSTOM_HEAD_SCRIPTS', NULL, 'tracking', 'Raw HTML/JS to inject into the document <head>. Use for any custom verification/tracking tags.', false)
ON CONFLICT (key) DO NOTHING;
