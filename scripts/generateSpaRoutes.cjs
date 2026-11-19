// تولید نسخه‌های استاتیک HTML برای همه مسیرهای SPA روی GitHub Pages
// چون GitHub Pages لینک‌های عمیق را 404 برمی‌گرداند، برای هر آدرس یک
// پوشه واقعی با index.html می‌سازیم و متای اختصاصی همان صفحه را تزریق می‌کنیم.
const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, '..', 'dist');
const BASE_URL = 'https://atre-shalizar.ir';
const SITE = 'عطر شالیزار';

if (!fs.existsSync(path.join(DIST, 'index.html'))) {
  console.error('❌ dist/index.html پیدا نشد — اول vite build اجرا شود.');
  process.exit(1);
}

const readJson = (rel) => {
  const full = path.join(__dirname, '..', rel);
  if (!fs.existsSync(full)) return [];
  try { return JSON.parse(fs.readFileSync(full, 'utf8')); } catch { return []; }
};

const shell = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');

/** تبدیل مسیر نسبی تصویر به URL مطلق */
const absoluteUrl = (p) => {
  if (!p) return null;
  return /^https?:\/\//i.test(p) ? p : `${BASE_URL}${p.startsWith('/') ? p : `/${p}`}`;
};

/* ------------------------------------------------------------------ */
/* داده ساختاریافته (JSON-LD) استاتیک                                  */
/* همان خروجی useSEO در سمت کلاینت است تا حتی بدون اجرای جاوااسکریپت   */
/* (خزشگرهای ساده، ابزارهای سئو و پیش‌نمایش لینک) هم در دسترس باشد.    */
/* چون هر دو طرف عنصر id="page-json-ld" را مدیریت می‌کنند، تکرار نمی‌شود.*/
/* ------------------------------------------------------------------ */

const PRICE_VALID_UNTIL = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
  .toISOString()
  .slice(0, 10);

/** تومان → ریال (استاندارد ISO ارز ایران) */
const toRial = (toman) => String(Math.round(Number(toman) * 10));

const absoluteCanonical = (route) =>
  route === '/' ? `${BASE_URL}/` : `${BASE_URL}${route.replace(/\/+$/, '')}/`;

const breadcrumbJsonLd = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: absoluteCanonical(item.path),
  })),
});

/** نام فارسی دسته‌بندی‌ها برای فیلد category در Schema محصول */
const CATEGORY_NAMES = {
  tarom: 'برنج طارم',
  hashemi: 'برنج هاشمی',
  fajr: 'برنج فجر',
  shirodi: 'برنج شیرودی',
  'chai-siah': 'چای سیاه',
  'chai-chob': 'چای چوب',
  'chai-sabz': 'چای سبز',
  damnoosh: 'دمنوش',
  badam: 'بادام آستانه',
};

/** دسته‌بندی‌های دارای صفحه اختصاصی — برای breadcrumb محصول */
const PRODUCT_CATEGORY = {
  tarom: { slug: 'berenj', name: 'برنج ایرانی' },
  hashemi: { slug: 'berenj', name: 'برنج ایرانی' },
  fajr: { slug: 'berenj', name: 'برنج ایرانی' },
  shirodi: { slug: 'berenj', name: 'برنج ایرانی' },
  'chai-siah': { slug: 'chai', name: 'چای ایرانی' },
  'chai-chob': { slug: 'chai', name: 'چای ایرانی' },
};

/**
 * قیمت‌ها از وزن‌های قیمت‌دار گرفته می‌شوند (نه price پایه که ممکن است
 * «قیمت هر کیلو» باشد)؛ چند قیمت ⇒ AggregateOffer با بازه واقعی.
 */
const productJsonLd = (p) => {
  const weightPrices = (Array.isArray(p.weights) ? p.weights : [])
    .map((w) => Number(w && w.price))
    .filter((n) => n > 0);
  const candidates = weightPrices.length
    ? weightPrices
    : [Number(p.price) || 0].filter((n) => n > 0);
  const distinct = [...new Set(candidates)].sort((a, b) => a - b);
  const productUrl = absoluteCanonical(`/product/${p.slug}`);
  const availability = p.inStock
    ? 'https://schema.org/InStock'
    : 'https://schema.org/OutOfStock';
  const category = PRODUCT_CATEGORY[p.category];

  const offers = distinct.length > 1
    ? {
        '@type': 'AggregateOffer',
        url: productUrl,
        priceCurrency: 'IRR',
        lowPrice: toRial(distinct[0]),
        highPrice: toRial(distinct[distinct.length - 1]),
        offerCount: distinct.length,
        availability,
        itemCondition: 'https://schema.org/NewCondition',
        priceValidUntil: PRICE_VALID_UNTIL,
        seller: { '@type': 'Organization', name: SITE },
      }
    : {
        '@type': 'Offer',
        url: productUrl,
        priceCurrency: 'IRR',
        price: toRial(distinct[0] ?? 0),
        availability,
        itemCondition: 'https://schema.org/NewCondition',
        priceValidUntil: PRICE_VALID_UNTIL,
        seller: { '@type': 'Organization', name: SITE },
      };

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    url: productUrl,
    description: p.metaDescription || p.description || p.longDescription || undefined,
    image: absoluteUrl(p.image) || undefined,
    sku: p.slug,
    category: CATEGORY_NAMES[p.category] || (category ? category.name : p.category),
    brand: { '@type': 'Brand', name: SITE, alternateName: 'Atre Shalizar' },
    offers,
  };
};

const articleJsonLd = (b) => {
  const postUrl = absoluteCanonical(`/blog/${b.slug}`);
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: b.title,
    description: b.meta_description || b.excerpt || undefined,
    image: absoluteUrl(b.featured_image_url) || `${BASE_URL}/og-image.jpg`,
    datePublished: b.published_at || b.created_at,
    dateModified: b.updated_at || b.published_at || b.created_at,
    inLanguage: 'fa-IR',
    keywords: Array.isArray(b.tags) ? b.tags.join(', ') : undefined,
    author: { '@type': 'Organization', name: SITE, url: absoluteCanonical('/about') },
    publisher: {
      '@type': 'Organization',
      name: SITE,
      alternateName: 'Atre Shalizar',
      logo: { '@type': 'ImageObject', url: `${BASE_URL}/favicon.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': postUrl },
    url: postUrl,
  };
};

/**
 * تزریق متای اختصاصی هر مسیر روی پوسته استاتیک.
 * علاوه بر title/description/canonical، تصویر شاخص همان صفحه (og:image و twitter:image)
 * هم تزریق می‌شود تا پیش‌نمایش اشتراک‌گذاری لینک در تلگرام/واتساپ/اینستاگرام
 * عکس واقعی همان محصول/مقاله را نشان دهد، نه عکس عمومی سایت.
 */
function writeRoute(route, { title, description, image, type = 'website', published, modified, jsonLd, noindex = false }) {
  const safeTitle = String(title || SITE).replace(/</g, ' ');
  const safeDesc = String(description || '').replace(/"/g, '”').slice(0, 300);
  // GitHub Pages مسیر بدون اسلش را با 301 به مسیر اسلش‌دار هدایت می‌کند؛
  // canonical باید همان URL نهایی (با اسلش) باشد تا سیگنال تکراری ساخته نشود.
  const canonical =
    route === '/'
      ? `${BASE_URL}/`
      : `${BASE_URL}${route.replace(/\/+$/, '')}/`;
  let html = shell
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${safeTitle}</title>`)
    .replace(/<meta name="description" content="[^"]*"/, `<meta name="description" content="${safeDesc}"`)
    .replace(/<link rel="canonical" href="[^"]*"/, `<link rel="canonical" href="${canonical}"`)
    .replace(/<meta property="og:title" content="[^"]*"/, `<meta property="og:title" content="${safeTitle}"`)
    .replace(/<meta property="og:description" content="[^"]*"/, `<meta property="og:description" content="${safeDesc}"`)
    .replace(/<meta property="og:url" content="[^"]*"/, `<meta property="og:url" content="${canonical}"`)
    .replace(/<meta property="og:type" content="[^"]*"/, `<meta property="og:type" content="${type}"`)
    .replace(/<meta property="og:image:alt" content="[^"]*"/, `<meta property="og:image:alt" content="${safeTitle}"`)
    .replace(
      /<meta name="robots" content="[^"]*"/,
      `<meta name="robots" content="${
        noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1'
      }"`,
    )
    .replace(/<meta name="twitter:title" content="[^"]*"/, `<meta name="twitter:title" content="${safeTitle}"`)
    .replace(/<meta name="twitter:description" content="[^"]*"/, `<meta name="twitter:description" content="${safeDesc}"`);

  const imageUrl = absoluteUrl(image);
  if (imageUrl) {
    html = html
      .replace(/<meta property="og:image" content="[^"]*"/, `<meta property="og:image" content="${imageUrl}"`)
      .replace(/<meta name="twitter:image" content="[^"]*"/, `<meta name="twitter:image" content="${imageUrl}"`)
      // ابعاد ثابت 1200x630 برای این تصاویر نادرست است؛ حذفشان می‌کنیم تا
      // موتورهای اشتراک‌گذاری خودشان ابعاد واقعی را از فایل بخوانند.
      .replace(/[ \t]*<meta property="og:image:width" content="[^"]*"\s*\/>\n?/g, '')
      .replace(/[ \t]*<meta property="og:image:height" content="[^"]*"\s*\/>\n?/g, '');
  }

  // متاتگ‌های زمان انتشار/به‌روزرسانی مقاله برای خزشگرها و پیش‌نمایش شبکه‌های اجتماعی
  if (type === 'article') {
    const articleMeta = [];
    if (published) {
      articleMeta.push(`    <meta property="article:published_time" content="${published}" />`);
    }
    if (modified) {
      articleMeta.push(`    <meta property="article:modified_time" content="${modified}" />`);
    }
    if (articleMeta.length) {
      html = html.replace('</head>', `${articleMeta.join('\n')}\n  </head>`);
    }
  }

  // داده ساختاریافته صفحه (Product / Article / BreadcrumbList)
  if (jsonLd) {
    // همان ساختار آرایه‌ای که useSEO تولید می‌کند تا سمت کلاینت دقیقاً جایگزینش کند.
    // `<` به \u003c تبدیل می‌شود تا اگر متن پاسخ شامل </script> بود تگ زودتر بسته نشود.
    const schema = JSON.stringify(Array.isArray(jsonLd) ? jsonLd : [jsonLd]).replace(
      /</g,
      '\\u003c',
    );
    html = html.replace(
      '</head>',
      `    <script type="application/ld+json" id="page-json-ld">${schema}</script>\n  </head>`,
    );
  }

  const dir = path.join(DIST, route);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf8');
}

const products = readJson('src/data/products.json');
const blogPosts = readJson('src/data/blogPosts.json').filter((b) => b.published !== false);

// صفحات ثابت
const HOME = { name: 'خانه', path: '/' };
const SHOP_CRUMB = { name: 'فروشگاه', path: '/shop' };

writeRoute('/shop', {
  title: 'خرید برنج ایرانی و چای لاهیجان | فروشگاه آنلاین – ' + SITE,
  description: 'خرید آنلاین برنج هاشمی معطر، چای سیاه لاهیجان، چای بهاره و چای چوب شمال با قیمت روز، انتخاب وزن دلخواه و ارسال سریع به سراسر ایران از عطر شالیزار.',
  jsonLd: [breadcrumbJsonLd([HOME, SHOP_CRUMB])],
});
writeRoute('/blog', {
  title: 'وبلاگ برنج و چای ایرانی | آموزش پخت و راهنمای خرید – ' + SITE,
  description: 'مقالات آموزشی برنج و چای ایرانی؛ راهنمای پخت برنج دم‌کشیده، خرید برنج هاشمی معطر، چای بهاره و چای چوب اصل لاهیجان.',
  jsonLd: [breadcrumbJsonLd([HOME, { name: 'وبلاگ', path: '/blog' }])],
});
writeRoute('/about', {
  title: 'درباره عطر شالیزار | تأمین مستقیم برنج و چای شمال',
  description: 'آشنایی با فروشگاه عطر شالیزار؛ تأمین مستقیم برنج ایرانی و چای لاهیجان از شالیزارها و باغ‌های گیلان و مازندران بدون واسطه.',
  jsonLd: [breadcrumbJsonLd([HOME, { name: 'درباره ما', path: '/about' }])],
});
writeRoute('/contact', {
  title: 'تماس با عطر شالیزار | تلفن و آدرس فروشگاه در لاهیجان',
  description: 'راه‌های تماس با فروشگاه عطر شالیزار در لاهیجان گیلان برای سفارش تلفنی برنج و چای؛ تلفن ۰۹۳۵۴۲۹۹۷۸۵، پاسخگویی ۹ تا ۱۴ و ۱۷ تا ۲۲.',
  jsonLd: [breadcrumbJsonLd([HOME, { name: 'تماس با ما', path: '/contact' }])],
});

// صفحات کاربردی (بدون ایندکس) — بدون این دو مسیر، بازدید مستقیم /cart/ و
// /checkout/ روی گیت‌هاب پیجز به ۴۰۴ می‌خورد و سبد خرید باز نمی‌شود.
writeRoute('/cart', {
  title: 'سبد خرید | عطر شالیزار',
  description: 'سبد خرید فروشگاه عطر شالیزار؛ مرور محصولات انتخابی، ویرایش تعداد و ادامه فرایند خرید.',
  noindex: true,
});
writeRoute('/checkout', {
  title: 'ثبت سفارش | فروشگاه عطر شالیزار',
  description: 'نهایی کردن سفارش برنج و چای ایرانی؛ انتخاب روش پرداخت و ارسال.',
  noindex: true,
});

// صفحات دسته‌بندی
const categoryPages = [
  {
    slug: 'berenj',
    name: 'برنج ایرانی',
    title: 'خرید برنج ایرانی اصل | قیمت روز برنج هاشمی معطر گیلان – ' + SITE,
    description: 'خرید آنلاین برنج ایرانی اصل با قیمت روز؛ برنج هاشمی معطر برداشت تازه از شالیزارهای گیلان و مازندران با بسته‌بندی مطمئن و ارسال سریع به سراسر ایران.',
  },
  {
    slug: 'chai',
    name: 'چای ایرانی',
    title: 'خرید چای ایرانی اصل لاهیجان | قیمت چای سیاه، بهاره و چوب – ' + SITE,
    description: 'خرید چای ایرانی اصل با قیمت روز؛ چای سیاه لاهیجان، چای بهاره ممتاز و چای چوب شمال ساقه‌دار، مستقیم از باغ‌های گیلان با ارسال سریع از عطر شالیزار.',
  },
];
for (const c of categoryPages) {
  writeRoute(`/category/${c.slug}`, {
    title: c.title,
    description: c.description,
    jsonLd: [
      breadcrumbJsonLd([
        HOME,
        SHOP_CRUMB,
        { name: c.name, path: `/category/${c.slug}` },
      ]),
    ],
  });
}

// صفحات محصول
for (const p of products) {
  const productCategory = PRODUCT_CATEGORY[p.category];
  writeRoute(`/product/${p.slug}`, {
    title: p.metaTitle || `${p.name} | خرید آنلاین با قیمت روز – ${SITE}`,
    description: p.metaDescription || p.description || '',
    image: p.image,
    // هم‌راستا با ProductDetail که og:type را product تنظیم می‌کند
    type: 'product',
    jsonLd: [
      productJsonLd(p),
      breadcrumbJsonLd([
        HOME,
        SHOP_CRUMB,
        ...(productCategory
          ? [{ name: productCategory.name, path: `/category/${productCategory.slug}` }]
          : []),
        { name: p.name, path: `/product/${p.slug}` },
      ]),
    ],
  });
}

// صفحات مقاله
for (const b of blogPosts) {
  writeRoute(`/blog/${b.slug}`, {
    title: b.meta_title || `${b.title} | وبلاگ ${SITE}`,
    description: b.meta_description || b.excerpt || '',
    image: b.featured_image_url,
    type: 'article',
    published: b.published_at || b.created_at,
    modified: b.updated_at,
    jsonLd: [
      articleJsonLd(b),
      breadcrumbJsonLd([
        HOME,
        { name: 'وبلاگ', path: '/blog' },
        { name: b.title, path: `/blog/${b.slug}` },
      ]),
    ],
  });
}

console.log(
  `✅ SPA routes generated: ${6 + categoryPages.length + products.length + blogPosts.length} pages ` +
    `(static 4 + 2 transactional + ${categoryPages.length} categories + ${products.length} products + ${blogPosts.length} posts)`,
);
