-- Create storage bucket for memory photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('memory-photos', 'memory-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for memory-photos bucket

-- Policy: Users can upload their own photos
-- Users can only upload to folders named with their user ID
CREATE POLICY "Users can upload their own photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'memory-photos' AND
    (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  );

-- Policy: Public photos are viewable by everyone
-- All photos in the memory-photos bucket are publicly accessible
CREATE POLICY "Public photos are viewable by everyone"
  ON storage.objects FOR SELECT
  TO authenticated, anon
  USING (bucket_id = 'memory-photos');

-- Policy: Users can update their own photos
-- Users can only update photos in their own folder
CREATE POLICY "Users can update their own photos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'memory-photos' AND
    (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  );

-- Policy: Users can delete their own photos
-- Users can only delete photos from their own folder
CREATE POLICY "Users can delete their own photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'memory-photos' AND
    (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  );
