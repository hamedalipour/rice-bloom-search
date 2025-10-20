/**
 * Test script to verify category_id fix in products table
 * Run this script to ensure category_id is working correctly
 *
 * Usage: node test_category_fix.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const adminEmail = 'hamedalipour38@gmail.com';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase credentials');
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Test results tracker
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

function logTest(name, passed, message) {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status}: ${name}`);
  if (message) {
    console.log(`   ${message}`);
  }
  results.tests.push({ name, passed, message });
  if (passed) results.passed++;
  else results.failed++;
}

async function testDatabaseConnection() {
  console.log('\n📡 Test 1: Database Connection');
  try {
    const { data, error } = await supabase.from('products').select('count', { count: 'exact', head: true });
    if (error) throw error;
    logTest('Database Connection', true, 'Successfully connected to Supabase');
    return true;
  } catch (error) {
    logTest('Database Connection', false, error.message);
    return false;
  }
}

async function testTableStructure() {
  console.log('\n🔍 Test 2: Table Structure');
  try {
    // Fetch one product to check structure
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(1);

    if (error) throw error;

    const requiredFields = ['id', 'name', 'slug', 'category_id', 'price', 'image_url'];
    const oldFields = ['category', 'image'];

    if (data && data.length > 0) {
      const product = data[0];
      const fields = Object.keys(product);

      // Check for new fields
      const hasNewFields = requiredFields.every(field => fields.includes(field));
      // Check that old fields don't exist
      const hasOldFields = oldFields.some(field => fields.includes(field));

      if (hasNewFields && !hasOldFields) {
        logTest('Table Structure', true, 'All required fields exist, old fields removed');
        return true;
      } else if (!hasNewFields) {
        const missingFields = requiredFields.filter(field => !fields.includes(field));
        logTest('Table Structure', false, `Missing fields: ${missingFields.join(', ')}`);
        return false;
      } else {
        logTest('Table Structure', false, `Old fields still exist: ${oldFields.filter(f => fields.includes(f)).join(', ')}`);
        return false;
      }
    } else {
      logTest('Table Structure', true, 'Table exists (no data to verify structure)');
      return true;
    }
  } catch (error) {
    logTest('Table Structure', false, error.message);
    return false;
  }
}

async function testCategoryRead() {
  console.log('\n📖 Test 3: Read Products with category_id');
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, category_id, image_url')
      .limit(5);

    if (error) throw error;

    if (data && data.length > 0) {
      console.log(`   Found ${data.length} products`);
      data.forEach(product => {
        console.log(`   - ${product.name}: category_id="${product.category_id || 'null'}"`);
      });
      logTest('Read Products', true, `Successfully read ${data.length} products with category_id`);
    } else {
      logTest('Read Products', true, 'No products in database yet');
    }
    return true;
  } catch (error) {
    logTest('Read Products', false, error.message);
    return false;
  }
}

async function testCategoryInsert() {
  console.log('\n➕ Test 4: Insert Product with category_id');

  const testProduct = {
    name: `Test Product ${Date.now()}`,
    slug: `test-product-${Date.now()}`,
    category_id: 'hashemi',
    price: 50000,
    description: 'محصول تست',
    long_description: 'توضیحات کامل محصول تست',
    origin: 'گیلان',
    features: ['ویژگی ۱', 'ویژگی ۲'],
    weights: [{ value: '1kg', price: 50000 }],
    in_stock: true,
    image_url: '/images/default.jpg'
  };

  try {
    const { data, error } = await supabase
      .from('products')
      .insert(testProduct)
      .select()
      .single();

    if (error) throw error;

    if (data && data.category_id === 'hashemi') {
      logTest('Insert Product', true, `Product inserted with category_id="${data.category_id}"`);

      // Clean up - delete test product
      await supabase.from('products').delete().eq('id', data.id);
      console.log('   ⚡ Test product cleaned up');

      return true;
    } else {
      logTest('Insert Product', false, 'Product inserted but category_id is incorrect');
      return false;
    }
  } catch (error) {
    if (error.message.includes('permission') || error.message.includes('policy')) {
      logTest('Insert Product', false, `Permission denied - Check RLS policies and admin role: ${error.message}`);
    } else {
      logTest('Insert Product', false, error.message);
    }
    return false;
  }
}

async function testCategoryUpdate() {
  console.log('\n✏️ Test 5: Update Product category_id');

  // First, create a test product
  const testProduct = {
    name: `Test Update ${Date.now()}`,
    slug: `test-update-${Date.now()}`,
    category_id: 'tarom',
    price: 60000,
    description: 'محصول تست به‌روزرسانی',
    long_description: 'توضیحات کامل',
    origin: 'مازندران'
  };

  try {
    const { data: insertedProduct, error: insertError } = await supabase
      .from('products')
      .insert(testProduct)
      .select()
      .single();

    if (insertError) throw insertError;

    // Now update the category
    const { data: updatedProduct, error: updateError } = await supabase
      .from('products')
      .update({ category_id: 'fajr' })
      .eq('id', insertedProduct.id)
      .select()
      .single();

    if (updateError) throw updateError;

    if (updatedProduct.category_id === 'fajr') {
      logTest('Update Product', true, `Category updated from "tarom" to "fajr"`);

      // Clean up
      await supabase.from('products').delete().eq('id', insertedProduct.id);
      console.log('   ⚡ Test product cleaned up');

      return true;
    } else {
      logTest('Update Product', false, 'Category was not updated correctly');
      await supabase.from('products').delete().eq('id', insertedProduct.id);
      return false;
    }
  } catch (error) {
    if (error.message.includes('permission') || error.message.includes('policy')) {
      logTest('Update Product', false, `Permission denied - Check RLS policies and admin role: ${error.message}`);
    } else {
      logTest('Update Product', false, error.message);
    }
    return false;
  }
}

async function testNullCategory() {
  console.log('\n⭕ Test 6: Product with null category_id');

  const testProduct = {
    name: `Test Null Category ${Date.now()}`,
    slug: `test-null-${Date.now()}`,
    category_id: null,
    price: 40000,
    description: 'محصول بدون دسته‌بندی',
    long_description: 'توضیحات کامل',
    origin: 'تهران'
  };

  try {
    const { data, error } = await supabase
      .from('products')
      .insert(testProduct)
      .select()
      .single();

    if (error) throw error;

    if (data && data.category_id === null) {
      logTest('Null Category', true, 'Product can be created without category_id');

      // Clean up
      await supabase.from('products').delete().eq('id', data.id);
      console.log('   ⚡ Test product cleaned up');

      return true;
    } else {
      logTest('Null Category', false, 'Unexpected category_id value');
      return false;
    }
  } catch (error) {
    logTest('Null Category', false, error.message);
    return false;
  }
}

async function checkAdminRole() {
  console.log('\n👤 Test 7: Check Admin Role');
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('email, role')
      .eq('email', adminEmail)
      .single();

    if (error) throw error;

    if (data && data.role === 'admin') {
      logTest('Admin Role', true, `User ${adminEmail} has admin role`);
      return true;
    } else {
      logTest('Admin Role', false, `User ${adminEmail} does not have admin role (current: ${data?.role || 'none'})`);
      console.log('   ⚠️  Run this SQL in Supabase to fix:');
      console.log(`   UPDATE user_profiles SET role = 'admin' WHERE email = '${adminEmail}';`);
      return false;
    }
  } catch (error) {
    logTest('Admin Role', false, error.message);
    return false;
  }
}

function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${results.tests.length}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log('='.repeat(60));

  if (results.failed === 0) {
    console.log('\n🎉 All tests passed! Category fix is working correctly.');
    console.log('You can now use category_id in the admin panel.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
    console.log('\n📋 Recommended Actions:');
    console.log('1. Run FIX_CATEGORY_ISSUE.sql in Supabase SQL Editor');
    console.log('2. Ensure your user has admin role');
    console.log('3. Check RLS policies on products table');
    console.log('4. Clear browser cache and retry');
  }

  console.log('\n');
}

async function runAllTests() {
  console.log('🚀 Starting Category Fix Tests...');
  console.log('Supabase URL:', supabaseUrl);
  console.log('');

  await testDatabaseConnection();
  await testTableStructure();
  await testCategoryRead();
  await checkAdminRole();
  await testCategoryInsert();
  await testCategoryUpdate();
  await testNullCategory();

  printSummary();

  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});
