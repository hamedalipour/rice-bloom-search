-- Create blog_posts table
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

-- Create index on slug for fast lookups
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);

-- Create index on category for filtering
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);

-- Create index on published status for filtering
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);

-- Create index on created_at for ordering
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at DESC);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_blog_posts_updated_at 
  BEFORE UPDATE ON blog_posts 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

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