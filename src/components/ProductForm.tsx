import React, { useState, useEffect } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
    category: '',
    price: 0,
    original_price: 0,
    image: '',
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
        category: product.category || '',
        price: product.price || 0,
        original_price: product.original_price || 0,
        image: product.image || '',
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
    
    const productData = {
      ...formData,
      features: formData.features.filter(f => f.trim()),
      weights: formData.weights.filter(w => w.value && w.price > 0),
    };

    if (mode === 'edit' && product) {
      await updateProduct(product.id, productData);
    } else {
      await createProduct(productData);
    }
    
    onClose();
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
            <Label>دسته‌بندی</Label>
            <Input
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              disabled={mode === 'view'}
              required
            />
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
            <Label>تصویر</Label>
            <Input
              value={formData.image}
              onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
              disabled={mode === 'view'}
              required
            />
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