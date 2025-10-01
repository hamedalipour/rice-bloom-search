import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { products } from "@/data/products";
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
  const product = products.find((p) => p.slug === slug);
  const [selectedWeight, setSelectedWeight] = useState(0);
  const [quantity, setQuantity] = useState(1);

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
    (p) => p.category === product.category && p.id !== product.id
  );

  const selectedPrice = product.weights[selectedWeight].price;
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    toast.success("محصول به سبد خرید اضافه شد", {
      description: `${product.name} - ${product.weights[selectedWeight].value}`,
    });
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
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
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
                          i < Math.floor(product.rating)
                            ? "fill-primary text-primary"
                            : "text-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-foreground font-medium">{product.rating}</span>
                  <span className="text-muted-foreground">
                    ({product.reviewCount} نظر)
                  </span>
                </div>

                {/* Price */}
                <div className="mb-6 p-6 bg-muted/50 rounded-lg">
                  {product.originalPrice && (
                    <span className="text-xl text-muted-foreground line-through block mb-2">
                      {product.originalPrice.toLocaleString('fa-IR')} تومان
                    </span>
                  )}
                  <span className="text-3xl font-bold text-primary">
                    {selectedPrice.toLocaleString('fa-IR')} تومان
                  </span>
                </div>

                {/* Description */}
                <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                  {product.longDescription}
                </p>

                {/* Origin */}
                <div className="mb-6">
                  <h3 className="font-bold text-lg mb-2 text-foreground">منبع تولید:</h3>
                  <p className="text-muted-foreground">{product.origin}</p>
                </div>

                {/* Features */}
                <div className="mb-6">
                  <h3 className="font-bold text-lg mb-3 text-foreground">ویژگی‌ها:</h3>
                  <ul className="space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weight Selection */}
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
                      {product.weights.map((weight, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          {weight.value} - {weight.price.toLocaleString('fa-IR')} تومان
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Add to Cart */}
                <Button
                  size="lg"
                  className="w-full gap-2 mb-6"
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {product.inStock ? "افزودن به سبد خرید" : "ناموجود"}
                </Button>

                {/* Trust Badges */}
                <div className="grid grid-cols-3 gap-4">
                  <Card className="border-border">
                    <CardContent className="p-4 text-center">
                      <Truck className="h-6 w-6 text-primary mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">ارسال رایگان</p>
                    </CardContent>
                  </Card>
                  <Card className="border-border">
                    <CardContent className="p-4 text-center">
                      <Shield className="h-6 w-6 text-primary mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">ضمانت اصالت</p>
                    </CardContent>
                  </Card>
                  <Card className="border-border">
                    <CardContent className="p-4 text-center">
                      <CheckCircle2 className="h-6 w-6 text-primary mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">کیفیت تضمینی</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold text-foreground">محصولات مشابه</h2>
                  <Button asChild variant="outline">
                    <Link to="/shop">
                      مشاهده همه
                      <ArrowRight className="mr-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {relatedProducts.slice(0, 4).map((relatedProduct) => (
                    <ProductCard key={relatedProduct.id} product={relatedProduct} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
