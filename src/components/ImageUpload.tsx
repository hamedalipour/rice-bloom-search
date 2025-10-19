import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange, disabled }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('لطفاً یک فایل تصویر انتخاب کنید');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم فایل نباید بیش از ۵ مگابایت باشد');
      return;
    }

    setUploading(true);

    try {
      // Log upload attempt
      console.log('Attempting to upload file:', {
        name: file.name,
        size: file.size,
        type: file.type
      });

      // Upload image to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      console.log('Uploading to bucket: product-images, file name:', fileName);
      
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Image upload error:', error);
        // Check if it's a bucket not found error
        if (error.message.includes('Bucket not found')) {
          toast.error('خطا: پوشه تصاویر یافت نشد. لطفاً با مدیر سیستم تماس بگیرید.');
        } else {
          toast.error(`خطا در آپلود تصویر: ${error.message}`);
        }
        return;
      }

      console.log('Upload successful:', data);

      // Get public URL for the uploaded image
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      console.log('Public URL generated:', publicUrl);
      onChange(publicUrl);
      toast.success('تصویر با موفقیت بارگذاری شد');
      
    } catch (error: any) {
      console.error('Image processing error:', error);
      toast.error(`خطا در پردازش تصویر: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange('');
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
            onError={(e) => {
              console.error('Image failed to load:', value);
              toast.error('خطا در بارگذاری تصویر');
            }}
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
            <Label htmlFor="image-upload" className="cursor-pointer">
              <span className="mt-2 block text-sm font-medium text-gray-900">
                فایل تصویر را انتخاب کنید
              </span>
            </Label>
            <Input
              id="image-upload"
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
    </div>
  );
};

export default ImageUpload;