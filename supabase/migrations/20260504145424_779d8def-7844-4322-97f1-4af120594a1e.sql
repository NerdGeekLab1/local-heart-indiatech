
CREATE TABLE public.host_eligibility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  city TEXT NOT NULL,
  country_focus TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{}',
  english_proficiency TEXT NOT NULL DEFAULT 'basic',
  years_hosting INTEGER NOT NULL DEFAULT 0,
  foreign_guests_hosted INTEGER NOT NULL DEFAULT 0,
  has_passport BOOLEAN NOT NULL DEFAULT false,
  has_kyc BOOLEAN NOT NULL DEFAULT false,
  cultural_training BOOLEAN NOT NULL DEFAULT false,
  emergency_contact TEXT,
  references_count INTEGER NOT NULL DEFAULT 0,
  hosting_specialties TEXT[] DEFAULT '{}',
  why_host TEXT,
  eligibility_score INTEGER NOT NULL DEFAULT 0,
  waitlist_position INTEGER,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.host_eligibility ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users submit own eligibility"
  ON public.host_eligibility FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view own eligibility"
  ON public.host_eligibility FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users update own pending application"
  ON public.host_eligibility FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete eligibility"
  ON public.host_eligibility FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_host_eligibility_updated_at
  BEFORE UPDATE ON public.host_eligibility
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_host_eligibility_status ON public.host_eligibility(status);
CREATE INDEX idx_host_eligibility_score ON public.host_eligibility(eligibility_score DESC);
