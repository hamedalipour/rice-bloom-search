import { supabase } from '@/integrations/supabase/client';

export const checkProductsSchema = async () => {
  try {
    console.log('=== CHECKING PRODUCTS TABLE SCHEMA ===');
    
    // Get table info
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error accessing products table:', error);
      return { success: false, error };
    }
    
    if (data && data.length > 0) {
      console.log('Table structure:');
      Object.keys(data[0]).forEach(key => {
        console.log(`  ${key}: ${typeof data[0][key as keyof typeof data[0]]}`);
      });
    } else {
      console.log('Products table is empty or does not exist');
    }
    
    // Check specific columns
    const columnChecks = ['category_id', 'image_url', 'name', 'slug', 'price'];
    
    for (const column of columnChecks) {
      try {
        const { data: columnData, error: columnError } = await supabase
          .from('products')
          .select(column)
          .limit(1);
        
        if (columnError) {
          console.error(`Column ${column} check failed:`, columnError.message);
        } else {
          console.log(`✅ Column ${column} exists and is accessible`);
        }
      } catch (columnCheckError) {
        console.error(`Column ${column} check threw exception:`, columnCheckError);
      }
    }
    
    console.log('=== SCHEMA CHECK COMPLETE ===');
    return { success: true, data };
  } catch (error) {
    console.error('Schema check failed:', error);
    return { success: false, error };
  }
};