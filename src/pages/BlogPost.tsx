import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import {
  useSEO,
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
} from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, ArrowRight, ShoppingCart, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

/**
 * سؤالات متداول اختصاصی هر مقاله — همراه با FAQPage Schema.
 * پاسخ‌ها کوتاه و برگرفته از همان محتوای مقاله هستند تا با متن صفحه یکی باشند.
 */
const FAQ_BY_SLUG: Record<string, { question: string; answer: string }[]> = {
  "chai-chob-chist-tafavot-ba-chai-siah": [
    {
      question: "چای جوش چیست؟",
      answer:
        "چای جوش به روش سنتی دم کردن چای در کتری گفته می‌شود؛ آب و چای همراه هم و روی شعله ملایم دم می‌کنند. در شمال ایران این کار اغلب با چای چوب یا چای ساقه‌دار انجام می‌شود و نتیجه، چایی پررنگ‌تر و ملایم‌تر از چای برگ است.",
    },
    {
      question: "چای جوش چه فرقی با چای سیاه دارد؟",
      answer:
        "چای سیاه از برگ جوان بوته چای ساخته می‌شود و رنگ و طعم پررنگ‌تری دارد؛ چای جوش معمولاً با چای چوب (ساقه و شاخه نازک) دم می‌شود، ملایم‌تر است، دیرتر تلخ می‌شود و رنگ طلایی روشن‌تری می‌دهد.",
    },
    {
      question: "چای چوب را چطور دم کنیم که تلخ نشود؟",
      answer:
        "برای هر نفر یک قاشق چای‌خوری سرصاف چای چوب بریزید، از آب تازه استفاده کنید و روی شعله ملایم ۱۰ تا ۱۵ دقیقه دم کنید. جوشاندن شدید و ماندن طولانی روی برگ، چای را تلخ می‌کند.",
    },
    {
      question: "قیمت چای چوب چقدر است؟",
      answer:
        "قیمت چای چوب به وزن بسته بستگی دارد. قیمت روز نیم‌کیلو و یک‌کیلوگرم در صفحه محصول «چای چوب شمال (ساقه‌دار)» نمایش داده می‌شود و پیش از ثبت سفارش قابل مشاهده است.",
    },
  ],
  "chai-bahareh-chist-va-rahnemaye-kharid": [
    {
      question: "چای بهاره چیست؟",
      answer:
        "چای بهاره از اولین چین برگ بوته چای در فصل بهار تهیه می‌شود؛ برگ‌های جوان و نرم‌ترند و عطر طبیعی بیشتری دارند. به همین دلیل چای بهاره معمولاً باکیفیت‌ترین و گران‌ترین چای فصل شناخته می‌شود.",
    },
    {
      question: "چای بهاره بهتر است یا چای تابستونه؟",
      answer:
        "چای بهاره عطر بالاتر و طعم ملایم‌تری دارد و برای پذیرایی و مهمانی مناسب‌تر است؛ چای تابستونه دوام و رنگ بیشتری دارد و برای مصرف روزانه اقتصادی‌تر است.",
    },
    {
      question: "قیمت چای بهاره چقدر است؟",
      answer:
        "قیمت چای بهاره به وزن بسته و چین فصل بستگی دارد. قیمت روز نیم‌کیلو و یک‌کیلوگرم در صفحه محصول «چای بهاره ممتاز شمال» قابل مشاهده است.",
    },
    {
      question: "چای بهاره را چطور دم کنیم؟",
      answer:
        "آب تازه را بعد از جوشیدن ۱ تا ۲ دقیقه آرام کنید، سپس چای را ۱۰ تا ۱۵ دقیقه روی شعله ملایم دم کنید. برای چای سبز و بهاره، زمان کمتر (۳ تا ۵ دقیقه) از تلخی جلوگیری می‌کند.",
    },
  ],
  "dam-kardan-chai-irani-droost": [
    {
      question: "چرا چای تلخ می‌شود؟",
      answer:
        "زیاد بودن مقدار چای، جوشاندن شدید یا ماندن طولانی دم‌کرده روی برگ، سه دلیل اصلی تلخی چای هستند. یک قاشق چای‌خوری سرصاف برای هر نفر و دم ملایم، تلخی را کم می‌کند.",
    },
    {
      question: "چای را چند دقیقه دم کنیم؟",
      answer:
        "چای سیاه ۱۰ تا ۱۵ دقیقه، چای سبز ۳ تا ۵ دقیقه و دمنوش ۷ تا ۱۰ دقیقه. زمان بیشتر از این، عطر را کم و تلخی را زیاد می‌کند.",
    },
    {
      question: "نسبت چای به آب چقدر باشد؟",
      answer:
        "برای هر نفر حدود ۲ گرم چای (یک قاشق چای‌خوری سرصاف) کافی است. این نسبت برای چای سیاه و چای چوب مناسب است و به تلخی نیازی به شکر زیاد ندارد.",
    },
    {
      question: "برای دم کردن چای ایرانی چه آبی مناسب است؟",
      answer:
        "آب تازه بهتر است؛ آب مانده یا چندبار جوشیده اکسیژن خود را از دست می‌دهد و عطر چای را کم می‌کند. بعد از جوشیدن، ۱ تا ۲ دقیقه صبر کنید تا آب کمی آرام بگیرد.",
    },
  ],
  "chai-lahijan-chist-rahnemaye-kharid": [
    {
      question: "چای لاهیجان اصل را چطور تشخیص دهیم؟",
      answer:
        "برگ کامل و یکدست، عطر طبیعی و گیاهی، رنگ کهربایی شفاف و باز شدن برگ‌ها بعد از دم کشیدن نشانه‌های چای اصل هستند. دانه شکسته و رنگ تیره و کدر معمولاً نشانه چای مخلوط یا افزودنی است.",
    },
    {
      question: "قیمت چای لاهیجان چقدر است؟",
      answer:
        "قیمت چای لاهیجان به نوع چای (سیاه، بهاره یا چوب) و وزن بسته بستگی دارد. قیمت روز نیم‌کیلو و یک‌کیلوگرم در صفحه محصول چای سیاه لاهیجان درجه یک آمده است.",
    },
    {
      question: "چای سیاه بهتر است یا چای بهاره؟",
      answer:
        "چای بهاره عطر بیشتری دارد و ملایم‌تر است؛ چای سیاه رنگ و طعم پررنگ‌تری دارد و برای صبحانه و مصرف روزانه انتخاب رایج‌تری است. انتخاب به سلیقه و زمان مصرف بستگی دارد.",
    },
    {
      question: "چای لاهیجان را از کجا بخریم؟",
      answer:
        "از فروشگاهی بخرید که منبع باغ، فصل چین و وزن بسته را مشخص می‌کند. چای‌های عطر شالیزار مستقیم از باغ‌های گیلان تأمین می‌شوند و قیمت روز هر وزن در صفحه محصول قابل مشاهده است.",
    },
  ],
  "barenj-hashemi-moattar-chist": [
    {
      question: "برنج هاشمی معطر چیست؟",
      answer:
        "برنج هاشمی معطر یک برنج ایرانی دانه‌بلند با عطر قوی، لعاب سفید و پخت آسان است که در شالیزارهای گیلان و مازندران کشت می‌شود و به «سلطان برنج‌های مهمانی» معروف است.",
    },
    {
      question: "تفاوت برنج هاشمی و طارم چیست؟",
      answer:
        "طارم دانه باریک‌تر و عطر ملایم‌تری دارد؛ هاشمی عطر قوی‌تر، لعاب بیشتر و حجم پخت بالاتری دارد و برای مهمانی و ته‌دیگ مناسب‌تر است. مقایسه کامل در مقاله «تفاوت برنج طارم و هاشمی» آمده است.",
    },
    {
      question: "قیمت برنج هاشمی چقدر است؟",
      answer:
        "قیمت برنج هاشمی به وزن بسته و برداشت سال بستگی دارد. قیمت روز بسته ۵ کیلوگرمی در صفحه محصول «برنج هاشمی معطر» نمایش داده می‌شود.",
    },
    {
      question: "برنج هاشمی را چطور بپزیم؟",
      answer:
        "برنج را ۲ تا ۳ بار بشویید، ۳۰ تا ۴۵ دقیقه خیس کنید، در آب جوش ۵ تا ۷ دقیقه بجوشانید و آبکش کنید؛ سپس با شعله کم ۳۰ تا ۴۰ دقیقه دم کنید. مراحل کامل در مقاله «راهنمای پخت برنج ایرانی» است.",
    },
  ],
};

/** محصول پیشنهادی هر مقاله — برای تبدیل خواننده به خریدار و لینک‌سازی داخلی */
const CTA_BY_SLUG: Record<
  string,
  { productSlug: string; productLabel: string; categorySlug: string; categoryLabel: string }
> = {
  "chai-chob-chist-tafavot-ba-chai-siah": {
    productSlug: "/product/chai-sabz-barooti-gilan/",
    productLabel: "مشاهده قیمت و خرید چای چوب شمال (ساقه‌دار)",
    categorySlug: "/category/chai/",
    categoryLabel: "همه چای‌های ایرانی",
  },
  "chai-bahareh-chist-va-rahnemaye-kharid": {
    productSlug: "/product/chai-bahareh-momtaz-shomal/",
    productLabel: "مشاهده قیمت و خرید چای بهاره ممتاز",
    categorySlug: "/category/chai/",
    categoryLabel: "همه چای‌های ایرانی",
  },
  "dam-kardan-chai-irani-droost": {
    productSlug: "/product/chai-siah-lahijan-daraje-yek/",
    productLabel: "مشاهده قیمت و خرید چای سیاه لاهیجان",
    categorySlug: "/category/chai/",
    categoryLabel: "همه چای‌های ایرانی",
  },
  "chai-lahijan-chist-rahnemaye-kharid": {
    productSlug: "/product/chai-siah-lahijan-daraje-yek/",
    productLabel: "مشاهده قیمت و خرید چای سیاه لاهیجان",
    categorySlug: "/category/chai/",
    categoryLabel: "همه چای‌های ایرانی",
  },
  "barenj-hashemi-moattar-chist": {
    productSlug: "/product/berenj-hashemi-moattar/",
    productLabel: "مشاهده قیمت و خرید برنج هاشمی معطر",
    categorySlug: "/category/berenj/",
    categoryLabel: "همه برنج‌های ایرانی",
  },
  "tafavot-berenj-tarom-hashemi": {
    productSlug: "/product/berenj-hashemi-moattar/",
    productLabel: "مشاهده قیمت و خرید برنج هاشمی معطر",
    categorySlug: "/category/berenj/",
    categoryLabel: "همه برنج‌های ایرانی",
  },
  "rahnama-pokht-berenj-irani": {
    productSlug: "/product/berenj-hashemi-moattar/",
    productLabel: "مشاهده قیمت و خرید برنج هاشمی معطر",
    categorySlug: "/category/berenj/",
    categoryLabel: "همه برنج‌های ایرانی",
  },
  "negahdari-berenj": {
    productSlug: "/product/berenj-hashemi-moattar/",
    productLabel: "مشاهده قیمت و خرید برنج هاشمی معطر",
    categorySlug: "/category/berenj/",
    categoryLabel: "همه برنج‌های ایرانی",
  },
  "tafavot-chai-siah-va-chai-sabz": {
    productSlug: "/product/chai-siah-lahijan-daraje-yek/",
    productLabel: "مشاهده قیمت و خرید چای سیاه لاهیجان",
    categorySlug: "/category/chai/",
    categoryLabel: "همه چای‌های ایرانی",
  },
  "badam-astane-chist-rahnemaye-kharid": {
    productSlug: "/product/badam-astane/",
    productLabel: "مشاهده قیمت و خرید بادام آستانه",
    categorySlug: "/shop/",
    categoryLabel: "همه محصولات فروشگاه",
  },
};

/** لینک‌های داخلی محتوا هم باید به URL نهایی (با اسلش) اشاره کنند */
const normalizeInternalHref = (href: string): string => {
  if (!href.startsWith("/") || href.startsWith("/#")) return href;
  if (/\.[a-z0-9]{2,5}$/i.test(href)) return href;
  const [base, hash] = href.split("#");
  const normalized = base.endsWith("/") ? base : `${base}/`;
  return hash ? `${normalized}#${hash}` : normalized;
};

/** تبدیل ساده Markdown (سرتیترها، لیست‌ها و بولد) به تگ‌های HTML
    تا ساختار سرتیترها (h2/h3) برای سئوی محتوا در دسترس موتورها باشد. */
const renderMarkdownContent = (content: string) => {
  const lines = content.split("\n");
  const blocks: JSX.Element[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const inline = (text: string) =>
    text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\))/g).map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      // لینک‌های داخلی [متن](/مسیر) → react-router (سئو: لینک‌سازی داخلی)
      const m = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
      if (m) {
        const [, label, href] = m;
        return href.startsWith("/") ? (
          <Link key={i} to={normalizeInternalHref(href)} className="text-primary font-medium underline decoration-primary/40 underline-offset-4 hover:text-primary/80">
            {label}
          </Link>
        ) : (
          <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="text-primary font-medium underline underline-offset-4 hover:text-primary/80">
            {label}
          </a>
        );
      }
      return part;
    });

  const flushList = (key: string) => {
    if (!list) return;
    const current = list;
    list = null;
    const items = current.items.map((item, i) => (
      <li key={i}>{inline(item)}</li>
    ));
    blocks.push(
      current.ordered ? <ol key={key}>{items}</ol> : <ul key={key}>{items}</ul>,
    );
  };

  lines.forEach((raw, idx) => {
    const line = raw.trim();
    if (!line) {
      flushList(`list-${idx}`);
      return;
    }
    if (line.startsWith("### ")) {
      flushList(`list-${idx}`);
      blocks.push(<h4 key={idx}>{inline(line.slice(4))}</h4>);
    } else if (line.startsWith("## ")) {
      flushList(`list-${idx}`);
      blocks.push(<h3 key={idx}>{inline(line.slice(3))}</h3>);
    } else if (line.startsWith("# ")) {
      flushList(`list-${idx}`);
      blocks.push(<h2 key={idx}>{inline(line.slice(2))}</h2>);
    } else if (/^[-*] /.test(line)) {
      if (!list || list.ordered) {
        flushList(`list-${idx}`);
        list = { ordered: false, items: [] };
      }
      list!.items.push(line.slice(2));
    } else if (/^\d+\. /.test(line)) {
      if (!list || !list.ordered) {
        flushList(`list-${idx}`);
        list = { ordered: true, items: [] };
      }
      list!.items.push(line.replace(/^\d+\. /, ""));
    } else {
      flushList(`list-${idx}`);
      blocks.push(<p key={idx}>{inline(line)}</p>);
    }
  });
  flushList("list-final");
  return blocks;
};

const BlogPost = () => {
  const { slug } = useParams();
  const { blogPosts, getBlogPostBySlug } = useBlogPosts();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (slug) {
        // Try to get from hook first (for published posts)
        let foundPost = blogPosts.find((p: any) => p.slug === slug && p.published);
        
        if (!foundPost) {
          // Try direct database lookup
          const result = await getBlogPostBySlug(slug);
          if (result.data && result.data.published) {
            foundPost = result.data;
          }
        }
        
        setPost(foundPost);
      }
      setLoading(false);
    };

    fetchPost();
  }, [slug, blogPosts, getBlogPostBySlug]);

  const faqs = (slug && FAQ_BY_SLUG[slug]) || [];
  const cta = slug ? CTA_BY_SLUG[slug] : undefined;

  // SEO: عنوان و توضیحات باید همان meta_title/meta_description داخل HTML استاتیک
  // باشد تا پس از hydration عنوان صفحه عوض نشود (ناهماهنگی title = افت CTR).
  useSEO({
    title: post
      ? post.meta_title || `${post.title} | وبلاگ عطر شالیزار`
      : "وبلاگ برنج و چای ایرانی | عطر شالیزار",
    description: post
      ? (
          post.meta_description ||
          post.excerpt ||
          "مقاله آموزشی درباره برنج و چای ایرانی از وبلاگ عطر شالیزار"
        ).slice(0, 160)
      : "مقالات آموزشی درباره خرید، پخت و نگهداری برنج ایرانی و چای لاهیجان.",
    path: `/blog/${slug}`,
    image: post?.featured_image_url || undefined,
    type: "article",
    noindex: !loading && !post,
    jsonLd: post
      ? [
          buildArticleJsonLd(post),
          buildBreadcrumbJsonLd([
            { name: "خانه", path: "/" },
            { name: "وبلاگ", path: "/blog" },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
          ...(faqs.length ? [buildFaqJsonLd(faqs)] : []),
        ]
      : undefined,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center py-8">در حال بارگذاری...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4 text-foreground">مقاله یافت نشد یا منتشر نشده</h1>
            <Button asChild>
              <Link to="/blog/">بازگشت به وبلاگ</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Get category from tags array
  const category = (post as any).tags ? (post as any).tags[0] : 'عمومی';

  // مدت مطالعه بر اساس حجم واقعی محتوا (نه عدد ثابت)
  const wordCount = String(post.content || "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean).length;
  const readingMinutes = Math.max(3, Math.ceil(wordCount / 180));

  const sameCategoryPosts = blogPosts.filter((p: any) => {
    const pCategory = p.tags ? p.tags[0] : "عمومی";
    return pCategory === category && p.id !== post.id && p.published;
  });

  // اگر هم‌دسته‌ای نبود، جدیدترین مقالات را نشان بده تا صفحه بدون لینک داخلی نماند
  const relatedPosts = (sameCategoryPosts.length
    ? sameCategoryPosts
    : blogPosts.filter((p: any) => p.published && p.id !== post.id)
  ).slice(0, 3);

  const showUpdated =
    post.updated_at &&
    post.created_at &&
    new Date(post.updated_at).getTime() >
      new Date(post.created_at).getTime() + 24 * 60 * 60 * 1000;

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
              <Link to="/blog/" className="hover:text-primary">وبلاگ</Link>
              <span>/</span>
              <span className="text-foreground line-clamp-1">{post.title}</span>
            </div>
          </div>
        </section>

        {/* Post Header */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Badge className="mb-4">{category}</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground leading-tight">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-muted-foreground mb-8">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {(post as any).author_id ? 'نویسنده' : 'سیستم'}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {new Date(post.created_at).toLocaleDateString('fa-IR')}
                </div>
                {showUpdated && (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5" />
                    آخرین به‌روزرسانی:{" "}
                    {new Date(post.updated_at).toLocaleDateString("fa-IR")}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  {readingMinutes.toLocaleString("fa-IR")} دقیقه مطالعه
                </div>
              </div>

              {/* Featured Image */}
              <div className="relative aspect-video rounded-lg overflow-hidden mb-12">
                <img
                  src={post.featured_image_url || '/placeholder.svg'}
                  alt={post.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.src = '/placeholder.svg';
                  }}
                />
              </div>

              {/* Post Content */}
              <article className="prose prose-lg max-w-none mb-12 text-foreground">
                <div className="leading-relaxed" style={{ lineHeight: '1.8' }}>
                  {renderMarkdownContent(post.content || "")}
                </div>
              </article>

              {/* CTA خرید – تبدیل خواننده به مشتری + لینک داخلی به صفحه محصول */}
              {cta && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 md:p-8 mb-12">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-2">
                        قیمت روز را ببینید و مطمئن خرید کنید
                      </h2>
                      <p className="text-muted-foreground leading-7">
                        محصول معرفی‌شده در این مقاله را می‌توانید با قیمت شفاف، انتخاب وزن و
                        ارسال سریع از فروشگاه عطر شالیزار سفارش دهید.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3 shrink-0">
                      <Button asChild size="lg">
                        <Link to={cta.productSlug}>
                          <ShoppingCart className="ml-2 h-5 w-5" />
                          {cta.productLabel}
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="lg">
                        <Link to={cta.categorySlug}>{cta.categoryLabel}</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* سؤالات متداول مقاله – با FAQPage Schema */}
              {faqs.length > 0 && (
                <section className="mb-12">
                  <h2 className="text-2xl md:text-3xl font-bold mb-6 text-foreground">
                    سؤالات متداول
                  </h2>
                  <div className="space-y-3">
                    {faqs.map((faq, i) => (
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

              {/* Share Section */}
              <div className="border-t border-b border-border py-6 mb-12">
                <p className="text-muted-foreground">
                  این مقاله را با دوستان خود به اشتراک بگذارید
                </p>
              </div>

              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <div>
                  <h2 className="text-3xl font-bold mb-6 text-foreground">مقالات مرتبط</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {relatedPosts.map((relatedPost: any) => (
                      <Link key={relatedPost.id} to={`/blog/${relatedPost.slug}/`}>
                        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 h-full group border-border">
                          <div className="relative h-40 overflow-hidden">
                            <img
                              // Fix: Use the actual database column name 'featured_image_url' instead of 'image'
                              src={relatedPost.featured_image_url || '/placeholder.svg'}
                              alt={relatedPost.title}
                              loading="lazy"
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              onError={(e) => {
                                const target = e.currentTarget;
                                target.src = '/placeholder.svg';
                              }}
                            />
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                              {relatedPost.title}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {relatedPost.excerpt}
                            </p>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Back to Blog Button */}
              <div className="mt-12 text-center">
                <Button asChild variant="outline" size="lg">
                  <Link to="/blog/">
                    <ArrowRight className="ml-2 h-5 w-5" />
                    بازگشت به وبلاگ
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BlogPost;
