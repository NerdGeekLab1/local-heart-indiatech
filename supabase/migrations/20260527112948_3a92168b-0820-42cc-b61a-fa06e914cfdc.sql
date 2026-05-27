-- Allow global feature-flag checks for public-facing beta features without exposing user-specific grants
DROP POLICY IF EXISTS "Authenticated read flags" ON public.feature_flags;
CREATE POLICY "Anyone can read global flag status"
ON public.feature_flags
FOR SELECT
TO anon, authenticated
USING (true);

GRANT SELECT ON public.feature_flags TO anon;
GRANT SELECT ON public.feature_flags TO authenticated;

-- Ensure the AI Travel Guide flag exists and is enabled by default so the guide is visible again
INSERT INTO public.feature_flags (flag_key, label, description, enabled_globally)
VALUES ('ai_concierge', 'AI Concierge', 'Access to AI trip concierge and guided travel chat', true)
ON CONFLICT (flag_key) DO UPDATE
SET enabled_globally = true,
    label = EXCLUDED.label,
    description = EXCLUDED.description,
    updated_at = now();

-- Public beta waitlist signup with confirmation email queueing handled server-side
CREATE OR REPLACE FUNCTION public.join_beta_waitlist(
  _email text,
  _full_name text DEFAULT NULL,
  _city text DEFAULT NULL,
  _interest text DEFAULT NULL,
  _plan_interest text DEFAULT 'explorer',
  _referral_source text DEFAULT NULL,
  _origin text DEFAULT NULL
)
RETURNS TABLE(id uuid, confirmation_token uuid, email text, full_name text, plan_interest text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_waitlist public.beta_waitlist%ROWTYPE;
  v_origin text := COALESCE(NULLIF(_origin, ''), '');
  v_plan text := COALESCE(NULLIF(lower(trim(_plan_interest)), ''), 'explorer');
BEGIN
  IF _email IS NULL OR length(trim(_email)) < 5 OR position('@' in _email) = 0 THEN
    RAISE EXCEPTION 'A valid email address is required';
  END IF;

  IF v_plan NOT IN ('explorer', 'adventurer', 'nomad') THEN
    v_plan := 'explorer';
  END IF;

  INSERT INTO public.beta_waitlist (email, full_name, city, interest, plan_interest, referral_source)
  VALUES (lower(trim(_email)), NULLIF(trim(_full_name), ''), NULLIF(trim(_city), ''), NULLIF(trim(_interest), ''), v_plan, NULLIF(trim(_referral_source), ''))
  ON CONFLICT (email) DO UPDATE
  SET full_name = COALESCE(EXCLUDED.full_name, public.beta_waitlist.full_name),
      city = COALESCE(EXCLUDED.city, public.beta_waitlist.city),
      interest = COALESCE(EXCLUDED.interest, public.beta_waitlist.interest),
      plan_interest = EXCLUDED.plan_interest,
      referral_source = COALESCE(EXCLUDED.referral_source, public.beta_waitlist.referral_source)
  RETURNING * INTO v_waitlist;

  INSERT INTO public.email_notifications (
    recipient_email,
    subject,
    template_name,
    trigger_event,
    body_html,
    payload
  ) VALUES (
    v_waitlist.email,
    'Confirm your Travelista beta spot',
    'beta_waitlist_confirm',
    'beta_waitlist_signup',
    '<p>Hi ' || COALESCE(v_waitlist.full_name, 'traveler') || ',</p>' ||
    '<p>Thanks for joining the Travelista beta waitlist! Please confirm your email to lock in your <strong>' || v_waitlist.plan_interest || '</strong> tier spot:</p>' ||
    '<p><a href="' || v_origin || '/beta-waitlist/confirm?token=' || v_waitlist.confirmation_token::text || '">Confirm my spot</a></p>' ||
    '<p>— The Travelista Team</p>',
    jsonb_build_object('waitlist_id', v_waitlist.id, 'confirmation_token', v_waitlist.confirmation_token, 'plan', v_waitlist.plan_interest)
  );

  RETURN QUERY SELECT v_waitlist.id, v_waitlist.confirmation_token, v_waitlist.email, v_waitlist.full_name, v_waitlist.plan_interest;
END;
$$;

REVOKE ALL ON FUNCTION public.join_beta_waitlist(text, text, text, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.join_beta_waitlist(text, text, text, text, text, text, text) TO anon, authenticated;
