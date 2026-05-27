
CREATE TABLE public.feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_key text NOT NULL UNIQUE,
  label text NOT NULL,
  description text,
  enabled_globally boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read flags" ON public.feature_flags FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage flags" ON public.feature_flags FOR ALL TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_feature_flags_updated BEFORE UPDATE ON public.feature_flags FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.user_feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  flag_key text NOT NULL,
  granted_by uuid NOT NULL,
  granted_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, flag_key)
);
ALTER TABLE public.user_feature_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own flags" ON public.user_feature_flags FOR SELECT TO authenticated USING (user_id = auth.uid() OR has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage user flags" ON public.user_feature_flags FOR ALL TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

CREATE TABLE public.beta_waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  full_name text,
  city text,
  interest text,
  plan_interest text,
  referral_source text,
  status text NOT NULL DEFAULT 'pending',
  confirmation_token uuid NOT NULL DEFAULT gen_random_uuid(),
  confirmed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.beta_waitlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can join waitlist" ON public.beta_waitlist FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins view waitlist" ON public.beta_waitlist FOR SELECT TO authenticated USING (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage waitlist" ON public.beta_waitlist FOR UPDATE TO authenticated USING (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete waitlist" ON public.beta_waitlist FOR DELETE TO authenticated USING (has_role(auth.uid(),'admin'));

INSERT INTO public.feature_flags (flag_key, label, description) VALUES
  ('beta_experiences','Beta Experiences','Show beta-only experience templates'),
  ('advanced_moderation','Advanced Moderation','Unlock advanced moderation tools'),
  ('wedding_preview','Wedding Live Preview','Live preview panel for wedding fields'),
  ('ai_concierge','AI Concierge','Access to AI trip concierge');
