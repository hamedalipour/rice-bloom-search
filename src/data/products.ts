// لایه تایپ‌شده روی داده محصولات.
// منبع حقیقت: products.json — توسط پنل مدیریت محلی (panel/server.cjs) ویرایش می‌شود.
import productsData from "./products.json";

export interface Product {
  id: string;
  name: string;
  slug: string;
  /** اسلاگ انگلیسی دسته‌بندی: tarom | hashemi | fajr | shirodi | chai-siah | chai-sabz | damnoosh */
  category: string;
  price: number;
  originalPrice?: number | null;
  image: string;
  description: string;
  longDescription: string;
  origin: string;
  features: string[];
  weights: { value: string; price: number }[];
  rating: number;
  reviewCount: number;
  inStock: boolean;
  /** سئوی اختصاصی محصول (اختیاری) — در متاتگ‌های صفحه محصول استفاده می‌شود */
  metaTitle?: string | null;
  metaDescription?: string | null;
}

export const products: Product[] = productsData as Product[];

export const categories = [
  { name: "طارم", slug: "tarom" },
  { name: "هاشمی", slug: "hashemi" },
  { name: "فجر", slug: "fajr" },
  { name: "شیرودی", slug: "shirodi" },
  { name: "چای سیاه", slug: "chai-siah" },
  { name: "چای سبز", slug: "chai-sabz" },
  { name: "دمنوش", slug: "damnoosh" },
];

export const categoryName = (slug: string): string =>
  categories.find((c) => c.slug === slug)?.name || slug;
