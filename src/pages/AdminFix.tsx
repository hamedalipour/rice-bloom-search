import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const AdminFix: React.FC = () => {
  const { user, userProfile, refreshProfile } = useAuth();
  const [isFixing, setIsFixing] = useState(false);
  const [result, setResult] = useState<string>('');

  const fixAdminProfile = async () => {
    if (!user) {
      setResult('No user logged in');
      return;
    }

    setIsFixing(true);
    setResult('');

    try {
      console.log('Fixing admin profile for user:', user.id, user.email);
      
      // Force update the user profile to admin
      const { data: updatedProfile, error } = await supabase
        .from('user_profiles')
        .update({
          role: 'admin',
          email: 'hamedalipour38@gmail.com',
          first_name: 'Hamed',
          last_name: 'Alipour'
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        setResult(`Error: ${error.message}`);
      } else if (updatedProfile) {
        console.log('Profile updated successfully:', updatedProfile);
        setResult('Admin profile updated successfully!');
        // Refresh the profile in the auth context
        await refreshProfile();
      } else {
        setResult('No profile was updated');
      }
    } catch (error: any) {
      console.error('Unexpected error:', error);
      setResult(`Unexpected error: ${error.message}`);
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">Admin Profile Fix</h1>
        
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Current User:</h2>
            <p>Email: {user?.email}</p>
            <p>ID: {user?.id}</p>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold">Current Profile:</h2>
            <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
              {JSON.stringify(userProfile, null, 2)}
            </pre>
          </div>
          
          <div>
            <button
              onClick={fixAdminProfile}
              disabled={isFixing}
              className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 disabled:opacity-50"
            >
              {isFixing ? 'Fixing...' : 'Force Fix Admin Profile'}
            </button>
          </div>
          
          {result && (
            <div className={`p-4 rounded ${result.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {result}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminFix;