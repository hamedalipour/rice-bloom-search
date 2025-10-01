import React from "react";
import { ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import type { Tables } from "@/integrations/supabase/types";

type Product = Tables<'products'>;

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem, isInCart, getCartItemQuantity } = useCart();
  
  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      image_url: product.image_url || '',
      price: product.price,
      inStock: product.in_stock || false,
    });
  };

  const itemInCart = isInCart(product.id);
  const cartQuantity = getCartItemQuantity(product.id);

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-border">
      <Link to={`/product/${product.slug}`}>
        <div className="relative overflow-hidden bg-muted aspect-square">
          <img
            src={product.image_url || '/placeholder-image.jpg'}
            alt={product.name}
            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
          {discount > 0 && (
            <Badge className="absolute top-3 right-3 bg-destructive text-destructive-foreground">
              {discount}٪ تخفیف
            </Badge>
          )}
          {!product.in_stock && (
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
          <span className="text-sm font-medium text-foreground">{product.rating || 0}</span>
          <span className="text-xs text-muted-foreground">({product.review_count || 0} نظر)</span>
        </div>

        <div className="flex items-center gap-2">
          {product.original_price && (
            <span className="text-sm text-muted-foreground line-through">
              {product.original_price.toLocaleString('fa-IR')} تومان
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
          disabled={!product.in_stock}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="h-4 w-4" />
          {itemInCart ? `در سبد (${cartQuantity})` : "افزودن به سبد خرید"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;