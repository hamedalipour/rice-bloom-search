import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSEO } from "@/lib/seo";
import { logInvalidRouteAccess } from "@/lib/routeUtils";

const NotFound = () => {
  const location = useLocation();

  // SEO: صفحه 404 نباید توسط موتورهای جستجو ایندکس شود
  useSEO({
    title: "صفحه یافت نشد (404) | عطر شالیزار",
    description:
      "صفحه مورد نظر در فروشگاه عطر شالیزار پیدا نشد؛ از فروشگاه برنج ایرانی ما دیدن کنید.",
    path: location.pathname,
    noindex: true,
  });

  useEffect(() => {

    // Log the invalid route access
    logInvalidRouteAccess(location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center px-4 py-16">
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-gray-300 mb-4">404</h1>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              صفحه یافت نشد
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
              متأسفانه صفحه‌ای که به دنبال آن هستید وجود ندارد یا حذف شده است.
            </p>
          </div>
          
          <div className="space-x-4 space-x-reverse">
            <Button asChild size="lg">
              <Link to="/">
                <Home className="ml-2 h-4 w-4" />
                بازگشت به خانه
              </Link>
            </Button>
            
            <Button asChild variant="outline" size="lg">
              <Link to="/shop">
                مشاهده محصولات
                <ArrowRight className="mr-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default NotFound;
