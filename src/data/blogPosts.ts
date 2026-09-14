// لایه تایپ‌شده روی داده مقالات وبلاگ.
// منبع حقیقت: blogPosts.json — توسط پنل مدیریت محلی (panel/server.cjs) ویرایش می‌شود.
// شکل داده مطابق همان ساختاری است که صفحات وبلاگ از قبل مصرف می‌کنند.
import blogPostsData from "./blogPosts.json";

export interface BlogPostRow {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image_url: string;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  meta_title: string | null;
  meta_description: string | null;
  tags: string[];
}

export const blogPosts: BlogPostRow[] = blogPostsData as BlogPostRow[];

export const blogCategories = [
  { name: "دستور پخت", slug: "recipe" },
  { name: "دانستنی‌ها", slug: "knowledge" },
  { name: "اخبار", slug: "news" },
];
