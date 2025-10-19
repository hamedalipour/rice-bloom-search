import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ImageUploadDebugProps {
  value?: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

const ImageUploadDebug: React.FC<ImageUploadDebugProps> = ({ value, onChange, disabled }) => {
  const [uploading, setUploading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const addDebugInfo = (info: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toISOString()}: ${info}`]);
    console.log(info);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Clear previous debug info
    setDebugInfo([]);
    
    addDebugInfo(`Selected file: ${file.name}, size: ${file.size}, type: ${file.type}`);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      const errorMsg = 'Invalid file type - please select an image file';
      addDebugInfo(errorMsg);
      toast.error('لطفاً یک فایل تصویر انتخاب کنید');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      const errorMsg = `File too large: ${file.size} bytes (max 5MB)`;
      addDebugInfo(errorMsg);
      toast.error('حجم فایل نباید بیش از ۵ مگابایت باشد');
      return;
    }

    setUploading(true);

    try {
      addDebugInfo('Starting Supabase Storage upload...');
      
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        const errorMsg = 'User not authenticated';
        addDebugInfo(errorMsg);
        toast.error('کاربر وارد نشده است. لطفاً ابتدا وارد شوید.');
        return;
      }
      
      addDebugInfo(`User authenticated: ${session.user.id}`);

      // Check if storage bucket exists
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      if (bucketError) {
        const errorMsg = `Failed to list buckets: ${bucketError.message}`;
        addDebugInfo(errorMsg);
      } else {
        addDebugInfo(`Available buckets: ${buckets?.map(b => b.name).join(', ')}`);
        const hasProductImagesBucket = buckets?.some(b => b.name === 'product-images');
        addDebugInfo(`Has product-images bucket: ${hasProductImagesBucket}`);
      }

      // Upload image to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      addDebugInfo(`Generated file name: ${fileName}`);
      
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        const errorMsg = `Upload failed: ${error.message}, code: ${error.code}`;
        addDebugInfo(errorMsg);
        toast.error(`خطا در آپلود تصویر: ${error.message}`);
        return;
      }

      addDebugInfo(`Upload successful: ${JSON.stringify(data)}`);

      // Get public URL for the uploaded image
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      addDebugInfo(`Public URL: ${publicUrl}`);
      onChange(publicUrl);
      toast.success('تصویر با موفقیت بارگذاری شد');
      
    } catch (error: any) {
      const errorMsg = `Unexpected error: ${error.message}`;
      addDebugInfo(errorMsg);
      console.error('Image processing error:', error);
      toast.error('خطا در پردازش تصویر');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange('');
  };

  const copyDebugInfo = () => {
    navigator.clipboard.writeText(debugInfo.join('\n'));
    toast.success('اطلاعات اشکال‌زدایی کپی شد');
  };

  return (
    <div className="space-y-4">
      <Label>تصویر</Label>
      
      {value ? (
        <div className="relative">
          <img
            src={value}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg border"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={handleRemove}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <Label htmlFor="image-upload-debug" className="cursor-pointer">
              <span className="mt-2 block text-sm font-medium text-gray-900">
                فایل تصویر را انتخاب کنید
              </span>
            </Label>
            <Input
              id="image-upload-debug"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={disabled || uploading}
              className="hidden"
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">
            فرمت‌های PNG، JPG، GIF تا حجم ۵ مگابایت
          </p>
        </div>
      )}

      {uploading && (
        <div className="text-center">
          <p className="text-sm text-gray-500">در حال بارگذاری...</p>
        </div>
      )}

      {debugInfo.length > 0 && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium">اطلاعات اشکال‌زدایی</h3>
            <Button size="sm" onClick={copyDebugInfo}>کپی</Button>
          </div>
          <pre className="text-xs bg-white p-2 rounded max-h-40 overflow-y-auto">
            {debugInfo.join('\n')}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ImageUploadDebug;