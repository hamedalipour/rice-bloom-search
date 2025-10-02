import React, { useState } from 'react';
import { useOrders } from '@/hooks/useOrders';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const OrderTest: React.FC = () => {
  const { createOrder, loading } = useOrders();
  const [result, setResult] = useState<string>('');

  const testOrderCreation = async () => {
    console.log('=== Starting Order Test ===');
    
    // Check current auth state
    const { data: { session } } = await supabase.auth.getSession();
    console.log('Current session:', session);
    
    const testFormData = {
      firstName: 'تست',
      lastName: 'کاربر',
      email: 'test@example.com',
      phone: '09123456789',
      address: 'آدرس تست',
      city: 'تهران',
      postalCode: '1234567890',
      notes: 'یادداشت تست'
    };

    const testCartItems = [
      {
        id: 'test-1',
        name: 'محصول تست',
        slug: 'test-product',
        image_url: 'https://via.placeholder.com/300',
        price: 100000,
        quantity: 2,
        inStock: true
      }
    ];

    const totalAmount = 200000;

    console.log('Test data prepared:', { testFormData, testCartItems, totalAmount });

    try {
      const { data, error } = await createOrder(testFormData, testCartItems, totalAmount);
      
      if (error) {
        console.error('Order creation failed:', error);
        setResult(`خطا: ${JSON.stringify(error, null, 2)}`);
      } else {
        console.log('Order created successfully:', data);
        setResult(`موفق: سفارش با شناسه ${data?.id} ایجاد شد`);
      }
    } catch (error: any) {
      console.error('Unexpected error:', error);
      setResult(`خطای غیرمنتظره: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>تست ایجاد سفارش</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={testOrderCreation}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'در حال تست...' : 'تست ایجاد سفارش'}
            </Button>
            
            {result && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-bold mb-2">نتیجه:</h3>
                <pre className="text-sm overflow-auto">{result}</pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderTest;