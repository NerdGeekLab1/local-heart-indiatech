DROP FUNCTION public.get_public_wanderer_showcase(uuid);
DROP FUNCTION public.get_public_wanderers_showcase();

CREATE FUNCTION public.get_public_wanderers_showcase()
RETURNS TABLE(
  id uuid,
  user_id uuid,
  full_name text,
  city text,
  bio text,
  travel_styles text[],
  preferred_destinations text[],
  social_links jsonb,
  video_url text,
  score integer,
  missions_completed integer,
  total_videos integer,
  badge text,
  status text,
  created_at timestamptz,
  avatar_url text,
  stamps jsonb,
  stamp_count bigint,
  missions jsonb
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    w.id, w.user_id, w.full_name, w.city, w.bio, w.travel_styles,
    w.preferred_destinations, w.social_links, w.video_url, w.score,
    w.missions_completed, w.total_videos, w.badge, w.status, w.created_at,
    p.avatar_url,
    COALESCE(stamp_summary.stamps, '[]'::jsonb),
    COALESCE(stamp_summary.stamp_count, 0),
    COALESCE(mission_summary.missions, '[]'::jsonb)
  FROM public.beta_wanderers w
  LEFT JOIN public.profiles p ON p.id = w.user_id
  LEFT JOIN LATERAL (
    SELECT
      jsonb_agg(
        jsonb_build_object(
          'stamp_key', s.stamp_key,
          'tier', s.tier,
          'category', s.category,
          'earned_at', s.earned_at
        ) ORDER BY s.earned_at DESC
      ) AS stamps,
      COUNT(*) AS stamp_count
    FROM public.traveler_stamps s
    WHERE s.user_id = w.user_id
  ) stamp_summary ON true
  LEFT JOIN LATERAL (
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', m.id,
        'title', m.title,
        'description', m.description,
        'destination', m.destination,
        'status', m.status,
        'deadline', m.deadline,
        'reward_points', m.reward_points,
        'completed_at', m.completed_at,
        'created_at', m.created_at
      ) ORDER BY COALESCE(m.completed_at, m.created_at) DESC
    ) AS missions
    FROM public.wanderer_missions m
    WHERE m.wanderer_id = w.id
      AND m.status = 'completed'
  ) mission_summary ON true
  WHERE w.status = 'approved'
  ORDER BY w.score DESC;
$$;

CREATE FUNCTION public.get_public_wanderer_showcase(_id uuid)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  full_name text,
  city text,
  bio text,
  travel_styles text[],
  preferred_destinations text[],
  social_links jsonb,
  video_url text,
  score integer,
  missions_completed integer,
  total_videos integer,
  badge text,
  status text,
  created_at timestamptz,
  avatar_url text,
  stamps jsonb,
  stamp_count bigint,
  missions jsonb
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.get_public_wanderers_showcase() WHERE id = _id;
$$;

REVOKE ALL ON FUNCTION public.get_public_wanderers_showcase() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_public_wanderer_showcase(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_wanderers_showcase() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_public_wanderer_showcase(uuid) TO anon, authenticated, service_role;

ALTER TABLE public.creator_content
  ADD COLUMN reviewed_by uuid,
  ADD COLUMN stamp_key text;

ALTER TABLE public.creator_payouts
  ADD COLUMN content_ids uuid[] NOT NULL DEFAULT '{}',
  ADD COLUMN approved_by uuid,
  ADD COLUMN approved_at timestamptz;

CREATE UNIQUE INDEX creator_payout_reference_unique
  ON public.creator_payouts(reference)
  WHERE reference IS NOT NULL AND btrim(reference) <> '';

CREATE UNIQUE INDEX reward_ledger_creator_content_unique
  ON public.reward_ledger(user_id, reference_key, reference_id)
  WHERE reference_key = 'creator_content';

CREATE OR REPLACE FUNCTION public.guard_creator_owned_updates()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;

  IF TG_TABLE_NAME = 'creator_applications' THEN
    NEW.user_id := OLD.user_id;
    NEW.status := OLD.status;
    NEW.tier := OLD.tier;
    NEW.review_notes := OLD.review_notes;
    NEW.reviewed_at := OLD.reviewed_at;
    NEW.reviewed_by := OLD.reviewed_by;
  ELSIF TG_TABLE_NAME = 'creator_content' THEN
    NEW.creator_id := OLD.creator_id;
    NEW.user_id := OLD.user_id;
    NEW.status := OLD.status;
    NEW.reward_points := OLD.reward_points;
    NEW.payout_amount := OLD.payout_amount;
    NEW.review_notes := OLD.review_notes;
    NEW.reviewed_at := OLD.reviewed_at;
    NEW.reviewed_by := OLD.reviewed_by;
    NEW.stamp_key := OLD.stamp_key;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER guard_creator_application_owner_update
  BEFORE UPDATE ON public.creator_applications
  FOR EACH ROW EXECUTE FUNCTION public.guard_creator_owned_updates();

CREATE TRIGGER guard_creator_content_owner_update
  BEFORE UPDATE ON public.creator_content
  FOR EACH ROW EXECUTE FUNCTION public.guard_creator_owned_updates();

CREATE OR REPLACE FUNCTION public.review_creator_content(
  _content_id uuid,
  _status text,
  _reward_points integer DEFAULT NULL,
  _payout numeric DEFAULT NULL,
  _notes text DEFAULT NULL
)
RETURNS public.creator_content
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  row public.creator_content;
  creator_user uuid;
  earned_stamp_key text;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Admins only'; END IF;
  IF _status NOT IN ('submitted','approved','rejected') THEN RAISE EXCEPTION 'Invalid status'; END IF;
  IF COALESCE(_reward_points, 0) < 0 OR COALESCE(_reward_points, 0) > 100000 THEN RAISE EXCEPTION 'Invalid reward points'; END IF;
  IF COALESCE(_payout, 0) < 0 OR COALESCE(_payout, 0) > 10000000 THEN RAISE EXCEPTION 'Invalid payout amount'; END IF;

  SELECT user_id INTO creator_user FROM public.creator_content WHERE id = _content_id FOR UPDATE;
  IF creator_user IS NULL THEN RAISE EXCEPTION 'Content not found'; END IF;

  earned_stamp_key := 'creator-storyteller-' || _content_id::text;

  UPDATE public.creator_content
  SET status = _status,
      reward_points = CASE WHEN _status = 'approved' THEN COALESCE(_reward_points, reward_points) ELSE 0 END,
      payout_amount = CASE WHEN _status = 'approved' THEN COALESCE(_payout, payout_amount) ELSE 0 END,
      review_notes = _notes,
      reviewed_at = now(),
      reviewed_by = auth.uid(),
      stamp_key = CASE WHEN _status = 'approved' THEN earned_stamp_key ELSE NULL END
  WHERE id = _content_id
  RETURNING * INTO row;

  IF _status = 'approved' THEN
    INSERT INTO public.reward_ledger (
      user_id, event_type, reference_key, reference_id, points, status,
      title, notes, metadata, reviewed_by, reviewed_at
    ) VALUES (
      creator_user, 'creator_content', 'creator_content', _content_id,
      row.reward_points, 'approved', 'Creator content approved', _notes,
      jsonb_build_object('content_title', row.title, 'payout_amount_inr', row.payout_amount, 'platform', row.platform),
      auth.uid(), now()
    )
    ON CONFLICT (user_id, reference_key, reference_id)
    DO UPDATE SET points = EXCLUDED.points, status = 'approved', title = EXCLUDED.title,
      notes = EXCLUDED.notes, metadata = EXCLUDED.metadata, reviewed_by = EXCLUDED.reviewed_by,
      reviewed_at = EXCLUDED.reviewed_at, updated_at = now();

    INSERT INTO public.traveler_stamps (user_id, stamp_key, category, tier, progress, metadata)
    VALUES (
      creator_user, earned_stamp_key, 'creator',
      CASE WHEN row.reward_points >= 500 THEN 'gold' WHEN row.reward_points >= 200 THEN 'silver' ELSE 'bronze' END,
      100,
      jsonb_build_object('title', 'Published Storyteller', 'content_id', row.id, 'content_title', row.title, 'platform', row.platform)
    )
    ON CONFLICT (user_id, stamp_key) DO UPDATE
      SET tier = EXCLUDED.tier, progress = 100, metadata = EXCLUDED.metadata, updated_at = now();
  ELSE
    UPDATE public.reward_ledger
      SET status = 'rejected', points = 0, notes = _notes, reviewed_by = auth.uid(), reviewed_at = now(), updated_at = now()
      WHERE user_id = creator_user AND reference_key = 'creator_content' AND reference_id = _content_id;
    DELETE FROM public.traveler_stamps
      WHERE user_id = creator_user AND stamp_key = earned_stamp_key;
  END IF;

  RETURN row;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_creator_account_summary(_creator_id uuid DEFAULT NULL)
RETURNS TABLE(
  creator_id uuid,
  approved_earnings numeric,
  approved_payments numeric,
  paid_payments numeric,
  available_balance numeric,
  reward_points integer,
  stamp_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH creator AS (
    SELECT c.id, c.user_id
    FROM public.creator_applications c
    WHERE c.id = COALESCE(_creator_id, c.id)
      AND (c.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    ORDER BY CASE WHEN c.user_id = auth.uid() THEN 0 ELSE 1 END
    LIMIT 1
  ), earnings AS (
    SELECT COALESCE(sum(cc.payout_amount), 0) AS amount
    FROM public.creator_content cc JOIN creator c ON c.id = cc.creator_id
    WHERE cc.status IN ('approved','paid')
  ), payments AS (
    SELECT
      COALESCE(sum(cp.amount_inr) FILTER (WHERE cp.status IN ('approved','paid')), 0) AS released,
      COALESCE(sum(cp.amount_inr) FILTER (WHERE cp.status = 'paid'), 0) AS paid
    FROM public.creator_payouts cp JOIN creator c ON c.id = cp.creator_id
  )
  SELECT c.id, e.amount, p.released, p.paid, GREATEST(e.amount - p.released, 0),
    COALESCE((SELECT sum(rl.points)::integer FROM public.reward_ledger rl WHERE rl.user_id = c.user_id AND rl.reference_key = 'creator_content' AND rl.status IN ('approved','paid')), 0),
    COALESCE((SELECT count(*) FROM public.traveler_stamps ts WHERE ts.user_id = c.user_id AND ts.category = 'creator'), 0)
  FROM creator c CROSS JOIN earnings e CROSS JOIN payments p;
$$;

REVOKE ALL ON FUNCTION public.get_creator_account_summary(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_creator_account_summary(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.record_creator_payout(
  _creator_id uuid,
  _amount numeric,
  _period text DEFAULT NULL,
  _method text DEFAULT NULL,
  _reference text DEFAULT NULL,
  _status text DEFAULT 'approved',
  _notes text DEFAULT NULL
)
RETURNS public.creator_payouts
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  row public.creator_payouts;
  owner uuid;
  earned numeric;
  released numeric;
  eligible_content_ids uuid[];
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Admins only'; END IF;
  IF _status NOT IN ('approved','paid','failed') THEN RAISE EXCEPTION 'Invalid status'; END IF;
  IF _amount IS NULL OR _amount <= 0 THEN RAISE EXCEPTION 'Payout amount must be positive'; END IF;

  SELECT user_id INTO owner FROM public.creator_applications WHERE id = _creator_id FOR UPDATE;
  IF owner IS NULL THEN RAISE EXCEPTION 'Creator not found'; END IF;

  SELECT COALESCE(sum(payout_amount), 0), array_agg(id ORDER BY reviewed_at)
    INTO earned, eligible_content_ids
  FROM public.creator_content
  WHERE creator_id = _creator_id AND status IN ('approved','paid') AND payout_amount > 0;

  SELECT COALESCE(sum(amount_inr), 0) INTO released
  FROM public.creator_payouts
  WHERE creator_id = _creator_id AND status IN ('approved','paid');

  IF _amount > earned - released THEN
    RAISE EXCEPTION 'Payout exceeds available creator balance';
  END IF;

  INSERT INTO public.creator_payouts (
    creator_id, user_id, amount_inr, period, method, reference, status, notes,
    paid_at, content_ids, approved_by, approved_at
  ) VALUES (
    _creator_id, owner, _amount, _period, _method, NULLIF(btrim(_reference), ''), _status, _notes,
    CASE WHEN _status = 'paid' THEN now() ELSE NULL END,
    COALESCE(eligible_content_ids, '{}'), auth.uid(), now()
  ) RETURNING * INTO row;

  INSERT INTO public.reward_ledger (
    user_id, event_type, reference_key, reference_id, points, status,
    title, notes, metadata, reviewed_by, reviewed_at
  ) VALUES (
    owner, 'creator_payment', 'creator_payout', row.id, 0,
    CASE WHEN _status = 'failed' THEN 'rejected' ELSE _status END,
    CASE WHEN _status = 'paid' THEN 'Creator payment paid' ELSE 'Creator payment approved' END,
    _notes,
    jsonb_build_object('amount_inr', _amount, 'period', _period, 'method', _method, 'reference', row.reference),
    auth.uid(), now()
  );

  RETURN row;
END;
$$;

REVOKE ALL ON FUNCTION public.review_creator_content(uuid, text, integer, numeric, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.record_creator_payout(uuid, numeric, text, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.review_creator_content(uuid, text, integer, numeric, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.record_creator_payout(uuid, numeric, text, text, text, text, text) TO authenticated, service_role;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'creator_applications'
  ) THEN ALTER PUBLICATION supabase_realtime ADD TABLE public.creator_applications; END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'creator_content'
  ) THEN ALTER PUBLICATION supabase_realtime ADD TABLE public.creator_content; END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'creator_payouts'
  ) THEN ALTER PUBLICATION supabase_realtime ADD TABLE public.creator_payouts; END IF;
END $$;