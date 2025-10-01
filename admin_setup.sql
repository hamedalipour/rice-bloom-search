-- First, make sure you have applied all the migrations:
-- 001_create_products_table.sql
-- 002_create_blog_posts_table.sql  
-- 003_add_user_roles.sql

-- Then create an admin user by:
-- 1. Register a user through the app (e.g., admin@example.com)
-- 2. Run this SQL in Supabase SQL Editor to make them admin:

UPDATE user_profiles 
SET role = 'admin' 
WHERE email = 'admin@example.com';

-- Or if you know the user ID:
UPDATE user_profiles 
SET role = 'admin' 
WHERE id = 'YOUR_USER_ID';

-- To check current users and their roles:
SELECT id, email, role, first_name, last_name 
FROM user_profiles;