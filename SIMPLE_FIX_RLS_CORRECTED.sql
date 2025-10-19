-- SIMPLE SCRIPT TO FIX RLS POLICIES FOR product-images BUCKET
-- Copy and paste this into your Supabase SQL Editor and run it

-- 1. First, let's see what policies currently exist
SELECT policyname, tablename, roles, command 
FROM pg_policies 
WHERE tablename = 'objects';

-- 2. Drop any existing conflicting policies
DROP POLICY IF EXISTS "Allow public read access on product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin users to update product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin users to delete product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update their images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete their images" ON storage.objects;

-- 3. Create simple, permissive policies
-- Allow anyone to read images (needed for displaying images on the site)
CREATE POLICY "Public read access for product images" 
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Allow authenticated users to insert images
CREATE POLICY "Allow authenticated insert" 
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- Allow authenticated users to update images
CREATE POLICY "Allow authenticated update" 
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete images
CREATE POLICY "Allow authenticated delete" 
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- 4. Verify the policies were created
SELECT policyname, tablename, roles, command 
FROM pg_policies 
WHERE tablename = 'objects' AND policyname LIKE '%images%';

-- 5. Check that the bucket exists
SELECT id, name, public FROM storage.buckets WHERE id = 'product-images';