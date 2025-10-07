import { supabase } from '@/integrations/supabase/client';

export const testSimpleQuery = async () => {
  try {
    console.log('Testing simple database query...');
    
    // Try to fetch a few products
    const { data, error } = await supabase
      .from('products')
      .select('id, name, slug, category_id, price, image_url, in_stock')
      .limit(5);

    if (error) {
      console.error('Query error:', error);
      return { success: false, error: error.message };
    }

    console.log('Query successful:', data);
    return { success: true, data };
    
  } catch (error) {
    console.error('Query exception:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Run the test when this module is imported
testSimpleQuery().then(result => {
  console.log('Test result:', result);
});