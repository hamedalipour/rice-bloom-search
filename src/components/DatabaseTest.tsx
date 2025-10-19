import React from 'react';
import { runDatabaseTests } from '@/utils/dbTest';

const DatabaseTest = () => {
  const handleRunTests = async () => {
    await runDatabaseTests();
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', margin: '20px' }}>
      <h3>Database Tests</h3>
      <button onClick={handleRunTests}>Run Database Tests</button>
      <p>Check the browser console for test results.</p>
    </div>
  );
};

export default DatabaseTest;