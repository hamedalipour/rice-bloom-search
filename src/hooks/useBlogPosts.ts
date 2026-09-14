import { useEffect, useState } from "react";
import { blogPosts as localBlogPosts, type BlogPostRow } from "@/data/blogPosts";

/**
 * مقالات وبلاگ از فایل محلی خوانده می‌شوند؛ منبع حقیقت: src/data/blogPosts.json
 * که با پنل مدیریت محلی (panel/server.cjs) ویرایش و به گیت‌هاب پوش می‌شود.
 */
export type BlogPost = BlogPostRow;

export const useBlogPosts = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // مرتب‌سازی: جدیدترین اول (مطابق رفتار قبلی دیتابیس)
      const sorted = [...localBlogPosts].sort((a, b) =>
        (b.created_at || "").localeCompare(a.created_at || ""),
      );
      setBlogPosts(sorted);
      setError(null);
    } catch (err) {
      console.error("Error loading local blog posts:", err);
      setError(err instanceof Error ? err.message : "خطا در بارگذاری مقالات");
    } finally {
      setLoading(false);
    }
  }, []);

  /** سازگار با API قبلی: یافتن مقاله بر اساس اسلاگ */
  const getBlogPostBySlug = (slug: string): { data: BlogPost | null } => {
    const found = localBlogPosts.find((p) => p.slug === slug) || null;
    return { data: found };
  };

  /** برای سازگاری با API قبلی نگه داشته شده؛ داده استاتیک است و کاری نمی‌کند. */
  const fetchBlogPosts = () => {
    /* داده محلی و استاتیک است — نیازی به دریافت مجدد نیست */
  };

  return { blogPosts, loading, error, getBlogPostBySlug, fetchBlogPosts };
};
