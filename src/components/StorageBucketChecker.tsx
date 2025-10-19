import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface BucketInfo {
  id: string;
  name: string;
  public: boolean;
  created_at: string;
}

interface PolicyInfo {
  policyname: string;
  tablename: string;
  roles: string[];
  cmd: string;
}

const StorageBucketChecker: React.FC = () => {
  const [bucketInfo, setBucketInfo] = useState<BucketInfo | null>(null);
  const [policies, setPolicies] = useState<PolicyInfo[]>([]);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkStorageConfiguration = async () => {
    setChecking(true);
    setError(null);
    setBucketInfo(null);
    setPolicies([]);

    try {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('User not authenticated');
        toast.error('کاربر وارد نشده است');
        return;
      }

      // Check if product-images bucket exists
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      if (bucketError) throw bucketError;

      const productImagesBucket = buckets?.find(b => b.id === 'product-images');
      if (productImagesBucket) {
        setBucketInfo(productImagesBucket);
      } else {
        setError('پوشه تصاویر یافت نشد');
        toast.error('پوشه تصاویر (product-images) یافت نشد');
        return;
      }

      // Try to list files in the bucket to check permissions
      const { data: files, error: fileError } = await supabase.storage
        .from('product-images')
        .list('', { limit: 1 });
      
      if (fileError) {
        console.warn('Warning: Could not list files in bucket:', fileError.message);
      }

      // Try to upload a small test file
      const testContent = new Blob(['test'], { type: 'text/plain' });
      const testFileName = `test-${Date.now()}.txt`;
      
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(testFileName, testContent, { upsert: true });
      
      if (uploadError) {
        setError(`خطا در آپلود فایل تست: ${uploadError.message}`);
        toast.error(`خطا در آپلود فایل تست: ${uploadError.message}`);
      } else {
        // Clean up test file
        await supabase.storage.from('product-images').remove([testFileName]);
        toast.success('پیکربندی ذخیره‌سازی به درستی کار می‌کند');
      }

    } catch (err: any) {
      console.error('Storage configuration check failed:', err);
      setError(`خطا در بررسی پیکربندی: ${err.message}`);
      toast.error(`خطا در بررسی پیکربندی: ${err.message}`);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkStorageConfiguration();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>بررسی پیکربندی ذخیره‌سازی</CardTitle>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={checkStorageConfiguration} 
          disabled={checking}
          className="mb-4"
        >
          {checking ? 'در حال بررسی...' : 'بررسی مجدد'}
        </Button>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}

        {bucketInfo && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <h3 className="font-bold mb-2">پوشه تصاویر یافت شد:</h3>
            <ul className="list-disc list-inside">
              <li>شناسه: {bucketInfo.id}</li>
              <li>نام: {bucketInfo.name}</li>
              <li>عمومی: {bucketInfo.public ? 'بله' : 'خیر'}</li>
              <li>تاریخ ایجاد: {new Date(bucketInfo.created_at).toLocaleDateString('fa-IR')}</li>
            </ul>
          </div>
        )}

        {policies.length > 0 && (
          <div className="mt-4">
            <h3 className="font-bold mb-2">قوانین امنیتی:</h3>
            <ul className="list-disc list-inside">
              {policies.map((policy, index) => (
                <li key={index}>
                  {policy.policyname} - {policy.cmd}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StorageBucketChecker;