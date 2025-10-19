import { supabase } from '@/integrations/supabase/client';

export const runDatabaseTests = async () => {
  try {
    console.log('=== RUNNING DATABASE TESTS ===');
    
    // Test 1: Check if products table exists and structure
    console.log('Test 1: Checking products table structure...');
    const { data: sampleProduct, error: sampleError } = await supabase
      .from('products')
      .select('*')
      .limit(1);
    
    if (sampleError) {
      console.error('Products table check failed:', sampleError);
    } else {
      console.log('Products table accessible');
      if (sampleProduct && sampleProduct.length > 0) {
        console.log('Sample product columns:', Object.keys(sampleProduct[0]));
      }
    }
    
    // Test 2: Try inserting a minimal product
    console.log('Test 2: Testing minimal product insert...');
    const testProduct = {
      name: 'Database Test Product',
      slug: 'db-test-' + Date.now(),
      price: 99.99,
      description: 'Test product for database verification',
      long_description: 'Detailed test product description',
      origin: 'Test Origin',
      category_id: null // Since no categories table exists
    };
    
    const { data: insertResult, error: insertError } = await supabase
      .from('products')
      .insert(testProduct)
      .select()
      .single();
    
    if (insertError) {
      console.error('Minimal product insert failed:', insertError);
      console.error('Error code:', insertError.code);
      console.error('Error message:', insertError.message);
      console.error('Error details:', insertError.details);
    } else {
      console.log('✅ Minimal product insert succeeded:', insertResult);
      
      // Clean up test product
      if (insertResult && insertResult.id) {
        await supabase
          .from('products')
          .delete()
          .eq('id', insertResult.id);
        console.log('Cleaned up test product');
      }
    }
    
    console.log('=== DATABASE TESTS COMPLETE ===');
  } catch (error) {
    console.error('Database tests failed with exception:', error);
  }
};