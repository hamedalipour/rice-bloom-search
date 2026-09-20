import { useEffect } from "react";

/**
 * هسته سئوی سایت — مدیریت title، متاتگ‌ها، canonical، Open Graph و JSON-LD
 * برای هر صفحه به‌صورت خودکار و idempotent انجام می‌شود.
 */

export const SITE = {
  name: "عطر شالیزار",
  url: "https://atre-shalizar.ir",
  description:
    "فروشگاه اینترنتی عطر شالیزار – خرید آنلاین برنج ایرانی اصل (طارم، هاشمی، فجر و شیرودی) مستقیماً از شالیزارهای شمال کشور با بهترین قیمت و ارسال سریع به سراسر ایران.",
  phone: "+989377893307",
  email: "hamedalipour38@gmail.com",
  logo: "/favicon.png",
  ogImage: "/og-image.jpg",
};

/** تبدیل مسیر نسبی تصویر به URL مطلق (برای استفاده در Schema و OG) */
export const absoluteUrl = (path?: string | null): string | undefined => {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;
};

const PAGE_JSONLD_ID = "page-json-ld";

const setMeta = (attr: "name" | "property", key: string, content: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(
    `meta[${attr}="${key}"]`,
  );
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

const setLink = (rel: string, href: string) => {
  let el = document.head.querySelector<HTMLLinkElement>(
    `link[rel="${rel}"]`,
  );
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
};

export interface SEOOptions {
  /** عنوان صفحه (تگ title) */
  title: string;
  /** توضیحات متا – ۱۵۰ تا ۱۶۰ کاراکتر ایده‌آل است */
  description: string;
  /** مسیر canonical صفحه مثل "/product/berenj-tarom" */
  path?: string;
  /** تصویر شاخص برای اشتراک‌گذاری (OG و توییتر) */
  image?: string;
  /** نوع OG – به‌صورت پیش‌فرض website */
  type?: string;
  /** صفحاتی مثل سبد خرید و تسویه‌حساب نباید ایندکس شوند */
  noindex?: boolean;
  /** داده ساختاریافته JSON-LD – آبجکت یا آرایه‌ای از آبجکت‌ها */
  jsonLd?: object | object[];
}

/**
 * هوک سئو — در اولین خط هر صفحه (قبل از returnهای شرطی) فراخوانی شود.
 */
export const useSEO = ({
  title,
  description,
  path = "/",
  image,
  type = "website",
  noindex = false,
  jsonLd,
}: SEOOptions) => {
  const jsonLdKey = JSON.stringify(jsonLd);

  useEffect(() => {
    const canonicalUrl = `${SITE.url}${path === "/" ? "" : path}`;
    const imageUrl = absoluteUrl(image) || absoluteUrl(SITE.ogImage)!;

    document.title = title;

    setMeta("name", "description", description);
    setMeta(
      "name",
      "robots",
      noindex
        ? "noindex, nofollow"
        : "index, follow, max-image-preview:large, max-snippet:-1",
    );
    setLink("canonical", canonicalUrl);


    // Open Graph (تلگرام، واتس‌اپ، فیس‌بوک و ...)
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", canonicalUrl);
    setMeta("property", "og:type", type);
    setMeta("property", "og:image", imageUrl);
    setMeta("property", "og:image:alt", title);
    setMeta("property", "og:site_name", SITE.name);
    setMeta("property", "og:locale", "fa_IR");

    // Twitter Card
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", imageUrl);

    // JSON-LD صفحه جاری (سراسری‌ها در index.html قرار دارند)
    document.getElementById(PAGE_JSONLD_ID)?.remove();
    if (jsonLd) {
      const schema = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = PAGE_JSONLD_ID;
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, path, image, type, noindex, jsonLdKey]);
};

/* ------------------------------------------------------------------ */
/* سازنده‌های داده ساختاریافته (Schema.org)                            */
/* ------------------------------------------------------------------ */

interface BreadcrumbItem {
  name: string;
  /** مسیر نسبی مثل "/shop" */
  path: string;
}

export const buildBreadcrumbJsonLd = (items: BreadcrumbItem[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: absoluteUrl(item.path),
  })),
});

/** خروجی useProducts (اسنک‌کیس دیتابیس) را به Schema محصول تبدیل می‌کند */
export const buildProductJsonLd = (product: any) => {
  const weights = Array.isArray(product?.weights) ? product.weights : [];
  const candidates = [
    ...weights.map((w: any) => Number(w?.price)).filter((n: number) => n > 0),
    Number(product?.price) || 0,
  ];
  const price = candidates.length ? Math.min(...candidates) : 0;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product?.name,
    description:
      product?.meta_description ||
      product?.description ||
      product?.long_description ||
      undefined,
    image: absoluteUrl(product?.image_url || product?.image),
    sku: product?.slug,
    category: product?.category_id || product?.category,
    brand: { "@type": "Brand", name: SITE.name },
    ...(product?.rating > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.rating,
        reviewCount: product.review_count || 1,
        bestRating: 5,
        worstRating: 1,
      },
    }),
    offers: {
      "@type": "Offer",
      url: `${SITE.url}/product/${product?.slug}`,
      priceCurrency: "IRR",
      // قیمت‌ها در سایت تومان است؛ استاندارد ISO ارز ایران «ریال» است (تومان × ۱۰)
      price: String(Math.round(price * 10)),
      availability: product?.in_stock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10),
      seller: { "@type": "Organization", name: SITE.name },
    },
  };
};

/** پست بلاگ (از دیتابیس) را به Schema مقاله تبدیل می‌کند */
export const buildArticleJsonLd = (post: any) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  headline: post?.title,
  description: post?.excerpt || undefined,
  image: absoluteUrl(post?.featured_image_url) || absoluteUrl(SITE.ogImage),
  datePublished: post?.created_at,
  dateModified: post?.updated_at || post?.created_at,
  inLanguage: "fa-IR",
  author: { "@type": "Organization", name: SITE.name },
  publisher: {
    "@type": "Organization",
    name: SITE.name,
    logo: { "@type": "ImageObject", url: absoluteUrl(SITE.logo) },
  },
  mainEntityOfPage: `${SITE.url}/blog/${post?.slug}`,
});

/** لیست محصولات/مقالات برای صفحه‌های فهرستی */
export const buildItemListJsonLd = (
  name: string,
  items: { name: string; path: string }[],
) => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  name,
  numberOfItems: items.length,
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    url: absoluteUrl(item.path),
  })),
});

/** پرسش و پاسخ‌های متداول – برای نتایج غنی (Rich Results) پرسش‌های گوگل */
export const buildFaqJsonLd = (faqs: { question: string; answer: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: f.answer },
  })),
});

/** اطلاعات فروشگاه (Store) – در صفحه تماس استفاده می‌شود */
export const buildStoreJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "Store",
  "@id": `${SITE.url}/#store`,
  name: SITE.name,
  url: SITE.url,
  logo: absoluteUrl(SITE.logo),
  image: absoluteUrl(SITE.ogImage),
  description: SITE.description,
  telephone: SITE.phone,
  email: SITE.email,
  priceRange: "$$",
  address: {
    "@type": "PostalAddress",
    addressLocality: "لاهیجان",
    addressRegion: "گیلان",
    addressCountry: "IR",
  },
});

