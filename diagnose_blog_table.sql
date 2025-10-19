-- Comprehensive diagnostic script for blog_posts table
-- Run this in your Supabase SQL editor to diagnose issues

-- 1. Check the actual table structure
\d blog_posts;

-- 2. Check column names and types
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'blog_posts'
ORDER BY ordinal_position;

-- 3. Check if there are any rows in the table
SELECT COUNT(*) as total_posts FROM blog_posts;

-- 4. Check a sample row to see the actual column names
SELECT * FROM blog_posts LIMIT 1;

-- 5. Check for any triggers on the table
SELECT 
    tgname as trigger_name,
    pg_get_triggerdef(oid) as trigger_definition
FROM pg_trigger
WHERE tgrelid = 'blog_posts'::regclass;

-- 6. Check for any policies on the table
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policy
WHERE polrelid = 'blog_posts'::regclass;