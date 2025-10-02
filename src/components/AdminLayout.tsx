import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, Package, FileText, LogOut, User, ShoppingCart } from 'lucide-react';

const AdminLayout: React.FC = () => {
  const { user, signOut, userProfile } = useAuth();
  const location = useLocation();

  const navigationItems = [
    { name: 'داشبورد', href: '/admin', icon: LayoutDashboard },
    { name: 'مدیریت محصولات', href: '/admin/products', icon: Package },
    { name: 'مدیریت بلاگ', href: '/admin/blog', icon: FileText },
    { name: 'مدیریت سفارشات', href: '/admin/orders', icon: ShoppingCart },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <div className="w-64 bg-white shadow-lg">
        <div className="flex items-center justify-center h-16 border-b">
          <h1 className="text-xl font-bold text-gray-800">پنل مدیریت</h1>
        </div>
        
        <nav className="mt-6">
          <div className="px-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const current = location.pathname === item.href || 
                            location.pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    current
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  } group flex items-center px-3 py-2 text-sm font-medium`}
                >
                  <Icon className="ml-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <User className="h-5 w-5 text-gray-400" />
              <span className="mr-2 text-sm">{user?.email}</span>
            </div>
            <button onClick={signOut} className="text-gray-400 hover:text-gray-600">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;