DROP POLICY IF EXISTS "Authenticated users read own avatars" ON storage.objects;
CREATE POLICY "Authenticated users read own avatars"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);