import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { CATEGORY_PAGES } from "@/data/products";
import { useSEO, buildBreadcrumbJsonLd, buildItemListJsonLd } from "@/lib/seo";
import NotFound from "@/pages/NotFound";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

/** صفحه دسته‌بندی اختصاصی (/category/berenj و /category/chai) برای سئوی هر گروه محصول */
const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const page = CATEGORY_PAGES.find((c) => c.slug === slug);
  const { products, loading } = useProducts();
  const { blogPosts } = useBlogPosts();

  const categoryProducts = page
    ? products.filter((p) => (page.ids as readonly string[]).includes(p.category_id))
    : [];

  const relatedPosts = page
    ? blogPosts.filter((b) => b.published && (page.blogSlugs as readonly string[]).includes(b.slug))
    : [];

  useSEO({
    title: page ? page.seoTitle : "دسته‌بندی یافت نشد | عطر شالیزار",
    description: page
      ? page.seoDescription
      : "فروشگاه اینترنتی عطر شالیزار – خرید آنلاین برنج و چای ایرانی اصل مستقیماً از شالیزارهای شمال کشور.",
    path: page ? `/category/${page.slug}` : "/",
    jsonLd: page
      ? [
          buildBreadcrumbJsonLd([
            { name: "خانه", path: "/" },
            { name: "فروشگاه", path: "/shop" },
            { name: page.name, path: `/category/${page.slug}` },
          ]),
          buildItemListJsonLd(
            page.name,
            categoryProducts.map((p) => ({ name: p.name, path: `/product/${p.slug}` })),
          ),
        ]
      : undefined,
  });

  if (!page) return <NotFound />;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* سربرگ دسته‌بندی */}
        <section className="bg-muted/30 py-14 border-b border-border">
          <div className="container mx-auto px-4">
            <nav className="text-sm text-muted-foreground mb-4" aria-label="breadcrumb">
              <Link to="/" className="hover:text-primary">خانه</Link>
              <span className="mx-2">/</span>
              <Link to="/shop" className="hover:text-primary">فروشگاه</Link>
              <span className="mx-2">/</span>
              <span className="text-foreground">{page.name}</span>
            </nav>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">{page.h1}</h1>
            <div className="max-w-3xl space-y-3 text-muted-foreground leading-8">
              {(page.intro as readonly string[]).map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </div>
        </section>

        {/* محصولات دسته */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                محصولات {page.name}
              </h2>
              <p className="text-muted-foreground">{categoryProducts.length} محصول</p>
            </div>

            {loading ? (
              <div className="text-center py-12 text-muted-foreground">در حال بارگذاری محصولات...</div>
            ) : categoryProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {categoryProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                محصولی در این دسته یافت نشد.
              </div>
            )}

            <div className="mt-10 text-center">
              <Button asChild variant="outline">
                <Link to="/shop">
                  مشاهده همه محصولات فروشگاه
                  <ArrowRight className="mr-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* مقالات مرتبط – لینک‌سازی داخلی */}
        {relatedPosts.length > 0 && (
          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl md:text-3xl font-bold mb-8 text-foreground">
                راهنمای خرید {page.name} – از وبلاگ
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((post) => (
                  <Link key={post.id} to={`/blog/${post.slug}`}>
                    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 h-full border-border">
                      <div className="relative h-40 overflow-hidden">
                        <img
                          src={post.featured_image_url || "/placeholder.svg"}
                          alt={post.title}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg";
                          }}
                        />
                      </div>
                      <CardContent className="p-5">
                        <h3 className="font-bold mb-2 text-foreground hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CategoryPage;
