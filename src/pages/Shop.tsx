import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { categories as sampleCategories } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useSEO, buildBreadcrumbJsonLd } from "@/lib/seo";

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, loading, error } = useProducts();
  const categoryFromUrl = searchParams.get("category");

  const [selectedCategory, setSelectedCategory] = useState<string>(
    categoryFromUrl || "all",
  );
  const [sortBy, setSortBy] = useState("default");
  const [priceRange, setPriceRange] = useState([0, 400000]);

  const categoryLabel =
    selectedCategory === "all"
      ? null
      : sampleCategories.find((c) => c.slug === selectedCategory)?.name;

  // SEO: عنوان و توضیحات اختصاصی فروشگاه (و هر دسته‌بندی)
  useSEO({
    title: categoryLabel
      ? `خرید ${categoryLabel} با بهترین قیمت و کیفیت | عطر شالیزار`
      : "فروشگاه برنج ایرانی | خرید آنلاین انواع برنج با قیمت روز – عطر شالیزار",
    description: categoryLabel
      ? `قیمت روز و خرید اینترنتی ${categoryLabel} اصل از شالیزارهای شمال کشور با انتخاب وزن (۵، ۱۰ و ۲۵ کیلویی) و ارسال سریع به سراسر ایران از فروشگاه عطر شالیزار.`
      : "خرید آنلاین انواع برنج ایرانی (طارم، هاشمی، فجر و شیرودی) با مقایسه قیمت، انتخاب وزن دلخواه و ارسال سریع از فروشگاه اینترنتی عطر شالیزار.",
    path:
      selectedCategory === "all"
        ? "/shop"
        : `/shop?category=${selectedCategory}`,
    jsonLd: buildBreadcrumbJsonLd([
      { name: "خانه", path: "/" },
      { name: "فروشگاه", path: "/shop" },
      ...(categoryLabel
        ? [
            {
              name: categoryLabel,
              path: `/shop?category=${selectedCategory}`,
            },
          ]
        : []),
    ]),
  });

  // Generate categories from products
  const categories = useMemo(() => {
    // Use sample categories data
    return sampleCategories.map((cat) => ({
      name: cat.name,
      slug: cat.slug,
    }));
  }, [products]);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Filter by category
    if (selectedCategory !== "all") {
      // category_id in database is already in english lowercase (hashemi, tarom, fajr, shirodi)
      // So we can directly compare with selectedCategory
      filtered = filtered.filter((p) => p.category_id === selectedCategory);
    }

    // Filter by price range
    filtered = filtered.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1],
    );

    // Sort
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "popular":
        filtered.sort((a, b) => (b.review_count || 0) - (a.review_count || 0));
        break;
    }

    return filtered;
  }, [products, selectedCategory, sortBy, priceRange]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (category === "all") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", category);
    }
    setSearchParams(searchParams);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg text-muted-foreground">
              در حال بارگذاری محصولات...
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold mb-2 text-foreground">
              خطا در بارگذاری
            </h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>تلاش مجدد</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Page Header */}
        <section className="bg-muted/50 py-12 border-b border-border">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              فروشگاه
            </h1>
            <p className="text-lg text-muted-foreground">
              انواع برنج ایرانی با بهترین کیفیت و قیمت
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Filters Sidebar */}
              <aside className="lg:col-span-1">
                <Card className="sticky top-24 border-border">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-6 text-foreground">
                      فیلترها
                    </h2>

                    {/* Category Filter */}
                    <div className="mb-6">
                      <h3 className="font-semibold mb-3 text-foreground">
                        دسته‌بندی
                      </h3>
                      <div className="space-y-2">
                        <Button
                          variant={
                            selectedCategory === "all" ? "default" : "ghost"
                          }
                          className="w-full justify-start"
                          onClick={() => handleCategoryChange("all")}
                        >
                          همه محصولات
                        </Button>
                        {categories.map((cat) => (
                          <Button
                            key={cat.slug}
                            variant={
                              selectedCategory === cat.slug
                                ? "default"
                                : "ghost"
                            }
                            className="w-full justify-start"
                            onClick={() => handleCategoryChange(cat.slug)}
                          >
                            {cat.name}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Price Range Filter */}
                    <div className="mb-6">
                      <h3 className="font-semibold mb-3 text-foreground">
                        محدوده قیمت
                      </h3>
                      <Slider
                        value={priceRange}
                        onValueChange={setPriceRange}
                        max={400000}
                        step={10000}
                        className="mb-4"
                      />
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>
                          {priceRange[0].toLocaleString("fa-IR")} تومان
                        </span>
                        <span>
                          {priceRange[1].toLocaleString("fa-IR")} تومان
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </aside>

              {/* Products Grid */}
              <div className="lg:col-span-3">
                {/* Sort and Count */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                  <p className="text-muted-foreground">
                    {filteredProducts.length} محصول یافت شد
                  </p>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      مرتب‌سازی:
                    </span>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">پیش‌فرض</SelectItem>
                        <SelectItem value="popular">محبوب‌ترین</SelectItem>
                        <SelectItem value="rating">بیشترین امتیاز</SelectItem>
                        <SelectItem value="price-low">ارزان‌ترین</SelectItem>
                        <SelectItem value="price-high">گران‌ترین</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Products */}
                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <Card className="p-12 text-center border-border">
                    <p className="text-muted-foreground text-lg">
                      محصولی با این فیلترها یافت نشد
                    </p>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Shop;
