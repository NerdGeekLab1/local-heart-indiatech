
REVOKE EXECUTE ON FUNCTION public.log_feature_flag_change() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_user_feature_flag_change() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_waitlist_confirmation() FROM PUBLIC, anon, authenticated;
-- confirm_beta_waitlist is intentionally callable by anon (token-gated). Restrict to anon only.
REVOKE EXECUTE ON FUNCTION public.confirm_beta_waitlist(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.confirm_beta_waitlist(uuid) TO anon, authenticated;
-- has_role is needed by RLS evaluation; keep grants
