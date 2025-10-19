import { supabase } from '@/integrations/supabase/client';

export const debugDatabaseSchema = async () => {
  try {
    console.log('=== DEBUGGING DATABASE SCHEMA ===');
    
    // Check products table structure
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(1);
    
    if (productsError) {
      console.error('Error fetching products sample:', productsError);
    } else {
      console.log('Products table sample:', productsData);
      if (productsData && productsData.length > 0) {
        console.log('Products table columns:', Object.keys(productsData[0]));
      }
    }
    
    // Check if category_id column exists
    const { data: categoryCheck, error: categoryError } = await supabase
      .from('products')
      .select('category_id')
      .limit(1);
    
    if (categoryError) {
      console.error('category_id column check failed:', categoryError);
    } else {
      console.log('category_id column exists and is accessible');
    }
    
    // Check if image_url column exists
    const { data: imageUrlCheck, error: imageUrlError } = await supabase
      .from('products')
      .select('image_url')
      .limit(1);
    
    if (imageUrlError) {
      console.error('image_url column check failed:', imageUrlError);
    } else {
      console.log('image_url column exists and is accessible');
    }
    
    // Check if image column exists
    const { data: imageCheck, error: imageError } = await supabase
      .from('products')
      .select('image')
      .limit(1);
    
    if (imageError) {
      console.error('image column check failed:', imageError);
    } else {
      console.log('image column exists and is accessible');
    }
    
    // Check categories table
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('categories')
      .select('*');
    
    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
    } else {
      console.log('Categories:', categoriesData);
    }
    
    console.log('=== DATABASE DEBUG COMPLETE ===');
  } catch (error) {
    console.error('Database debug failed:', error);
  }
};