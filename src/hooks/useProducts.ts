import { useEffect, useState } from "react";
import {
  products as localProducts,
  categoryName,
} from "@/data/products";

/**
 * شکل ردیف محصول که صفحات از قبل مصرف می‌کنند (همان ساختار جدول products).
 * داده از فایل محلی خوانده می‌شود؛ منبع حقیقت: src/data/products.json
 * که با پنل مدیریت محلی (panel/server.cjs) ویرایش و به گیت‌هاب پوش می‌شود.
 */
export type Product = {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  category_name: string;
  price: number;
  original_price: number | null;
  image_url: string;
  description: string;
  long_description: string;
  origin: string;
  features: string[];
  weights: { value: string; price: number }[];
  rating: number;
  review_count: number;
  in_stock: boolean;
  gallery_images: string[];
  is_featured: boolean;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
};

/** تبدیل داده محلی (camelCase) به شکل ردیف دیتابیس (snake_case) */
export const toProductRow = (p: (typeof localProducts)[number]): Product => ({
  id: p.id,
  name: p.name,
  slug: p.slug,
  category_id: p.category,
  category_name: categoryName(p.category),
  price: p.price,
  original_price: p.originalPrice ?? null,
  image_url: p.image,
  description: p.description || "توضیحی ارائه نشده",
  long_description: p.longDescription || "توضیحات کامل ارائه نشده",
  origin: p.origin || "نامشخص",
  features: p.features || [],
  weights: p.weights || [],
  rating: p.rating || 0,
  review_count: p.reviewCount || 0,
  in_stock: p.inStock !== undefined ? p.inStock : true,
  gallery_images: [],
  is_featured: false,
  meta_title: p.metaTitle ?? null,
  meta_description: p.metaDescription ?? null,
  created_at: "",
  updated_at: "",
});

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // داده محصول کاملاً استاتیک و باندل‌شده است؛ هیچ درخواست شبکه‌ای لازم نیست.
      setProducts(localProducts.map(toProductRow));
      setError(null);
    } catch (err) {
      console.error("Error loading local products:", err);
      setError(err instanceof Error ? err.message : "خطا در بارگذاری محصولات");
    } finally {
      setLoading(false);
    }
  }, []);

  return { products, loading, error };
};
