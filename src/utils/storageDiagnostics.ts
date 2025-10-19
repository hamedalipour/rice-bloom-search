import { supabase } from '@/integrations/supabase/client';

export const storageDiagnostics = {
  // Check if user is authenticated
  async checkAuth() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      
      return {
        authenticated: !!session,
        userId: session?.user?.id,
        userEmail: session?.user?.email
      };
    } catch (error) {
      return { error: error.message };
    }
  },

  // List all storage buckets
  async listBuckets() {
    try {
      const { data, error } = await supabase.storage.listBuckets();
      if (error) throw error;
      
      return {
        buckets: data,
        bucketNames: data?.map(b => b.name)
      };
    } catch (error) {
      return { error: error.message };
    }
  },

  // Check if product-images bucket exists and is accessible
  async checkProductImagesBucket() {
    try {
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      if (bucketError) throw bucketError;
      
      const productImagesBucket = buckets?.find(b => b.name === 'product-images');
      
      if (!productImagesBucket) {
        return { exists: false, message: 'Bucket "product-images" not found' };
      }
      
      // Try to list files in the bucket (to check permissions)
      const { data: files, error: fileError } = await supabase.storage
        .from('product-images')
        .list('', { limit: 1 });
      
      return {
        exists: true,
        accessible: !fileError,
        files: files,
        error: fileError?.message
      };
    } catch (error) {
      return { error: error.message };
    }
  },

  // Test file upload
  async testUpload() {
    try {
      // Create a simple test file
      const testContent = new Blob(['Test file for storage diagnostics'], { type: 'text/plain' });
      const fileName = `diagnostics-test-${Date.now()}.txt`;
      
      // Try to upload
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, testContent, { upsert: true });
      
      if (error) throw error;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);
      
      // Clean up - remove test file
      await supabase.storage.from('product-images').remove([fileName]);
      
      return {
        success: true,
        uploadData: data,
        publicUrl: publicUrl
      };
    } catch (error) {
      return { error: error.message };
    }
  },

  // Run all diagnostics
  async runAll() {
    const results = {
      auth: await this.checkAuth(),
      buckets: await this.listBuckets(),
      productImages: await this.checkProductImagesBucket(),
      uploadTest: await this.testUpload()
    };
    
    return results;
  }
};