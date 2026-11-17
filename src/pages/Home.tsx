import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, CheckCircle2, Star, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { useSEO, buildItemListJsonLd, buildFaqJsonLd } from "@/lib/seo";
import taromImage from "@/assets/rice-tarom.jpg";

/** سؤالات متداول صفحه اصلی — همراه با FAQPage Schema در JSON-LD */
const FAQ_DATA: { question: string; answer: string }[] = [
  {
    question: "چطور از فروشگاه عطر شالیزار سفارش بدهم؟",
    answer:
      "محصول مورد نظر را به سبد خرید اضافه کنید و فرم سفارش را تکمیل کنید؛ یا سفارش تلفنی خود را به شماره 09354299785 اعلام کنید. پاسخگویی هر روز از ۹ صبح تا ۹ شب است.",
  },
  {
    question: "ارسال سفارش چند روز طول می‌کشد؟",
    answer:
      "سفارش‌ها با پست پیشتاز و تیپاکس ارسال می‌شوند؛ تهران و کرج معمولاً ۲ تا ۳ روز کاری و سایر شهرها ۳ تا ۵ روز کاری به طول می‌انجامد.",
  },
  {
    question: "هزینه ارسال چقدر است؟",
    answer:
      "هزینه ارسال بر اساس وزن مرسوله و شهر مقصد محاسبه می‌شود و برای سفارش‌های حجیم (ساک‌های چندکیلویی برنج) تخفیف ارسال در نظر گرفته می‌شود. برای اطلاع دقیق قبل از سفارش با ما تماس بگیرید.",
  },
  {
    question: "برنج‌های شما از کجا تأمین می‌شود؟",
    answer:
      "برنج‌ها مستقیم از شالیزارهای گیلان و مازندران و بدون واسطه تهیه می‌شوند؛ برداشت تازه‌ی هر فصل، شال‌گیری و عیارسنجی دستی پیش از بسته‌بندی انجام می‌شود.",
  },
  {
    question: "تفاوت برنج طارم و هاشمی چیست؟",
    answer:
      "برنج طارم عطر قوی‌تر و دانه‌ی کشیده‌تری دارد؛ برنج هاشمی لعاب بیشتری دارد و به «سلطان برنج‌های مهمانی» معروف است. راهنمای کامل را در مقاله «تفاوت برنج طارم و هاشمی» بخوانید.",
  },
  {
    question: "چای لاهیجان اصل را چگونه تشخیص بدهم؟",
    answer:
      "چای اصل برگ کامل دارد، عطرش طبیعی و ملایم است و دم‌کرده‌اش رنگ عسلی شفاف می‌گیرد؛ چای‌های خارجی معمولاً دانه شکسته و رنگ تیره‌ی مصنوعی دارند. راهنمای کامل در مقاله «چای لاهیجان چیست» آمده است.",
  },
  {
    question: "بسته‌بندی برنج و چای چگونه است؟",
    answer:
      "برنج در ساک‌های ۵ و ۱۰ کیلویی و چای در بسته‌های ۲۵۰ گرمی و نیم‌کیلویی بسته‌بندی می‌شود. بسته‌بندی‌ها دو لایه و مطمئن است تا تازگی محصول تا لحظه‌ی رسیدن حفظ شود.",
  },
  {
    question: "پرداخت چطور انجام می‌شود؟",
    answer:
      "پرداخت از طریق درگاه امن بانکی سایت انجام می‌شود. برای هماهنگی روش‌های دیگر پرداخت (مثل کارت به کارت) با پشتیبانی تماس بگیرید.",
  },
  {
    question: "چای جوش چیست و چه فرقی با چای چوب دارد؟",
    answer:
      "چای جوش به روش سنتی دم کردن چای در کتری گفته می‌شود که اغلب با چای چوب یا چای ساقه‌دار انجام می‌شود؛ چایی پررنگ‌تر و ملایم‌تر از چای قوری. چای جوش یک روش دم کردن است و چای چوب نوع چای؛ توضیح کامل و طرز دم کردن در مقاله «چای جوش چیست» آمده است.",
  },
  {
    question: "چای چوب چیست؟",
    answer:
      "چای چوب از ساقه‌ها و شاخه‌های نازک بوته چای تهیه می‌شود؛ نسبت به چای سیاه ملایم‌تر، خوش‌عطرتر و اقتصادی‌تر است و رنگ طلایی روشنی می‌دهد. تفاوت کامل آن با چای سیاه را در مقاله «چای چوب چیست» بخوانید.",
  },
  {
    question: "قیمت برنج هاشمی معطر چقدر است؟",
    answer:
      "قیمت برنج هاشمی به وزن بسته و برداشت سال بستگی دارد. قیمت روز بسته ۵ کیلوگرمی در جدول «قیمت روز» همین صفحه و در صفحه محصول «برنج هاشمی معطر» نمایش داده می‌شود.",
  },
  {
    question: "قیمت چای لاهیجان چقدر است؟",
    answer:
      "قیمت چای لاهیجان به نوع چای (سیاه، بهاره یا چوب) و وزن بسته بستگی دارد. قیمت روز نیم‌کیلو و یک‌کیلوگرم در جدول «قیمت روز» همین صفحه و در صفحه هر محصول قابل مشاهده است.",
  },
  {
    question: "برنج هاشمی معطر چیست؟",
    answer:
      "برنج هاشمی معطر، برنج دانه‌بلند و خوش‌عطر ایرانی از شالیزارهای مازندران و گیلان است که به «سلطان برنج‌های مهمانی» معروف است؛ عطر قوی و لعاب سفید دارد. راهنمای کامل تشخیص اصل در مقاله «برنج هاشمی معطر چیست» آمده است.",
  },
  {
    question: "بادام آستانه را از کجا بخرم؟",
    answer:
      "بادام آستانه اصل را باید از فروشگاهی بخرید که منبعش را مشخص می‌کند؛ بادام آستانه عطر شالیزار مستقیم از باغ‌های آستانه قوچان گلستان تهیه می‌شود. راهنمای کامل تشخیص اصل در مقاله «بادام آستانه چیست» آمده است.",
  },
];


const Home = () => {
  const { products, loading, error } = useProducts();
  const { blogPosts } = useBlogPosts();

  const featuredProducts = products;
  // ۳ مقاله جدیدترین (مرتب‌سازی بر اساس تاریخ) — برای سئو و تازگی محتوا
  const latestPosts = [...blogPosts]
    .filter((post) => post.published)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 3);

  // جدول قیمت روز: همه وزن‌ها را شفاف نشان می‌دهد (کاهش ابهام قیمت = کلیک بیشتر)
  const priceRows = featuredProducts.flatMap((product) => {
    const list =
      Array.isArray(product.weights) && product.weights.length
        ? product.weights
        : [{ value: "بسته", price: product.price }];
    return list.map((weight) => ({
      product,
      weight: weight.value,
      price: weight.price,
    }));
  });

  useSEO({
    title: "خرید برنج هاشمی و چای لاهیجان اصل | قیمت روز – عطر شالیزار",
    description:
      "خرید آنلاین برنج هاشمی معطر و چای لاهیجان اصل (سیاه، بهاره و چوب) مستقیم از شالیزارهای گیلان و مازندران؛ قیمت روز و ارسال سریع به سراسر ایران.",
    path: "/",
    jsonLd: [
      buildItemListJsonLd(
        "محصولات برنج و چای عطر شالیزار",
        featuredProducts.map((p) => ({ name: p.name, path: `/product/${p.slug}` })),
      ),
      buildFaqJsonLd(FAQ_DATA),
    ],
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative flex h-[560px] items-end overflow-hidden sm:h-[600px] sm:items-center">
          <div className="absolute inset-0">
            <img
              src="/hero-rice-field.jpg"
              alt="شالیزار سرسبز برنج ایرانی در شمال کشور - عطر شالیزار"
              className="w-full h-full object-cover object-center"
            />
            {/* لایه خوانایی: موبایل = محو از پایین (متن پایین می‌نشیند و بالا تصویر معلوم است)
                دسکتاپ = محو افقی، قوی سمت راست (سمت متن در RTL) تا منظر سمت چپ دید داشته باشد */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/10 sm:bg-gradient-to-l sm:from-background/90 sm:via-background/55 sm:to-background/50" />
          </div>

          <div className="container mx-auto relative z-10 px-4 pb-8 sm:pb-0">
            <div className="max-w-2xl">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground leading-snug drop-shadow-sm">
                خرید برنج ایرانی و چای لاهیجان اصل، مستقیم از شالیزار
              </h1>
              <p className="text-base md:text-lg text-foreground/80 leading-8 mb-6 max-w-xl">
                برنج هاشمی معطر، چای سیاه لاهیجان، چای بهاره و{" "}
                <Link to="/blog/chai-chob-chist-tafavot-ba-chai-siah/" className="font-semibold text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary">
                  چای چوب (ساقه‌دار)
                </Link>{" "}
                را بدون واسطه از شالیزارها و باغ‌های گیلان و مازندران تأمین می‌کنیم؛
                قیمت روز، بسته‌بندی مطمئن و ارسال سریع به سراسر ایران.
              </p>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                <Button asChild variant="hero" size="lg">
                  <Link to="/shop/">
                    مشاهده محصولات
                    <ArrowRight className="mr-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/about/">درباره ما</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                انواع برنج و چای ایرانی
              </h2>
              <p className="text-muted-foreground text-lg">
                محصول مورد علاقه خود را انتخاب کنید
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  name: "برنج ایرانی اصل",
                  desc: "طارم، هاشمی، فجر و شیرودی",
                  image: taromImage,
                  to: "/category/berenj/",
                  alt: "خرید برنج ایرانی اصل - ساک برنج طارم عطر شالیزار",
                },
                {
                  name: "چای ایرانی لاهیجان",
                  desc: "چای سیاه، بهاره و چوب شمال",
                  image: "/assets/chai-siah.jpg",
                  to: "/category/chai/",
                  alt: "خرید چای ایرانی اصل لاهیجان - عطر شالیزار",
                  // زوم روی کاسه چای تا متن‌ها و حاشیه‌های تبلیغاتی عکس از کادر خارج شوند
                  imgCls: "scale-[1.45] origin-[42%_56%] group-hover:scale-[1.55]",
                },
              ].map((cat) => (
                <Link key={cat.to} to={cat.to} className="group">
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300">
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={cat.image}
                        alt={cat.alt}
                        loading="lazy"
                        className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${cat.imgCls ?? ""}`}
                        onError={(e) => { e.currentTarget.src = "/placeholder.svg"; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/95 to-transparent flex items-end">
                        <div className="p-6">
                          <h3 className="text-2xl font-bold text-foreground">{cat.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{cat.desc}</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            {/* لینک‌های سریع محصولات (لینک‌سازی داخلی) */}
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-8 text-sm">
              {[
                ["برنج هاشمی معطر", "/product/berenj-hashemi-moattar/"],
                ["چای سیاه لاهیجان", "/product/chai-siah-lahijan-daraje-yek/"],
                ["چای بهاره ممتاز", "/product/chai-bahareh-momtaz-shomal/"],
                ["چای چوب شمال", "/product/chai-sabz-barooti-gilan/"],
                ["چای جوش چیست؟", "/blog/chai-chob-chist-tafavot-ba-chai-siah/"],
              ].map(([label, to]) => (
                <Link key={to} to={to} className="text-muted-foreground hover:text-primary transition-colors">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                  محصولات فروشگاه
                </h2>
                <p className="text-muted-foreground text-lg">
                  برنج ایرانی، چای لاهیجان و بادام آستانه
                </p>
              </div>
              <Button asChild variant="outline">
                <Link to="/shop/">
                  مشاهده همه
                  <ArrowRight className="mr-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts && featuredProducts.length > 0 ? (
                featuredProducts.map((product) => (
                  <div key={product.id}>
                    <ProductCard product={product} />
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-muted-foreground">در حال بارگذاری محصولات...</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Price Table – محتوای متنی و قیمت شفاف برای کوئری‌های «قیمت» */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                قیمت روز برنج و چای
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                قیمت‌ها به تومان و به تفکیک وزن بسته است؛ پیش از ثبت سفارش، وزن دلخواه
                را در صفحه محصول انتخاب کنید.
              </p>
            </div>

            <div className="max-w-4xl mx-auto overflow-x-auto rounded-xl border border-border bg-background">
              <table className="w-full min-w-[560px] text-sm">
                <thead className="bg-muted/70 text-foreground">
                  <tr>
                    <th className="text-right p-4 font-bold">محصول</th>
                    <th className="text-right p-4 font-bold">وزن بسته</th>
                    <th className="text-right p-4 font-bold">قیمت</th>
                    <th className="text-right p-4 font-bold">خرید</th>
                  </tr>
                </thead>
                <tbody>
                  {priceRows.map(({ product, weight, price }) => (
                    <tr key={`${product.id}-${weight}`} className="border-t border-border">
                      <td className="p-4 font-medium text-foreground">{product.name}</td>
                      <td className="p-4 text-muted-foreground">{weight}</td>
                      <td className="p-4 font-bold text-primary whitespace-nowrap">
                        {price.toLocaleString("fa-IR")} تومان
                      </td>
                      <td className="p-4">
                        <Link
                          to={`/product/${product.slug}/`}
                          className="text-primary font-medium hover:underline"
                        >
                          مشاهده و خرید
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-center text-xs text-muted-foreground mt-4">
              قیمت‌ها ممکن است با تغییر فصل برداشت و بازار به‌روزرسانی شوند؛ آخرین
              قیمت در صفحه هر محصول نمایش داده می‌شود.
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center border-border">
                <CardContent className="pt-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <CheckCircle2 className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-foreground">کیفیت تضمینی</h3>
                  <p className="text-muted-foreground">
                    تمامی محصولات ما از بهترین شالیزارهای شمال کشور تهیه می‌شوند
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center border-border">
                <CardContent className="pt-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <TrendingUp className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-foreground">قیمت مناسب</h3>
                  <p className="text-muted-foreground">
                    با حذف واسطه‌ها، بهترین قیمت را به شما ارائه می‌دهیم
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center border-border">
                <CardContent className="pt-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <Star className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-foreground">رضایت مشتریان</h3>
                  <p className="text-muted-foreground">
                    بیش از ۱۰۰۰ مشتری راضی از کیفیت محصولات ما
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Blog Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                  مقالات آموزشی
                </h2>
                <p className="text-muted-foreground text-lg">
                  یاد بگیرید چگونه برنج بهتری بپزید
                </p>
              </div>
              <Button asChild variant="outline">
                <Link to="/blog/">
                  مشاهده همه
                  <ArrowRight className="mr-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {latestPosts.map((post) => (
                <Link key={post.id} to={`/blog/${post.slug}/`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 h-full border-border">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={post.featured_image_url || '/placeholder.svg'}
                        alt={post.title}
                        loading="lazy"
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.src = '/placeholder.svg';
                        }}
                      />
                    </div>
                    <CardContent className="p-6">
                      <div className="text-sm text-muted-foreground mb-2">
                        {(post as any).tags ? (post as any).tags[0] : 'عمومی'} • ۵ دقیقه
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-foreground hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-muted-foreground line-clamp-3">
                        {post.excerpt}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section – با FAQPage Schema برای نتایج غنی گوگل */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                سؤالات متداول
              </h2>
              <p className="text-muted-foreground text-lg">
                هر آنچه پیش از خرید برنج و چای ایرانی باید بدانید
              </p>
            </div>
            <div className="max-w-3xl mx-auto space-y-3">
              {FAQ_DATA.map((faq, i) => (
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
                  <p className="px-5 pb-5 text-muted-foreground leading-7">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary to-accent/80">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary-foreground">
              آماده خرید برنج و چای اصل هستید؟
            </h2>
            <p className="text-primary-foreground/90 text-lg mb-8 max-w-2xl mx-auto">
              محصول را انتخاب کنید و سفارش خود را ثبت کنید؛ برای سفارش تلفنی هم
              می‌توانید با ۰۹۳۵۴۲۹۹۷۸۵ تماس بگیرید.
            </p>
            <Button asChild size="lg" variant="secondary">
              <Link to="/shop/">شروع خرید</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;