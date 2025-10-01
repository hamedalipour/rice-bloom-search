import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

const EmergencyAdmin: React.FC = () => {
  const { user, userProfile, isAdmin, loading } = useAuth();

  // Force admin state for testing
  const forceAdminAccess = () => {
    // Navigate directly to admin page
    window.location.href = '/admin';
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6 text-red-600">Emergency Admin Access</h1>
        
        <div className="space-y-4">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            <strong>Warning:</strong> This is an emergency bypass for development/testing only.
          </div>
          
          <div>
            <h2 className="text-lg font-semibold">Current State:</h2>
            <ul className="list-disc ml-6 space-y-1">
              <li>Loading: {loading ? 'TRUE' : 'FALSE'}</li>
              <li>User Email: {user?.email || 'NULL'}</li>
              <li>User Profile: {userProfile ? 'EXISTS' : 'NULL'}</li>
              <li>Is Admin: {isAdmin ? 'TRUE' : 'FALSE'}</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <button
              onClick={forceAdminAccess}
              className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
            >
              Force Access to Admin Panel
            </button>
            
            <p className="text-sm text-gray-600">
              This will directly navigate to /admin regardless of authentication state.
            </p>
          </div>
          
          <div>
            <h3 className="text-md font-semibold">Direct Links:</h3>
            <ul className="space-y-1">
              <li><a href="/admin" className="text-blue-600 hover:underline">/admin</a></li>
              <li><a href="/admin/products" className="text-blue-600 hover:underline">/admin/products</a></li>
              <li><a href="/admin/blog" className="text-blue-600 hover:underline">/admin/blog</a></li>
              <li><a href="/profile" className="text-blue-600 hover:underline">/profile</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyAdmin;