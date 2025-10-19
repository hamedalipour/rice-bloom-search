import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Use flexible typing since the generated types don't match the actual schema
export const useBlogPosts = () => {
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBlogPosts = async (includeUnpublished = false) => {
    try {
      setLoading(true);
      console.log('Fetching blog posts from Supabase...');
      
      let query = supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (!includeUnpublished) {
        query = query.eq('published', true);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Blog posts fetched successfully:', data?.length || 0, 'posts');
      setBlogPosts(data || []);
      setError(null);
    } catch (err) {
      console.error('Error in fetchBlogPosts:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createBlogPost = async (blogPost: any) => {
    try {
      console.log('=== CREATING BLOG POST ===');
      console.log('Original form data:', blogPost);
      
      // Map form data to actual database schema (from debug output)
      const actualSchemaData = {
        title: blogPost.title,
        slug: blogPost.slug,
        excerpt: blogPost.excerpt || 'خلاصه‌ای ارائه نشده',
        content: blogPost.content,
        // Fix: Use the correct database column name 'image' instead of 'featured_image_url'
        image: blogPost.image || '',
        author_id: null, // Set to null since we don't have user IDs
        published: blogPost.published !== undefined ? blogPost.published : false,
        published_at: blogPost.published ? new Date().toISOString() : null,
        meta_title: blogPost.title,
        meta_description: blogPost.excerpt || blogPost.title,
        tags: blogPost.category ? [blogPost.category] : []
      };
      
      console.log('Mapped to actual schema:', actualSchemaData);
      
      const { data, error } = await supabase
        .from('blog_posts')
        .insert(actualSchemaData)
        .select()
        .single();
      
      if (error) {
        console.error('❌ Blog post creation failed:', error);
        throw error;
      }
      
      console.log('✅ Blog post created successfully:', data);
      await fetchBlogPosts(true);
      return { data, error: null };
      
    } catch (err) {
      console.error('=== CREATE BLOG POST FAILED ===');
      console.error('Final error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Database error occurred';
      return { data: null, error: errorMessage };
    }
  };

  const updateBlogPost = async (id: string, updates: any) => {
    try {
      console.log('=== UPDATING BLOG POST ===');
      console.log('Blog post ID:', id);
      console.log('Update data:', updates);
      
      // First, get the existing blog post to see what fields we can update
      const { data: existingPost } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single();
      
      if (existingPost) {
        console.log('Existing blog post structure:', Object.keys(existingPost));
      }
      
      // Map form data to actual database schema
      const actualSchemaUpdate = {
        title: updates.title,
        slug: updates.slug,
        excerpt: updates.excerpt || 'خلاصه‌ای ارائه نشده',
        content: updates.content,
        // Fix: Use the correct database column name 'image' instead of 'featured_image_url'
        image: updates.image || '',
        published: updates.published !== undefined ? updates.published : false,
        published_at: updates.published ? new Date().toISOString() : null,
        meta_title: updates.title,
        meta_description: updates.excerpt || updates.title,
        tags: updates.category ? [updates.category] : []
      };
      
      console.log('Mapped update to actual schema:', actualSchemaUpdate);
      
      const { data, error } = await supabase
        .from('blog_posts')
        .update(actualSchemaUpdate)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Blog post update failed:', error);
        throw error;
      }
      
      console.log('✅ Blog post updated successfully:', data);
      await fetchBlogPosts(true); // Refresh the list with unpublished posts
      return { data, error: null };
      
    } catch (err) {
      console.error('=== UPDATE BLOG POST FAILED ===');
      console.error('Final error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Database error occurred';
      return { data: null, error: errorMessage };
    }
  };

  const deleteBlogPost = async (id: string) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchBlogPosts(true); // Refresh the list
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      return { error: errorMessage };
    }
  };

  const getBlogPostBySlug = async (slug: string) => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      return { data: null, error: errorMessage };
    }
  };

  const publishBlogPost = async (id: string, published: boolean) => {
    return updateBlogPost(id, { published });
  };

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  return {
    blogPosts,
    loading,
    error,
    fetchBlogPosts,
    createBlogPost,
    updateBlogPost,
    deleteBlogPost,
    getBlogPostBySlug,
    publishBlogPost,
  };
};