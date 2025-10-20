-- Fix category_id field and ensure proper table structure
-- This migration ensures the products table has the correct schema

-- Step 1: Add new columns if they don't exist
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Step 2: Migrate data from old columns to new columns if they exist
DO $$
BEGIN
  -- Check if old 'category' column exists and migrate data
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name = 'products' AND column_name = 'category') THEN
    UPDATE products
    SET category_id = category
    WHERE category_id IS NULL AND category IS NOT NULL;
  END IF;

  -- Check if old 'image' column exists and migrate data
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name = 'products' AND column_name = 'image') THEN
    UPDATE products
    SET image_url = image
    WHERE image_url IS NULL AND image IS NOT NULL;
  END IF;
END $$;

-- Step 3: Drop old columns if they exist (after data migration)
ALTER TABLE products DROP COLUMN IF EXISTS category;
ALTER TABLE products DROP COLUMN IF EXISTS image;

-- Step 4: Set appropriate constraints
-- category_id should be nullable (optional field)
ALTER TABLE products ALTER COLUMN category_id DROP NOT NULL;

-- image_url should be nullable (optional field)
ALTER TABLE products ALTER COLUMN image_url DROP NOT NULL;

-- Make sure these fields are NOT NULL
ALTER TABLE products ALTER COLUMN name SET NOT NULL;
ALTER TABLE products ALTER COLUMN slug SET NOT NULL;
ALTER TABLE products ALTER COLUMN price SET NOT NULL;

-- These fields can be nullable with defaults
ALTER TABLE products ALTER COLUMN description DROP NOT NULL;
ALTER TABLE products ALTER COLUMN description SET DEFAULT 'توضیحی ارائه نشده';

ALTER TABLE products ALTER COLUMN long_description DROP NOT NULL;
ALTER TABLE products ALTER COLUMN long_description SET DEFAULT 'توضیحات کامل ارائه نشده';

ALTER TABLE products ALTER COLUMN origin DROP NOT NULL;
ALTER TABLE products ALTER COLUMN origin SET DEFAULT 'نامشخص';

-- Step 5: Ensure unique constraint on slug
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_slug_key') THEN
    ALTER TABLE products ADD CONSTRAINT products_slug_key UNIQUE (slug);
  END IF;
END $$;

-- Step 6: Create or update indexes
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- Step 7: Ensure features is TEXT[] type
ALTER TABLE products ALTER COLUMN features TYPE TEXT[] USING
  CASE
    WHEN features IS NULL THEN '{}'::TEXT[]
    WHEN pg_typeof(features) = 'jsonb'::regtype THEN
      ARRAY(SELECT jsonb_array_elements_text(features))
    ELSE features
  END;

ALTER TABLE products ALTER COLUMN features SET DEFAULT '{}';

-- Step 8: Update RLS policies for better admin access
DROP POLICY IF EXISTS "Allow all operations for testing" ON products;
DROP POLICY IF EXISTS "Allow admin users to manage products" ON products;
DROP POLICY IF EXISTS "Allow read access to products for all users" ON products;

-- Policy 1: Allow everyone to read products
CREATE POLICY "Allow read access to products for all users"
  ON products FOR SELECT
  USING (true);

-- Policy 2: Allow authenticated admins to insert products
CREATE POLICY "Allow admin users to insert products"
  ON products FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND
      role = 'admin'
    )
  );

-- Policy 3: Allow authenticated admins to update products
CREATE POLICY "Allow admin users to update products"
  ON products FOR UPDATE
  USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND
      role = 'admin'
    )
  )
  WITH CHECK (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND
      role = 'admin'
    )
  );

-- Policy 4: Allow authenticated admins to delete products
CREATE POLICY "Allow admin users to delete products"
  ON products FOR DELETE
  USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND
      role = 'admin'
    )
  );

-- Step 9: Add comment to document the schema
COMMENT ON COLUMN products.category_id IS 'Product category identifier (hashemi, tarom, fajr, shirodi, general, etc.)';
COMMENT ON COLUMN products.image_url IS 'URL or path to the product image';
COMMENT ON COLUMN products.features IS 'Array of product features';
COMMENT ON COLUMN products.weights IS 'JSONB array of available weights and their prices';
