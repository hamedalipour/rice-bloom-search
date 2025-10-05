import { supabase } from '@/integrations/supabase/client';

// Test current database schema and storage setup
export const testCurrentSetup = async () => {
  console.log('=== Testing Current Database Setup ===');
  
  try {
    // Test 1: Check if we can read from products table
    console.log('1. Testing products table read...');
    const { data: products, error: readError } = await supabase
      .from('products')
      .select('*')
      .limit(5);
    
    if (readError) {
      console.error('❌ Products table read error:', readError);
    } else {
      console.log('✅ Products table accessible. Found', products?.length || 0, 'products');
      if (products && products.length > 0) {
        console.log('Sample product structure:', Object.keys(products[0]));
      }
    }
    
    // Test 2: Check storage bucket
    console.log('2. Testing storage bucket...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Storage buckets error:', bucketsError);
    } else {
      console.log('✅ Storage accessible. Buckets:', buckets?.map(b => b.name));
      
      const productImagesBucket = buckets?.find(b => b.name === 'product-images');
      if (productImagesBucket) {
        console.log('✅ product-images bucket exists');
      } else {
        console.log('❌ product-images bucket not found');
      }
    }
    
    // Test 3: Try a minimal product insert to see what fields are required
    console.log('3. Testing minimal product insert...');
    const testSlug = 'test-product-' + Date.now();
    const minimalProduct = {
      name: 'Test Product',
      slug: testSlug,
      price: 100
    };
    
    const { data: insertResult, error: insertError } = await supabase
      .from('products')
      .insert(minimalProduct)
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Minimal insert failed:', insertError);
      console.error('Error details:', {
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        code: insertError.code
      });
    } else {
      console.log('✅ Minimal insert successful:', insertResult);
      
      // Clean up
      await supabase.from('products').delete().eq('id', insertResult.id);
      console.log('✅ Cleanup completed');
    }
    
    // Test 4: Check authentication
    console.log('4. Testing authentication...');
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('❌ Auth error:', authError);
    } else {
      console.log('✅ Auth status:', authData.user ? 'Logged in' : 'Not logged in');
      if (authData.user) {
        console.log('User email:', authData.user.email);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed with exception:', error);
  }
};

// Make it available in browser console
(window as any).testCurrentSetup = testCurrentSetup;