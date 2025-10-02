import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert } from '@/integrations/supabase/types';
import { CartItem } from '@/contexts/CartContext';

type Order = Tables<'orders'>;
type OrderInsert = TablesInsert<'orders'>;

export interface OrderFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  notes?: string;
}

export const useOrders = () => {
  const [loading, setLoading] = useState(false);

  const createOrder = async (formData: OrderFormData, cartItems: CartItem[], totalAmount: number) => {
    setLoading(true);
    try {
      console.log('Creating order with data:', { formData, cartItems, totalAmount });
      
      // Create order data
      const orderData: OrderInsert = {
        user_id: null, // Allow guest orders
        customer_name: `${formData.firstName} ${formData.lastName}`,
        customer_email: formData.email,
        customer_phone: formData.phone,
        customer_address: formData.address,
        customer_city: formData.city,
        customer_postal_code: formData.postalCode,
        notes: formData.notes || null,
        total_amount: totalAmount,
        shipping_address: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode
        },
        order_items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          image_url: item.image_url,
          price: item.price,
          quantity: item.quantity,
          weight: item.weight
        })),
        status: 'pending'
      };

      console.log('Order data to insert:', orderData);

      // Try to insert the order
      const { data, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      console.log('Supabase response:', { data, error });

      if (error) {
        console.error('Detailed error creating order:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error(`Order creation failed: ${error.message}`);
      }

      console.log('Order created successfully:', data);

      // Send email notification to admin
      await sendAdminEmailNotification(data, cartItems);

      return { data, error: null };
    } catch (error) {
      console.error('Error in createOrder:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in fetchOrders:', error);
      return { data: null, error };
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        console.error('Error updating order status:', error);
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in updateOrderStatus:', error);
      return { data: null, error };
    }
  };

  const sendAdminEmailNotification = async (order: Order, cartItems: CartItem[]) => {
    try {
      // In a real application, you would use a service like EmailJS, Resend, or your backend
      // For now, we'll just log the email details
      const emailData = {
        to: 'hamedalipour38@gmail.com', // Admin email
        subject: `سفارش جدید - شماره ${order.id.slice(-8)}`,
        html: `
          <div dir="rtl" style="font-family: Arial, sans-serif;">
            <h2>سفارش جدید دریافت شد</h2>
            
            <h3>اطلاعات مشتری:</h3>
            <p><strong>نام:</strong> ${order.customer_name}</p>
            <p><strong>ایمیل:</strong> ${order.customer_email}</p>
            <p><strong>تلفن:</strong> ${order.customer_phone}</p>
            <p><strong>آدرس:</strong> ${order.customer_address}, ${order.customer_city}</p>
            <p><strong>کد پستی:</strong> ${order.customer_postal_code}</p>
            ${order.notes ? `<p><strong>توضیحات:</strong> ${order.notes}</p>` : ''}
            
            <h3>محصولات سفارش:</h3>
            <table border="1" style="border-collapse: collapse; width: 100%;">
              <tr>
                <th style="padding: 10px; text-align: right;">محصول</th>
                <th style="padding: 10px; text-align: right;">تعداد</th>
                <th style="padding: 10px; text-align: right;">قیمت واحد</th>
                <th style="padding: 10px; text-align: right;">جمع</th>
              </tr>
              ${cartItems.map(item => `
                <tr>
                  <td style="padding: 10px;">${item.name}</td>
                  <td style="padding: 10px;">${item.quantity}</td>
                  <td style="padding: 10px;">${item.price.toLocaleString('fa-IR')} تومان</td>
                  <td style="padding: 10px;">${(item.price * item.quantity).toLocaleString('fa-IR')} تومان</td>
                </tr>
              `).join('')}
            </table>
            
            <h3 style="color: #e11d48;">مجموع کل: ${order.total_amount.toLocaleString('fa-IR')} تومان</h3>
            
            <p>برای مشاهده جزئیات بیشتر، وارد پنل مدیریت شوید.</p>
          </div>
        `
      };

      console.log('Email notification data:', emailData);
      
      // Here you would integrate with your email service
      // Example with EmailJS:
      // await emailjs.send('service_id', 'template_id', emailData, 'public_key');
      
      return true;
    } catch (error) {
      console.error('Error sending admin email notification:', error);
      return false;
    }
  };

  return {
    createOrder,
    fetchOrders,
    updateOrderStatus,
    loading
  };
};