REVOKE EXECUTE ON FUNCTION public.claim_stamp_reward(text, integer, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.redeem_reward(text, integer, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.regenerate_referral_code(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_reward_balance(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.set_reward_receipt_code() FROM anon, authenticated;