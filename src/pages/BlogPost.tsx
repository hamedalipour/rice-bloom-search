import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import {
  useSEO,
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
} from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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
          <Link key={i} to={href} className="text-primary font-medium underline decoration-primary/40 underline-offset-4 hover:text-primary/80">
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

  // SEO: عنوان، توضیحات، تصویر شاخص و داده ساختاریافته مقاله
  useSEO({
    title: post ? `${post.title} | وبلاگ عطر شالیزار` : "وبلاگ عطر شالیزار",
    description: post
      ? (post.excerpt ||
          "مقاله آموزشی درباره برنج ایرانی از وبلاگ عطر شالیزار").slice(0, 160)
      : "مقالات آموزشی درباره برنج ایرانی",
    path: `/blog/${slug}`,
    image: post?.featured_image_url || undefined,
    type: "article",
    jsonLd: post
      ? [
          buildArticleJsonLd(post),
          buildBreadcrumbJsonLd([
            { name: "خانه", path: "/" },
            { name: "وبلاگ", path: "/blog" },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
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
              <Link to="/blog">بازگشت به وبلاگ</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Get category from tags array
  const category = (post as any).tags ? (post as any).tags[0] : 'عمومی';
  
  // Find related posts by same category
  const relatedPosts = blogPosts.filter(
    (p: any) => {
      const pCategory = p.tags ? p.tags[0] : 'عمومی';
      return pCategory === category && p.id !== post.id && p.published;
    }
  ).slice(0, 3);

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
              <Link to="/blog" className="hover:text-primary">وبلاگ</Link>
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
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  ۵ دقیقه
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
                      <Link key={relatedPost.id} to={`/blog/${relatedPost.slug}`}>
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
                  <Link to="/blog">
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
