// Storage Bucket Setup Script
// Run this in your Supabase SQL Editor to create the required storage bucket

const setupStorageBucket = `
-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the storage bucket
-- First, drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access on product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin users to update product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin users to delete product images" ON storage.objects;

-- Create policy to allow public read access on product images
CREATE POLICY "Allow public read access on product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

-- Create policy to allow authenticated admin users to upload product images
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

-- Create policy to allow admin users to update product images
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

-- Create policy to allow admin users to delete product images
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
`;

console.log('Copy and paste the following SQL into your Supabase SQL Editor:');
console.log(setupStorageBucket);