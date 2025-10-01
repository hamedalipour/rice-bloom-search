import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { blogPosts, blogCategories } from "@/data/blogPosts";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User } from "lucide-react";

const Blog = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Page Header */}
        <section className="bg-muted/50 py-12 border-b border-border">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">وبلاگ</h1>
            <p className="text-lg text-muted-foreground">
              مقالات آموزشی درباره برنج و نحوه پخت آن
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            {/* Categories */}
            <div className="flex flex-wrap gap-2 mb-8">
              <Badge variant="default" className="cursor-pointer">
                همه مقالات
              </Badge>
              {blogCategories.map((category) => (
                <Badge
                  key={category.slug}
                  variant="outline"
                  className="cursor-pointer hover:bg-accent"
                >
                  {category.name}
                </Badge>
              ))}
            </div>

            {/* Blog Posts */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post) => (
                <Link key={post.id} to={`/blog/${post.slug}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 h-full group border-border">
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">
                        {post.category}
                      </Badge>
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {post.date}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {post.readTime}
                        </div>
                      </div>

                      <h2 className="text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h2>

                      <p className="text-muted-foreground mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        {post.author}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
