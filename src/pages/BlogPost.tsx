import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { blogPosts } from "@/data/blogPosts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const BlogPost = () => {
  const { slug } = useParams();
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4 text-foreground">مقاله یافت نشد</h1>
            <Button asChild>
              <Link to="/blog">بازگشت به وبلاگ</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const relatedPosts = blogPosts.filter(
    (p) => p.category === post.category && p.id !== post.id
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
              <Badge className="mb-4">{post.category}</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground leading-tight">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-muted-foreground mb-8">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {post.author}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {post.date}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  {post.readTime}
                </div>
              </div>

              {/* Featured Image */}
              <div className="relative aspect-video rounded-lg overflow-hidden mb-12">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Post Content */}
              <article className="prose prose-lg max-w-none mb-12 text-foreground">
                <div
                  className="whitespace-pre-line leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
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
                    {relatedPosts.map((relatedPost) => (
                      <Link key={relatedPost.id} to={`/blog/${relatedPost.slug}`}>
                        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 h-full group border-border">
                          <div className="relative h-40 overflow-hidden">
                            <img
                              src={relatedPost.image}
                              alt={relatedPost.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
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
