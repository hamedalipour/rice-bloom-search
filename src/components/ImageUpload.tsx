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
      // For now, use a fallback to local blob URL until storage bucket is properly configured
      console.log('Storage bucket not available, using local blob URL as fallback');
      
      // Create a local URL for preview (temporary solution)
      const imageUrl = URL.createObjectURL(file);
      onChange(imageUrl);
      toast.success('تصویر بارگذاری شد (موقت). برای ذخیره دائمی از انتخاب از پوشه Assets استفاده کنید');
      
      // Note: In production, you would implement proper storage here
      // For now, recommend using asset selector for permanent images
      
    } catch (error) {
      console.error('Image processing error:', error);
      toast.error('خطا در پردازش تصویر');
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