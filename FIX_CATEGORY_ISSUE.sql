-- ====================================================================
-- FIX CATEGORY ISSUE IN PRODUCTS TABLE
-- ====================================================================
-- This script fixes the category_id field issue in the products table
-- Run this in Supabase SQL Editor to resolve category save problems
-- ====================================================================

-- Step 1: Add new columns if they don't exist
DO $$
BEGIN
  -- Add category_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE products ADD COLUMN category_id TEXT;
    RAISE NOTICE 'Added category_id column';
  ELSE
    RAISE NOTICE 'category_id column already exists';
  END IF;

  -- Add image_url column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE products ADD COLUMN image_url TEXT;
    RAISE NOTICE 'Added image_url column';
  ELSE
    RAISE NOTICE 'image_url column already exists';
  END IF;
END $$;

-- Step 2: Migrate data from old columns to new columns
DO $$
BEGIN
  -- Migrate category to category_id
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'category'
  ) THEN
    UPDATE products
    SET category_id = category
    WHERE category_id IS NULL AND category IS NOT NULL;
    RAISE NOTICE 'Migrated category data to category_id';
  END IF;

  -- Migrate image to image_url
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'image'
  ) THEN
    UPDATE products
    SET image_url = image
    WHERE image_url IS NULL AND image IS NOT NULL;
    RAISE NOTICE 'Migrated image data to image_url';
  END IF;
END $$;

-- Step 3: Drop old columns (after data migration)
ALTER TABLE products DROP COLUMN IF EXISTS category;
ALTER TABLE products DROP COLUMN IF EXISTS image;

-- Step 4: Adjust column constraints
-- Make category_id nullable (it's optional)
ALTER TABLE products ALTER COLUMN category_id DROP NOT NULL;

-- Make image_url nullable (it's optional)
ALTER TABLE products ALTER COLUMN image_url DROP NOT NULL;

-- Ensure required fields have proper constraints
ALTER TABLE products ALTER COLUMN name SET NOT NULL;
ALTER TABLE products ALTER COLUMN slug SET NOT NULL;
ALTER TABLE products ALTER COLUMN price SET NOT NULL;

-- Set defaults for optional text fields
ALTER TABLE products ALTER COLUMN description DROP NOT NULL;
ALTER TABLE products ALTER COLUMN description SET DEFAULT 'توضیحی ارائه نشده';

ALTER TABLE products ALTER COLUMN long_description DROP NOT NULL;
ALTER TABLE products ALTER COLUMN long_description SET DEFAULT 'توضیحات کامل ارائه نشده';

ALTER TABLE products ALTER COLUMN origin DROP NOT NULL;
ALTER TABLE products ALTER COLUMN origin SET DEFAULT 'نامشخص';

-- Step 5: Ensure unique constraint on slug
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'products_slug_key'
  ) THEN
    ALTER TABLE products ADD CONSTRAINT products_slug_key UNIQUE (slug);
    RAISE NOTICE 'Added unique constraint on slug';
  END IF;
END $$;

-- Step 6: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- Step 7: Fix features column type if needed
DO $$
BEGIN
  -- Check if features is JSONB and convert to TEXT[]
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products'
    AND column_name = 'features'
    AND data_type = 'jsonb'
  ) THEN
    ALTER TABLE products ALTER COLUMN features TYPE TEXT[]
    USING CASE
      WHEN features IS NULL THEN '{}'::TEXT[]
      WHEN jsonb_typeof(features) = 'array' THEN
        ARRAY(SELECT jsonb_array_elements_text(features))
      ELSE '{}'::TEXT[]
    END;
    RAISE NOTICE 'Converted features from JSONB to TEXT[]';
  END IF;
END $$;

-- Ensure features has proper default
ALTER TABLE products ALTER COLUMN features SET DEFAULT '{}';

-- Step 8: Update RLS policies
-- Drop existing policies first
DROP POLICY IF EXISTS "Allow all operations for testing" ON products;
DROP POLICY IF EXISTS "Allow admin users to manage products" ON products;
DROP POLICY IF EXISTS "Allow read access to products for all users" ON products;
DROP POLICY IF EXISTS "Allow admin users to insert products" ON products;
DROP POLICY IF EXISTS "Allow admin users to update products" ON products;
DROP POLICY IF EXISTS "Allow admin users to delete products" ON products;

-- Create new comprehensive policies
-- Policy 1: Everyone can read products
CREATE POLICY "Allow read access to products for all users"
  ON products FOR SELECT
  USING (true);

-- Policy 2: Authenticated admins can insert products
CREATE POLICY "Allow admin users to insert products"
  ON products FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    (
      EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid() AND role = 'admin'
      )
      OR
      auth.jwt() ->> 'email' = 'hamedalipour38@gmail.com'
    )
  );

-- Policy 3: Authenticated admins can update products
CREATE POLICY "Allow admin users to update products"
  ON products FOR UPDATE
  USING (
    auth.role() = 'authenticated' AND
    (
      EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid() AND role = 'admin'
      )
      OR
      auth.jwt() ->> 'email' = 'hamedalipour38@gmail.com'
    )
  )
  WITH CHECK (
    auth.role() = 'authenticated' AND
    (
      EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid() AND role = 'admin'
      )
      OR
      auth.jwt() ->> 'email' = 'hamedalipour38@gmail.com'
    )
  );

-- Policy 4: Authenticated admins can delete products
CREATE POLICY "Allow admin users to delete products"
  ON products FOR DELETE
  USING (
    auth.role() = 'authenticated' AND
    (
      EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid() AND role = 'admin'
      )
      OR
      auth.jwt() ->> 'email' = 'hamedalipour38@gmail.com'
    )
  );

-- Step 9: Add helpful comments
COMMENT ON COLUMN products.category_id IS 'Product category: hashemi, tarom, fajr, shirodi, general, etc. (nullable)';
COMMENT ON COLUMN products.image_url IS 'URL or path to product main image (nullable)';
COMMENT ON COLUMN products.features IS 'Array of product feature strings';
COMMENT ON COLUMN products.weights IS 'JSONB array of weight options with prices';

-- Step 10: Verify the changes
DO $$
DECLARE
  column_count INTEGER;
  policy_count INTEGER;
BEGIN
  -- Check columns
  SELECT COUNT(*) INTO column_count
  FROM information_schema.columns
  WHERE table_name = 'products'
  AND column_name IN ('category_id', 'image_url', 'name', 'slug', 'price');

  IF column_count = 5 THEN
    RAISE NOTICE '✓ All required columns exist';
  ELSE
    RAISE WARNING '✗ Missing some required columns (found % of 5)', column_count;
  END IF;

  -- Check policies
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'products';

  RAISE NOTICE 'Found % RLS policies on products table', policy_count;

  -- Check for old columns
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'category'
  ) THEN
    RAISE WARNING '✗ Old "category" column still exists';
  ELSE
    RAISE NOTICE '✓ Old "category" column removed';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'image'
  ) THEN
    RAISE WARNING '✗ Old "image" column still exists';
  ELSE
    RAISE NOTICE '✓ Old "image" column removed';
  END IF;

  RAISE NOTICE '====================================';
  RAISE NOTICE 'FIX COMPLETED SUCCESSFULLY!';
  RAISE NOTICE '====================================';
END $$;

-- Display current schema
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'products'
ORDER BY ordinal_position;
