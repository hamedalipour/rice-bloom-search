import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { useSEO } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, ShoppingCart, Trash2, MapPin } from "lucide-react";

const ORDER_PHONE = "09377893307";
const priceFmt = (n: number) => Number(n || 0).toLocaleString("fa-IR");

/**
 * صفحه ثبت سفارش — نسخه تلفنی
 * سفارش‌گیری آنلاین (دیتابیس) موقتاً حذف شده؛ مشتری سبد را می‌بیند
 * و با تماس تلفنی سفارش را نهایی می‌کند. بعداً اگر خواستی، همین‌جا
 * می‌توان دکمه ارسال به واتساپ/ایمیل اضافه کرد.
 */
const Checkout = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();

  useSEO({
    title: "ثبت سفارش تلفنی | فروشگاه عطر شالیزار",
    description:
      "برای نهایی کردن سفارش برنج ایرانی، سبد خرید را مرور کنید و با شماره ۰۹۳۷۷۸۹۳۳۰۷ تماس بگیرید.",
    path: "/checkout",
  });

  // اگر سبد خالی است، به سبد خرید برگرد
  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-green-50 to-green-100 py-12 px-4" dir="rtl">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">ثبت سفارش</h1>
            <p className="text-muted-foreground">
              سفارش‌گیری آنلاین موقتاً غیرفعال است؛ سفارش شما تلفنی نهایی می‌شود.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* خلاصه سفارش */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <ShoppingCart className="w-5 h-5" />
                  خلاصه سفارش شما
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={`${item.id}-${item.weight?.value || "default"}`}
                      className="flex items-center gap-4 p-3 border rounded-lg bg-white"
                    >
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                        onError={(e) => { e.currentTarget.src = "/placeholder.svg"; }}
                      />
                      <div className="flex-1 min-w-0">
                        <Link to={`/product/${item.slug}`} className="font-bold hover:text-primary">
                          {item.name}
                        </Link>
                        {item.weight && (
                          <p className="text-sm text-muted-foreground">وزن: {item.weight.value}</p>
                        )}
                        <p className="text-sm">تعداد: {priceFmt(item.quantity)}</p>
                      </div>
                      <div className="text-left font-bold whitespace-nowrap">
                        {priceFmt((item.weight?.price ?? item.price) * item.quantity)}
                        <span className="text-xs font-normal text-muted-foreground"> تومان</span>
                      </div>
                    </div>
                  ))}

                  <div className="border-t pt-4 flex justify-between items-center text-lg font-bold">
                    <span>مجموع کل:</span>
                    <span className="text-primary">{priceFmt(totalPrice)} تومان</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* تماس برای نهایی کردن سفارش */}
            <Card className="lg:col-span-2 h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Phone className="w-5 h-5" />
                  نهایی کردن سفارش
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-6">
                  برای ثبت نهایی سفارش، هماهنگی ارسال و پرداخت، با شماره زیر تماس بگیرید
                  و محصولات داخل سبد را اعلام کنید:
                </p>

                <Button asChild className="w-full h-14 text-lg">
                  <a href={`tel:${ORDER_PHONE}`} dir="ltr">
                    {ORDER_PHONE}
                  </a>
                </Button>

                <div className="rounded-lg bg-muted p-3 text-sm space-y-2">
                  <p className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    ارسال به سراسر ایران
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary" />
                    ساعت پاسخگویی: ۹ صبح تا ۹ شب
                  </p>
                </div>

                <Button asChild variant="outline" className="w-full">
                  <Link to="/contact">راه‌های ارتباطی دیگر</Link>
                </Button>

                <Button
                  variant="ghost"
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => {
                    if (confirm("سبد خرید خالی شود؟ (پس از ثبت تلفنی سفارش)")) {
                      clearCart();
                      navigate("/");
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  سبد را خالی کن
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Checkout;
