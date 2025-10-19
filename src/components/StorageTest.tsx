import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

const StorageTest: React.FC = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  const addResult = (test: string, result: any) => {
    setTestResults(prev => [...prev, { test, result, timestamp: new Date().toISOString() }]);
  };

  const runStorageTest = async () => {
    setIsTesting(true);
    setTestResults([]);
    
    try {
      // Test 1: Check auth status
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      addResult('Authentication', {
        authenticated: !!session,
        userId: session?.user?.id,
        error: authError?.message
      });
      
      // Test 2: List buckets
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      addResult('List Buckets', {
        success: !bucketError,
        buckets: buckets?.map(b => b.name),
        error: bucketError?.message
      });
      
      // Test 3: Check product-images bucket specifically
      const productBucket = buckets?.find(b => b.name === 'product-images');
      addResult('Product Images Bucket', {
        exists: !!productBucket,
        bucket: productBucket
      });
      
      // Test 4: Try to upload a simple file
      if (productBucket) {
        const testFile = new Blob(['Test content'], { type: 'text/plain' });
        const fileName = `test-${Date.now()}.txt`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, testFile, { upsert: true });
          
        addResult('File Upload Test', {
          success: !uploadError,
          data: uploadData,
          error: uploadError?.message
        });
        
        // Test 5: Get public URL
        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(fileName);
            
          addResult('Public URL', {
            url: publicUrl
          });
          
          // Clean up - remove the test file
          await supabase.storage.from('product-images').remove([fileName]);
          addResult('Cleanup', {
            message: 'Test file removed'
          });
        }
      }
      
    } catch (error: any) {
      addResult('Unexpected Error', {
        message: error.message
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Supabase Storage Test</CardTitle>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={runStorageTest} 
          disabled={isTesting}
          className="mb-4"
        >
          {isTesting ? 'Testing...' : 'Run Storage Test'}
        </Button>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {testResults.map((result, index) => (
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

export default StorageTest;