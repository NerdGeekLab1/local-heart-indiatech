ALTER PUBLICATION supabase_realtime ADD TABLE public.invoices;

DROP FUNCTION IF EXISTS public.get_public_host_directory();
CREATE OR REPLACE FUNCTION public.get_public_host_directory()
 RETURNS TABLE(id uuid, username text, full_name text, city text, tagline text, bio text, avatar_url text, cover_url text, services text[], specialties text[], languages text[], response_time text, social_links jsonb, price_per_day numeric, host_since timestamp with time zone, rating numeric, review_count bigint, experiences_count bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT p.id, p.username, trim(concat_ws(' ',p.first_name,p.last_name)), p.city, p.tagline, p.bio, p.avatar_url, p.cover_url,
    p.services, p.specialties, p.languages, p.response_time, p.social_links, p.price_per_day, p.host_since,
    COALESCE(avg(r.rating),0)::numeric(3,2), count(DISTINCT r.id), count(DISTINCT e.id)
  FROM public.profiles p
  JOIN public.user_roles ur ON ur.user_id=p.id AND ur.role='host'::public.app_role
  JOIN public.host_applications ha ON ha.user_id=p.id AND ha.status IN ('approved','verified')
  LEFT JOIN public.reviews r ON r.host_id=p.id
  LEFT JOIN public.experiences e ON e.host_id=p.id AND e.status='approved'
  WHERE p.is_public
  GROUP BY p.id;
$function$;