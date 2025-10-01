import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const AuthDebug: React.FC = () => {
  const { user, userProfile, isAdmin, loading, refreshProfile } = useAuth();

  useEffect(() => {
    // Log authentication state changes
    console.log('AuthDebug - State changed:', { user: user?.email, userProfile, isAdmin, loading });
  }, [user, userProfile, isAdmin, loading]);

  const handleRefresh = () => {
    refreshProfile();
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">Authentication Debug</h1>
        
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Loading State:</h2>
            <p>{loading ? 'Loading...' : 'Loaded'}</p>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold">User:</h2>
            <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold">User Profile:</h2>
            <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
              {JSON.stringify(userProfile, null, 2)}
            </pre>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold">Is Admin:</h2>
            <p className={`font-bold ${isAdmin ? 'text-green-600' : 'text-red-600'}`}>
              {isAdmin ? 'YES' : 'NO'}
            </p>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold">Expected Admin Email:</h2>
            <p>hamedalipour38@gmail.com</p>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold">Current Email Match:</h2>
            <p className={`font-bold ${user?.email === 'hamedalipour38@gmail.com' ? 'text-green-600' : 'text-red-600'}`}>
              {user?.email === 'hamedalipour38@gmail.com' ? 'MATCH' : 'NO MATCH'}
            </p>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold">Actions:</h2>
            <button 
              onClick={handleRefresh}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Refresh Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthDebug;