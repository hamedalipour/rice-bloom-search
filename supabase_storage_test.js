// Supabase Storage Test Script
// Copy and paste this into your browser's console to test storage functionality

async function testSupabaseStorage() {
  console.log('=== Supabase Storage Test ===');
  
  // Get the Supabase client from the window object (if available)
  const supabase = window.supabase;
  if (!supabase) {
    console.error('Supabase client not found in window object');
    return;
  }
  
  try {
    // Test 1: Check authentication
    console.log('1. Checking authentication...');
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError) {
      console.error('Auth error:', authError);
      return;
    }
    
    console.log('Authenticated:', !!session);
    if (session) {
      console.log('User ID:', session.user.id);
    }
    
    // Test 2: List buckets
    console.log('2. Listing storage buckets...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    if (bucketError) {
      console.error('Bucket listing error:', bucketError);
      return;
    }
    
    console.log('Buckets found:', buckets.map(b => b.name));
    
    // Test 3: Check if product-images bucket exists
    const productImagesBucket = buckets.find(b => b.name === 'product-images');
    if (!productImagesBucket) {
      console.error('product-images bucket not found');
      return;
    }
    
    console.log('product-images bucket exists');
    
    // Test 4: Try to upload a simple test file
    console.log('3. Testing file upload...');
    const testContent = new Blob(['Hello Supabase Storage!'], { type: 'text/plain' });
    const fileName = `test-file-${Date.now()}.txt`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, testContent, { upsert: true });
    
    if (uploadError) {
      console.error('Upload error:', uploadError);
      return;
    }
    
    console.log('Upload successful:', uploadData);
    
    // Test 5: Get public URL
    console.log('4. Getting public URL...');
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);
    
    console.log('Public URL:', publicUrl);
    
    // Test 6: Clean up - remove test file
    console.log('5. Cleaning up test file...');
    const { error: removeError } = await supabase.storage
      .from('product-images')
      .remove([fileName]);
    
    if (removeError) {
      console.error('Cleanup error:', removeError);
    } else {
      console.log('Test file removed successfully');
    }
    
    console.log('=== All tests completed successfully ===');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the test
testSupabaseStorage();