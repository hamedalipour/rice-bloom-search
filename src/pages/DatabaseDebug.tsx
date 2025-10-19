import React from 'react';
import DebugDatabase from '@/components/DebugDatabase';
import DatabaseTest from '@/components/DatabaseTest';
import TestProductSave from '@/components/TestProductSave';
import SchemaCheck from '@/components/SchemaCheck';

const DatabaseDebug = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Database Debug Tools</h1>
      
      <div className="grid grid-cols-1 gap-6">
        <DebugDatabase />
        <DatabaseTest />
        <TestProductSave />
        <SchemaCheck />
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Instructions</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>Open the browser console (F12) to see detailed logs</li>
          <li>Click "Run Database Tests" to check the current database state</li>
          <li>Use "Test Product Save" to try saving a product with minimal data</li>
          <li>Click "Check Schema" to verify the products table structure</li>
          <li>Check the console output for any error messages or success confirmations</li>
        </ol>
      </div>
    </div>
  );
};

export default DatabaseDebug;