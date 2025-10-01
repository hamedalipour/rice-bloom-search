-- Add role column to user_profiles table for admin functionality
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Add email column to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Create index on role for filtering
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- Create index on email for filtering
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- Update existing policies to use the role column
DROP POLICY IF EXISTS "Allow admin users to manage products" ON products;
DROP POLICY IF EXISTS "Allow admin users to read all blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Allow admin users to manage blog posts" ON blog_posts;

-- Recreate policies with proper role checking
CREATE POLICY "Allow admin users to manage products" ON products
  FOR ALL USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Allow admin users to read all blog posts" ON blog_posts
  FOR SELECT USING (
    published = true OR (
      auth.role() = 'authenticated' AND 
      EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() AND role = 'admin'
      )
    )
  );

CREATE POLICY "Allow admin users to manage blog posts" ON blog_posts
  FOR ALL USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );