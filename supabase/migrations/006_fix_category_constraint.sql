-- Fix any potential issues with the category_id column
-- Ensure the column exists and has the correct type

-- Add category_id column if it doesn't exist
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS category_id TEXT;

-- Remove any foreign key constraints that might be causing issues
-- (since there's no categories table, foreign key constraints would fail)
ALTER TABLE products 
DROP CONSTRAINT IF EXISTS products_category_id_fkey;

-- Ensure image_url column exists
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Update any existing products that might have the old column name
UPDATE products 
SET category_id = category 
WHERE category_id IS NULL AND category IS NOT NULL;

-- Update any existing products that might have the old image column
UPDATE products 
SET image_url = image 
WHERE image_url IS NULL AND image IS NOT NULL;

-- Drop the old columns if they still exist
ALTER TABLE products 
DROP COLUMN IF EXISTS category;

ALTER TABLE products 
DROP COLUMN IF EXISTS image;