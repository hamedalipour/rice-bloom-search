import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { useSEO } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, ShoppingCart, Trash2, MapPin, CreditCard, Loader2 } from "lucide-react";
import {
  requestPayment,
  zarinpalStartUrl,
  priceFmt,
} from "@/lib/zarinpal";

const ORDER_PHONE = "09354299785";

/**
 * صفحه ثبت سفارش — دو گزینه:
 *  1. پرداخت آنلاین با درگاه زرین‌پال
 *  2. سفارش تلفنی (venie با تماس)
 */
const Checkout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { items, totalPrice, clearCart } = useCart();

  const authority = searchParams.get("authority");
  const payment = searchParams.get("payment");
  const returning = Boolean(authority);

  useSEO({
    title: "ثبت سفارش | فروشگاه عطر شالیزار",
    description:
      "برای نهایی کردن سفارش برنج ایرانی، سبد خرید را مرور کنید و روش پرداخت را انتخاب کنید.",
    path: "/checkout",
  });

  // اگر سبد خالی است، به سبد خرید برگرد
  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  const lineTotal = (item: (typeof items)[number]) =>
    (item.weight?.price ?? item.price) * item.quantity;

  // ---------- حالت بازگشت از درگاه (تایید پرداخت) ----------
  if (returning) {
    const verifying = payment !== "success";

    return (
      <>
        <Navbar />
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-green-50 to-green-100 py-12 px-4" dir="rtl">
          <div className="container mx-auto max-w-2xl">
            <Card className="text-center">
              <CardHeader>
                {verifying ? (
                  <>
                    <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-primary" />
                    <h2 className="text-2xl font-bold mb-3">در حال تایید پرداخت...</h2>
                    <p className="text-muted-foreground">
                      لطفاً منتظر بمانید، پرداخت شما بررسی می‌شود.
                    </p>
                  </>
                ) : payment === "success" ? (
                  <>
                    <CreditCard className="w-12 h-12 mx-auto mb-4 text-green-600" />
                    <h2 className="text-2xl font-bold mb-3">پرداخت با موفقیت انجام شد ✅</h2>
                    <p className="text-muted-foreground mb-6">
                      سفارش شما ثبت و تایید شد.팀 به‌زودی با شما تماس می‌گیرد.
                    </p>
                    <Button asChild className="w-full h-14 text-lg">
                      <Link to="/shop">بازگشت به فروشگاه</Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Phone className="w-10 h-10 mx-auto mb-4 text-red-600" />
                    <h2 className="text-2xl font-bold mb-3">پرداخت انجام نشد ❌</h2>
                    <p className="text-muted-foreground mb-6">
                      پرداخت شما توسط درگاه تایید نشد یا لغو شد. می‌توانید دوباره تلاش کنید
                      یا با تماس تلفنی سفارش را ثبت کنید.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button asChild className="flex-1">
                        <Link to="/cart">دوباره تلاش کنید</Link>
                      </Button>
                      <Button variant="outline" asChild className="flex-1">
                        <a href={`tel:${ORDER_PHONE}`} dir="ltr">
                          تماس تلفنی
                        </a>
                      </Button>
                    </div>
                  </>
                )}
              </CardHeader>
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
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">ثبت سفارش</h1>
            <p className="text-muted-foreground">
              روش پرداخت را انتخاب کنید و سفارش را نهایی نمایید.
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
                        {priceFmt(lineTotal(item))}
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

            {/* فرم انتخاب روش پرداخت */}
            <Card className="lg:col-span-2 h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <CreditCard className="w-5 h-5" />
                  انتخاب روش پرداخت
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-6">
                  برای سفارش آنلاین، نام و شماره تماس خود را وارد کنید و درگاه پرداخت زرین‌پال
                  باز می‌شود. پس از پرداخت، به صفحه نتیجه باز می‌گردید.
                </p>

                <div className="space-y-3">
                  <Label htmlFor="customer-name">نام و نام‌خانوادگی</Label>
                  <Input id="customer-name" placeholder="مثلاً علی احمدی" defaultValue="" />

                  <Label htmlFor="customer-phone">شماره تماس</Label>
                  <Input id="customer-phone" type="tel" placeholder="مثلاً 09123456789" />

                  <Label htmlFor="customer-address">آدرس ارسال</Label>
                  <Input id="customer-address" placeholder="استان، شهر، خیابان، پلاک و کد پستی" />
                </div>

                <Button
                  onClick={handlePayOnline}
                  className="w-full h-14 text-lg bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
                  disabled={!validateForm()}
                >
                  <CreditCard className="w-5 h-5" />
                  پرداخت آنلاین با درگاه زرین‌پال
                </Button>

                <div className="rounded-lg bg-muted p-3 text-sm space-y-2 border border-border">
                  <p className="flex items-center gap-2 text-amber-700">
                    <span className="text-amber-500">⚠</span>
                    در حالت آزمایشی (sandbox) پرداخت processing می‌شود.
                  </p>
                </div>

                <Button asChild variant="outline" className="w-full">
                  <a href={`tel:${ORDER_PHONE}`} dir="ltr">
                    <Phone className="w-4 h-4 mr-2" />
                    سفارش تلفنی (تماس با {ORDER_PHONE})
                  </a>
                </Button>

                <Button
                  variant="ghost"
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => {
                    if (confirm("سبد خرید خالی شود؟ (پس از ثبت سفارش)")) {
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

  function getForm() {
    const nameEl = document.getElementById("customer-name") as HTMLInputElement | null;
    const phoneEl = document.getElementById("customer-phone") as HTMLInputElement | null;
    const addressEl = document.getElementById("customer-address") as HTMLInputElement | null;
    return {
      name: nameEl?.value.trim() || "",
      phone: phoneEl?.value.trim() || "",
      address: addressEl?.value.trim() || "",
    };
  }

  function validateForm() {
    const { name, phone } = getForm();
    return Boolean(name && phone);
  }

  async function handlePayOnline() {
    const { name, phone, address } = getForm();
    if (!name || !phone) {
      alert("لطفاً نام و شماره تماس را وارد کنید.");
      return;
    }

    const callbackUrl = `${import.meta.env.VITE_PANEL_API_BASE || 'http://127.0.0.1:3001'}/api/payment/verify`;
    const description = `سفارش برنج — ${items.length} محصول — مجموع ${priceFmt(totalPrice)} تومان`;

    try {
      const result = await requestPayment({
        amount: totalPrice,
        callback_url: callbackUrl,
        description,
        customer_name: name,
        customer_mobile: phone,
      });

      if (!result.ok || !result.authority) {
        alert(result.message || "خطا در ایجاد پرداخت. لطفاً دوباره تلاش کنید.");
        return;
      }

      // ذخیره-light سفارش در localStorage برای verbunden کردن بعد از بازگشت
      const order = {
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        amount: totalPrice,
        authority: result.authority,
        status: "pending",
        customer: { name, phone, address },
        items: items.map((i) => ({
          id: i.id,
          name: i.name,
          slug: i.slug,
          weight: i.weight?.value || null,
          quantity: i.quantity,
          price: i.weight?.price ?? i.price,
        })),
      };
      localStorage.setItem("rice-bloom-pending-order", JSON.stringify(order));

      window.location.href = result.url || zarinpalStartUrl(result.authority);
    } catch (err) {
      alert("خطای اتصال به سرور پرداخت. لطفاً از راه‌اندازی سرور backend اطمینان حاصل کنید.");
      console.error(err);
    }
  }
};

export default Checkout;
