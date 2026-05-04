ALTER TABLE public.host_eligibility
  ADD COLUMN IF NOT EXISTS social_links jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS social_score integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS questionnaire_score integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS questionnaire_answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS badge text NOT NULL DEFAULT 'newcomer';