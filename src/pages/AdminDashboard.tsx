import React from 'react';
import { Package, FileText, Users, ShoppingCart } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">داشبورد مدیریت</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-emerald-600" />
            <div className="mr-4">
              <h3 className="text-lg font-semibold text-gray-900">محصولات</h3>
              <p className="text-gray-600">مدیریت محصولات فروشگاه</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-blue-600" />
            <div className="mr-4">
              <h3 className="text-lg font-semibold text-gray-900">بلاگ</h3>
              <p className="text-gray-600">مدیریت مقالات بلاگ</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-purple-600" />
            <div className="mr-4">
              <h3 className="text-lg font-semibold text-gray-900">کاربران</h3>
              <p className="text-gray-600">مدیریت کاربران</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <ShoppingCart className="h-8 w-8 text-orange-600" />
            <div className="mr-4">
              <h3 className="text-lg font-semibold text-gray-900">سفارشات</h3>
              <p className="text-gray-600">مدیریت سفارشات</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">خلاصه فعالیت‌ها</h2>
        <p className="text-gray-600">در این قسمت می‌توانید آمار کلی فروشگاه را مشاهده کنید.</p>
      </div>
    </div>
  );
};

export default AdminDashboard;