import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const RLSDiagnostic: React.FC = () => {
  const [diagnosticResults, setDiagnosticResults] = useState<any[]>([]);
  const [checking, setChecking] = useState(false);

  const addResult = (test: string, result: any) => {
    setDiagnosticResults(prev => [...prev, { test, result, timestamp: new Date().toISOString() }]);
  };

  const runRLSDiagnostic = async () => {
    setChecking(true);
    setDiagnosticResults([]);
    
    try {
      // Test 1: Check authentication
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      addResult('Authentication', {
        authenticated: !!session,
        userId: session?.user?.id,
        userEmail: session?.user?.email,
        error: authError?.message
      });
      
      // Test 2: Check user role
      if (session) {
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
          
        addResult('User Role', {
          role: profile?.role,
          isAdmin: profile?.role === 'admin',
          error: profileError?.message
        });
      }
      
      // Test 3: Try to upload a test file
      const testFile = new Blob(['RLS Test'], { type: 'text/plain' });
      const fileName = `rls-test-${Date.now()}.txt`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, testFile, { upsert: true });
        
      addResult('Upload Test', {
        success: !uploadError,
        data: uploadData,
        error: uploadError?.message
      });
      
      // Test 4: If upload successful, try to delete the test file
      if (!uploadError) {
        const { error: deleteError } = await supabase.storage
          .from('product-images')
          .remove([fileName]);
          
        addResult('Delete Test', {
          success: !deleteError,
          error: deleteError?.message
        });
      }
      
      // Test 5: Check existing storage policies
      // Note: This requires admin privileges to run directly
      addResult('Note', {
        message: 'For detailed policy information, run the SQL diagnostic script in Supabase SQL Editor'
      });
      
      toast.success('تشخیص RLS با موفقیت انجام شد');
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
        <CardTitle>تشخیص سیاست‌های امنیتی (RLS)</CardTitle>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={runRLSDiagnostic} 
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
        
        <div className="mt-4 p-3 bg-blue-50 rounded">
          <h4 className="font-medium mb-2">راهنمای رفع مشکل:</h4>
          <p className="text-sm">
            اگر خطای "row-level security policy" دریافت کردید، 
            اسکریپت <code className="bg-gray-200 px-1 rounded">FIX_STORAGE_POLICIES.sql</code> را 
            در Supabase SQL Editor اجرا کنید.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RLSDiagnostic;