
DROP POLICY IF EXISTS "public read crop images" ON storage.objects;
CREATE POLICY "users list own crop images" ON storage.objects FOR SELECT
  USING (bucket_id = 'crop-images' AND auth.uid()::text = (storage.foldername(name))[1]);
