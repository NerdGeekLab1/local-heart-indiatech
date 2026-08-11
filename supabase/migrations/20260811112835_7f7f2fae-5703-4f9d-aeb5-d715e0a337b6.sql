-- 1. Host applications: allow submission when there is no session (email not yet confirmed),
-- even though the identity trigger back-fills user_id from a matching account.
DROP POLICY IF EXISTS "Anyone can submit a host application" ON public.host_applications;
CREATE POLICY "Anyone can submit a host application"
ON public.host_applications
FOR INSERT
TO anon, authenticated
WITH CHECK (
  auth.uid() IS NULL
  OR user_id IS NULL
  OR auth.uid() = user_id
);

-- 2. Storage: complete per-folder policies for the media buckets.
DROP POLICY IF EXISTS "Public read trip images" ON storage.objects;
CREATE POLICY "Public read trip images" ON storage.objects
FOR SELECT USING (bucket_id IN ('trip-images','experience-images','feed-media','avatars'));

DROP POLICY IF EXISTS "Feed media own update" ON storage.objects;
CREATE POLICY "Feed media own update" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'feed-media' AND (auth.uid())::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'feed-media' AND (auth.uid())::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Creators can update trip images" ON storage.objects;
CREATE POLICY "Creators can update trip images" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'trip-images' AND (auth.uid())::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'trip-images' AND (auth.uid())::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Hosts can update experience images" ON storage.objects;
CREATE POLICY "Hosts can update experience images" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'experience-images' AND (auth.uid())::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'experience-images' AND (auth.uid())::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Creators can upload trip images" ON storage.objects;
CREATE POLICY "Creators can upload trip images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'trip-images' AND (auth.uid())::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Hosts can upload experience images" ON storage.objects;
CREATE POLICY "Hosts can upload experience images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'experience-images' AND (auth.uid())::text = (storage.foldername(name))[1]);