import React, { useState } from 'react';
import { debugProductSave } from '@/utils/debugProductSave';

const TestProductSave = () => {
  const [testData, setTestData] = useState({
    name: 'Test Product',
    slug: 'test-product-' + Date.now(),
    category_id: '1', // Assuming category ID 1 exists
    price: 100
  });

  const handleTestSave = async () => {
    console.log('Testing product save with data:', testData);
    await debugProductSave(testData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTestData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value
    }));
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', margin: '20px' }}>
      <h3>Test Product Save</h3>
      <div>
        <label>Name: </label>
        <input 
          type="text" 
          name="name" 
          value={testData.name} 
          onChange={handleInputChange} 
        />
      </div>
      <div>
        <label>Slug: </label>
        <input 
          type="text" 
          name="slug" 
          value={testData.slug} 
          onChange={handleInputChange} 
        />
      </div>
      <div>
        <label>Category ID: </label>
        <input 
          type="text" 
          name="category_id" 
          value={testData.category_id} 
          onChange={handleInputChange} 
        />
      </div>
      <div>
        <label>Price: </label>
        <input 
          type="number" 
          name="price" 
          value={testData.price} 
          onChange={handleInputChange} 
        />
      </div>
      <button onClick={handleTestSave}>Test Save Product</button>
      <p>Check the browser console for results.</p>
    </div>
  );
};

export default TestProductSave;