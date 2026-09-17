ALTER FUNCTION public.get_creator_account_summary(uuid) SECURITY INVOKER;
ALTER FUNCTION public.review_creator_content(uuid, text, integer, numeric, text) SECURITY INVOKER;
ALTER FUNCTION public.record_creator_payout(uuid, numeric, text, text, text, text, text) SECURITY INVOKER;
ALTER FUNCTION public.guard_creator_owned_updates() SECURITY INVOKER;
REVOKE ALL ON FUNCTION public.guard_creator_owned_updates() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.guard_creator_owned_updates() TO service_role;