import { Link } from "react-router-dom";
import { ShoppingCart, Menu, X, Minus, Plus, Trash2, Phone } from "lucide-react";
import faviconImage from "@/assets/favicon.png";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";

const ORDER_PHONE = "09377893307";
const priceFmt = (n: number) => Number(n || 0).toLocaleString("fa-IR");

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { items, itemCount, totalPrice, updateQuantity, removeItem } = useCart();

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      {/* نوار بالای صفحه با شماره تماس */}
      <div className="hidden md:block bg-primary text-primary-foreground py-2 px-4 text-sm">
        <div className="container mx-auto flex justify-end">
          <div className="flex items-center gap-2">
            <span>تلفن سفارشات:</span>
            <span className="font-bold" dir="ltr">{ORDER_PHONE}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* لوگو */}
          <Link to="/" className="flex items-center gap-3">
            <img src={faviconImage} alt="عطر شالیزار" className="h-10 w-10 object-contain" />
            <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              عطر شالیزار
            </div>
          </Link>

          {/* منوی دسکتاپ */}
          <div className="hidden md:flex items-center gap-6" dir="rtl">
            <Link to="/" className="text-foreground hover:text-primary transition-colors">خانه</Link>
            <Link to="/shop" className="text-foreground hover:text-primary transition-colors">فروشگاه</Link>
            <Link to="/blog" className="text-foreground hover:text-primary transition-colors">وبلاگ</Link>
            <Link to="/about" className="text-foreground hover:text-primary transition-colors">درباره ما</Link>
            <Link to="/contact" className="text-foreground hover:text-primary transition-colors">تماس با ما</Link>
          </div>

          {/* سبد خرید + منوی موبایل */}
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {itemCount > 0 && (
                    <Badge className="absolute -top-1 -left-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center p-0">
                      {itemCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="left" className="w-80">
                {items.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    سبد خرید شما خالی است
                  </div>
                ) : (
                  <>
                    <div className="max-h-64 overflow-y-auto p-2 space-y-3">
                      {items.map((item) => (
                        <div key={`${item.id}-${item.weight?.value || "default"}`} className="flex items-center gap-3 p-2 border rounded-lg">
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded"
                            onError={(e) => { e.currentTarget.src = "/placeholder.svg"; }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.name}</p>
                            {item.weight && <p className="text-xs text-muted-foreground">{item.weight.value}</p>}
                            <div className="flex items-center gap-2 mt-1">
                              <button
                                className="p-1 border rounded"
                                onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1), item.weight?.value)}
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="text-sm">{priceFmt(item.quantity)}</span>
                              <button
                                className="p-1 border rounded"
                                onClick={() => updateQuantity(item.id, item.quantity + 1, item.weight?.value)}
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                              <button
                                className="p-1 text-red-500 mr-auto"
                                onClick={() => removeItem(item.id, item.weight?.value)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <DropdownMenuSeparator />
                    <div className="p-3">
                      <div className="flex justify-between mb-3 text-sm font-bold">
                        <span>مجموع:</span>
                        <span>{priceFmt(totalPrice)} تومان</span>
                      </div>
                      <div className="grid gap-2">
                        <Button asChild size="sm">
                          <Link to="/checkout">مشاهده و ثبت سفارش</Link>
                        </Button>
                        <DropdownMenuItem asChild>
                          <Link to="/cart" className="w-full text-center">مشاهده سبد خرید</Link>
                        </DropdownMenuItem>
                      </div>
                    </div>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
        {/* منوی موبایل */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="md:hidden bg-primary text-primary-foreground py-2 px-4 text-sm mb-4 rounded-lg">
              <div className="flex items-center gap-2 justify-center">
                <Phone className="h-4 w-4" />
                <span>تلفن سفارشات:</span>
                <span className="font-bold" dir="ltr">{ORDER_PHONE}</span>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <Link to="/" className="text-foreground hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>خانه</Link>
              <Link to="/shop" className="text-foreground hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>فروشگاه</Link>
              <Link to="/blog" className="text-foreground hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>وبلاگ</Link>
              <Link to="/about" className="text-foreground hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>درباره ما</Link>
              <Link to="/contact" className="text-foreground hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>تماس با ما</Link>
              <Link to="/cart" className="text-foreground hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>سبد خرید</Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
