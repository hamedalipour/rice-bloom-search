import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { products, categories } from "@/data/products";
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

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get("category");
  
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryFromUrl || "all");
  const [sortBy, setSortBy] = useState("default");
  const [priceRange, setPriceRange] = useState([0, 400000]);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((p) => p.category.toLowerCase() === selectedCategory);
    }

    // Filter by price range
    filtered = filtered.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Sort
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "popular":
        filtered.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
    }

    return filtered;
  }, [selectedCategory, sortBy, priceRange]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (category === "all") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", category);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Page Header */}
        <section className="bg-muted/50 py-12 border-b border-border">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">فروشگاه</h1>
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
                    <h2 className="text-xl font-bold mb-6 text-foreground">فیلترها</h2>

                    {/* Category Filter */}
                    <div className="mb-6">
                      <h3 className="font-semibold mb-3 text-foreground">دسته‌بندی</h3>
                      <div className="space-y-2">
                        <Button
                          variant={selectedCategory === "all" ? "default" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => handleCategoryChange("all")}
                        >
                          همه محصولات
                        </Button>
                        {categories.map((cat) => (
                          <Button
                            key={cat.slug}
                            variant={selectedCategory === cat.slug ? "default" : "ghost"}
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
                      <h3 className="font-semibold mb-3 text-foreground">محدوده قیمت</h3>
                      <Slider
                        value={priceRange}
                        onValueChange={setPriceRange}
                        max={400000}
                        step={10000}
                        className="mb-4"
                      />
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{priceRange[0].toLocaleString('fa-IR')} تومان</span>
                        <span>{priceRange[1].toLocaleString('fa-IR')} تومان</span>
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
                    <span className="text-sm text-muted-foreground">مرتب‌سازی:</span>
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
