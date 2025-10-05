import { supabase } from '@/integrations/supabase/client';

// Simple debug function to test blog posts table access
export const debugBlogPost = async () => {
  console.log('=== DEBUGGING BLOG POST ISSUES ===');
  
  try {
    // Step 1: Check if blog_posts table exists
    console.log('1. Testing if blog_posts table exists...');
    
    const { data: tableCheck, error: tableError } = await supabase
      .from('blog_posts')
      .select('*')
      .limit(0);
    
    if (tableError) {
      console.error('❌ TABLE DOES NOT EXIST:', tableError);
      console.log('\n🛠️ TO FIX THIS:');
      console.log('1. Go to your Supabase dashboard');
      console.log('2. Open SQL Editor');
      console.log('3. Run the SQL from FIX_BLOG_DATABASE.sql file');
      console.log('4. This will create the missing blog_posts table');
      return;
    }
    
    console.log('✅ blog_posts table exists and is accessible');
    
    // Step 2: Check table structure
    console.log('2. Checking table structure...');
    const { data: existingPosts, error: readError } = await supabase
      .from('blog_posts')
      .select('*')
      .limit(1);
    
    if (readError) {
      console.error('❌ Cannot read blog_posts table:', readError);
    } else {
      console.log('✅ Found posts:', existingPosts?.length || 0);
      if (existingPosts && existingPosts.length > 0) {
        console.log('✅ Table fields:', Object.keys(existingPosts[0]));
      }
    }
    
    // Step 3: Test minimal insert
    console.log('3. Testing blog post creation...');
    const testSlug = 'debug-test-' + Date.now();
    
    const testData = {
      title: 'Debug Test Post',
      slug: testSlug,
      excerpt: 'Test excerpt',
      content: 'Test content',
      category: 'debug',
      author: 'Test Author',
      image: '/test.jpg',
      read_time: '1 minute',
      published: false
    };
    
    const { data: result, error: insertError } = await supabase
      .from('blog_posts')
      .insert(testData)
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ INSERT FAILED:', insertError);
      console.error('Error details:', {
        message: insertError.message,
        details: insertError.details,
        code: insertError.code
      });
    } else {
      console.log('✅ Insert successful:', result);
      // Clean up test post
      await supabase.from('blog_posts').delete().eq('id', result.id);
      console.log('✅ Test post cleaned up');
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
};

// Make available globally
(window as any).debugBlogPost = debugBlogPost;