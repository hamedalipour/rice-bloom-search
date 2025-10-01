import React, { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import ProductForm from '@/components/ProductForm';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ProductManagement: React.FC = () => {
  const { products, loading, deleteProduct } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'view'>('create');

  const handleDelete = async (id: string) => {
    if (confirm('آیا از حذف این محصول اطمینان دارید؟')) {
      await deleteProduct(id);
    }
  };

  const openModal = (type: 'create' | 'edit' | 'view', product = null) => {
    setModalType(type);
    setSelectedProduct(product);
    setShowModal(true);
  };

  if (loading) {
    return <div className="text-center py-8">در حال بارگذاری...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">مدیریت محصولات</h1>
        <Button onClick={() => openModal('create')} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4 ml-2" />
          افزودن محصول جدید
        </Button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                نام محصول
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                دسته‌بندی
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                قیمت
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                موجودی
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                عملیات
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img
                      className="h-10 w-10 rounded object-cover ml-4"
                      src={product.image}
                      alt={product.name}
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {product.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {product.slug}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {product.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {product.price.toLocaleString()} تومان
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    product.in_stock 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.in_stock ? 'موجود' : 'ناموجود'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2 space-x-reverse">
                    <button
                      onClick={() => openModal('view', product)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openModal('edit', product)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <ProductForm
        product={selectedProduct}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        mode={modalType}
      />
    </div>
  );
};

export default ProductManagement;