REVOKE EXECUTE ON FUNCTION public.get_public_profile(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_public_profiles(uuid[]) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_public_wanderer(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_public_wanderers() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.get_public_profile(uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_public_profiles(uuid[]) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_public_wanderer(uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_public_wanderers() TO anon, authenticated, service_role;