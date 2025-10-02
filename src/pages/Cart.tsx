import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Minus, Plus, Trash2, ArrowRight } from 'lucide-react';

const Cart = () => {
  const { items, totalPrice, updateQuantity, removeItem, clearCart } = useCart();

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
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-green-50 to-green-100 py-12 px-4" dir="rtl">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-2xl font-bold">سبد خرید</CardTitle>
                  <Badge variant="secondary">{items.length} محصول</Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map((item) => (
                    <div 
                      key={`${item.id}-${item.weight?.value || 'default'}`} 
                      className="flex items-center gap-4 p-4 border border-border rounded-lg bg-background"
                    >
                      <Link to={`/product/${item.slug}`}>
                        <img 
                          src={item.image_url} 
                          alt={item.name} 
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      </Link>
                      
                      <div className="flex-1">
                        <Link to={`/product/${item.slug}`}>
                          <h3 className="font-semibold text-lg hover:text-primary transition-colors">
                            {item.name}
                          </h3>
                        </Link>
                        {item.weight && (
                          <p className="text-sm text-muted-foreground mb-1">
                            وزن: {item.weight.value}
                          </p>
                        )}
                        <p className="text-lg font-bold text-primary">
                          {item.price.toLocaleString('fa-IR')} تومان
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 border border-border rounded-lg p-1">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantity - 1, item.weight?.value)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="mx-3 text-lg font-medium min-w-[30px] text-center">
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
                      <div className="text-left">
                        <p className="text-lg font-bold">
                          {(item.price * item.quantity).toLocaleString('fa-IR')} تومان
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex justify-between pt-4">
                    <Button 
                      variant="outline" 
                      onClick={clearCart}
                      className="gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      خالی کردن سبد
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to="/shop">ادامه خرید</Link>
                    </Button>
                  </div>
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
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>جمع محصولات:</span>
                      <span>{totalPrice.toLocaleString('fa-IR')} تومان</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>هزینه ارسال:</span>
                      <span className="text-green-600">رایگان</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between text-lg font-bold">
                      <span>مجموع:</span>
                      <span className="text-primary">
                        {totalPrice.toLocaleString('fa-IR')} تومان
                      </span>
                    </div>
                  </div>

                  <Button className="w-full" size="lg" asChild>
                    <Link to="/checkout">
                      ادامه فرآیند خرید
                    </Link>
                  </Button>

                  <div className="text-center text-sm text-muted-foreground">
                    <p>✓ ارسال رایگان برای سفارش‌های بالای ۵۰۰ هزار تومان</p>
                    <p>✓ ضمانت اصالت و کیفیت</p>
                    <p>✓ امکان بازگشت تا ۷ روز</p>
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

export default Cart;