// Simple script to check database status
// Run with: node check_database_status.js

const { createClient } = require('@supabase/supabase-js');

// Get these from your .env file
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDatabaseStatus() {
  console.log('=== DATABASE STATUS CHECK ===');
  
  try {
    // Check if we can connect to the database
    console.log('1. Testing database connection...');
    const { data, error } = await supabase
      .from('products')
      .select('count()');
    
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      return;
    }
    
    console.log('✅ Database connection successful');
    
    // Check products table structure
    console.log('2. Checking products table structure...');
    const { data: sampleData, error: sampleError } = await supabase
      .from('products')
      .select('*')
      .limit(1);
    
    if (sampleError) {
      console.error('❌ Failed to query products table:', sampleError.message);
    } else {
      console.log('✅ Products table accessible');
      if (sampleData && sampleData.length > 0) {
        console.log('   Table columns:', Object.keys(sampleData[0]));
      } else {
        console.log('   Table is empty');
      }
    }
    
    // Check specific columns
    console.log('3. Checking required columns...');
    const requiredColumns = ['name', 'slug', 'category_id', 'price', 'image_url'];
    
    for (const column of requiredColumns) {
      try {
        const { data: columnData, error: columnError } = await supabase
          .from('products')
          .select(column)
          .limit(1);
        
        if (columnError) {
          console.warn(`   ⚠️  Column '${column}' check failed:`, columnError.message);
        } else {
          console.log(`   ✅ Column '${column}' exists`);
        }
      } catch (columnCheckError) {
        console.warn(`   ⚠️  Column '${column}' check threw exception:`, columnCheckError.message);
      }
    }
    
    console.log('=== DATABASE STATUS CHECK COMPLETE ===');
    
  } catch (error) {
    console.error('❌ Database status check failed with exception:', error.message);
  }
}

checkDatabaseStatus();