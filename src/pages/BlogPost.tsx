import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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
                  src={post.image || '/placeholder-image.jpg'}
                  alt={post.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.src = '/placeholder-image.jpg';
                  }}
                />
              </div>

              {/* Post Content */}
              <article className="prose prose-lg max-w-none mb-12 text-foreground">
                <div
                  className="whitespace-pre-line leading-relaxed"
                  style={{ lineHeight: '1.8' }}
                >
                  {post.content}
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
                              src={relatedPost.image || '/placeholder-image.jpg'}
                              alt={relatedPost.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              onError={(e) => {
                                const target = e.currentTarget;
                                target.src = '/placeholder-image.jpg';
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
