ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS host_proposed_requests text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS provided_requests text[] NOT NULL DEFAULT '{}'::text[];