// Complete Image Upload Diagnostic Script
// Copy and paste this into your browser's console to run a comprehensive diagnostic

async function runCompleteImageUploadDiagnostic() {
  console.log('=== Complete Image Upload Diagnostic ===');
  
  // Helper function to log results
  const logResult = (test, result) => {
    console.log(`✅ ${test}:`, result);
  };
  
  const logError = (test, error) => {
    console.error(`❌ ${test}:`, error);
  };
  
  try {
    // Test 1: Check if we're in the right environment
    if (!window.supabase) {
      throw new Error('Supabase client not found in window object');
    }
    
    const supabase = window.supabase;
    logResult('Supabase Client', 'Available');
    
    // Test 2: Check authentication
    console.log('\n--- Authentication Test ---');
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError) throw authError;
    
    logResult('Auth Status', session ? 'Authenticated' : 'Not Authenticated');
    if (session) {
      logResult('User ID', session.user.id);
    }
    
    // Test 3: List storage buckets
    console.log('\n--- Storage Buckets Test ---');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    if (bucketError) throw bucketError;
    
    logResult('Buckets Found', buckets.length);
    buckets.forEach(bucket => {
      logResult(`Bucket: ${bucket.name}`, `Public: ${bucket.public}, Created: ${bucket.created_at}`);
    });
    
    // Test 4: Check product-images bucket
    console.log('\n--- Product Images Bucket Test ---');
    const productImagesBucket = buckets.find(b => b.name === 'product-images');
    if (!productImagesBucket) {
      throw new Error('product-images bucket not found');
    }
    
    logResult('Product Images Bucket', 'Found');
    
    // Test 5: Test file upload permissions
    console.log('\n--- File Upload Test ---');
    const testFile = new Blob(['Diagnostic test file content'], { type: 'text/plain' });
    const testFileName = `diagnostic-test-${Date.now()}.txt`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(testFileName, testFile, { upsert: true });
    
    if (uploadError) throw uploadError;
    
    logResult('File Upload', 'Success');
    logResult('Upload Data', uploadData);
    
    // Test 6: Get public URL
    console.log('\n--- Public URL Test ---');
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(testFileName);
    
    logResult('Public URL', publicUrl);
    
    // Test 7: Verify the file exists
    console.log('\n--- File Verification Test ---');
    const { data: fileList, error: listError } = await supabase.storage
      .from('product-images')
      .list('', { search: testFileName });
    
    if (listError) throw listError;
    
    const uploadedFile = fileList.find(f => f.name === testFileName);
    if (!uploadedFile) {
      throw new Error('Uploaded file not found in bucket');
    }
    
    logResult('File Verification', 'File exists in bucket');
    logResult('File Info', `Name: ${uploadedFile.name}, Size: ${uploadedFile.metadata.size}`);
    
    // Test 8: Clean up - remove test file
    console.log('\n--- Cleanup Test ---');
    const { error: removeError } = await supabase.storage
      .from('product-images')
      .remove([testFileName]);
    
    if (removeError) throw removeError;
    
    logResult('Cleanup', 'Test file removed successfully');
    
    // Test 9: Test with actual image
    console.log('\n--- Actual Image Test ---');
    // Create a simple SVG image as a blob
    const svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
        <rect width="200" height="200" fill="#4ade80"/>
        <text x="100" y="100" font-family="Arial" font-size="20" fill="white" text-anchor="middle" dominant-baseline="middle">
          Test Image
        </text>
      </svg>
    `;
    
    const imageBlob = new Blob([svgContent], { type: 'image/svg+xml' });
    const imageFileName = `diagnostic-image-${Date.now()}.svg`;
    
    const { data: imageData, error: imageError } = await supabase.storage
      .from('product-images')
      .upload(imageFileName, imageBlob, { upsert: true });
    
    if (imageError) throw imageError;
    
    logResult('Image Upload', 'Success');
    logResult('Image Data', imageData);
    
    // Get public URL for image
    const { data: { publicUrl: imageUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(imageFileName);
    
    logResult('Image Public URL', imageUrl);
    
    // Clean up image file
    await supabase.storage.from('product-images').remove([imageFileName]);
    logResult('Image Cleanup', 'Test image removed successfully');
    
    console.log('\n=== All Tests Completed Successfully ===');
    console.log('✅ Image upload functionality is working correctly');
    
  } catch (error) {
    logError('Diagnostic Failed', error.message);
    console.log('\n=== Diagnostic Failed ===');
    console.log('Please check the error above and verify your Supabase configuration');
  }
}

// Make the function available globally
window.runImageUploadDiagnostic = runCompleteImageUploadDiagnostic;

console.log('Diagnostic script loaded. Run "runImageUploadDiagnostic()" to start the test.');