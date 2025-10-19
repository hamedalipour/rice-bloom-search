-- FIX STORAGE POLICIES FOR product-images BUCKET
-- Run this script in your Supabase SQL Editor to fix RLS policy issues

-- First, let's check existing policies
SELECT * FROM pg_policies WHERE polname LIKE '%product images%';

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access on product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin users to update product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin users to delete product images" ON storage.objects;

-- Create new, more permissive policies

-- 1. Allow public read access to all images (needed for displaying images)
CREATE POLICY "Allow public read access on product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

-- 2. Allow authenticated users to upload images (simpler policy)
CREATE POLICY "Allow authenticated users to upload images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images' AND
    auth.role() = 'authenticated'
  );

-- 3. Allow authenticated users to update their own images
CREATE POLICY "Allow authenticated users to update their images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'product-images' AND
    auth.role() = 'authenticated'
  );

-- 4. Allow authenticated users to delete their own images
CREATE POLICY "Allow authenticated users to delete their images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product-images' AND
    auth.role() = 'authenticated'
  );

-- Verify the new policies were created
SELECT polname, polcmd, polroles FROM pg_policies WHERE polname LIKE '%images%';

-- Test by listing buckets
SELECT * FROM storage.buckets WHERE id = 'product-images';