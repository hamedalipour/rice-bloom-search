import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { products as sampleProducts } from '@/data/products';

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
      
      // If no products found in database, use sample data
      const productsToUse = (data && data.length > 0) ? data : sampleProducts.map(product => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        category_id: product.category,
        price: product.price,
        original_price: product.originalPrice || null,
        image_url: product.image,
        description: product.description || 'توضیحی ارائه نشده',
        long_description: product.longDescription || 'توضیحات کامل ارائه نشده',
        origin: product.origin || 'نامشخص',
        features: product.features || [],
        weights: product.weights || [],
        rating: product.rating || 0,
        review_count: product.reviewCount || 0,
        in_stock: product.inStock !== undefined ? product.inStock : true,
        gallery_images: [],
        is_featured: false,
        meta_title: null,
        meta_description: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as Product));
      
      console.log('Products fetched successfully:', productsToUse.length, 'products');
      setProducts(productsToUse);
      setError(null);
    } catch (err) {
      console.error('Error in fetchProducts:', err);
      // Fallback to sample data
      const fallbackProducts = sampleProducts.map(product => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        category_id: product.category,
        price: product.price,
        original_price: product.originalPrice || null,
        image_url: product.image,
        description: product.description || 'توضیحی ارائه نشده',
        long_description: product.longDescription || 'توضیحات کامل ارائه نشده',
        origin: product.origin || 'نامشخص',
        features: product.features || [],
        weights: product.weights || [],
        rating: product.rating || 0,
        review_count: product.reviewCount || 0,
        in_stock: product.inStock !== undefined ? product.inStock : true,
        gallery_images: [],
        is_featured: false,
        meta_title: null,
        meta_description: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as Product));
      
      setProducts(fallbackProducts);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (product: ProductInsert) => {
    try {
      console.log('=== CREATING PRODUCT ===');
      console.log('Original form data:', product);
      
      // Create a safe product data without problematic category field
      const safeProductData = {
        name: product.name,
        slug: product.slug,
        price: product.price,
        original_price: product.original_price || null,
        description: product.description || 'توضیحی ارائه نشده',
        long_description: product.long_description || 'توضیحات کامل ارائه نشده',
        origin: product.origin || 'نامشخص',
        features: product.features || ['ویژگی خاصی ندارد'],
        weights: product.weights || [],
        in_stock: product.in_stock !== undefined ? product.in_stock : true
      };
      
      // Add image field if provided
      if (product.image_url) {
        (safeProductData as any).image_url = product.image_url;
      }
      
      console.log('Safe product data (no category):', safeProductData);
      
      const { data, error } = await supabase
        .from('products')
        .insert(safeProductData)
        .select()
        .single();
      
      if (error) {
        console.error('Safe create failed:', error);
        
        // If image_url fails, try with image field
        if (product.image_url && error.message.includes('image_url')) {
          console.log('Retrying with image field instead of image_url...');
          const retryData = { ...safeProductData };
          delete (retryData as any).image_url;
          (retryData as any).image = product.image_url;
          
          const { data: retryResult, error: retryError } = await supabase
            .from('products')
            .insert(retryData)
            .select()
            .single();
          
          if (!retryError) {
            console.log('✅ Retry with image field succeeded:', retryResult);
            await fetchProducts();
            return { data: retryResult, error: null };
          }
        }
        
        throw error;
      }
      
      console.log('✅ Product created successfully:', data);
      await fetchProducts();
      return { data, error: null };
      
    } catch (err) {
      console.error('=== CREATE PRODUCT FAILED ===');
      console.error('Final error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Database error occurred';
      return { data: null, error: errorMessage };
    }
  };

  const updateProduct = async (id: string, updates: ProductUpdate) => {
    try {
      console.log('=== UPDATING PRODUCT ===');
      console.log('Product ID:', id);
      console.log('Update data:', updates);
      
      // First, get the existing product to see what fields we can update
      const { data: existingProduct } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (existingProduct) {
        console.log('Existing product structure:', Object.keys(existingProduct));
      }
      
      // Try updating only the fields that we know exist and work
      const safeUpdate = {
        name: updates.name,
        slug: updates.slug,
        price: updates.price,
        original_price: updates.original_price || null,
        description: updates.description || 'توضیحی ارائه نشده',
        long_description: updates.long_description || 'توضیحات کامل ارائه نشده',
        origin: updates.origin || 'نامشخص',
        features: updates.features || [],
        weights: updates.weights || [],
        in_stock: updates.in_stock !== undefined ? updates.in_stock : true
      };
      
      // Add image field if we have an image
      if (updates.image_url) {
        // Try both possible image field names
        if (existingProduct && 'image_url' in existingProduct) {
          (safeUpdate as any).image_url = updates.image_url;
        } else if (existingProduct && 'image' in existingProduct) {
          (safeUpdate as any).image = updates.image_url;
        }
      }
      
      console.log('Safe update (no category):', safeUpdate);
      
      const { data, error } = await supabase
        .from('products')
        .update(safeUpdate)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Safe update failed:', error);
        throw error;
      }
      
      console.log('✅ Product updated successfully:', data);
      await fetchProducts();
      return { data, error: null };
      
    } catch (err) {
      console.error('=== UPDATE PRODUCT FAILED ===');
      console.error('Final error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Database error occurred';
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
      console.log('Fetching product by slug:', slug);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .single();

      console.log('Product fetch result:', { data, error });
      
      if (error) {
        console.error('Error fetching product by slug:', error);
        // Try to find in sample data as fallback
        const sampleProduct = sampleProducts.find(p => p.slug === slug);
        if (sampleProduct) {
          const convertedProduct = {
            id: sampleProduct.id,
            name: sampleProduct.name,
            slug: sampleProduct.slug,
            category_id: sampleProduct.category,
            price: sampleProduct.price,
            original_price: sampleProduct.originalPrice || null,
            image_url: sampleProduct.image,
            description: sampleProduct.description || 'توضیحی ارائه نشده',
            long_description: sampleProduct.longDescription || 'توضیحات کامل ارائه نشده',
            origin: sampleProduct.origin || 'نامشخص',
            features: sampleProduct.features || [],
            weights: sampleProduct.weights || [],
            rating: sampleProduct.rating || 0,
            review_count: sampleProduct.reviewCount || 0,
            in_stock: sampleProduct.inStock !== undefined ? sampleProduct.inStock : true,
            gallery_images: [],
            is_featured: false,
            meta_title: null,
            meta_description: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          } as Product;
          return { data: convertedProduct, error: null };
        }
        throw error;
      }
      
      return { data, error: null };
    } catch (err) {
      console.error('=== GET PRODUCT BY SLUG FAILED ===');
      console.error('Slug:', slug);
      console.error('Final error:', err);
      
      // Try to find in sample data as fallback
      const sampleProduct = sampleProducts.find(p => p.slug === slug);
      if (sampleProduct) {
        const convertedProduct = {
          id: sampleProduct.id,
          name: sampleProduct.name,
          slug: sampleProduct.slug,
          category_id: sampleProduct.category,
          price: sampleProduct.price,
          original_price: sampleProduct.originalPrice || null,
          image_url: sampleProduct.image,
          description: sampleProduct.description || 'توضیحی ارائه نشده',
          long_description: sampleProduct.longDescription || 'توضیحات کامل ارائه نشده',
          origin: sampleProduct.origin || 'نامشخص',
          features: sampleProduct.features || [],
          weights: sampleProduct.weights || [],
          rating: sampleProduct.rating || 0,
          review_count: sampleProduct.reviewCount || 0,
          in_stock: sampleProduct.inStock !== undefined ? sampleProduct.inStock : true,
          gallery_images: [],
          is_featured: false,
          meta_title: null,
          meta_description: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as Product;
        return { data: convertedProduct, error: null };
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Database error occurred';
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