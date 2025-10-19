-- Check the current structure of the products table
\d products

-- Check if category_id column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'products' AND column_name = 'category_id';

-- Check if image_url column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'products' AND column_name = 'image_url';

-- Check sample data
SELECT * FROM products LIMIT 1;