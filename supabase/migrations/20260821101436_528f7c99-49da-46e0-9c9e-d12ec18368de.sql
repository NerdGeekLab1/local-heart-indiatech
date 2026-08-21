ALTER FUNCTION public.apply_for_host_verification() SECURITY INVOKER;
ALTER FUNCTION public.review_host_verification(uuid,text,text) SECURITY INVOKER;