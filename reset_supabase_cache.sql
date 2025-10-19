-- This script can help reset the Supabase schema cache
-- Run this in your Supabase SQL editor if you're experiencing schema cache issues

-- First, let's check the actual structure of the blog_posts table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'blog_posts'
ORDER BY ordinal_position;

-- If you're still experiencing issues, you can try to reset the PostgREST schema cache
-- Note: This requires admin privileges
NOTIFY pgrst, 'reload schema';

-- If that doesn't work, you can also try restarting the PostgREST service
-- This would typically be done through the Supabase dashboard