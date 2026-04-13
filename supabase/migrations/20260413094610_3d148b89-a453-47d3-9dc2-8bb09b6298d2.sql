
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('experience-images', 'experience-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('trip-images', 'trip-images', true);

CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own avatar" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Experience images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'experience-images');
CREATE POLICY "Hosts can upload experience images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'experience-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Hosts can update experience images" ON storage.objects FOR UPDATE USING (bucket_id = 'experience-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Hosts can delete experience images" ON storage.objects FOR DELETE USING (bucket_id = 'experience-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Trip images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'trip-images');
CREATE POLICY "Creators can upload trip images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'trip-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Creators can update trip images" ON storage.objects FOR UPDATE USING (bucket_id = 'trip-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Creators can delete trip images" ON storage.objects FOR DELETE USING (bucket_id = 'trip-images' AND auth.uid()::text = (storage.foldername(name))[1]);
