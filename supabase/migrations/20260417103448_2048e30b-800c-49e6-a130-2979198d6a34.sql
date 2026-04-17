-- Generic updated_at helper
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Attach handle_new_user trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- App configuration table
CREATE TABLE IF NOT EXISTS public.app_configuration (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  description TEXT,
  is_secret BOOLEAN NOT NULL DEFAULT false,
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.app_configuration ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage configuration"
  ON public.app_configuration FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated read non-secret configuration"
  ON public.app_configuration FOR SELECT
  TO authenticated
  USING (is_secret = false);

DROP TRIGGER IF EXISTS update_app_configuration_updated_at ON public.app_configuration;
CREATE TRIGGER update_app_configuration_updated_at
  BEFORE UPDATE ON public.app_configuration
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.app_configuration (key, category, description, is_secret) VALUES
  ('STRIPE_PUBLISHABLE_KEY', 'payments', 'Stripe publishable key', false),
  ('STRIPE_SECRET_KEY', 'payments', 'Stripe secret key', true),
  ('RAZORPAY_KEY_ID', 'payments', 'Razorpay Key ID', false),
  ('RAZORPAY_KEY_SECRET', 'payments', 'Razorpay Key Secret', true),
  ('RESEND_API_KEY', 'email', 'Resend API key', true),
  ('SENDGRID_API_KEY', 'email', 'SendGrid API key', true),
  ('TWILIO_ACCOUNT_SID', 'messaging', 'Twilio Account SID', false),
  ('TWILIO_AUTH_TOKEN', 'messaging', 'Twilio Auth Token', true),
  ('TWILIO_WHATSAPP_FROM', 'messaging', 'Twilio WhatsApp sender number', false),
  ('OPENAI_API_KEY', 'ai', 'OpenAI / ChatGPT API key', true),
  ('GEMINI_API_KEY', 'ai', 'Google Gemini API key', true),
  ('AI_DEFAULT_MODEL', 'ai', 'Default AI model identifier', false),
  ('PLATFORM_TAX_RATE', 'general', 'Platform tax rate (e.g. 0.18)', false),
  ('PLATFORM_COMMISSION', 'general', 'Platform commission percentage', false),
  ('SUPPORT_EMAIL', 'general', 'Public support email', false),
  ('MAINTENANCE_MODE', 'general', 'Toggle maintenance banner', false)
ON CONFLICT (key) DO NOTHING;