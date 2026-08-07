
CREATE TABLE public.traveler_stamps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  stamp_key text NOT NULL,
  category text NOT NULL,
  tier text NOT NULL DEFAULT 'bronze',
  progress integer NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  earned_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, stamp_key)
);

ALTER TABLE public.traveler_stamps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own stamps" ON public.traveler_stamps
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users insert own stamps" ON public.traveler_stamps
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users update own stamps" ON public.traveler_stamps
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete stamps" ON public.traveler_stamps
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_traveler_stamps_updated_at
  BEFORE UPDATE ON public.traveler_stamps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_traveler_stamps_user ON public.traveler_stamps(user_id);
CREATE INDEX idx_traveler_stamps_category ON public.traveler_stamps(category);
