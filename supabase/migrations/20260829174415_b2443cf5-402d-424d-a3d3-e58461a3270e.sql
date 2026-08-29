-- 1. Reward ledger
CREATE TABLE public.reward_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('referral','stamp','redemption','payout','adjustment')),
  reference_key text,
  reference_id uuid,
  points integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','paid','rejected')),
  title text NOT NULL DEFAULT '',
  notes text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reward_ledger TO authenticated;
GRANT ALL ON public.reward_ledger TO service_role;
ALTER TABLE public.reward_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own ledger" ON public.reward_ledger FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins manage ledger" ON public.reward_ledger FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE TRIGGER reward_ledger_updated_at BEFORE UPDATE ON public.reward_ledger
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX reward_ledger_user_idx ON public.reward_ledger(user_id, created_at DESC);

-- 2. Referral codes with history
CREATE TABLE public.referral_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  uses integer NOT NULL DEFAULT 0,
  created_by uuid,
  retired_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.referral_codes TO authenticated;
GRANT ALL ON public.referral_codes TO service_role;
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own referral codes" ON public.referral_codes FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins manage referral codes" ON public.referral_codes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE TRIGGER referral_codes_updated_at BEFORE UPDATE ON public.referral_codes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE UNIQUE INDEX referral_codes_one_active ON public.referral_codes(user_id) WHERE is_active;

-- 3. Stamp claim tracking
ALTER TABLE public.traveler_stamps
  ADD COLUMN IF NOT EXISTS claimed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS claimed_at timestamptz;

-- 4. Points balance
CREATE OR REPLACE FUNCTION public.get_reward_balance(_user uuid DEFAULT NULL)
RETURNS TABLE(approved_points integer, pending_points integer, paid_points integer, spent_points integer)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    COALESCE(sum(points) FILTER (WHERE status IN ('approved','paid') AND points > 0), 0)::int
      + COALESCE(sum(points) FILTER (WHERE status IN ('approved','paid') AND points < 0), 0)::int,
    COALESCE(sum(points) FILTER (WHERE status = 'pending' AND points > 0), 0)::int,
    COALESCE(sum(points) FILTER (WHERE status = 'paid'), 0)::int,
    COALESCE(-sum(points) FILTER (WHERE points < 0 AND status <> 'rejected'), 0)::int
  FROM public.reward_ledger
  WHERE user_id = COALESCE(_user, auth.uid())
    AND (COALESCE(_user, auth.uid()) = auth.uid() OR public.has_role(auth.uid(), 'admin'::public.app_role));
$$;

-- 5. Claim a stamp reward
CREATE OR REPLACE FUNCTION public.claim_stamp_reward(_stamp_key text, _points integer, _title text)
RETURNS reward_ledger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_stamp public.traveler_stamps%ROWTYPE;
  v_row public.reward_ledger%ROWTYPE;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Sign in to claim rewards'; END IF;
  SELECT * INTO v_stamp FROM public.traveler_stamps WHERE user_id = v_uid AND stamp_key = _stamp_key FOR UPDATE;
  IF v_stamp.id IS NULL THEN RAISE EXCEPTION 'You have not earned this stamp yet'; END IF;
  IF v_stamp.claimed THEN RAISE EXCEPTION 'This stamp reward was already claimed'; END IF;

  UPDATE public.traveler_stamps SET claimed = true, claimed_at = now(), updated_at = now() WHERE id = v_stamp.id;

  INSERT INTO public.reward_ledger (user_id, event_type, reference_key, reference_id, points, status, title, metadata)
  VALUES (v_uid, 'stamp', _stamp_key, v_stamp.id, GREATEST(COALESCE(_points, 0), 0), 'approved',
          COALESCE(NULLIF(_title, ''), 'Stamp reward'), jsonb_build_object('tier', v_stamp.tier, 'category', v_stamp.category))
  RETURNING * INTO v_row;
  RETURN v_row;
END;
$$;

-- 6. Redeem points
CREATE OR REPLACE FUNCTION public.redeem_reward(_reward_key text, _points integer, _title text)
RETURNS reward_ledger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_balance integer;
  v_row public.reward_ledger%ROWTYPE;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Sign in to redeem rewards'; END IF;
  IF COALESCE(_points, 0) <= 0 THEN RAISE EXCEPTION 'Invalid redemption amount'; END IF;

  SELECT COALESCE(sum(points), 0)::int INTO v_balance
  FROM public.reward_ledger WHERE user_id = v_uid AND status IN ('approved','paid','pending') AND points < 0;
  SELECT v_balance + COALESCE(sum(points), 0)::int INTO v_balance
  FROM public.reward_ledger WHERE user_id = v_uid AND status IN ('approved','paid') AND points > 0;

  IF v_balance < _points THEN RAISE EXCEPTION 'Not enough reward points (available: %)', GREATEST(v_balance, 0); END IF;

  INSERT INTO public.reward_ledger (user_id, event_type, reference_key, points, status, title)
  VALUES (v_uid, 'redemption', _reward_key, -_points, 'pending', COALESCE(NULLIF(_title, ''), 'Reward redemption'))
  RETURNING * INTO v_row;
  RETURN v_row;
END;
$$;

-- 7. Referral code creation / regeneration
CREATE OR REPLACE FUNCTION public.regenerate_referral_code(_user uuid DEFAULT NULL)
RETURNS referral_codes
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_target uuid := COALESCE(_user, auth.uid());
  v_code text;
  v_row public.referral_codes%ROWTYPE;
BEGIN
  IF v_actor IS NULL THEN RAISE EXCEPTION 'Sign in required'; END IF;
  IF v_target <> v_actor AND NOT public.has_role(v_actor, 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Only admins can manage another traveler''s referral code';
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
  RETURN v_row;
END;
$$;

-- 8. Admin ledger review
CREATE OR REPLACE FUNCTION public.review_reward_ledger(_id uuid, _status text, _notes text DEFAULT NULL)
RETURNS reward_ledger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_row public.reward_ledger%ROWTYPE;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Only admins can review reward events';
  END IF;
  IF _status NOT IN ('pending','approved','paid','rejected') THEN RAISE EXCEPTION 'Invalid status'; END IF;
  UPDATE public.reward_ledger
     SET status = _status, notes = COALESCE(_notes, notes), reviewed_by = auth.uid(), reviewed_at = now(), updated_at = now()
   WHERE id = _id RETURNING * INTO v_row;
  IF v_row.id IS NULL THEN RAISE EXCEPTION 'Reward event not found'; END IF;
  INSERT INTO public.admin_audit_log (admin_id, entity_type, entity_id, action, new_status, notes, metadata)
  VALUES (auth.uid(), 'reward_ledger', v_row.id, 'review', _status, _notes,
          jsonb_build_object('user_id', v_row.user_id, 'points', v_row.points, 'event_type', v_row.event_type));
  RETURN v_row;
END;
$$;
