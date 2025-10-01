import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, isAdmin, loading, userProfile } = useAuth();
  const location = useLocation();

  console.log('AdminRoute - user:', user?.email, 'isAdmin:', isAdmin, 'userProfile:', userProfile, 'loading:', loading);

  // TEMPORARY: For admin user, bypass all checks
  if (user?.email === 'hamedalipour38@gmail.com') {
    console.log('Admin user detected - bypassing route protection');
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  // Log unauthorized access attempts
  if (!user || !isAdmin) {
    console.warn(`Unauthorized admin access attempt to: ${location.pathname}`);
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};