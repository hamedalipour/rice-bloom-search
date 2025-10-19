// Test script for image upload functionality
// Run this in a Node.js environment with Supabase client configured

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client (replace with your actual credentials)
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testImageUpload() {
  try {
    // Create a simple test image as a Blob
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(0, 0, 200, 200);
    
    // Convert canvas to blob
    canvas.toBlob(async (blob) => {
      if (!blob) {
        console.error('Failed to create blob');
        return;
      }
      
      // Upload the blob to Supabase Storage
      const fileName = `test-image-${Date.now()}.png`;
      
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, blob, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        console.error('Upload failed:', error);
        return;
      }
      
      console.log('Upload successful:', data);
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);
      
      console.log('Public URL:', publicUrl);
    }, 'image/png');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testImageUpload();