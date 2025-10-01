import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, CheckCircle2, Star, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import heroImage from "@/assets/hero-rice-field.jpg";
import taromImage from "@/assets/rice-tarom.jpg";
import hashemiImage from "@/assets/rice-hashemi.jpg";
import fajrImage from "@/assets/rice-fajr.jpg";
import shirudiImage from "@/assets/rice-shirudi.jpg";

const Home = () => {
  const { products } = useProducts();
  const { blogPosts } = useBlogPosts();
  
  const featuredProducts = products.slice(0, 4);
  const latestPosts = blogPosts.slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={heroImage}
              alt="شالیزار سرسبز ایرانی"
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
                بهترین برنج‌های ایرانی از شالیزارهای شمال کشور، مستقیم به سفره شما
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
                انواع برنج ایرانی
              </h2>
              <p className="text-muted-foreground text-lg">
                برنج مورد علاقه خود را انتخاب کنید
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: "برنج طارم", image: taromImage, slug: "tarom" },
                { name: "برنج هاشمی", image: hashemiImage, slug: "hashemi" },
                { name: "برنج فجر", image: fajrImage, slug: "fajr" },
                { name: "برنج شیرودی", image: shirudiImage, slug: "shirudi" }
              ].map((category) => (
                <Link
                  key={category.slug}
                  to={`/shop?category=${category.slug}`}
                  className="group"
                >
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent flex items-end">
                        <h3 className="text-2xl font-bold p-6 text-foreground">
                          {category.name}
                        </h3>
                      </div>
                    </div>
                  </Card>
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
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
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
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <CardContent className="p-6">
                      <div className="text-sm text-muted-foreground mb-2">
                        {post.category} • {post.read_time}
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