import { supabase } from '@/integrations/supabase/client';

// Comprehensive test to debug product save issues
export const debugProductSave = async () => {
  console.log('=== DEBUGGING PRODUCT SAVE ISSUES ===');
  
  try {
    // Step 1: Check table structure
    console.log('1. Checking table structure...');
    const { data: existingProducts, error: readError } = await supabase
      .from('products')
      .select('*')
      .limit(1);
    
    if (readError) {
      console.error('❌ Cannot read products table:', readError);
      return;
    }
    
    if (existingProducts && existingProducts.length > 0) {
      console.log('✅ Table structure (first product):', Object.keys(existingProducts[0]));
    }
    
    // Step 2: Test minimal insert
    console.log('2. Testing minimal insert...');
    const testSlug = 'debug-test-' + Date.now();
    
    // Try with original schema
    const minimalData1 = {
      name: 'Test Product',
      slug: testSlug,
      price: 100,
      category: 'general',
      image: '',
      description: 'test',
      long_description: 'test desc',
      origin: 'test origin'
    };
    
    const { data: result1, error: error1 } = await supabase
      .from('products')
      .insert(minimalData1)
      .select()
      .single();
    
    if (error1) {
      console.error('❌ Original schema insert failed:', error1);
      
      // Try with new schema
      console.log('3. Trying with new schema...');
      const minimalData2 = {
        name: 'Test Product 2',
        slug: testSlug + '-2',
        price: 100,
        category_id: 'general',
        image_url: '',
        description: 'test',
        long_description: 'test desc',
        origin: 'test origin'
      };
      
      const { data: result2, error: error2 } = await supabase
        .from('products')
        .insert(minimalData2)
        .select()
        .single();
      
      if (error2) {
        console.error('❌ New schema insert also failed:', error2);
      } else {
        console.log('✅ New schema works:', result2);
        // Clean up
        await supabase.from('products').delete().eq('id', result2.id);
      }
    } else {
      console.log('✅ Original schema works:', result1);
      // Clean up
      await supabase.from('products').delete().eq('id', result1.id);
    }
    
    // Step 4: Check auth and permissions
    console.log('4. Checking authentication and permissions...');
    const { data: authData } = await supabase.auth.getUser();
    console.log('Auth user:', authData.user?.email);
    
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', authData.user?.id)
      .single();
    console.log('User profile:', profile);
    
    // Step 5: Test actual form data structure
    console.log('5. Testing with realistic form data...');
    const realisticData = {
      name: 'برنج طارم محلی',
      slug: 'tarom-mahali-debug',
      category: 'tarom',
      price: 250000,
      original_price: 280000,
      image: '/assets/rice-tarom.jpg',
      description: 'برنج طارم محلی درجه یک',
      long_description: 'این برنج از بهترین انواع برنج است',
      origin: 'شمال ایران',
      features: ['درجه یک', 'ارگانیک'],
      weights: [{value: '1 کیلو', price: 250000}],
      in_stock: true
    };
    
    const { data: result3, error: error3 } = await supabase
      .from('products')
      .insert(realisticData)
      .select()
      .single();
    
    if (error3) {
      console.error('❌ Realistic data failed:', error3);
    } else {
      console.log('✅ Realistic data works:', result3);
      // Clean up
      await supabase.from('products').delete().eq('id', result3.id);
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
};

// Make available globally
(window as any).debugProductSave = debugProductSave;