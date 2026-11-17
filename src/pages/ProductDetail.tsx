import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart, CheckCircle2, Truck, Shield, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import ProductCard from "@/components/ProductCard";
import {
  useSEO,
  buildProductJsonLd,
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
} from "@/lib/seo";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { CATEGORY_PAGES } from "@/data/products";

/** راهنمای خرید: برای هر دسته محصول، مقالات مرتبط وبلاگ (سئو: لینک‌سازی داخلی موضوعی) */
const GUIDE_POSTS: Record<string, string[]> = {
  hashemi: ["barenj-hashemi-moattar-chist", "rahnama-pokht-berenj-irani", "tafavot-berenj-tarom-hashemi"],
  "chai-siah": ["chai-lahijan-chist-rahnemaye-kharid", "chai-bahareh-chist-va-rahnemaye-kharid", "dam-kardan-chai-irani-droost"],
  "chai-chob": ["chai-chob-chist-tafavot-ba-chai-siah", "tafavot-chai-siah-va-chai-sabz", "dam-kardan-chai-irani-droost"],
  damnoosh: ["dam-kardan-chai-irani-droost", "chai-chob-chist-tafavot-ba-chai-siah"],
  badam: ["badam-astane-chist-rahnemaye-kharid"],
};

/** داشتن سؤالات متداول اختصاصی هر دسته، شانس نمایش FAQ در نتایج را بیشتر می‌کند */
const PRODUCT_FAQ: Record<string, { question: string; answer: string }[]> = {
  "chai-siah": [
    {
      question: "چای سیاه لاهیجان اصل چه ویژگی‌ای دارد؟",
      answer:
        "برگ یکدست و درشت، عطر طبیعی و رنگ کهربایی شفاف از نشانه‌های چای سیاه لاهیجان اصل است. چای‌های ما بدون رنگ و عطر افزودنی و مستقیم از باغ‌های گیلان تأمین می‌شوند.",
    },
    {
      question: "چای سیاه را چطور دم کنیم که تلخ نشود؟",
      answer:
        "برای هر نفر یک قاشق چای‌خوری سرصاف چای بریزید، از آب تازه استفاده کنید و ۱۰ تا ۱۵ دقیقه روی شعله ملایم دم کنید. جوشاندن شدید یا ماندن طولانی روی برگ، چای را تلخ می‌کند.",
    },
    {
      question: "تفاوت چای سیاه و چای بهاره چیست؟",
      answer:
        "چای بهاره از اولین چین بهار تهیه می‌شود، برگ نرم‌تر و عطر بیشتری دارد و ملایم‌تر است؛ چای سیاه رنگ و طعم پررنگ‌تری دارد و برای صبحانه و مصرف روزانه انتخاب رایج‌تری است.",
    },
  ],
  "chai-chob": [
    {
      question: "چای چوب یا چای جوش چه تفاوتی با چای سیاه دارد؟",
      answer:
        "چای چوب از ساقه و شاخه نازک بوته چای تهیه می‌شود و ملایم‌تر از چای سیاه است؛ رنگ طلایی روشن‌تری می‌دهد، دیرتر تلخ می‌شود و برای دم کردن در کتری و مصرف روزانه مناسب است.",
    },
    {
      question: "چای چوب را چند دقیقه دم کنیم؟",
      answer:
        "چای چوب معمولاً ۱۰ تا ۱۵ دقیقه با شعله ملایم دم می‌کند تا رنگ طلایی بگیرد. چون از ساقه تهیه شده، چند بار دم کردن را هم تحمل می‌کند و زیاد تلخ نمی‌شود.",
    },
    {
      question: "قیمت چای چوب چقدر است؟",
      answer:
        "قیمت چای چوب به وزن بسته بستگی دارد؛ قیمت نیم‌کیلو و یک‌کیلوگرم در جدول همین صفحه نمایش داده شده و پیش از ثبت سفارش قابل مشاهده است.",
    },
  ],
  hashemi: [
    {
      question: "برنج هاشمی معطر برای چه غذایی مناسب است؟",
      answer:
        "برنج هاشمی برای پلو، چلو، ته‌دیگ و مهمانی مناسب است؛ دانه‌هایش کشیده می‌شوند، لعاب سفید دارند و به هم نمی‌چسبند.",
    },
    {
      question: "برنج هاشمی را چطور بپزیم؟",
      answer:
        "برنج را ۲ تا ۳ بار بشویید، ۳۰ تا ۴۵ دقیقه خیس کنید، ۵ تا ۷ دقیقه در آب جوش بجوشانید و آبکش کنید؛ سپس با شعله کم ۳۰ تا ۴۰ دقیقه دم کنید.",
    },
    {
      question: "قیمت برنج هاشمی به چه چیزی بستگی دارد؟",
      answer:
        "قیمت برنج هاشمی به وزن بسته، برداشت سال و کیفیت دانه بستگی دارد. قیمت روز بسته‌های موجود در جدول همین صفحه آمده است.",
    },
  ],
  badam: [
    {
      question: "بادام آستانه اصل را چطور تشخیص دهیم؟",
      answer:
        "مغز پر و درشت، رنگ قهوه‌ای روشن و یکدست، عطر طبیعی و نبود بوی ترشیدگی از نشانه‌های بادام آستانه اصل است. بادام کهنه بوی نعنایی یا ترش می‌دهد.",
    },
    {
      question: "بادام آستانه را چطور نگهداری کنیم؟",
      answer:
        "در ظرف درب‌دار و دور از رطوبت و نور نگه دارید؛ برای نگهداری بیش از ۶ ماه، یخچال یا فریزر بهترین گزینه است تا روغن طبیعی مغز تغییر نکند.",
    },
  ],
};

const DEFAULT_FAQ = [
  {
    question: "ارسال سفارش چند روز طول می‌کشد؟",
    answer:
      "سفارش‌ها با پست پیشتاز و تیپاکس ارسال می‌شوند؛ تهران و کرج معمولاً ۲ تا ۳ روز کاری و سایر شهرها ۳ تا ۵ روز کاری.",
  },
  {
    question: "شرایط بازگشت کالا چگونه است؟",
    answer:
      "کیفیت محصولات تضمین شده است و در صورت مغایرت یا مشکل، تا ۷ روز امکان بازگشت یا پیگیری وجود دارد. برای هماهنگی با پشتیبانی تماس بگیرید.",
  },
];

const ProductDetail = () => {
  const { slug } = useParams();
  const { products, loading: productsLoading } = useProducts();
  const { blogPosts: allBlogPosts } = useBlogPosts();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWeight, setSelectedWeight] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addItem, isInCart, getCartItemQuantity } = useCart();

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      setError("آدرس محصول نامعتبر است");
      return;
    }

    // تا زمانی که لیست محصولات در حال دریافت است، در حالت لودینگ می‌مانیم
    if (productsLoading) {
      setLoading(true);
      return;
    }

    const foundProduct = products.find(p => p.slug === slug);

    if (foundProduct) {
      setProduct(foundProduct);
      setError(null);
    } else {
      setProduct(null);
      setError("محصول یافت نشد");
    }
    setLoading(false);
  }, [slug, products, productsLoading]);

  // SEO: عنوان، توضیحات، تصویر و داده ساختاریافته اختصاصی هر محصول
  const seoPath = `/product/${slug}`;
  const seoTitle = product
    ? (product.meta_title ||
        `${product.name} | خرید آنلاین با قیمت روز – عطر شالیزار`)
    : "محصول یافت نشد | عطر شالیزار";
  const seoDescription = product
    ? (
        product.meta_description ||
        product.description ||
        product.long_description ||
        ""
      ).slice(0, 160)
    : "مشخصات، قیمت روز و خرید آنلاین محصولات برنج و چای از فروشگاه عطر شالیزار";

  const productCategoryPage = product
    ? CATEGORY_PAGES.find((c) =>
        (c.ids as readonly string[]).includes(product.category_id),
      )
    : undefined;
  const productFaqs = product
    ? PRODUCT_FAQ[product.category_id] || DEFAULT_FAQ
    : [];

  useSEO({
    title: seoTitle,
    description: seoDescription,
    path: seoPath,
    image: product?.image_url || undefined,
    type: "product",
    noindex: !loading && (!product || !!error),
    jsonLd: product
      ? [
          buildProductJsonLd(product),
          buildBreadcrumbJsonLd([
            { name: "خانه", path: "/" },
            { name: "فروشگاه", path: "/shop" },
            ...(productCategoryPage
              ? [
                  {
                    name: productCategoryPage.name,
                    path: `/category/${productCategoryPage.slug}`,
                  },
                ]
              : []),
            { name: product.name, path: seoPath },
          ]),
          buildFaqJsonLd(productFaqs),
        ]
      : undefined,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">در حال بارگذاری...</h1>
            <p className="text-muted-foreground">لطفاً صبر کنید</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4 text-foreground">خطا در بارگذاری محصول</h1>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button asChild>
              <Link to="/shop/">بازگشت به فروشگاه</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4 text-foreground">محصول یافت نشد</h1>
            <Button asChild>
              <Link to="/shop/">بازگشت به فروشگاه</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const relatedProducts = products.filter(
    (p) => p.id !== product.id
  ).slice(0, 4);

  // مقالات راهنمای خرید مرتبط با دسته این محصول (لینک‌سازی داخلی موضوعی)
  const guidePosts = (GUIDE_POSTS[(product as any).category_id] || [])
    .map((s) => (allBlogPosts as any[]).find((p) => p.slug === s && p.published))
    .filter(Boolean)
    .slice(0, 3);

  const weights = Array.isArray(product.weights) ? product.weights : [];
  const features = Array.isArray(product.features) ? product.features : [];
  const selectedPrice = weights[selectedWeight]?.price || product.price || 0;
  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  const handleAddToCart = () => {
    if (!product) return;
    
    try {
      const selectedWeightData = weights[selectedWeight] || { value: "پیش‌فرض", price: product.price };
      
      addItem({
        id: product.id,
        name: product.name,
        slug: product.slug,
        image_url: product.image_url || product.image || '',
        price: selectedWeightData.price,
        weight: selectedWeightData,
        inStock: product.in_stock,
      }, quantity);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error("خطا در افزودن به سبد خرید");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Breadcrumb */}
        <section className="bg-muted/30 py-4 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-primary">خانه</Link>
              <span>/</span>
              <Link to="/shop/" className="hover:text-primary">فروشگاه</Link>
              <span>/</span>
              {productCategoryPage && (
                <>
                  <Link
                    to={`/category/${productCategoryPage.slug}/`}
                    className="hover:text-primary"
                  >
                    {productCategoryPage.name}
                  </Link>
                  <span>/</span>
                </>
              )}
              <span className="text-foreground">{product.name}</span>
            </div>
          </div>
        </section>

        {/* Product Details */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
              {/* Product Image */}
              <div className="space-y-4">
                <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                  <img
                    src={product.image_url || '/placeholder.svg'}
                    alt={`${product.name} – ${product.category_name} اصل ${product.origin} – عطر شالیزار`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg';
                    }}
                  />
                  {discount > 0 && (
                    <Badge className="absolute top-4 right-4 bg-destructive text-destructive-foreground text-lg px-4 py-2">
                      {discount}٪ تخفیف
                    </Badge>
                  )}
                </div>
              </div>

              {/* Product Info */}
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                  {product.name}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(product.rating || 0)
                            ? "fill-primary text-primary"
                            : "text-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-foreground font-medium">{product.rating}</span>
                  <span className="text-muted-foreground">
                    ({product.review_count} نظر)
                  </span>
                </div>

                {/* Price */}
                <div className="mb-6 p-6 bg-muted/50 rounded-lg">
                  {product.original_price && (
                    <span className="text-xl text-muted-foreground line-through block mb-2">
                      {product.original_price.toLocaleString('fa-IR')} تومان
                    </span>
                  )}
                  <span className="text-3xl font-bold text-primary">
                    {selectedPrice.toLocaleString('fa-IR')} تومان
                  </span>
                </div>

                {/* Description */}
                <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                  {product.long_description}
                </p>

                {/* مشخصات محصول – محتوای متنی قابل ایندکس */}
                <div className="mb-6">
                  <h3 className="font-bold text-lg mb-3 text-foreground">مشخصات محصول</h3>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="rounded-lg border border-border p-3">
                      <dt className="text-muted-foreground mb-1">منبع تولید</dt>
                      <dd className="font-medium text-foreground">{product.origin}</dd>
                    </div>
                    <div className="rounded-lg border border-border p-3">
                      <dt className="text-muted-foreground mb-1">دسته‌بندی</dt>
                      <dd className="font-medium text-foreground">
                        {productCategoryPage ? (
                          <Link
                            to={`/category/${productCategoryPage.slug}/`}
                            className="text-primary hover:underline"
                          >
                            {product.category_name}
                          </Link>
                        ) : (
                          product.category_name
                        )}
                      </dd>
                    </div>
                    <div className="rounded-lg border border-border p-3">
                      <dt className="text-muted-foreground mb-1">برند</dt>
                      <dd className="font-medium text-foreground">عطر شالیزار</dd>
                    </div>
                    <div className="rounded-lg border border-border p-3">
                      <dt className="text-muted-foreground mb-1">وضعیت موجودی</dt>
                      <dd className="font-medium text-foreground">
                        {product.in_stock ? "موجود و آماده ارسال" : "ناموجود"}
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Features */}
                {features.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-bold text-lg mb-3 text-foreground">ویژگی‌ها:</h3>
                    <ul className="space-y-2">
                      {features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-muted-foreground">
                          <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Weight Selection */}
                {weights.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-bold text-lg mb-3 text-foreground">انتخاب وزن:</h3>
                    <Select
                      value={selectedWeight.toString()}
                      onValueChange={(value) => setSelectedWeight(parseInt(value))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {weights.map((weight, index) => (
                          <SelectItem key={index} value={index.toString()}>
                            {weight.value} - {weight.price.toLocaleString('fa-IR')} تومان
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* جدول شفاف وزن و قیمت – هم برای کاربر و هم برای داده ساختاریافته */}
                {weights.length > 0 && (
                  <div className="mb-6 overflow-x-auto rounded-lg border border-border">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/60 text-foreground">
                        <tr>
                          <th className="text-right p-3 font-bold">وزن</th>
                          <th className="text-right p-3 font-bold">قیمت</th>
                          <th className="text-right p-3 font-bold">انتخاب</th>
                        </tr>
                      </thead>
                      <tbody>
                        {weights.map((weight, index) => (
                          <tr
                            key={index}
                            className={`border-t border-border ${
                              selectedWeight === index ? "bg-primary/5" : ""
                            }`}
                          >
                            <td className="p-3 font-medium text-foreground">
                              {weight.value}
                            </td>
                            <td className="p-3 font-bold text-primary whitespace-nowrap">
                              {weight.price.toLocaleString("fa-IR")} تومان
                            </td>
                            <td className="p-3">
                              <button
                                type="button"
                                onClick={() => setSelectedWeight(index)}
                                className={`text-sm font-medium hover:underline ${
                                  selectedWeight === index
                                    ? "text-primary"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {selectedWeight === index ? "انتخاب‌شده" : "انتخاب این وزن"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Add to Cart */}
                <Button
                  size="lg"
                  className="w-full gap-2 mb-6"
                  onClick={handleAddToCart}
                  disabled={!product.in_stock}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {product.in_stock ? (
                    isInCart(product.id, weights[selectedWeight]?.value) 
                      ? `در سبد (${getCartItemQuantity(product.id, weights[selectedWeight]?.value)})` 
                      : "افزودن به سبد خرید"
                  ) : (
                    "ناموجود"
                  )}
                </Button>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-4 border border-border rounded-lg">
                    <Truck className="h-6 w-6 text-primary" />
                    <div>
                      <p className="font-semibold text-foreground">ارسال رایگان</p>
                      <p className="text-sm text-muted-foreground">برای خرید بالای ۲۰۰ هزار تومان</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 border border-border rounded-lg">
                    <Shield className="h-6 w-6 text-primary" />
                    <div>
                      <p className="font-semibold text-foreground">ضمانت کیفیت</p>
                      <p className="text-sm text-muted-foreground">ضمانت بازگشت ۷ روزه</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 border border-border rounded-lg">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                    <div>
                      <p className="font-semibold text-foreground">اصالت محصول</p>
                      <p className="text-sm text-muted-foreground">۱۰۰٪ اصل و مرغوب</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* سؤالات متداول محصول – با FAQPage Schema */}
            {productFaqs.length > 0 && (
              <section className="mb-16 max-w-3xl">
                <h2 className="text-2xl md:text-3xl font-bold mb-6 text-foreground">
                  سؤالات متداول درباره {product.name}
                </h2>
                <div className="space-y-3">
                  {productFaqs.map((faq, i) => (
                    <details
                      key={i}
                      className="group bg-background border border-border rounded-lg overflow-hidden"
                    >
                      <summary className="flex items-center justify-between cursor-pointer list-none p-5 font-semibold text-foreground hover:text-primary transition-colors">
                        {faq.question}
                        <span className="text-primary text-xl leading-none transition-transform group-open:rotate-45">
                          +
                        </span>
                      </summary>
                      <p className="px-5 pb-5 text-muted-foreground leading-7">
                        {faq.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </section>
            )}

            {/* Related Products */}
            {relatedProducts.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                    محصولات مشابه
                  </h2>
                  <Button asChild variant="outline">
                    <Link to="/shop/">
                      مشاهده همه
                      <ArrowRight className="mr-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {relatedProducts.map((relatedProduct) => (
                    <ProductCard key={relatedProduct.id} product={relatedProduct} />
                  ))}
                </div>
              </section>
            )}

            {/* راهنمای خرید – مقالات مرتبط با این محصول (سئو: لینک‌سازی داخلی موضوعی) */}
            {guidePosts.length > 0 && (
              <section>
                <h2 className="text-2xl md:text-3xl font-bold mb-8 text-foreground">
                  راهنمای خرید و مقالات مرتبط
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {guidePosts.map((post: any) => (
                    <Link key={post.id} to={`/blog/${post.slug}/`} className="group">
                      <Card className="h-full border-border hover:shadow-lg transition-all duration-300">
                        <CardContent className="p-5">
                          <h3 className="font-bold mb-2 text-foreground group-hover:text-primary transition-colors line-clamp-2">
                            {post.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;