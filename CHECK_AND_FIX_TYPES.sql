-- ====================================================================
-- CHECK AND FIX DATA TYPES IN PRODUCTS TABLE
-- ====================================================================
-- This script checks and fixes data type issues that cause error 22P02
-- Error 22P02 = "invalid input syntax for type"
-- Run this in Supabase SQL Editor
-- ====================================================================

-- Display current table structure
\echo '=== CURRENT TABLE STRUCTURE ==='
SELECT
  column_name,
  data_type,
  udt_name,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'products'
ORDER BY ordinal_position;

-- Step 1: Ensure category_id is TEXT and nullable
DO $$
BEGIN
  -- Check if category_id exists and is correct type
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products'
    AND column_name = 'category_id'
    AND data_type != 'text'
  ) THEN
    ALTER TABLE products ALTER COLUMN category_id TYPE TEXT;
    RAISE NOTICE '✓ Fixed category_id type to TEXT';
  END IF;

  ALTER TABLE products ALTER COLUMN category_id DROP NOT NULL;
  RAISE NOTICE '✓ category_id is now nullable';
END $$;

-- Step 2: Ensure image_url is TEXT and nullable
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products'
    AND column_name = 'image_url'
    AND data_type != 'text'
  ) THEN
    ALTER TABLE products ALTER COLUMN image_url TYPE TEXT;
    RAISE NOTICE '✓ Fixed image_url type to TEXT';
  END IF;

  ALTER TABLE products ALTER COLUMN image_url DROP NOT NULL;
  RAISE NOTICE '✓ image_url is now nullable';
END $$;

-- Step 3: Ensure price fields are numeric
DO $$
BEGIN
  -- Fix price type if needed
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products'
    AND column_name = 'price'
    AND data_type NOT IN ('numeric', 'double precision', 'real')
  ) THEN
    ALTER TABLE products ALTER COLUMN price TYPE NUMERIC(10,2) USING price::numeric;
    RAISE NOTICE '✓ Fixed price type to NUMERIC(10,2)';
  END IF;

  -- Fix original_price type if needed
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products'
    AND column_name = 'original_price'
    AND data_type NOT IN ('numeric', 'double precision', 'real')
  ) THEN
    ALTER TABLE products ALTER COLUMN original_price TYPE NUMERIC(10,2) USING original_price::numeric;
    RAISE NOTICE '✓ Fixed original_price type to NUMERIC(10,2)';
  END IF;

  ALTER TABLE products ALTER COLUMN original_price DROP NOT NULL;
  RAISE NOTICE '✓ original_price is now nullable';
END $$;

-- Step 4: Ensure features is TEXT[] (NOT JSONB)
DO $$
BEGIN
  -- Check current type of features
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products'
    AND column_name = 'features'
    AND data_type = 'jsonb'
  ) THEN
    -- Convert JSONB to TEXT[]
    ALTER TABLE products ALTER COLUMN features TYPE TEXT[]
    USING CASE
      WHEN features IS NULL THEN '{}'::TEXT[]
      WHEN jsonb_typeof(features) = 'array' THEN
        ARRAY(SELECT jsonb_array_elements_text(features))
      ELSE '{}'::TEXT[]
    END;
    RAISE NOTICE '✓ Converted features from JSONB to TEXT[]';
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products'
    AND column_name = 'features'
    AND data_type != 'ARRAY'
  ) THEN
    -- If it's some other type, convert to TEXT[]
    ALTER TABLE products ALTER COLUMN features TYPE TEXT[]
    USING CASE
      WHEN features IS NULL THEN '{}'::TEXT[]
      ELSE ARRAY[features::TEXT]
    END;
    RAISE NOTICE '✓ Converted features to TEXT[]';
  ELSE
    RAISE NOTICE '✓ features is already TEXT[]';
  END IF;

  -- Set default for features
  ALTER TABLE products ALTER COLUMN features SET DEFAULT '{}';
  ALTER TABLE products ALTER COLUMN features DROP NOT NULL;
  RAISE NOTICE '✓ features has proper default and nullable';
END $$;

-- Step 5: Ensure weights is JSONB (NOT TEXT[])
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products'
    AND column_name = 'weights'
    AND data_type != 'jsonb'
  ) THEN
    -- Convert to JSONB
    ALTER TABLE products ALTER COLUMN weights TYPE JSONB
    USING CASE
      WHEN weights IS NULL THEN '[]'::JSONB
      WHEN weights::TEXT = '' THEN '[]'::JSONB
      ELSE weights::JSONB
    END;
    RAISE NOTICE '✓ Converted weights to JSONB';
  ELSE
    RAISE NOTICE '✓ weights is already JSONB';
  END IF;

  ALTER TABLE products ALTER COLUMN weights SET DEFAULT '[]'::JSONB;
  ALTER TABLE products ALTER COLUMN weights DROP NOT NULL;
  RAISE NOTICE '✓ weights has proper default and nullable';
END $$;

-- Step 6: Ensure boolean fields are correct
DO $$
BEGIN
  ALTER TABLE products ALTER COLUMN in_stock TYPE BOOLEAN
  USING CASE
    WHEN in_stock IS NULL THEN true
    ELSE in_stock::BOOLEAN
  END;

  ALTER TABLE products ALTER COLUMN in_stock SET DEFAULT true;
  RAISE NOTICE '✓ in_stock is BOOLEAN with default true';

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'is_featured'
  ) THEN
    ALTER TABLE products ALTER COLUMN is_featured TYPE BOOLEAN
    USING CASE
      WHEN is_featured IS NULL THEN false
      ELSE is_featured::BOOLEAN
    END;
    ALTER TABLE products ALTER COLUMN is_featured SET DEFAULT false;
    RAISE NOTICE '✓ is_featured is BOOLEAN with default false';
  END IF;
END $$;

-- Step 7: Ensure rating fields are correct type
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'rating'
  ) THEN
    ALTER TABLE products ALTER COLUMN rating TYPE NUMERIC(3,2)
    USING COALESCE(rating::NUMERIC(3,2), 0);
    ALTER TABLE products ALTER COLUMN rating SET DEFAULT 0;
    ALTER TABLE products ALTER COLUMN rating DROP NOT NULL;
    RAISE NOTICE '✓ rating is NUMERIC(3,2)';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'review_count'
  ) THEN
    ALTER TABLE products ALTER COLUMN review_count TYPE INTEGER
    USING COALESCE(review_count::INTEGER, 0);
    ALTER TABLE products ALTER COLUMN review_count SET DEFAULT 0;
    ALTER TABLE products ALTER COLUMN review_count DROP NOT NULL;
    RAISE NOTICE '✓ review_count is INTEGER';
  END IF;
END $$;

-- Step 8: Clean up any invalid data in existing rows
UPDATE products
SET
  features = COALESCE(features, '{}'),
  weights = COALESCE(weights, '[]'::JSONB),
  category_id = NULLIF(category_id, ''),
  image_url = NULLIF(image_url, ''),
  in_stock = COALESCE(in_stock, true)
WHERE
  features IS NULL
  OR weights IS NULL
  OR category_id = ''
  OR image_url = ''
  OR in_stock IS NULL;

-- Step 9: Display final table structure
\echo '=== FINAL TABLE STRUCTURE ==='
SELECT
  column_name,
  data_type,
  udt_name,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'products'
ORDER BY ordinal_position;

-- Step 10: Test data type validation
DO $$
DECLARE
  test_passed BOOLEAN := true;
  error_msg TEXT := '';
BEGIN
  RAISE NOTICE '=== RUNNING VALIDATION TESTS ===';

  -- Test 1: Check features is TEXT[]
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products'
    AND column_name = 'features'
    AND data_type = 'ARRAY'
  ) THEN
    error_msg := 'features is not TEXT[]';
    test_passed := false;
  ELSE
    RAISE NOTICE '✓ features is TEXT[]';
  END IF;

  -- Test 2: Check weights is JSONB
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products'
    AND column_name = 'weights'
    AND data_type = 'jsonb'
  ) THEN
    error_msg := error_msg || '; weights is not JSONB';
    test_passed := false;
  ELSE
    RAISE NOTICE '✓ weights is JSONB';
  END IF;

  -- Test 3: Check price is numeric
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products'
    AND column_name = 'price'
    AND data_type IN ('numeric', 'double precision')
  ) THEN
    error_msg := error_msg || '; price is not numeric';
    test_passed := false;
  ELSE
    RAISE NOTICE '✓ price is numeric';
  END IF;

  -- Test 4: Check category_id is TEXT
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products'
    AND column_name = 'category_id'
    AND data_type = 'text'
  ) THEN
    error_msg := error_msg || '; category_id is not TEXT';
    test_passed := false;
  ELSE
    RAISE NOTICE '✓ category_id is TEXT';
  END IF;

  -- Test 5: Check image_url is TEXT
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products'
    AND column_name = 'image_url'
    AND data_type = 'text'
  ) THEN
    error_msg := error_msg || '; image_url is not TEXT';
    test_passed := false;
  ELSE
    RAISE NOTICE '✓ image_url is TEXT';
  END IF;

  IF test_passed THEN
    RAISE NOTICE '====================================';
    RAISE NOTICE '✅ ALL VALIDATION TESTS PASSED!';
    RAISE NOTICE '====================================';
  ELSE
    RAISE WARNING 'Some validation tests failed: %', error_msg;
  END IF;
END $$;

-- Step 11: Create a test insert to verify everything works
DO $$
DECLARE
  test_id UUID;
BEGIN
  RAISE NOTICE '=== TESTING INSERT ===';

  -- Try to insert a test product
  INSERT INTO products (
    name,
    slug,
    category_id,
    price,
    original_price,
    image_url,
    description,
    long_description,
    origin,
    features,
    weights,
    in_stock
  ) VALUES (
    'Test Product',
    'test-product-' || floor(random() * 10000)::TEXT,
    'hashemi',
    50000,
    60000,
    '/images/test.jpg',
    'توضیحات تست',
    'توضیحات کامل تست',
    'گیلان',
    ARRAY['ویژگی ۱', 'ویژگی ۲'],
    '[{"value": "1kg", "price": 50000}]'::JSONB,
    true
  ) RETURNING id INTO test_id;

  RAISE NOTICE '✓ Test product inserted successfully with ID: %', test_id;

  -- Clean up test product
  DELETE FROM products WHERE id = test_id;
  RAISE NOTICE '✓ Test product cleaned up';

  RAISE NOTICE '====================================';
  RAISE NOTICE '✅ INSERT TEST PASSED!';
  RAISE NOTICE '====================================';

EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING '❌ Insert test failed: %', SQLERRM;
    RAISE WARNING 'Error code: %', SQLSTATE;
END $$;

-- Final summary
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '╔════════════════════════════════════════╗';
  RAISE NOTICE '║   DATA TYPE FIX COMPLETED!             ║';
  RAISE NOTICE '╚════════════════════════════════════════╝';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Clear browser cache (Ctrl + Shift + R)';
  RAISE NOTICE '2. Try adding/editing a product in admin panel';
  RAISE NOTICE '3. If still errors, check browser console for details';
  RAISE NOTICE '';
END $$;
