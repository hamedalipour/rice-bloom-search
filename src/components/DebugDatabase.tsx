import React, { useEffect } from 'react';
import { debugDatabaseSchema } from '@/utils/debugDatabase';

const DebugDatabase = () => {
  useEffect(() => {
    debugDatabaseSchema();
  }, []);

  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', margin: '20px' }}>
      <h3>Database Debug Information</h3>
      <p>Check the browser console for detailed database schema information.</p>
    </div>
  );
};

export default DebugDatabase;