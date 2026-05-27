REVOKE ALL ON FUNCTION public.join_beta_waitlist(text, text, text, text, text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.join_beta_waitlist(text, text, text, text, text, text, text) FROM anon;
REVOKE ALL ON FUNCTION public.join_beta_waitlist(text, text, text, text, text, text, text) FROM authenticated;

REVOKE ALL ON FUNCTION public.confirm_beta_waitlist(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.confirm_beta_waitlist(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.confirm_beta_waitlist(uuid) FROM authenticated;
