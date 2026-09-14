import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/contexts/CartContext';
import { useSEO } from '@/lib/seo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Minus, Plus, Trash2, ArrowRight } from 'lucide-react';

const Cart = () => {
  const { items, totalPrice, updateQuantity, removeItem, clearCart } = useCart();

  // SEO: سبد خرید نباید ایندکس شود
  useSEO({
    title: "سبد خرید | عطر شالیزار",
    description: "سبد خرید فروشگاه برنج عطر شالیزار",
    noindex: true,
  });

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 py-12 px-4" dir="rtl">
          <Card className="w-full max-w-md text-center">
            <CardContent className="p-8">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">سبد خرید خالی است</h2>
              <p className="text-muted-foreground mb-6">
                هنوز محصولی به سبد خرید اضافه نکرده‌اید
              </p>
              <Button asChild>
                <Link to="/shop">
                  بازگشت به فروشگاه
                  <ArrowRight className="mr-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-3rem)] bg-gradient-to-br from-green-50 to-green-100 py-12 px-4" dir="rtl">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <Card className="shadow-xl border-2">
                <CardHeader className="flex flex-row items-center justify-between p-7">
                  <CardTitle className="text-3xl font-bold">سبد خرید</CardTitle>
                  <Badge variant="secondary" className="text-lg px-4 py-2">{items.length} محصول</Badge>
                </CardHeader>
                <CardContent className="space-y-6 p-8">
                  {items.map((item) => (
                    <div 
                      key={`${item.id}-${item.weight?.value || 'default'}`} 
                      className="flex items-center gap-8 p-1 border-2 border-border rounded-xl bg-background shadow-lg hover:shadow-xl transition-shadow"
                    >
                      <Link to={`/product/${item.slug}`}>
                        <img 
                          src={item.image_url} 
                          alt={item.name} 
                          className="w-40 h-40 object-cover rounded-xl shadow-md"
                        />
                      </Link>
                      
                      <div className="flex-1 min-w-0">
                        <Link to={`/product/${item.slug}`}>
                          <h3 className="font-semibold text-3x3 hover:text-primary transition-colors mb-3">
                            {item.name}
                          </h3>
                        </Link>
                        {item.weight && (
                          <p className="text-lg text-muted-foreground mb-3">
                            وزن: {item.weight.value}
                          </p>
                        )}

                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 border border-border rounded-lg p-1 bg-muted/30">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantity - 1, item.weight?.value)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="mx-3 text-lg font-medium min-w-[40px] text-center">
                            {item.quantity}
                          </span>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantity + 1, item.weight?.value)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <Button 
                          size="icon" 
                          variant="outline" 
                          className="h-10 w-10"
                          onClick={() => removeItem(item.id, item.weight?.value)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Item Total */}
                      <div className="text-left min-w-[150px]">
                        <p className="text-2xl font-bold text-primary">
                          {(item.price * item.quantity).toLocaleString('fa-IR')} تومان
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex justify-between pt-6">
                    <Button 
                      variant="outline" 
                      onClick={clearCart}
                      className="gap-3 text-lg px-6 py-3 h-12"
                    >
                      <Trash2 className="h-5 w-5" />
                      خالی کردن سبد
                    </Button>
                    <Button variant="outline" asChild className="text-lg px-6 py-3 h-12">
                      <Link to="/shop">ادامه خرید</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24 shadow-xl border-2">
                <CardHeader className="p-8">
                  <CardTitle className="text-2xl font-bold">خلاصه سفارش</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-8">
                  <div className="space-y-4">
                    <div className="flex justify-between text-lg">
                      <span>جمع محصولات:</span>
                      <span className="font-semibold">{totalPrice.toLocaleString('fa-IR')} تومان</span>
                    </div>
                    <div className="flex justify-between text-lg">
                      <span>هزینه ارسال:</span>
                      <span className="text-green-600 font-semibold">رایگان</span>
                    </div>
                    <hr className="my-4 border-2" />
                    <div className="flex justify-between text-2xl font-bold bg-primary/10 p-4 rounded-lg">
                      <span>مجموع:</span>
                      <span className="text-primary">
                        {totalPrice.toLocaleString('fa-IR')} تومان
                      </span>
                    </div>
                  </div>

                  <Button className="w-full text-lg py-6 h-14" size="lg" asChild>
                    <Link to="/checkout">
                      ادامه فرآیند خرید
                    </Link>
                  </Button>
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

export default Cart;