// اسکریپت تولید خودکار sitemap.xml
// داده‌ها از فایل‌های JSON محلی خوانده می‌شوند (منبع حقیقت — بدون هیچ دیتابیس).
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://atre-shalizar.ir';

// صفحات ثابت و ارزشمند برای ایندکس
const staticRoutes = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/shop', priority: '0.9', changefreq: 'daily' },
  { path: '/blog', priority: '0.7', changefreq: 'weekly' },
  { path: '/about', priority: '0.5', changefreq: 'monthly' },
  { path: '/contact', priority: '0.5', changefreq: 'monthly' },
];

const isoDate = (d) => {
  const t = d ? new Date(d).getTime() : NaN;
  return Number.isFinite(t) ? new Date(t).toISOString().slice(0, 10) : null;
};

const readJson = (rel) => {
  const full = path.join(__dirname, '..', rel);
  if (!fs.existsSync(full)) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(full, 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn(`⚠️  فایل ${rel} قابل خواندن نیست:`, e.message);
    return [];
  }
};

const main = () => {
  const products = readJson('src/data/products.json');
  const blogPosts = readJson('src/data/blogPosts.json');

  // آخرین تغییر محصولات = زمان ویرایش فایل داده توسط پنل
  const productsFileTime = isoDate(
    fs.statSync(path.join(__dirname, '..', 'src/data/products.json')).mtime,
  );
  const today = new Date().toISOString().slice(0, 10);

  const routes = [
    ...staticRoutes,
    ...products.map((p) => ({
      path: `/product/${p.slug}`,
      priority: '0.8',
      changefreq: 'weekly',
      lastmod: productsFileTime || today,
    })),
    ...blogPosts
      .filter((b) => b.published !== false)
      .map((b) => ({
        path: `/blog/${b.slug}`,
        priority: '0.6',
        changefreq: 'monthly',
        lastmod: isoDate(b.updated_at) || isoDate(b.created_at) || today,
      })),
  ];

  // حذف اسلاگ‌های تکراری (احتیاط)
  const seen = new Set();
  const uniqueRoutes = routes.filter((r) => {
    if (seen.has(r.path)) return false;
    seen.add(r.path);
    return true;
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${uniqueRoutes
    .map(
      (r) => `  <url>
    <loc>${BASE_URL}${r.path}</loc>
    <lastmod>${r.lastmod || today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`,
    )
    .join('\n')}
</urlset>`;

  const outputPath = path.join(__dirname, '../public/sitemap.xml');
  fs.writeFileSync(outputPath, sitemap);

  console.log('Sitemap generated successfully at:', outputPath);
  console.log(
    `Sitemap includes ${staticRoutes.length} static pages, ${products.length} products, ${blogPosts.filter((b) => b.published !== false).length} blog posts (total ${uniqueRoutes.length}).`,
  );
};

main();
