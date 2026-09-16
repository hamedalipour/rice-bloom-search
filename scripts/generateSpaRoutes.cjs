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

function writeRoute(route, { title, description }) {
  const safeTitle = String(title || SITE).replace(/</g, ' ');
  const safeDesc = String(description || '').replace(/"/g, '”').slice(0, 300);
  const canonical = `${BASE_URL}${route === '/' ? '/' : route}`;
  let html = shell
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${safeTitle}</title>`)
    .replace(/<meta name="description" content="[^"]*"/, `<meta name="description" content="${safeDesc}"`)
    .replace(/<link rel="canonical" href="[^"]*"/, `<link rel="canonical" href="${canonical}"`)
    .replace(/<meta property="og:title" content="[^"]*"/, `<meta property="og:title" content="${safeTitle}"`)
    .replace(/<meta property="og:description" content="[^"]*"/, `<meta property="og:description" content="${safeDesc}"`)
    .replace(/<meta property="og:url" content="[^"]*"/, `<meta property="og:url" content="${canonical}"`);
  const dir = path.join(DIST, route);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf8');
}

const products = readJson('src/data/products.json');
const blogPosts = readJson('src/data/blogPosts.json').filter((b) => b.published !== false);

// صفحات ثابت
writeRoute('/shop', {
  title: 'فروشگاه برنج و چای ایرانی | خرید آنلاین با قیمت روز – ' + SITE,
  description: 'خرید آنلاین انواع برنج ایرانی (طارم، هاشمی، فجر، شیرودی) و چای اصل شمال (لاهیجان، سبز و دمنوش) با مقایسه قیمت و ارسال سریع از عطر شالیزار.',
});
writeRoute('/blog', {
  title: 'وبلاگ عطر شالیزار | آموزش پخت برنج و دم کردن چای ایرانی',
  description: 'مقالات آموزشی برنج و چای ایرانی؛ راهنمای پخت برنج دم‌کشیده، خرید چای لاهیجان اصل و تفاوت چای سیاه و سبز.',
});
writeRoute('/about', {
  title: 'درباره ما | عطر شالیزار – برنج و چای اصل شمال',
  description: 'آشنایی با فروشگاه عطر شالیزار؛ تأمین مستقیم برنج و چای ایرانی از شالیزارها و باغ‌های گیلان و مازندران.',
});
writeRoute('/contact', {
  title: 'تماس با ما | عطر شالیزار – سفارش تلفنی برنج و چای',
  description: 'راه‌های تماس با فروشگاه عطر شالیزار برای سفارش تلفنی برنج و چای ایرانی؛ پاسخگویی ۹ صبح تا ۹ شب.',
});

// صفحات محصول
for (const p of products) {
  writeRoute(`/product/${p.slug}`, {
    title: p.metaTitle || `${p.name} | خرید آنلاین با قیمت روز – ${SITE}`,
    description: p.metaDescription || p.description || '',
  });
}

// صفحات مقاله
for (const b of blogPosts) {
  writeRoute(`/blog/${b.slug}`, {
    title: b.meta_title || `${b.title} | وبلاگ ${SITE}`,
    description: b.meta_description || b.excerpt || '',
  });
}

console.log(`✅ SPA routes generated: ${4 + products.length + blogPosts.length} pages (static 4 + ${products.length} products + ${blogPosts.length} posts)`);
