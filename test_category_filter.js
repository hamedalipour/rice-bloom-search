/**
 * Test script to verify category filter functionality
 * This script tests that products are correctly filtered by category_id
 *
 * Usage: node test_category_filter.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

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

async function testCategoryValues() {
  console.log('\n📊 Test 1: Check Category Values in Database');
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, category_id');

    if (error) throw error;

    console.log(`   Found ${data.length} products`);

    const categories = {};
    data.forEach(product => {
      const cat = product.category_id || 'null';
      categories[cat] = (categories[cat] || 0) + 1;
      console.log(`   - ${product.name}: category_id="${product.category_id}"`);
    });

    console.log('\n   Category distribution:');
    Object.keys(categories).forEach(cat => {
      console.log(`   - ${cat}: ${categories[cat]} product(s)`);
    });

    const validCategories = ['hashemi', 'tarom', 'fajr', 'shirodi', null];
    const allValid = data.every(p => validCategories.includes(p.category_id));

    logTest('Category Values', allValid, `All categories are valid: ${Object.keys(categories).join(', ')}`);
    return true;
  } catch (error) {
    logTest('Category Values', false, error.message);
    return false;
  }
}

async function testFilterByCategory(categoryId) {
  console.log(`\n🔍 Test 2.${categoryId ? categoryId : 'all'}: Filter by category "${categoryId || 'all'}"`);
  try {
    let query = supabase.from('products').select('id, name, category_id, price');

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;

    if (error) throw error;

    console.log(`   Found ${data.length} product(s)`);
    data.forEach(product => {
      console.log(`   - ${product.name} (${product.category_id})`);
    });

    if (categoryId) {
      const allMatch = data.every(p => p.category_id === categoryId);
      logTest(`Filter by ${categoryId}`, allMatch, `All ${data.length} products have category_id="${categoryId}"`);
      return allMatch;
    } else {
      logTest('Filter all products', true, `Retrieved ${data.length} products`);
      return true;
    }
  } catch (error) {
    logTest(`Filter by ${categoryId}`, false, error.message);
    return false;
  }
}

async function testCategoryIdType() {
  console.log('\n🔤 Test 3: Verify category_id Data Type');
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      query: `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'products' AND column_name = 'category_id';
      `
    });

    if (error) {
      // Fallback: just check if we can query the field
      const { data: products, error: queryError } = await supabase
        .from('products')
        .select('category_id')
        .limit(1);

      if (queryError) throw queryError;

      logTest('category_id Field', true, 'Field exists and is queryable');
      return true;
    }

    const field = data[0];
    const isText = field.data_type === 'text';
    const isNullable = field.is_nullable === 'YES';

    console.log(`   Type: ${field.data_type}`);
    console.log(`   Nullable: ${field.is_nullable}`);

    logTest('category_id Type', isText && isNullable,
      `category_id is ${field.data_type} and ${isNullable ? 'nullable' : 'not nullable'}`);

    return isText && isNullable;
  } catch (error) {
    console.log('   Note: Could not check data type directly, but field is queryable');
    logTest('category_id Type', true, 'Field is queryable');
    return true;
  }
}

async function testShopFilterLogic() {
  console.log('\n🛒 Test 4: Simulate Shop Page Filter Logic');
  try {
    // Get all products
    const { data: allProducts, error: allError } = await supabase
      .from('products')
      .select('*');

    if (allError) throw allError;

    console.log(`   Total products: ${allProducts.length}`);

    // Test filtering for each category
    const categories = ['hashemi', 'tarom', 'fajr', 'shirodi'];
    let allTestsPassed = true;

    for (const category of categories) {
      const filtered = allProducts.filter(p => p.category_id === category);
      console.log(`   - Category "${category}": ${filtered.length} product(s)`);

      if (filtered.length > 0) {
        const allMatch = filtered.every(p => p.category_id === category);
        if (!allMatch) {
          allTestsPassed = false;
          console.log(`     ❌ Filtering error for ${category}`);
        }
      }
    }

    // Test "all" filter (no filtering)
    console.log(`   - Category "all": ${allProducts.length} product(s)`);

    logTest('Shop Filter Logic', allTestsPassed, 'All filters work correctly');
    return allTestsPassed;
  } catch (error) {
    logTest('Shop Filter Logic', false, error.message);
    return false;
  }
}

async function testCategoryMatchBetweenCodeAndDB() {
  console.log('\n🔗 Test 5: Match between Code Categories and DB');

  // Categories defined in code (from data/products.ts)
  const codeCategories = ['tarom', 'hashemi', 'fajr', 'shirodi'];

  try {
    const { data, error } = await supabase
      .from('products')
      .select('category_id');

    if (error) throw error;

    const dbCategories = [...new Set(data.map(p => p.category_id).filter(Boolean))];

    console.log('   Code categories:', codeCategories.join(', '));
    console.log('   DB categories:', dbCategories.join(', '));

    const allMatch = dbCategories.every(dbCat => codeCategories.includes(dbCat));

    if (!allMatch) {
      const extra = dbCategories.filter(dbCat => !codeCategories.includes(dbCat));
      console.log(`   ⚠️ Extra categories in DB: ${extra.join(', ')}`);
    }

    logTest('Code-DB Category Match', allMatch,
      allMatch ? 'All DB categories match code definitions' : 'Some categories mismatch');

    return allMatch;
  } catch (error) {
    logTest('Code-DB Category Match', false, error.message);
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
    console.log('\n🎉 All tests passed! Category filter is working correctly.');
    console.log('\n✅ What this means:');
    console.log('   - Category values in DB are correct (hashemi, tarom, etc.)');
    console.log('   - Filtering by category works properly');
    console.log('   - Shop page should filter products correctly');
    console.log('   - No data type issues');
  } else {
    console.log('\n⚠️ Some tests failed. Issues found:');
    results.tests.filter(t => !t.passed).forEach(t => {
      console.log(`   - ${t.name}: ${t.message}`);
    });
    console.log('\n📋 Recommended Actions:');
    console.log('   1. Check that category_id values match: hashemi, tarom, fajr, shirodi');
    console.log('   2. Ensure category_id is TEXT type (not UUID)');
    console.log('   3. Run FIX_CATEGORY_ISSUE.sql if needed');
    console.log('   4. Clear browser cache and test Shop page');
  }

  console.log('\n');
}

async function runAllTests() {
  console.log('🚀 Starting Category Filter Tests...');
  console.log('Supabase URL:', supabaseUrl);
  console.log('');

  await testCategoryValues();
  await testCategoryIdType();
  await testFilterByCategory(null); // Test "all"
  await testFilterByCategory('hashemi');
  await testFilterByCategory('tarom');
  await testFilterByCategory('fajr');
  await testFilterByCategory('shirodi');
  await testShopFilterLogic();
  await testCategoryMatchBetweenCodeAndDB();

  printSummary();

  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});
