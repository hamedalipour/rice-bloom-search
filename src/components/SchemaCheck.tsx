import React from 'react';
import { checkProductsSchema } from '@/utils/schemaCheck';

const SchemaCheck = () => {
  const handleCheckSchema = async () => {
    const result = await checkProductsSchema();
    console.log('Schema check result:', result);
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', margin: '20px' }}>
      <h3>Products Table Schema Check</h3>
      <button onClick={handleCheckSchema}>Check Schema</button>
      <p>Check the browser console for results.</p>
    </div>
  );
};

export default SchemaCheck;