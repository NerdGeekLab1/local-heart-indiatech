-- 1. Reward appeals
CREATE TABLE public.reward_appeals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  attempt_id uuid REFERENCES public.reward_claim_attempts(id) ON DELETE SET NULL,
  action text NOT NULL,
  reference_key text,
  block_reason text,
  points integer NOT NULL DEFAULT 0,
  reason text NOT NULL,
  evidence_url text,
  status text NOT NULL DEFAULT 'pending',
  decision_notes text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  timeline jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.reward_appeals TO authenticated;
GRANT ALL ON public.reward_appeals TO service_role;

ALTER TABLE public.reward_appeals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own appeals" ON public.reward_appeals
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users create own appeals" ON public.reward_appeals
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins manage appeals" ON public.reward_appeals
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE UNIQUE INDEX reward_appeals_attempt_unique ON public.reward_appeals(attempt_id) WHERE attempt_id IS NOT NULL;
CREATE INDEX reward_appeals_status_idx ON public.reward_appeals(status, created_at DESC);

CREATE TRIGGER update_reward_appeals_updated_at
  BEFORE UPDATE ON public.reward_appeals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Submit appeal (traveler)
CREATE OR REPLACE FUNCTION public.submit_reward_appeal(_attempt_id uuid, _reason text, _evidence_url text DEFAULT NULL)
RETURNS public.reward_appeals
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _attempt public.reward_claim_attempts;
  _row public.reward_appeals;
  _recent integer;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF _reason IS NULL OR length(btrim(_reason)) < 10 THEN
    RAISE EXCEPTION 'Please describe your appeal in at least 10 characters';
  END IF;

  SELECT * INTO _attempt FROM public.reward_claim_attempts
   WHERE id = _attempt_id AND user_id = _uid;
  IF _attempt.id IS NULL THEN
    RAISE EXCEPTION 'Attempt not found';
  END IF;
  IF _attempt.allowed THEN
    RAISE EXCEPTION 'This attempt was not blocked, nothing to appeal';
  END IF;

  SELECT count(*) INTO _recent FROM public.reward_appeals
   WHERE user_id = _uid AND created_at > now() - interval '24 hours';
  IF _recent >= 5 THEN
    RAISE EXCEPTION 'Appeal limit reached, please try again tomorrow';
  END IF;

  IF EXISTS (SELECT 1 FROM public.reward_appeals WHERE attempt_id = _attempt_id) THEN
    RAISE EXCEPTION 'You already appealed this attempt';
  END IF;

  INSERT INTO public.reward_appeals (
    user_id, attempt_id, action, reference_key, block_reason, points, reason, evidence_url, timeline
  ) VALUES (
    _uid, _attempt.id, _attempt.action, _attempt.reference_key, _attempt.reason,
    COALESCE(_attempt.points, 0), btrim(_reason), nullif(btrim(coalesce(_evidence_url, '')), ''),
    jsonb_build_array(jsonb_build_object('at', now(), 'status', 'pending', 'note', 'Appeal submitted by traveler'))
  )
  RETURNING * INTO _row;

  RETURN _row;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_reward_appeal(uuid, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_reward_appeal(uuid, text, text) TO authenticated;

-- 3. Review appeal (admin)
CREATE OR REPLACE FUNCTION public.review_reward_appeal(_appeal_id uuid, _status text, _notes text DEFAULT NULL)
RETURNS public.reward_appeals
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _row public.reward_appeals;
  _award integer;
BEGIN
  IF _uid IS NULL OR NOT public.has_role(_uid, 'admin') THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;
  IF _status NOT IN ('pending', 'under_review', 'approved', 'denied') THEN
    RAISE EXCEPTION 'Invalid appeal status';
  END IF;

  UPDATE public.reward_appeals SET
    status = _status,
    decision_notes = COALESCE(nullif(btrim(coalesce(_notes, '')), ''), decision_notes),
    reviewed_by = _uid,
    reviewed_at = now(),
    timeline = timeline || jsonb_build_array(jsonb_build_object(
      'at', now(), 'status', _status, 'note',
      COALESCE(nullif(btrim(coalesce(_notes, '')), ''), 'Status updated by admin')
    ))
  WHERE id = _appeal_id
  RETURNING * INTO _row;

  IF _row.id IS NULL THEN
    RAISE EXCEPTION 'Appeal not found';
  END IF;

  IF _status = 'approved' AND _row.action = 'stamp_claim' THEN
    _award := GREATEST(COALESCE(_row.points, 0), 0);
    IF _award > 0 AND NOT EXISTS (
      SELECT 1 FROM public.reward_ledger
       WHERE user_id = _row.user_id AND event_type = 'stamp'
         AND reference_key = _row.reference_key
    ) THEN
      INSERT INTO public.reward_ledger (user_id, event_type, reference_key, points, title, status, notes, metadata)
      VALUES (_row.user_id, 'stamp', _row.reference_key, _award,
        'Appeal approved: ' || COALESCE(_row.reference_key, 'stamp reward'), 'approved',
        'Granted after appeal review', jsonb_build_object('appeal_id', _row.id, 'verified', true));
    END IF;
  END IF;

  RETURN _row;
END;
$$;

REVOKE ALL ON FUNCTION public.review_reward_appeal(uuid, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.review_reward_appeal(uuid, text, text) TO authenticated;

-- 4. Wanderer-initiated mission requests
ALTER TABLE public.wanderer_missions ALTER COLUMN assigned_by DROP NOT NULL;

CREATE POLICY "Wanderers can request missions" ON public.wanderer_missions
  FOR INSERT TO authenticated
  WITH CHECK (
    status = 'requested'
    AND wanderer_id IN (
      SELECT id FROM public.beta_wanderers
       WHERE user_id = auth.uid() AND status IN ('approved', 'verified', 'active')
    )
  );
