-- Fix products table schema to match TypeScript types
ALTER TABLE products 
  RENAME COLUMN category TO category_id;
ALTER TABLE products 
  RENAME COLUMN image TO image_url;

-- Add missing columns from TypeScript types
ALTER TABLE products 
  ADD COLUMN IF NOT EXISTS gallery_images TEXT[] DEFAULT '{}';
ALTER TABLE products 
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE products 
  ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE products 
  ADD COLUMN IF NOT EXISTS meta_description TEXT;

-- Update features column to TEXT[] type instead of JSONB to match TypeScript types
ALTER TABLE products 
  ALTER COLUMN features TYPE TEXT[] USING 
  CASE 
    WHEN features IS NULL THEN '{}'::TEXT[]
    WHEN jsonb_typeof(features) = 'array' THEN 
      ARRAY(SELECT jsonb_array_elements_text(features))
    ELSE '{}'::TEXT[]
  END;

-- Set default for features column
ALTER TABLE products 
  ALTER COLUMN features SET DEFAULT '{}';

-- Update the policy to use the new column name
DROP POLICY IF EXISTS "Allow admin users to manage products" ON products;

CREATE POLICY "Allow admin users to manage products" ON products
  FOR ALL USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND 
      (user_profiles.email LIKE '%admin%' OR user_profiles.role = 'admin')
    )
  );