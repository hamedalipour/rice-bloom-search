import { useEffect } from "react";

/**
 * هسته سئوی سایت — مدیریت title، متاتگ‌ها، canonical، Open Graph و JSON-LD
 * برای هر صفحه به‌صورت خودکار و idempotent انجام می‌شود.
 */

export const SITE = {
  name: "عطر شالیزار",
  alternateName: "Atre Shalizar",
  url: "https://atre-shalizar.ir",
  description:
    "فروشگاه اینترنتی عطر شالیزار – خرید آنلاین برنج ایرانی اصل (هاشمی معطر، طارم، فجر و شیرودی) و چای لاهیجان (سیاه، بهاره و چوب) مستقیماً از شالیزارها و باغ‌های شمال کشور با قیمت روز و ارسال سریع به سراسر ایران.",
  phone: "+989354299785",
  email: "hamedalipour38@gmail.com",
  logo: "/favicon.png",
  ogImage: "/og-image.jpg",
  address: {
    streetAddress:
      "لاهیجان، میدان چهارپادشاه، خیابان کاشف غربی، نبش کاشف غربی پنج، فروشگاه مهدوی",
    addressLocality: "لاهیجان",
    addressRegion: "گیلان",
    addressCountry: "IR",
  },
};

/** تبدیل مسیر نسبی تصویر به URL مطلق (برای استفاده در Schema و OG) */
export const absoluteUrl = (path?: string | null): string | undefined => {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;
};

/**
 * نرمال‌سازی مسیر صفحه به شکل canonical.
 * GitHub Pages هر مسیر را از پوشه‌ی هم‌نام سرو می‌کند و آدرس بدون اسلش را
 * با 301 به آدرس اسلش‌دار هدایت می‌کند؛ پس canonical هم باید اسلش پایانی داشته باشد
 * تا سیگنال‌های تکراری (بدون اسلش / با اسلش) به یک URL واحد اشاره کنند.
 */
export const canonicalPath = (path = "/"): string => {
  const [rawPath = "/"] = String(path).split(/[?#]/);
  let normalized = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
  normalized = normalized.replace(/\/{2,}/g, "/");
  if (!normalized.endsWith("/")) normalized += "/";
  return normalized;
};

/** آدرس مطلق canonical یک صفحه */
export const canonicalUrl = (path = "/"): string =>
  `${SITE.url}${canonicalPath(path)}`;

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
    const pageUrl = canonicalUrl(path);
    const imageUrl = absoluteUrl(image) || absoluteUrl(SITE.ogImage)!;

    document.title = title;

    setMeta("name", "description", description);
    setMeta(
      "name",
      "robots",
      noindex
        ? "noindex, follow"
        : "index, follow, max-image-preview:large, max-snippet:-1",
    );
    setLink("canonical", pageUrl);

    // Open Graph (تلگرام، واتس‌اپ، فیس‌بوک و ...)
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", pageUrl);
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
    item: canonicalUrl(item.path),
  })),
});

/** قیمت‌ها در سایت تومان است؛ استاندارد ISO ارز ایران «ریال» است (تومان × ۱۰) */
const toRial = (toman: number): string => String(Math.round(toman * 10));

/** تاریخ اعتبار قیمت — یک سال آینده (قیمت‌های محصولات ثابت و دستی هستند) */
const priceValidUntil = (): string =>
  new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

/** خروجی useProducts (اسنک‌کیس دیتابیس) را به Schema محصول تبدیل می‌کند */
export const buildProductJsonLd = (product: any) => {
  const weights: any[] = Array.isArray(product?.weights) ? product.weights : [];
  const weightPrices: number[] = weights
    .map((w: any) => Number(w?.price))
    .filter((n: number) => n > 0);

  /**
   * اگر وزن‌های قیمت‌دار وجود دارند، فقط همان‌ها منبع قیمت هستند.
   * price پایه در برخی محصولات «قیمت هر کیلو» است و با بسته‌ی پیش‌فرض
   * (مثلاً ۵ کیلوگرم) یکی نیست؛ افزودنش به بازه، قیمت نادرست می‌سازد.
   */
  const candidates: number[] = weightPrices.length
    ? weightPrices
    : [Number(product?.price) || 0].filter((n: number) => n > 0);

  // قیمت‌های یکتا و مرتب‌شده برای تشخیص بازه
  const distinct = [...new Set<number>(candidates)].sort((a, b) => a - b);
  const productUrl = canonicalUrl(`/product/${product?.slug}`);

  const availability = product?.in_stock
    ? "https://schema.org/InStock"
    : "https://schema.org/OutOfStock";

  /**
   * اگر محصول چند قیمت متفاوت دارد (مثلاً بادام با وزن‌های نیم‌کیلو/یک‌کیلو/دو‌کیلو)،
   * یک عدد واحد یا ارزان‌ترین قیمت نادرست است — چون با قیمت کارت صفحه یکی نیست.
   * در این حالت AggregateOffer با بازه واقعی lowPrice/highPrice اعلام می‌شود تا
   * گوگل دقیقاً همان بازه‌ای را ببیند که کاربر در سایت انتخاب می‌کند.
   */
  const offers =
    distinct.length > 1
      ? {
          "@type": "AggregateOffer",
          url: productUrl,
          priceCurrency: "IRR",
          lowPrice: toRial(distinct[0]),
          highPrice: toRial(distinct[distinct.length - 1]),
          offerCount: distinct.length,
          availability,
          itemCondition: "https://schema.org/NewCondition",
          priceValidUntil: priceValidUntil(),
          seller: { "@type": "Organization", name: SITE.name },
        }
      : {
          "@type": "Offer",
          url: productUrl,
          priceCurrency: "IRR",
          price: toRial(distinct[0] ?? 0),
          availability,
          itemCondition: "https://schema.org/NewCondition",
          priceValidUntil: priceValidUntil(),
          seller: { "@type": "Organization", name: SITE.name },
        };

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product?.name,
    url: productUrl,
    description:
      product?.meta_description ||
      product?.description ||
      product?.long_description ||
      undefined,
    image: absoluteUrl(product?.image_url || product?.image),
    sku: product?.slug,
    category:
      product?.category_name || product?.category_id || product?.category,
    brand: { "@type": "Brand", name: SITE.name, alternateName: SITE.alternateName },
    ...(product?.rating > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.rating,
        reviewCount: product.review_count || 1,
        bestRating: 5,
        worstRating: 1,
      },
    }),
    offers,
  };
};

/** پست بلاگ (از دیتابیس) را به Schema مقاله تبدیل می‌کند */
export const buildArticleJsonLd = (post: any) => {
  const postUrl = canonicalUrl(`/blog/${post?.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post?.title,
    description: post?.meta_description || post?.excerpt || undefined,
    image: absoluteUrl(post?.featured_image_url) || absoluteUrl(SITE.ogImage),
    datePublished: post?.created_at,
    dateModified: post?.updated_at || post?.created_at,
    inLanguage: "fa-IR",
    articleSection: Array.isArray(post?.tags) ? post.tags[0] : undefined,
    keywords: Array.isArray(post?.tags) ? post.tags.join(", ") : undefined,
    author: { "@type": "Organization", name: SITE.name, url: canonicalUrl("/about") },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      alternateName: SITE.alternateName,
      logo: { "@type": "ImageObject", url: absoluteUrl(SITE.logo) },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": postUrl },
    url: postUrl,
  };
};

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
    url: canonicalUrl(item.path),
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
  alternateName: SITE.alternateName,
  url: canonicalUrl("/"),
  logo: absoluteUrl(SITE.logo),
  image: absoluteUrl(SITE.ogImage),
  description: SITE.description,
  telephone: SITE.phone,
  email: SITE.email,
  priceRange: "$$",
  currenciesAccepted: "IRR",
  paymentAccepted: "کارت بانکی، پرداخت آنلاین",
  address: {
    "@type": "PostalAddress",
    ...SITE.address,
  },
  areaServed: {
    "@type": "Country",
    name: "ایران",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Saturday",
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
      ],
      opens: "09:00",
      closes: "14:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Saturday",
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
      ],
      opens: "17:00",
      closes: "22:00",
    },
  ],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: SITE.phone,
    contactType: "customer service",
    areaServed: "IR",
    availableLanguage: "fa",
  },
});

