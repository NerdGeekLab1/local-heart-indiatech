REVOKE ALL ON FUNCTION public.approve_host_profile_application(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.approve_host_profile_application(uuid) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.get_public_host_directory() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_host_directory() TO anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.get_public_host(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_host(text) TO anon, authenticated, service_role;