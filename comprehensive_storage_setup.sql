-- Comprehensive Storage Setup Script
-- Run this in your Supabase SQL Editor to ensure proper storage configuration

-- 1. Check if the bucket exists
SELECT * FROM storage.buckets WHERE id = 'product-images';

-- 2. Create storage bucket for product images (will not overwrite if exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Verify the bucket was created
SELECT * FROM storage.buckets WHERE id = 'product-images';

-- 4. Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access on product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin users to update product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin users to delete product images" ON storage.objects;

-- 5. Create policy to allow public read access on product images
CREATE POLICY "Allow public read access on product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

-- 6. Create policy to allow authenticated admin users to upload product images
CREATE POLICY "Allow authenticated users to upload product images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images' AND
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND 
      (user_profiles.email LIKE '%admin%' OR user_profiles.role = 'admin')
    )
  );

-- 7. Create policy to allow admin users to update product images
CREATE POLICY "Allow admin users to update product images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'product-images' AND
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND 
      (user_profiles.email LIKE '%admin%' OR user_profiles.role = 'admin')
    )
  );

-- 8. Create policy to allow admin users to delete product images
CREATE POLICY "Allow admin users to delete product images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product-images' AND
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND 
      (user_profiles.email LIKE '%admin%' OR user_profiles.role = 'admin')
    )
  );

-- 9. Verify policies were created
SELECT * FROM pg_policies WHERE policyname LIKE '%product images%';

-- 10. Test by creating a simple file (optional - remove if you don't want to create a test file)
-- Uncomment the following lines if you want to create a test file:
/*
INSERT INTO storage.objects (bucket_id, name, owner, data)
VALUES ('product-images', 'setup-test.txt', NULL, 'Storage setup successful!')
ON CONFLICT (bucket_id, name) DO UPDATE SET data = EXCLUDED.data;
*/