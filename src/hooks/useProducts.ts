import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type Product = Tables<'products'>;
type ProductInsert = TablesInsert<'products'>;
type ProductUpdate = TablesUpdate<'products'>;

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('Fetching products from Supabase...');
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Products fetched successfully:', data?.length || 0, 'products');
      setProducts(data || []);
      setError(null);
    } catch (err) {
      console.error('Error in fetchProducts:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (product: ProductInsert) => {
    try {
      console.log('Creating product with data:', product);
      
      // Ensure required fields are not null
      const productData = {
        ...product,
        // Handle potential schema differences
        category_id: product.category_id || null,
        image_url: product.image_url || null,
        description: product.description || null,
        long_description: product.long_description || null,
        origin: product.origin || null,
        features: product.features || [],
        weights: product.weights || [],
        original_price: product.original_price || null,
        in_stock: product.in_stock !== undefined ? product.in_stock : true,
      };
      
      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();

      if (error) {
        console.error('Supabase createProduct error:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
      
      console.log('Product created successfully:', data);
      await fetchProducts(); // Refresh the list
      return { data, error: null };
    } catch (err) {
      console.error('Error in createProduct:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      console.error('Formatted error message:', errorMessage);
      return { data: null, error: errorMessage };
    }
  };

  const updateProduct = async (id: string, updates: ProductUpdate) => {
    try {
      console.log('Updating product with ID:', id, 'Data:', updates);
      
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase updateProduct error:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
      
      console.log('Product updated successfully:', data);
      await fetchProducts(); // Refresh the list
      return { data, error: null };
    } catch (err) {
      console.error('Error in updateProduct:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      console.error('Formatted error message:', errorMessage);
      return { data: null, error: errorMessage };
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchProducts(); // Refresh the list
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      return { error: errorMessage };
    }
  };

  const getProductBySlug = async (slug: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
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

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductBySlug,
  };
};