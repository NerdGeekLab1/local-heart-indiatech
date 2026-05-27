
CREATE OR REPLACE FUNCTION public.confirm_beta_waitlist(_token uuid)
RETURNS TABLE(email text, full_name text, plan_interest text, status text, confirmed_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.beta_waitlist
    SET status = 'confirmed', confirmed_at = COALESCE(confirmed_at, now())
    WHERE confirmation_token = _token;
  RETURN QUERY
    SELECT bw.email, bw.full_name, bw.plan_interest, bw.status, bw.confirmed_at
    FROM public.beta_waitlist bw
    WHERE bw.confirmation_token = _token
    LIMIT 1;
END;
$$;

REVOKE ALL ON FUNCTION public.confirm_beta_waitlist(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.confirm_beta_waitlist(uuid) TO anon, authenticated;
