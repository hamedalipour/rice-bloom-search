import { Link } from "react-router-dom";
import { Phone, Mail, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-muted/50 border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-foreground">عطر شالیزار</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              فروشگاه آنلاین برنج ایرانی اصل با بهترین کیفیت و قیمت مناسب. اعتماد شما سرمایه ماست.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-foreground">دسترسی سریع</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/shop" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  فروشگاه
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  وبلاگ
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  درباره ما
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  تماس با ما
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-foreground">دسته‌بندی‌ها</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/shop?category=tarom" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  برنج طارم
                </Link>
              </li>
              <li>
                <Link to="/shop?category=hashemi" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  برنج هاشمی
                </Link>
              </li>
              <li>
                <Link to="/shop?category=fajr" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  برنج فجر
                </Link>
              </li>
              <li>
                <Link to="/shop?category=shirudi" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  برنج شیرودی
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-foreground">تماس با ما</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-muted-foreground text-sm">
                <Phone className="h-4 w-4 text-primary" />
                <span dir="ltr">021-12345678</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground text-sm">
                <Mail className="h-4 w-4 text-primary" />
                info@atrshalizar.ir
              </li>
              <li className="flex items-start gap-2 text-muted-foreground text-sm">
                <MapPin className="h-4 w-4 text-primary mt-1" />
                <span>تهران، خیابان ولیعصر، پلاک ۱۲۳</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center">
          <p className="text-muted-foreground text-sm">
            © ۱۴۰۳ عطر شالیزار. تمامی حقوق محفوظ است.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
