-- 1. Receipt codes on ledger
ALTER TABLE public.reward_ledger ADD COLUMN IF NOT EXISTS receipt_code text;

CREATE OR REPLACE FUNCTION public.set_reward_receipt_code()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.receipt_code IS NULL THEN
    NEW.receipt_code := 'RWD-' || to_char(now(), 'YYMM') || '-' || upper(substr(md5(NEW.id::text || clock_timestamp()::text), 1, 6));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_reward_receipt_code ON public.reward_ledger;
CREATE TRIGGER set_reward_receipt_code
  BEFORE INSERT ON public.reward_ledger
  FOR EACH ROW EXECUTE FUNCTION public.set_reward_receipt_code();

UPDATE public.reward_ledger
   SET receipt_code = 'RWD-' || to_char(created_at, 'YYMM') || '-' || upper(substr(md5(id::text), 1, 6))
 WHERE receipt_code IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS reward_ledger_receipt_code_key ON public.reward_ledger (receipt_code);

-- Duplicate claim prevention: one ledger row per stamp claim
CREATE UNIQUE INDEX IF NOT EXISTS reward_ledger_unique_stamp_claim
  ON public.reward_ledger (user_id, reference_key)
  WHERE event_type = 'stamp';

-- 2. Server-side redemption price list
CREATE TABLE IF NOT EXISTS public.reward_redemption_catalog (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reward_key text NOT NULL UNIQUE,
  title text NOT NULL,
  points integer NOT NULL CHECK (points > 0),
  kind text NOT NULL DEFAULT 'credit',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.reward_redemption_catalog TO anon;
GRANT SELECT ON public.reward_redemption_catalog TO authenticated;
GRANT ALL ON public.reward_redemption_catalog TO service_role;
ALTER TABLE public.reward_redemption_catalog ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Redemption catalog is public" ON public.reward_redemption_catalog;
CREATE POLICY "Redemption catalog is public" ON public.reward_redemption_catalog FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins manage redemption catalog" ON public.reward_redemption_catalog;
CREATE POLICY "Admins manage redemption catalog" ON public.reward_redemption_catalog FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP TRIGGER IF EXISTS update_reward_redemption_catalog_updated_at ON public.reward_redemption_catalog;
CREATE TRIGGER update_reward_redemption_catalog_updated_at
  BEFORE UPDATE ON public.reward_redemption_catalog
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.reward_redemption_catalog (reward_key, title, points, kind) VALUES
  ('credit_100', '₹100 booking credit', 100, 'credit'),
  ('upgrade_exp', 'Free experience upgrade', 300, 'experience'),
  ('tier_explorer', '1 month Explorer tier', 500, 'membership'),
  ('credit_1000', '₹1,000 experience voucher', 900, 'credit'),
  ('tier_adventurer', '1 month Adventurer tier', 1000, 'membership'),
  ('free_stay', 'Complimentary 1-night stay', 2000, 'experience')
ON CONFLICT (reward_key) DO UPDATE SET title = EXCLUDED.title, points = EXCLUDED.points, kind = EXCLUDED.kind;

-- 3. Attempt log for rate limiting and abuse review
CREATE TABLE IF NOT EXISTS public.reward_claim_attempts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  action text NOT NULL,
  reference_key text,
  allowed boolean NOT NULL DEFAULT false,
  reason text,
  points integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.reward_claim_attempts TO authenticated;
GRANT ALL ON public.reward_claim_attempts TO service_role;
ALTER TABLE public.reward_claim_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own claim attempts" ON public.reward_claim_attempts;
CREATE POLICY "Users read own claim attempts" ON public.reward_claim_attempts FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE INDEX IF NOT EXISTS reward_claim_attempts_user_time ON public.reward_claim_attempts (user_id, action, created_at DESC);

-- 4. Tier -> points, server side
CREATE OR REPLACE FUNCTION public.stamp_tier_points(_tier text)
RETURNS integer
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE lower(COALESCE(_tier, 'bronze'))
    WHEN 'legend' THEN 1000
    WHEN 'platinum' THEN 500
    WHEN 'gold' THEN 250
    WHEN 'silver' THEN 100
    ELSE 50
  END;
$$;

-- 5. Hardened stamp claim
CREATE OR REPLACE FUNCTION public.claim_stamp_reward(_stamp_key text, _points integer, _title text)
RETURNS reward_ledger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_stamp public.traveler_stamps%ROWTYPE;
  v_row public.reward_ledger%ROWTYPE;
  v_recent integer;
  v_points integer;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Sign in to claim rewards'; END IF;

  -- rate limit: 10 stamp claims per rolling hour
  SELECT count(*) INTO v_recent FROM public.reward_claim_attempts
   WHERE user_id = v_uid AND action = 'stamp_claim' AND allowed AND created_at > now() - interval '1 hour';
  IF v_recent >= 10 THEN
    INSERT INTO public.reward_claim_attempts (user_id, action, reference_key, allowed, reason)
    VALUES (v_uid, 'stamp_claim', _stamp_key, false, 'rate_limited');
    RAISE EXCEPTION 'Too many claims in the last hour. Please try again later.';
  END IF;

  SELECT * INTO v_stamp FROM public.traveler_stamps
   WHERE user_id = v_uid AND stamp_key = _stamp_key FOR UPDATE;

  IF v_stamp.id IS NULL OR v_stamp.earned_at IS NULL OR v_stamp.earned_at > now() THEN
    INSERT INTO public.reward_claim_attempts (user_id, action, reference_key, allowed, reason)
    VALUES (v_uid, 'stamp_claim', _stamp_key, false, 'not_earned');
    RAISE EXCEPTION 'You have not earned this stamp yet';
  END IF;

  IF v_stamp.claimed THEN
    INSERT INTO public.reward_claim_attempts (user_id, action, reference_key, allowed, reason)
    VALUES (v_uid, 'stamp_claim', _stamp_key, false, 'already_claimed');
    RAISE EXCEPTION 'This stamp reward was already claimed';
  END IF;

  IF EXISTS (SELECT 1 FROM public.reward_ledger
              WHERE user_id = v_uid AND event_type = 'stamp' AND reference_key = _stamp_key) THEN
    INSERT INTO public.reward_claim_attempts (user_id, action, reference_key, allowed, reason)
    VALUES (v_uid, 'stamp_claim', _stamp_key, false, 'duplicate_ledger_entry');
    RAISE EXCEPTION 'This stamp reward was already claimed';
  END IF;

  -- server derives the point value; the client value is ignored
  v_points := public.stamp_tier_points(v_stamp.tier);

  UPDATE public.traveler_stamps
     SET claimed = true, claimed_at = now(), updated_at = now()
   WHERE id = v_stamp.id;

  INSERT INTO public.reward_ledger (user_id, event_type, reference_key, reference_id, points, status, title, metadata)
  VALUES (v_uid, 'stamp', _stamp_key, v_stamp.id, v_points, 'approved',
          COALESCE(NULLIF(_title, ''), 'Stamp reward'),
          jsonb_build_object('tier', v_stamp.tier, 'category', v_stamp.category, 'verified', true))
  RETURNING * INTO v_row;

  INSERT INTO public.reward_claim_attempts (user_id, action, reference_key, allowed, reason, points)
  VALUES (v_uid, 'stamp_claim', _stamp_key, true, 'approved', v_points);

  RETURN v_row;
END;
$$;

-- 6. Hardened redemption
CREATE OR REPLACE FUNCTION public.redeem_reward(_reward_key text, _points integer, _title text)
RETURNS reward_ledger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_balance integer;
  v_row public.reward_ledger%ROWTYPE;
  v_cat public.reward_redemption_catalog%ROWTYPE;
  v_recent integer;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Sign in to redeem rewards'; END IF;

  SELECT * INTO v_cat FROM public.reward_redemption_catalog
   WHERE reward_key = _reward_key AND is_active;
  IF v_cat.id IS NULL THEN
    INSERT INTO public.reward_claim_attempts (user_id, action, reference_key, allowed, reason)
    VALUES (v_uid, 'redemption', _reward_key, false, 'unknown_reward');
    RAISE EXCEPTION 'That reward is not available';
  END IF;

  -- rate limit: 5 redemptions per rolling hour
  SELECT count(*) INTO v_recent FROM public.reward_claim_attempts
   WHERE user_id = v_uid AND action = 'redemption' AND allowed AND created_at > now() - interval '1 hour';
  IF v_recent >= 5 THEN
    INSERT INTO public.reward_claim_attempts (user_id, action, reference_key, allowed, reason)
    VALUES (v_uid, 'redemption', _reward_key, false, 'rate_limited');
    RAISE EXCEPTION 'Too many redemptions in the last hour. Please try again later.';
  END IF;

  -- duplicate submission guard
  IF EXISTS (SELECT 1 FROM public.reward_ledger
              WHERE user_id = v_uid AND event_type = 'redemption' AND reference_key = _reward_key
                AND status = 'pending' AND created_at > now() - interval '1 minute') THEN
    INSERT INTO public.reward_claim_attempts (user_id, action, reference_key, allowed, reason)
    VALUES (v_uid, 'redemption', _reward_key, false, 'duplicate_submission');
    RAISE EXCEPTION 'This redemption was just submitted and is awaiting review';
  END IF;

  SELECT COALESCE(sum(points), 0)::int INTO v_balance
  FROM public.reward_ledger WHERE user_id = v_uid AND status IN ('approved','paid','pending') AND points < 0;
  SELECT v_balance + COALESCE(sum(points), 0)::int INTO v_balance
  FROM public.reward_ledger WHERE user_id = v_uid AND status IN ('approved','paid') AND points > 0;

  IF v_balance < v_cat.points THEN
    INSERT INTO public.reward_claim_attempts (user_id, action, reference_key, allowed, reason, points)
    VALUES (v_uid, 'redemption', _reward_key, false, 'insufficient_points', v_cat.points);
    RAISE EXCEPTION 'Not enough reward points (available: %)', GREATEST(v_balance, 0);
  END IF;

  INSERT INTO public.reward_ledger (user_id, event_type, reference_key, points, status, title, metadata)
  VALUES (v_uid, 'redemption', _reward_key, -v_cat.points, 'pending',
          COALESCE(NULLIF(_title, ''), v_cat.title),
          jsonb_build_object('kind', v_cat.kind, 'catalog_points', v_cat.points, 'verified', true))
  RETURNING * INTO v_row;

  INSERT INTO public.reward_claim_attempts (user_id, action, reference_key, allowed, reason, points)
  VALUES (v_uid, 'redemption', _reward_key, true, 'submitted', v_cat.points);

  RETURN v_row;
END;
$$;

-- 7. Referral code rotation rate limit
CREATE OR REPLACE FUNCTION public.regenerate_referral_code(_user uuid DEFAULT NULL::uuid)
RETURNS referral_codes
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_target uuid := COALESCE(_user, auth.uid());
  v_code text;
  v_row public.referral_codes%ROWTYPE;
  v_recent integer;
  v_is_admin boolean;
BEGIN
  IF v_actor IS NULL THEN RAISE EXCEPTION 'Sign in required'; END IF;
  v_is_admin := public.has_role(v_actor, 'admin'::public.app_role);
  IF v_target <> v_actor AND NOT v_is_admin THEN
    RAISE EXCEPTION 'Only admins can manage another traveler''s referral code';
  END IF;

  IF NOT v_is_admin THEN
    SELECT count(*) INTO v_recent FROM public.reward_claim_attempts
     WHERE user_id = v_actor AND action = 'referral_rotate' AND allowed AND created_at > now() - interval '1 hour';
    IF v_recent >= 3 THEN
      INSERT INTO public.reward_claim_attempts (user_id, action, allowed, reason)
      VALUES (v_actor, 'referral_rotate', false, 'rate_limited');
      RAISE EXCEPTION 'You can only refresh your referral code 3 times per hour';
    END IF;
  END IF;

  UPDATE public.referral_codes SET is_active = false, retired_at = now(), updated_at = now()
   WHERE user_id = v_target AND is_active;

  LOOP
    v_code := 'TRAV-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.referral_codes WHERE code = v_code);
  END LOOP;

  INSERT INTO public.referral_codes (user_id, code, created_by)
  VALUES (v_target, v_code, v_actor)
  RETURNING * INTO v_row;

  INSERT INTO public.reward_claim_attempts (user_id, action, reference_key, allowed, reason)
  VALUES (v_actor, 'referral_rotate', v_code, true, 'rotated');

  RETURN v_row;
END;
$$;