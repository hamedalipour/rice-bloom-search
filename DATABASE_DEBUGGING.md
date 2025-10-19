# Database Debugging Guide

This document provides instructions for debugging and fixing database issues in the rice-bloom-search application.

## Common Database Issues and Solutions

### 1. "Database error occurred" when saving products

This error typically occurs due to one of the following reasons:

1. **Schema mismatch**: The database schema doesn't match the expected structure
2. **Missing columns**: Required columns are missing from the products table
3. **Constraint violations**: Data doesn't meet database constraints
4. **Permission issues**: User doesn't have proper permissions to modify data

### 2. Debugging Steps

#### Step 1: Check Database Schema
1. Navigate to `/db-debug` in your browser
2. Click "Check Schema" to verify the products table structure
3. Check the browser console for detailed information about table columns

#### Step 2: Test Database Connection
1. Navigate to `/db-debug` in your browser
2. Click "Run Database Tests" to test basic database operations
3. Check the browser console for success or error messages

#### Step 3: Test Product Creation
1. Navigate to `/db-debug` in your browser
2. Fill in the test product form
3. Click "Test Save Product" to try creating a minimal product
4. Check the browser console for detailed error information

### 3. Database Migration Files

The application includes several migration files that define the database schema:

- `001_create_products_table.sql`: Initial products table creation
- `004_fix_products_schema.sql`: Schema fixes (renames category to category_id, image to image_url)
- `006_fix_category_constraint.sql`: Additional constraint fixes
- `007_complete_products_fix.sql`: Complete schema fix

### 4. Manual Database Fixes

If automatic migrations don't work, you can manually apply the fixes:

1. **Check current schema**:
   ```sql
   \d products
   ```

2. **Add missing columns**:
   ```sql
   ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id TEXT;
   ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;
   ```

3. **Remove problematic constraints**:
   ```sql
   ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_id_fkey;
   ```

4. **Update existing data**:
   ```sql
   UPDATE products SET category_id = category WHERE category_id IS NULL AND category IS NOT NULL;
   UPDATE products SET image_url = image WHERE image_url IS NULL AND image IS NOT NULL;
   ```

### 5. Common Error Messages and Solutions

| Error Message | Likely Cause | Solution |
|---------------|--------------|----------|
| "column 'category_id' does not exist" | Missing column | Add column using migration |
| "duplicate key value violates unique constraint" | Duplicate slug | Use unique slug |
| "null value in column 'name' violates not-null constraint" | Missing required field | Fill in all required fields |
| "permission denied for table products" | Insufficient permissions | Check user role and policies |

### 6. Testing Your Fixes

After applying fixes:

1. Restart the development server
2. Navigate to the admin panel
3. Try creating or updating a product
4. Check the browser console for any remaining errors

### 7. Getting More Help

If you continue to experience issues:

1. Check the browser console for detailed error messages
2. Look at the network tab to see the exact API responses
3. Contact the development team with the specific error messages