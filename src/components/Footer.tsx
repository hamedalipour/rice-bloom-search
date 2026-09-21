import { Link } from "react-router-dom";
import { Phone, Mail, MapPin } from "lucide-react";
import faviconImage from "@/assets/favicon.png";

const Footer = () => {
  const year = new Date().toLocaleDateString("fa-IR", { year: "numeric" });

  return (
    <footer className="bg-muted/50 border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img 
                src={faviconImage} 
                alt="عطر شالیزار" 
                className="h-12 w-12 object-contain"
              />
              <h3 className="text-lg font-bold text-foreground">عطر شالیزار</h3>
            </div>
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
                <Link to="/category/berenj" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">
                  برنج ایرانی اصل
                </Link>
              </li>
              <li>
                <Link to="/category/chai" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">
                  چای ایرانی لاهیجان
                </Link>
              </li>
              <li>
                <Link to="/product/chai-siah-lahijan-daraje-yek" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  چای سیاه لاهیجان درجه یک
                </Link>
              </li>
              <li>
                <Link to="/product/chai-sabz-barooti-gilan" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  چای سبز باروتی گیلان
                </Link>
              </li>
              <li>
                <Link to="/product/damnoosh-aramesh-gol-mohammadi" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  دمنوش آرامش گل محمدی
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
                <span dir="ltr">09354299785 علیپور</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground text-sm">
                <Mail className="h-4 w-4 text-primary" />
                hamedalipour38@gmail.com
              </li>
              <li className="flex items-start gap-2 text-muted-foreground text-sm">
                <MapPin className="h-4 w-4 text-primary mt-1" />
                <span>گیلان ، لاهیجان </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">
            © {year} عطر شالیزار. تمامی حقوق محفوظ است.
          </p>
          <a
            referrerpolicy="origin"
            target="_blank"
            href="https://trustseal.enamad.ir/?id=695498&Code=gxLZrsDM5sXpG2L7zbLC236ex2ihsq1O"
            aria-label="نماد اعتماد الکترونیکی – عطر شالیزار"
          >
            <img
              referrerpolicy="origin"
              src="https://trustseal.enamad.ir/logo.aspx?id=695498&Code=gxLZrsDM5sXpG2L7zbLC236ex2ihsq1O"
              alt="نماد اعتماد الکترونیکی"
              className="h-24 w-auto"
            />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
