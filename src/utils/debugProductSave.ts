import { supabase } from '@/integrations/supabase/client';
import { TablesInsert } from '@/integrations/supabase/types';

export const debugProductSave = async (productData: TablesInsert<'products'>) => {
  try {
    console.log('=== DEBUG PRODUCT SAVE ===');
    console.log('Input product data:', productData);
    
    // Check for required fields
    const requiredFields = ['name', 'slug', 'price'];
    const missingFields = requiredFields.filter(field => !productData[field as keyof typeof productData]);
    
    if (missingFields.length > 0) {
      console.warn('Missing required fields:', missingFields);
    }
    
    // Check data types
    console.log('Data types:');
    Object.keys(productData).forEach(key => {
      const value = productData[key as keyof typeof productData];
      console.log(`  ${key}: ${typeof value} =`, value);
    });
    
    // Try to insert with detailed error handling
    console.log('Attempting to insert product...');
    
    const { data, error } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single();
    
    if (error) {
      console.error('=== PRODUCT INSERT FAILED ===');
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', error.details);
      console.error('Error hint:', error.hint);
      
      // Try with minimal data
      console.log('Trying with minimal data...');
      const minimalData = {
        name: productData.name || 'Test Product',
        slug: productData.slug || 'test-product-' + Date.now(),
        price: productData.price || 0
      };
      
      const { data: minimalDataResult, error: minimalDataError } = await supabase
        .from('products')
        .insert(minimalData)
        .select()
        .single();
      
      if (minimalDataError) {
        console.error('=== MINIMAL INSERT ALSO FAILED ===');
        console.error('Minimal data error:', minimalDataError);
      } else {
        console.log('✅ Minimal insert succeeded:', minimalDataResult);
      }
    } else {
      console.log('✅ Product insert succeeded:', data);
    }
    
    console.log('=== DEBUG COMPLETE ===');
    return { data, error };
  } catch (error) {
    console.error('=== DEBUG PRODUCT SAVE FAILED ===');
    console.error('Exception:', error);
    return { data: null, error };
  }
};

// Make available globally
(window as any).debugProductSave = debugProductSave;