import { Link } from "react-router-dom";
import { ShoppingCart, Menu, X, User, LogOut, Minus, Plus, Trash2 } from "lucide-react";
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
import { useAuth } from "@/contexts/AuthContext";
import { useAuthOperations } from "@/hooks/useAuthOperations";
import { useCart } from "@/contexts/CartContext";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  const { handleSignOut } = useAuthOperations();
  const { items, itemCount, totalPrice, updateQuantity, removeItem } = useCart();

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      {/* Top bar with phone number */}
      <div className="hidden md:block bg-primary text-primary-foreground py-2 px-4 text-sm">
        <div className="container mx-auto flex justify-end">
          <div className="flex items-center gap-2">
            <span>تلفن سفارشات:</span>
            <span className="font-bold" dir="ltr">09377893307</span>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img 
              src={faviconImage} 
              alt="عطر شالیزار" 
              className="h-10 w-10 object-contain"
            />
            <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              عطر شالیزار
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6" dir="rtl">
            <Link to="/" className="text-foreground hover:text-primary transition-colors">
              خانه
            </Link>
            <Link to="/shop" className="text-foreground hover:text-primary transition-colors">
              فروشگاه
            </Link>
            <Link to="/blog" className="text-foreground hover:text-primary transition-colors">
              وبلاگ
            </Link>
            <Link to="/about" className="text-foreground hover:text-primary transition-colors">
              درباره ما
            </Link>
            <Link to="/contact" className="text-foreground hover:text-primary transition-colors">
              تماس با ما
            </Link>
          </div>

          {/* Cart and Auth Buttons */}
          <div className="flex items-center gap-4">
            {/* Shopping Cart Dropdown */}
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
              <DropdownMenuContent align="end" className="w-80">
                {items.length === 0 ? (
                  <DropdownMenuItem className="text-center py-6 text-muted-foreground">
                    سبد خرید خالی است
                  </DropdownMenuItem>
                ) : (
                  <>
                    <div className="p-2">
                      <h3 className="font-semibold mb-3">سبد خرید</h3>
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {items.map((item) => (
                          <div key={`${item.id}-${item.weight?.value || 'default'}`} className="flex items-center gap-3 p-2 border rounded-lg">
                            <img 
                              src={item.image_url} 
                              alt={item.name} 
                              className="w-12 h-12 object-cover rounded"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">{item.name}</h4>
                              {item.weight && (
                                <p className="text-xs text-muted-foreground">{item.weight.value}</p>
                              )}
                              <p className="text-sm font-semibold text-primary">
                                {item.price.toLocaleString('fa-IR')} تومان
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button 
                                size="icon" 
                                variant="outline" 
                                className="h-6 w-6"
                                onClick={() => updateQuantity(item.id, item.quantity - 1, item.weight?.value)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="mx-2 text-sm min-w-[20px] text-center">{item.quantity}</span>
                              <Button 
                                size="icon" 
                                variant="outline" 
                                className="h-6 w-6"
                                onClick={() => updateQuantity(item.id, item.quantity + 1, item.weight?.value)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                              <Button 
                                size="icon" 
                                variant="outline" 
                                className="h-6 w-6 ml-1"
                                onClick={() => removeItem(item.id, item.weight?.value)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <div className="p-3">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-semibold">مجموع:</span>
                        <span className="font-bold text-primary">
                          {totalPrice.toLocaleString('fa-IR')} تومان
                        </span>
                      </div>
                      <Button className="w-full" size="sm" asChild>
                        <Link to="/cart">
                          مشاهده سبد خرید
                        </Link>
                      </Button>
                    </div>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Authentication Buttons */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="font-medium">
                    {user.user_metadata?.full_name || user.email}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile">
                      <User className="mr-2 h-4 w-4" />
                      پروفایل
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSignOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    خروج
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    ورود
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">
                    ثبت نام
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            {/* Mobile phone number */}
            <div className="md:hidden bg-primary text-primary-foreground py-2 px-4 text-sm mb-4 rounded-lg">
              <div className="flex items-center gap-2 justify-center">
                <span>تلفن سفارشات:</span>
                <span className="font-bold" dir="ltr">09377893307</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-4">
              <Link
                to="/"
                className="text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                خانه
              </Link>
              <Link
                to="/shop"
                className="text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                فروشگاه
              </Link>
              <Link
                to="/blog"
                className="text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                وبلاگ
              </Link>
              <Link
                to="/about"
                className="text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                درباره ما
              </Link>
              <Link
                to="/contact"
                className="text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                تماس با ما
              </Link>
              
              {/* Mobile Auth Buttons */}
              {user ? (
                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-2">
                    {user.user_metadata?.full_name || user.email}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="w-full"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    خروج
                  </Button>
                </div>
              ) : (
                <div className="pt-4 border-t border-border flex flex-col gap-2">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">
                      ورود
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                    <Button size="sm" className="w-full">
                      ثبت نام
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
