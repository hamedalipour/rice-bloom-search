import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/hooks/useOrders';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, MapPin, Phone, Mail, CreditCard, Check } from 'lucide-react';
import { toast } from 'sonner';

// List of major Iranian cities
const iranianCities = [
  'تهران', 'مشهد', 'اصفهان', 'شیراز', 'تبریز', 'کرج', 'اهواز', 'قم', 'کرمانشاه', 'ارومیه',
  'رشت', 'زاهدان', 'همدان', 'کرمان', 'یزد', 'اردبیل', 'بندرعباس', 'اراک', 'ایلام', 'زنجان',
  'قزوین', 'خرم‌آباد', 'گرگان', 'ساری', 'بجنورد', 'سنندج', 'بیرجند', 'بوشهر', 'سمنان', 'یاسوج',
  'کاشان', 'نجف‌آباد', 'شاهرود', 'ورامین', 'اسلام‌شهر', 'نظرآباد', 'ملارد', 'بهارستان', 'نشتارود',
  'ساوه', 'پاکدشت', 'اندیشه', 'رباط‌کریم', 'شهریار', 'فردیس', 'دماوند', 'ری', 'کهریزک', 'باقرشهر'
];

// Validation functions
const isPersianText = (text: string): boolean => {
  const persianRegex = /^[\u0600-\u06FF\s]+$/;
  return persianRegex.test(text.trim());
};

const isValidIranianMobile = (phone: string): boolean => {
  const mobileRegex = /^09\d{9}$/;
  return mobileRegex.test(phone.replace(/\s/g, ''));
};

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { createOrder, loading: orderLoading } = useOrders();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: user?.user_metadata?.first_name || '',
    lastName: user?.user_metadata?.last_name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    notes: ''
  });

  // Redirect if cart is empty
  if (items.length === 0 && !orderComplete) {
    navigate('/cart');
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCityChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      city: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log('Submitting order with form data:', formData);
      console.log('Cart items:', items);
      console.log('Total price:', totalPrice);
      
      // Validate form data
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.address || !formData.city || !formData.postalCode) {
        toast.error('لطفا تمام فیلدهای الزامی را پر کنید');
        return;
      }

      // Validate Persian names
      if (!isPersianText(formData.firstName)) {
        toast.error('نام باید با حروف فارسی نوشته شود');
        return;
      }
      
      if (!isPersianText(formData.lastName)) {
        toast.error('نام خانوادگی باید با حروف فارسی نوشته شود');
        return;
      }

      // Validate Iranian mobile number
      if (!isValidIranianMobile(formData.phone)) {
        toast.error('شماره موبایل باید با 09 شروع شده و 11 رقمی باشد');
        return;
      }
      
      if (items.length === 0) {
        toast.error('سبد خرید شما خالی است');
        return;
      }

      // Create order in database
      const { data, error } = await createOrder(formData, items, totalPrice);
      
      if (error) {
        console.error('Order creation error:', error);
        toast.error(`خطا در ثبت سفارش: ${error.message || 'خطای نامشخص'}`);
        return;
      }

      console.log('Order created successfully:', data);
      
      // Clear cart and show success
      clearCart();
      setOrderComplete(true);
      
      toast.success('سفارش شما با موفقیت ثبت شد و ایمیل به ادمین ارسال شد!');
    } catch (error: any) {
      console.error('Error submitting order:', error);
      toast.error(`خطا در ثبت سفارش: ${error.message || 'لطفا دوباره تلاش کنید'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderComplete) {
    return (
      <>
        <Navbar />
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-green-50 to-green-100 py-12 px-4" dir="rtl">
          <div className="container mx-auto max-w-2xl">
            <Card className="text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold mb-4">سفارش شما ثبت شد!</h1>
                <p className="text-muted-foreground mb-6">
                  سفارش شما با موفقیت ثبت شد و به زودی پردازش خواهد شد.
                  اطلاعات سفارش به ایمیل شما ارسال شده است.
                </p>
                <div className="space-y-3">
                  <Button asChild className="w-full">
                    <Link to="/shop">ادامه خرید</Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full">
                    <Link to="/">بازگشت به صفحه اصلی</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-green-50 to-green-100 py-12 px-4" dir="rtl">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">تکمیل اطلاعات سفارش</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Personal Information */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Mail className="w-5 h-5" />
                        اطلاعات شخصی
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">نام (فارسی) *</Label>
                          <Input
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            placeholder="نام خود را با حروف فارسی وارد کنید"
                            dir="rtl"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">نام خانوادگی (فارسی) *</Label>
                          <Input
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            placeholder="نام خانوادگی خود را با حروف فارسی وارد کنید"
                            dir="rtl"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">ایمیل</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">شماره موبایل *</Label>
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="09xxxxxxxxx"
                            maxLength={11}
                            dir="ltr"
                            required
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            شماره موبایل باید با 09 شروع شده و 11 رقمی باشد
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        آدرس تحویل
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="address">آدرس کامل</Label>
                          <Textarea
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            rows={3}
                            required
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="city">شهر *</Label>
                            <Select value={formData.city} onValueChange={handleCityChange}>
                              <SelectTrigger>
                                <SelectValue placeholder="شهر خود را انتخاب کنید" />
                              </SelectTrigger>
                              <SelectContent className="max-h-60">
                                {iranianCities.map((city) => (
                                  <SelectItem key={city} value={city}>
                                    {city}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="postalCode">کد پستی</Label>
                            <Input
                              id="postalCode"
                              name="postalCode"
                              value={formData.postalCode}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order Notes */}
                    <div>
                      <Label htmlFor="notes">توضیحات سفارش (اختیاری)</Label>
                      <Textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="توضیحات اضافی در مورد سفارش..."
                      />
                    </div>

                    {/* Submit Button */}
                    <Button 
                      type="submit" 
                      className="w-full" 
                      size="lg"
                      disabled={isSubmitting || orderLoading}
                    >
                      {isSubmitting || orderLoading ? 'در حال ثبت سفارش...' : 'ثبت نهایی سفارش'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>خلاصه سفارش</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Cart Items */}
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={`${item.id}-${item.weight?.value || 'default'}`} className="flex items-center gap-3 p-3 border rounded-lg">
                        <img 
                          src={item.image_url} 
                          alt={item.name} 
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.name}</h4>
                          {item.weight && (
                            <p className="text-xs text-muted-foreground">
                              وزن: {item.weight.value}
                            </p>
                          )}
                          <p className="text-sm">
                            {item.quantity} × {item.price.toLocaleString('fa-IR')} تومان
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pricing */}
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span>جمع محصولات:</span>
                      <span>{totalPrice.toLocaleString('fa-IR')} تومان</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>هزینه ارسال:</span>
                      <span className="text-green-600">رایگان</span>
                    </div>
                    <hr />
                    <div className="flex justify-between text-lg font-bold">
                      <span>مجموع کل:</span>
                      <span className="text-primary">
                        {totalPrice.toLocaleString('fa-IR')} تومان
                      </span>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="w-4 h-4" />
                      <span className="font-medium text-sm">پرداخت در محل</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      پرداخت هنگام تحویل کالا
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Checkout;