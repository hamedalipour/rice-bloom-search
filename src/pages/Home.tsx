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
      "محصول مورد نظر را به سبد خرید اضافه کنید و فرم سفارش را تکمیل کنید؛ یا سفارش تلفنی خود را به شماره 09377893307 اعلام کنید. پاسخگویی هر روز از ۹ صبح تا ۹ شب است.",
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
];


const Home = () => {
  const { products, loading, error } = useProducts();
  const { blogPosts } = useBlogPosts();

  const featuredProducts = products.slice(0, 4);
  const latestPosts = blogPosts.filter(post => post.published).slice(0, 3);

  useSEO({
    title: "خرید برنج و چای ایرانی اصل | فروشگاه اینترنتی عطر شالیزار",
    description:
      "خرید آنلاین برنج ایرانی اصل (طارم، هاشمی، فجر، شیرودی) و چای اصل شمال (چای لاهیجان، چای سبز و دمنوش) مستقیماً از شالیزارها و باغ‌های گیلان و مازندران با قیمت روز و ارسال سریع به سراسر ایران.",
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
        <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="/hero-rice-field.jpg"
              alt="شالیزار سرسبز برنج ایرانی در شمال کشور - عطر شالیزار"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background/90 to-background/50" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-2xl">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground leading-tight">
                عطر شالیزار در خانه شما
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-muted-foreground">
                بهترین برنج‌های ایرانی از شالیزارهای شمال کشور و چای اصل لاهیجان، مستقیم به سفره شما
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild variant="hero" size="lg">
                  <Link to="/shop">
                    مشاهده محصولات
                    <ArrowRight className="mr-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/about">درباره ما</Link>
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
                  to: "/category/berenj",
                  alt: "خرید برنج ایرانی اصل - ساک برنج طارم عطر شالیزار",
                },
                {
                  name: "چای ایرانی لاهیجان",
                  desc: "چای سیاه، چای سبز و دمنوش",
                  image: "/assets/chai-siah.jpg",
                  to: "/category/chai",
                  alt: "خرید چای ایرانی اصل لاهیجان - عطر شالیزار",
                },
              ].map((cat) => (
                <Link key={cat.to} to={cat.to} className="group">
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300">
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={cat.image}
                        alt={cat.alt}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
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
                ["برنج طارم", "/product/berenj-tarom-mahali-daraje-yek"],
                ["برنج هاشمی", "/product/berenj-hashemi-moattar"],
                ["برنج فجر", "/product/berenj-fajr-gilan"],
                ["برنج شیرودی", "/product/berenj-shirudi-sonati"],
                ["چای سیاه لاهیجان", "/product/chai-siah-lahijan-daraje-yek"],
                ["چای سبز باروتی", "/product/chai-sabz-barooti-gilan"],
                ["دمنوش گل محمدی", "/product/damnoosh-aramesh-gol-mohammadi"],
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
                  محصولات پیشنهادی
                </h2>
                <p className="text-muted-foreground text-lg">
                  محبوب‌ترین برنج‌های ما
                </p>
              </div>
              <Button asChild variant="outline">
                <Link to="/shop">
                  مشاهده همه
                  <ArrowRight className="mr-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <Link to="/blog">
                  مشاهده همه
                  <ArrowRight className="mr-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {latestPosts.map((post) => (
                <Link key={post.id} to={`/blog/${post.slug}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 h-full border-border">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={post.featured_image_url || '/placeholder.svg'}
                        alt={post.title}
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
              آماده برای خرید بهترین برنج ایرانی هستید؟
            </h2>
            <p className="text-primary-foreground/90 text-lg mb-8 max-w-2xl mx-auto">
              همین الان سفارش دهید و از ارسال رایگان به سراسر کشور بهره‌مند شوید
            </p>
            <Button asChild size="lg" variant="secondary">
              <Link to="/shop">شروع خرید</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;