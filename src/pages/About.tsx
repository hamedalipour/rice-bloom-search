import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSEO } from "@/lib/seo";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Heart, Users, Award } from "lucide-react";
import aboutImage from "@/assets/about-us.jpg";

const About = () => {
  useSEO({
    title: "درباره عطر شالیزار | فروشنده مستقیم برنج ایرانی از شمال کشور",
    description:
      "داستان عطر شالیزار؛ خرید مستقیم برنج از کشاورزان شالیزارهای گیلان و مازندران بدون واسطه، با تعهد به کیفیت اصل و رضایت بیش از هزار خانواده ایرانی.",
    path: "/about",
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Page Header */}
        <section className="bg-muted/50 py-12 border-b border-border">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">درباره ما</h1>
            <p className="text-lg text-muted-foreground">
              داستان ما، مأموریت ما و تعهد ما به کیفیت
            </p>
          </div>
        </section>

        {/* About Content */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
                  داستان عطر شالیزار
                </h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    عطر شالیزار با هدف ارائه بهترین برنج‌های ایرانی به سفره خانواده‌های ایرانی آغاز به کار کرد.
                    ما معتقدیم که برنج باکیفیت، پایه و اساس یک غذای خوشمزه است.
                  </p>
                  <p>
                    تیم ما با سفر به بهترین شالیزارهای شمال کشور، مستقیم از کشاورزان محلی برنج خریداری می‌کند
                    تا اطمینان حاصل کند که محصولات ما از بالاترین کیفیت برخوردار هستند.
                  </p>
                  <p>
                    از طارم مازندران گرفته تا هاشمی گیلان، هر دانه برنج ما داستانی از زحمت کشاورزان،
                    خاک حاصلخیز شمال و عشق به سنت‌های کهن ایرانی را روایت می‌کند.
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-[4/3] rounded-lg overflow-hidden shadow-xl">
                  <img
                    src={aboutImage}
                    alt="درباره عطر شالیزار"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Values */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              <Card className="text-center border-border">
                <CardContent className="pt-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <CheckCircle2 className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-foreground">کیفیت برتر</h3>
                  <p className="text-muted-foreground">
                    انتخاب بهترین برنج از شالیزارهای مطمئن
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center border-border">
                <CardContent className="pt-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <Heart className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-foreground">عشق به سنت</h3>
                  <p className="text-muted-foreground">
                    حفظ روش‌های سنتی کشت و برداشت
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center border-border">
                <CardContent className="pt-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-foreground">حمایت از کشاورزان</h3>
                  <p className="text-muted-foreground">
                    خرید مستقیم و حمایت از تولیدکنندگان محلی
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center border-border">
                <CardContent className="pt-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <Award className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-foreground">اعتماد مشتریان</h3>
                  <p className="text-muted-foreground">
                    رضایت بیش از ۱۰۰۰ خانواده ایرانی
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Mission */}
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-8 md:p-12">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
                  مأموریت ما
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                  مأموریت ما ساده است: آوردن بهترین برنج‌های ایرانی از مزارع شمال کشور به سفره شما،
                  با کیفیتی که شایسته خانواده ایرانی است.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  ما می‌خواهیم با حذف واسطه‌ها، هم قیمت مناسب‌تری به مشتریان ارائه دهیم و هم درآمد بیشتری
                  برای کشاورزان زحمتکش ایجاد کنیم. این راه، راه برد-برد است.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
