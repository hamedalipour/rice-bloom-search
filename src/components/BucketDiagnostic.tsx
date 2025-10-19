import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const BucketDiagnostic: React.FC = () => {
  const [diagnosticResults, setDiagnosticResults] = useState<any[]>([]);
  const [checking, setChecking] = useState(false);

  const addResult = (test: string, result: any) => {
    setDiagnosticResults(prev => [...prev, { test, result, timestamp: new Date().toISOString() }]);
  };

  const runBucketDiagnostic = async () => {
    setChecking(true);
    setDiagnosticResults([]);
    
    try {
      // Test 1: Check authentication
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      addResult('Authentication', {
        authenticated: !!session,
        userId: session?.user?.id,
        error: authError?.message
      });
      
      // Test 2: List all buckets
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      addResult('List Buckets', {
        success: !bucketError,
        buckets: buckets?.map(b => ({ id: b.id, name: b.name, public: b.public })),
        error: bucketError?.message
      });
      
      // Test 3: Check specifically for product-images bucket
      const productImagesBucket = buckets?.find(b => b.id === 'product-images');
      addResult('Product Images Bucket', {
        exists: !!productImagesBucket,
        bucket: productImagesBucket
      });
      
      // Test 4: If bucket exists, try to list its contents
      if (productImagesBucket) {
        const { data: files, error: fileError } = await supabase.storage
          .from('product-images')
          .list('', { limit: 5 });
          
        addResult('List Bucket Contents', {
          success: !fileError,
          fileCount: files?.length,
          error: fileError?.message
        });
      }
      
      // Test 5: Try to create a test file (if bucket exists)
      if (productImagesBucket) {
        const testFile = new Blob(['Test file'], { type: 'text/plain' });
        const fileName = `diagnostic-test-${Date.now()}.txt`;
        
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, testFile, { upsert: true });
          
        addResult('Upload Test File', {
          success: !uploadError,
          error: uploadError?.message
        });
        
        // Clean up test file
        if (!uploadError) {
          await supabase.storage.from('product-images').remove([fileName]);
          addResult('Cleanup Test File', {
            message: 'Test file removed successfully'
          });
        }
      }
      
      toast.success('تشخیص با موفقیت انجام شد');
    } catch (error: any) {
      addResult('Unexpected Error', {
        message: error.message
      });
      toast.error(`خطا: ${error.message}`);
    } finally {
      setChecking(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>تشخیص پوشه تصاویر</CardTitle>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={runBucketDiagnostic} 
          disabled={checking}
          className="mb-4"
        >
          {checking ? 'در حال اجرا...' : 'اجرای تشخیص'}
        </Button>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {diagnosticResults.map((result, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded">
              <h3 className="font-medium">{result.test}</h3>
              <pre className="text-xs mt-2 bg-white p-2 rounded overflow-x-auto">
                {JSON.stringify(result.result, null, 2)}
              </pre>
              <p className="text-xs text-gray-500 mt-1">{result.timestamp}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default BucketDiagnostic;