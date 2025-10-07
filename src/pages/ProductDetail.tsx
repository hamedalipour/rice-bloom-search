import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/contexts/CartContext";
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart, CheckCircle2, Truck, Shield, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import ProductCard from "@/components/ProductCard";

const ProductDetail = () => {
  const { slug } = useParams();
  const { products } = useProducts();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWeight, setSelectedWeight] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addItem, isInCart, getCartItemQuantity } = useCart();

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      setError("آدرس محصول نامعتبر است");
      return;
    }

    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setLoading(false);
      setError("زمان بارگذاری به پایان رسید. لطفاً دوباره تلاش کنید.");
    }, 5000); // 5 second timeout

    // Try to find the product in the available products
    const foundProduct = products.find(p => p.slug === slug);
    
    if (foundProduct) {
      clearTimeout(timeoutId);
      setProduct(foundProduct);
      setLoading(false);
      setError(null);
    } else {
      // Simple approach - just show not found if not in products list
      clearTimeout(timeoutId);
      setLoading(false);
      setError("محصول یافت نشد");
    }

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
    };
  }, [slug, products]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">در حال بارگذاری...</h1>
            <p className="text-muted-foreground">لطفاً صبر کنید</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4 text-foreground">خطا در بارگذاری محصول</h1>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button asChild>
              <Link to="/shop">بازگشت به فروشگاه</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4 text-foreground">محصول یافت نشد</h1>
            <Button asChild>
              <Link to="/shop">بازگشت به فروشگاه</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const relatedProducts = products.filter(
    (p) => p.id !== product.id
  ).slice(0, 4);

  const weights = Array.isArray(product.weights) ? product.weights : [];
  const features = Array.isArray(product.features) ? product.features : [];
  const selectedPrice = weights[selectedWeight]?.price || product.price || 0;
  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  const handleAddToCart = () => {
    if (!product) return;
    
    try {
      const selectedWeightData = weights[selectedWeight] || { value: "پیش‌فرض", price: product.price };
      
      addItem({
        id: product.id,
        name: product.name,
        slug: product.slug,
        image_url: product.image_url || product.image || '',
        price: selectedWeightData.price,
        weight: selectedWeightData,
        inStock: product.in_stock,
      }, quantity);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error("خطا در افزودن به سبد خرید");
    }
  };

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
              <Link to="/shop" className="hover:text-primary">فروشگاه</Link>
              <span>/</span>
              <span className="text-foreground">{product.name}</span>
            </div>
          </div>
        </section>

        {/* Product Details */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
              {/* Product Image */}
              <div className="space-y-4">
                <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                  <img
                    src={product.image_url || '/placeholder-image.jpg'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-image.jpg';
                    }}
                  />
                  {discount > 0 && (
                    <Badge className="absolute top-4 right-4 bg-destructive text-destructive-foreground text-lg px-4 py-2">
                      {discount}٪ تخفیف
                    </Badge>
                  )}
                </div>
              </div>

              {/* Product Info */}
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                  {product.name}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(product.rating || 0)
                            ? "fill-primary text-primary"
                            : "text-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-foreground font-medium">{product.rating}</span>
                  <span className="text-muted-foreground">
                    ({product.review_count} نظر)
                  </span>
                </div>

                {/* Price */}
                <div className="mb-6 p-6 bg-muted/50 rounded-lg">
                  {product.original_price && (
                    <span className="text-xl text-muted-foreground line-through block mb-2">
                      {product.original_price.toLocaleString('fa-IR')} تومان
                    </span>
                  )}
                  <span className="text-3xl font-bold text-primary">
                    {selectedPrice.toLocaleString('fa-IR')} تومان
                  </span>
                </div>

                {/* Description */}
                <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                  {product.long_description}
                </p>

                {/* Origin */}
                <div className="mb-6">
                  <h3 className="font-bold text-lg mb-2 text-foreground">منبع تولید:</h3>
                  <p className="text-muted-foreground">{product.origin}</p>
                </div>

                {/* Features */}
                {features.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-bold text-lg mb-3 text-foreground">ویژگی‌ها:</h3>
                    <ul className="space-y-2">
                      {features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-muted-foreground">
                          <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Weight Selection */}
                {weights.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-bold text-lg mb-3 text-foreground">انتخاب وزن:</h3>
                    <Select
                      value={selectedWeight.toString()}
                      onValueChange={(value) => setSelectedWeight(parseInt(value))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {weights.map((weight, index) => (
                          <SelectItem key={index} value={index.toString()}>
                            {weight.value} - {weight.price.toLocaleString('fa-IR')} تومان
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Add to Cart */}
                <Button
                  size="lg"
                  className="w-full gap-2 mb-6"
                  onClick={handleAddToCart}
                  disabled={!product.in_stock}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {product.in_stock ? (
                    isInCart(product.id, weights[selectedWeight]?.value) 
                      ? `در سبد (${getCartItemQuantity(product.id, weights[selectedWeight]?.value)})` 
                      : "افزودن به سبد خرید"
                  ) : (
                    "ناموجود"
                  )}
                </Button>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-4 border border-border rounded-lg">
                    <Truck className="h-6 w-6 text-primary" />
                    <div>
                      <p className="font-semibold text-foreground">ارسال رایگان</p>
                      <p className="text-sm text-muted-foreground">برای خرید بالای ۲۰۰ هزار تومان</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 border border-border rounded-lg">
                    <Shield className="h-6 w-6 text-primary" />
                    <div>
                      <p className="font-semibold text-foreground">ضمانت کیفیت</p>
                      <p className="text-sm text-muted-foreground">ضمانت بازگشت ۷ روزه</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 border border-border rounded-lg">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                    <div>
                      <p className="font-semibold text-foreground">اصالت محصول</p>
                      <p className="text-sm text-muted-foreground">۱۰۰٪ اصل و مرغوب</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                    محصولات مشابه
                  </h2>
                  <Button asChild variant="outline">
                    <Link to="/shop">
                      مشاهده همه
                      <ArrowRight className="mr-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {relatedProducts.map((relatedProduct) => (
                    <ProductCard key={relatedProduct.id} product={relatedProduct} />
                  ))}
                </div>
              </section>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;