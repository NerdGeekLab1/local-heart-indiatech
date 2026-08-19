DROP POLICY IF EXISTS "Anyone can submit a host application" ON public.host_applications;

CREATE POLICY "Anyone can submit a host application"
ON public.host_applications
FOR INSERT
TO anon, authenticated
WITH CHECK (
  (auth.uid() IS NULL AND user_id IS NULL)
  OR (auth.uid() IS NOT NULL AND (user_id IS NULL OR user_id = auth.uid()))
);