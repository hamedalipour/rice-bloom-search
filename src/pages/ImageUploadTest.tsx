import React, { useState } from 'react';
import ImageUploadDebug from '@/components/ImageUploadDebug';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { storageDiagnostics } from '@/utils/storageDiagnostics';

const ImageUploadTest: React.FC = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [testResults, setTestResults] = useState<any[]>([]);
  const [runningDiagnostics, setRunningDiagnostics] = useState(false);

  const addTestResult = (test: string, result: any) => {
    setTestResults(prev => [...prev, { test, result, timestamp: new Date().toISOString() }]);
  };

  const runStorageDiagnostics = async () => {
    setRunningDiagnostics(true);
    setTestResults([]);
    
    try {
      const results = await storageDiagnostics.runAll();
      
      Object.entries(results).forEach(([key, value]) => {
        addTestResult(key, value);
      });
    } catch (error: any) {
      addTestResult('Diagnostic Error', { 
        message: error.message 
      });
    } finally {
      setRunningDiagnostics(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">تست آپلود تصویر</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>آپلود تصویر با اطلاعات اشکال‌زدایی</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUploadDebug 
              value={imageUrl} 
              onChange={setImageUrl} 
            />
            {imageUrl && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">آدرس تصویر:</p>
                <p className="text-xs bg-gray-100 p-2 rounded break-all">{imageUrl}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>تشخیص مشکلات ذخیره‌سازی</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={runStorageDiagnostics} 
              className="mb-4"
              disabled={runningDiagnostics}
            >
              {runningDiagnostics ? 'در حال اجرا...' : 'اجرای تشخیص'}
            </Button>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {testResults.map((result, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded">
                  <h3 className="font-medium text-sm">{result.test}</h3>
                  <pre className="text-xs mt-2 bg-white p-2 rounded overflow-x-auto">
                    {JSON.stringify(result.result, null, 2)}
                  </pre>
                  <p className="text-xs text-gray-500 mt-1">{result.timestamp}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ImageUploadTest;