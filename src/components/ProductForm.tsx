import React, { useState, useEffect } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import ImageUpload from '@/components/ImageUpload';
import AssetSelector from '@/components/AssetSelector';
import { X } from 'lucide-react';

interface ProductFormProps {
  product?: any;
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit' | 'view';
}

const ProductForm: React.FC<ProductFormProps> = ({ product, isOpen, onClose, mode }) => {
  const { createProduct, updateProduct } = useProducts();
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category_id: '',
    price: 0,
    original_price: 0,
    image_url: '',
    description: '',
    long_description: '',
    origin: '',
    features: [''],
    weights: [{ value: '', price: 0 }],
    in_stock: true,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        slug: product.slug || '',
        category_id: product.category_id || '',
        price: product.price || 0,
        original_price: product.original_price || 0,
        image_url: product.image_url || '',
        description: product.description || '',
        long_description: product.long_description || '',
        origin: product.origin || '',
        features: Array.isArray(product.features) ? product.features : [''],
        weights: Array.isArray(product.weights) ? product.weights : [{ value: '', price: 0 }],
        in_stock: product.in_stock !== false,
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name.trim()) {
      alert('نام محصول الزامی است');
      return;
    }
    if (!formData.slug.trim()) {
      alert('اسلاگ الزامی است');
      return;
    }
    if (!formData.price || formData.price <= 0) {
      alert('قیمت باید بیشتر از صفر باشد');
      return;
    }
    
    // Image is not required, but warn user
    if (!formData.image_url.trim()) {
      if (!confirm('هیچ تصویری انتخاب نشده. آیا مایل به ادامه هستید؟')) {
        return;
      }
    }
    
    try {
      const productData = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        category_id: formData.category_id.trim() || 'general',
        price: Number(formData.price),
        original_price: formData.original_price ? Number(formData.original_price) : null,
        image_url: formData.image_url.trim() || '',
        description: formData.description.trim() || 'توضیحی ارائه نشده',
        long_description: formData.long_description.trim() || 'توضیحات کامل ارائه نشده',
        origin: formData.origin.trim() || 'نامشخص',
        features: formData.features.filter(f => f.trim()).length > 0 ? formData.features.filter(f => f.trim()) : ['ویژگی خاصی ندارد'],
        weights: formData.weights.filter(w => w.value && w.price > 0),
        in_stock: formData.in_stock,
      };

      console.log('Submitting product data:', productData);

      let result;
      if (mode === 'edit' && product) {
        result = await updateProduct(product.id, productData);
      } else {
        result = await createProduct(productData);
      }

      if (result.error) {
        console.error('Error saving product:', result.error);
        
        // Provide more specific error messages
        let errorMsg = result.error;
        if (result.error.includes('duplicate key')) {
          errorMsg = 'اسلاگ تکراری است. لطفاً اسلاگ دیگری انتخاب کنید';
        } else if (result.error.includes('column') && result.error.includes('does not exist')) {
          errorMsg = 'مشکل در ساختار پایگاه داده. لطفاً با مدیر سیستم تماس بگیرید';
        } else if (result.error.includes('permission')) {
          errorMsg = 'عدم دسترسی برای ذخیره محصول';
        }
        
        alert(`خطا در ذخیره محصول: ${errorMsg}`);
        return;
      }

      console.log('Product saved successfully');
      alert('محصول با موفقیت ذخیره شد');
      onClose();
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('خطای غیرمنتظره‌ای رخ داد');
    }
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((f, i) => i === index ? value : f)
    }));
  };

  const addWeight = () => {
    setFormData(prev => ({
      ...prev,
      weights: [...prev.weights, { value: '', price: 0 }]
    }));
  };

  const updateWeight = (index: number, field: 'value' | 'price', value: string | number) => {
    setFormData(prev => ({
      ...prev,
      weights: prev.weights.map((w, i) => 
        i === index ? { ...w, [field]: value } : w
      )
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            {mode === 'create' ? 'افزودن محصول جدید' : 
             mode === 'edit' ? 'ویرایش محصول' : 'مشاهده محصول'}
          </h2>
          <Button variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>نام محصول</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              disabled={mode === 'view'}
              required
            />
          </div>

          <div>
            <Label>اسلاگ</Label>
            <Input
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              disabled={mode === 'view'}
              required
            />
          </div>

          <div>
            <Label>دسته‌بندی (اختیاری)</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.category_id}
              onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
              disabled={mode === 'view'}
            >
              <option value="">دسته‌بندی را انتخاب کنید (اختیاری)</option>
              <option value="hashemi">برنج هاشمی</option>
              <option value="tarom">برنج طارم</option>
              <option value="fajr">برنج فجر</option>
              <option value="shirodi">برنج شیرودی</option>
              <option value="general">عمومی</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              در حال حاضر دسته‌بندی در پایگاه داده ذخیره نمی‌شود و فقط برای نمایش است
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>قیمت</Label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                disabled={mode === 'view'}
                required
              />
            </div>
            <div>
              <Label>قیمت اصلی</Label>
              <Input
                type="number"
                value={formData.original_price}
                onChange={(e) => setFormData(prev => ({ ...prev, original_price: Number(e.target.value) }))}
                disabled={mode === 'view'}
              />
            </div>
          </div>

          <div>
            <Label>تصویر محصول</Label>
            <div className="space-y-4">
              {/* Option 1: Upload new image */}
              <div>
                <Label className="text-sm font-medium">آپلود تصویر جدید</Label>
                <p className="text-xs text-gray-500 mb-2">توجه: در حال حاضر آپلود به صورت موقت عمل می‌کند</p>
                <ImageUpload
                  value={formData.image_url}
                  onChange={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
                  disabled={mode === 'view'}
                />
              </div>
              
              {/* Option 2: Select from assets */}
              {mode !== 'view' && (
                <div>
                  <Label className="text-sm font-medium">یا انتخاب از تصاویر موجود (پیشنهادی)</Label>
                  <p className="text-xs text-green-600 mb-2">بهترین گزینه برای تصاویر دائمی</p>
                  <AssetSelector
                    selectedImage={formData.image_url}
                    onSelect={(imagePath) => setFormData(prev => ({ ...prev, image_url: imagePath }))}
                  />
                </div>
              )}
              
              {/* Option 3: Enter URL manually */}
              <div>
                <Label className="text-sm font-medium">یا آدرس تصویر را وارد کنید</Label>
                <Input
                  value={formData.image_url}
                  onChange={(e) => {
                    const url = e.target.value;
                    // Validate URL format
                    if (url && !url.startsWith('http') && !url.startsWith('/') && !url.startsWith('blob:')) {
                      console.warn('Invalid URL format:', url);
                    }
                    setFormData(prev => ({ ...prev, image_url: url }));
                  }}
                  disabled={mode === 'view'}
                  placeholder="https://example.com/image.jpg"
                />
                {formData.image_url && formData.image_url.includes('drive.google.com') && (
                  <p className="text-sm text-orange-600 mt-1">
                    توجه: لینک Google Drive به صورت مستقیم کار نمی‌کند. لطفاً تصویر را آپلود کنید یا از پوشه Assets انتخاب کنید.
                  </p>
                )}
              </div>
              
              {/* Preview */}
              {formData.image_url && (
                <div className="mt-4">
                  <Label className="text-sm text-muted-foreground">پیش‌نمایش:</Label>
                  <div className="mt-2 border rounded-lg p-4 bg-muted/50">
                    <div className="w-32 h-32 mx-auto relative">
                      <img
                        src={formData.image_url}
                        alt="پیش‌نمایش تصویر"
                        className="w-full h-full object-cover rounded-md"
                        onError={(e) => {
                          console.error('Image failed to load:', formData.image_url);
                          const target = e.currentTarget;
                          target.style.display = 'none';
                          
                          // Show error message if not already shown
                          const parent = target.parentElement;
                          if (parent && !parent.querySelector('.error-message')) {
                            const errorDiv = document.createElement('div');
                            errorDiv.className = 'error-message w-full h-full flex items-center justify-center bg-gray-100 rounded-md border-2 border-dashed border-gray-300';
                            errorDiv.innerHTML = `
                              <div class="text-center text-gray-500">
                                <svg class="mx-auto h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.684-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                <p class="text-xs">خطا در بارگذاری تصویر</p>
                                <p class="text-xs text-gray-400 mt-1">لطفاً آدرس صحیح وارد کنید</p>
                              </div>
                            `;
                            parent.appendChild(errorDiv);
                          }
                        }}
                        onLoad={(e) => {
                          // Remove error message if image loads successfully
                          const parent = (e.currentTarget as HTMLImageElement).parentElement;
                          const errorMsg = parent?.querySelector('.error-message');
                          if (errorMsg) {
                            errorMsg.remove();
                          }
                        }}
                      />
                    </div>
                    <p className="text-xs text-center text-gray-500 mt-2 break-all">
                      {formData.image_url.length > 50 
                        ? `${formData.image_url.substring(0, 50)}...` 
                        : formData.image_url
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <Label>توضیحات کوتاه</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              disabled={mode === 'view'}
              required
            />
          </div>

          <div>
            <Label>توضیحات کامل</Label>
            <Textarea
              value={formData.long_description}
              onChange={(e) => setFormData(prev => ({ ...prev, long_description: e.target.value }))}
              disabled={mode === 'view'}
              rows={4}
              required
            />
          </div>

          <div>
            <Label>منطقه</Label>
            <Input
              value={formData.origin}
              onChange={(e) => setFormData(prev => ({ ...prev, origin: e.target.value }))}
              disabled={mode === 'view'}
              required
            />
          </div>

          {mode !== 'view' && (
            <div className="flex justify-end space-x-2 space-x-reverse">
              <Button type="button" variant="outline" onClick={onClose}>
                انصراف
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                {mode === 'create' ? 'افزودن' : 'ذخیره'}
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ProductForm;