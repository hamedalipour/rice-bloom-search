import { Link } from "react-router-dom";
import { ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/data/products";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-border">
      <Link to={`/product/${product.slug}`}>
        <div className="relative overflow-hidden bg-muted aspect-square">
          <img
            src={product.image}
            alt={product.name}
            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
          {discount > 0 && (
            <Badge className="absolute top-3 right-3 bg-destructive text-destructive-foreground">
              {discount}٪ تخفیف
            </Badge>
          )}
          {!product.inStock && (
            <Badge className="absolute top-3 right-3 bg-muted text-muted-foreground">
              ناموجود
            </Badge>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        <Link to={`/product/${product.slug}`}>
          <h3 className="font-bold text-lg mb-2 text-foreground hover:text-primary transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{product.description}</p>
        
        <div className="flex items-center gap-1 mb-3">
          <Star className="h-4 w-4 fill-primary text-primary" />
          <span className="text-sm font-medium text-foreground">{product.rating}</span>
          <span className="text-xs text-muted-foreground">({product.reviewCount} نظر)</span>
        </div>

        <div className="flex items-center gap-2">
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {product.originalPrice.toLocaleString('fa-IR')} تومان
            </span>
          )}
          <span className="text-lg font-bold text-primary">
            {product.price.toLocaleString('fa-IR')} تومان
          </span>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button 
          variant="default" 
          className="w-full gap-2" 
          disabled={!product.inStock}
        >
          <ShoppingCart className="h-4 w-4" />
          افزودن به سبد خرید
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
