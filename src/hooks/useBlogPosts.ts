import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type BlogPost = Tables<'blog_posts'>;
type BlogPostInsert = TablesInsert<'blog_posts'>;
type BlogPostUpdate = TablesUpdate<'blog_posts'>;

export const useBlogPosts = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBlogPosts = async (includeUnpublished = false) => {
    try {
      setLoading(true);
      let query = supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (!includeUnpublished) {
        query = query.eq('published', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      setBlogPosts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createBlogPost = async (blogPost: BlogPostInsert) => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .insert(blogPost)
        .select()
        .single();

      if (error) throw error;
      await fetchBlogPosts(true); // Refresh the list with unpublished posts
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      return { data: null, error: errorMessage };
    }
  };

  const updateBlogPost = async (id: string, updates: BlogPostUpdate) => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      await fetchBlogPosts(true); // Refresh the list with unpublished posts
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
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