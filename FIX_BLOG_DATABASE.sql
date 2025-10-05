-- Run this SQL in your Supabase SQL Editor to create the blog_posts table
-- This fixes the "Database error occurred" issue

-- Create blog_posts table (from migration 002)
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  author TEXT NOT NULL,
  image TEXT NOT NULL,
  read_time TEXT NOT NULL,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at DESC);

-- Create trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER update_blog_posts_updated_at 
  BEFORE UPDATE ON blog_posts 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow read access to published blog posts for all users" ON blog_posts;
DROP POLICY IF EXISTS "Allow admin users to read all blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Allow admin users to manage blog posts" ON blog_posts;

-- Create policy to allow read access to published posts for all users
CREATE POLICY "Allow read access to published blog posts for all users" ON blog_posts
  FOR SELECT USING (published = true);

-- Create policy to allow read access to all posts for admin users
CREATE POLICY "Allow admin users to read all blog posts" ON blog_posts
  FOR SELECT USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND 
      (user_profiles.email LIKE '%admin%' OR user_profiles.role = 'admin')
    )
  );

-- Create policy to allow insert/update/delete only for authenticated admin users
CREATE POLICY "Allow admin users to manage blog posts" ON blog_posts
  FOR ALL USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND 
      (user_profiles.email LIKE '%admin%' OR user_profiles.role = 'admin')
    )
  );

-- Insert a test blog post to verify everything works
INSERT INTO blog_posts (title, slug, excerpt, content, category, author, image, read_time, published) VALUES
(
  'Test Blog Post - Database Fixed!',
  'test-blog-post-database-fixed',
  'This is a test post to verify that the blog_posts table is working correctly.',
  '# Test Blog Post

This blog post was automatically created to test that the blog_posts table is working correctly.

If you can see this post in the admin panel, then the database issue has been resolved!

You can delete this test post after confirming everything works.',
  'تست',
  'System',
  '/src/assets/hero-rice-field.jpg',  
  '۱ دقیقه',
  true
) ON CONFLICT (slug) DO NOTHING;

-- Show confirmation
SELECT 'Blog posts table created successfully!' as status;
SELECT COUNT(*) as total_posts FROM blog_posts;