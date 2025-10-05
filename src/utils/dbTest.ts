import { supabase } from '@/integrations/supabase/client';

// Test function to check the database schema
export const testDatabaseConnection = async () => {
  try {
    console.log('Testing database connection...');
    
    // Get table info
    const { data: tableInfo, error: tableError } = await supabase
      .from('products')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('Error fetching from products table:', tableError);
      return { success: false, error: tableError.message };
    }
    
    console.log('Products table accessible. Sample row:', tableInfo);
    
    // Try to describe the table structure by attempting an insert with minimal data
    const testProduct = {
      name: 'Test Product',
      slug: 'test-product-' + Date.now(),
      price: 100,
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('products')
      .insert(testProduct)
      .select()
      .single();
    
    if (insertError) {
      console.error('Insert test failed:', insertError);
      console.error('Error details:', {
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        code: insertError.code
      });
      return { success: false, error: insertError.message, details: insertError };
    }
    
    console.log('Insert test successful:', insertData);
    
    // Clean up the test product
    await supabase
      .from('products')
      .delete()
      .eq('id', insertData.id);
    
    return { success: true, data: insertData };
    
  } catch (error) {
    console.error('Database test failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Export for use in components
(window as any).testDatabaseConnection = testDatabaseConnection;