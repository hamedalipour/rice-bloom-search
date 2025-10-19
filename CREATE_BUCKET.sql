-- SIMPLE SCRIPT TO CREATE THE REQUIRED STORAGE BUCKET
-- Copy and paste this entire script into your Supabase SQL Editor and run it

-- Step 1: Create the product-images storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Verify the bucket was created
SELECT 'Bucket created successfully!' as result, id, name, public 
FROM storage.buckets 
WHERE id = 'product-images';

-- Step 3: If the above query returns no results, let's check what buckets exist
SELECT 'Existing buckets:' as info, id, name, public 
FROM storage.buckets;

-- Step 4: Check existing policies
SELECT policyname, command, roles FROM pg_policies WHERE policyname LIKE '%product images%';