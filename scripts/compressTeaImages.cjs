// فشرده‌سازی عکس‌های آپلودشده از پنل (PNG سنگین → JPG بهینه) + به‌روزرسانی JSONها
// فایل‌های اصلی به‌عنوان نسخه بهینه نوشته و نسخه PNG اصلی حذف می‌شود.
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// src: مسیر PNG سنگین، out: فایل JPG خروجی، slug: برای به‌روزرسانی JSON
const jobs = [
  // عکس‌های چای (نسخه‌های قبلی؛ اگر src موجود نباشد رد می‌شود)
  { src: 'dist/chai-siah.png', out: 'public/assets/chai-siah.jpg', width: 900, q: 82, label: 'چای سیاه (محصول)', optional: true },
  { src: 'dist/chai-sabz.png', out: 'public/assets/chai-sabz.jpg', width: 900, q: 82, label: 'چای سبز (محصول)', optional: true },
  { src: 'dist/chai-lahijan-chist.png', out: 'public/assets/chai-lahijan-chist.jpg', width: 1200, q: 80, label: 'مقاله چای لاهیجان', optional: true },

  // عکس‌های آپلودشده از پنل — بادام آستانه و مقاله آن
  {
    src: 'public/assets/products/1791570387524-307e9f.png',
    out: 'public/assets/products/1791570387524-307e9f.jpg',
    width: 900, q: 84, label: 'بادام آستانه (محصول)',
    json: 'src/data/products.json', key: 'slug', slug: 'badam-astane', field: 'image',
    publicPath: '/assets/products/1791570387524-307e9f.jpg',
  },
  {
    src: 'public/assets/blog/1791570403741-752820.png',
    out: 'public/assets/blog/1791570403741-752820.jpg',
    width: 1200, q: 80, label: 'مقاله بادام آستانه چیست',
    json: 'src/data/blogPosts.json', key: 'slug', slug: 'badam-astane-chist-rahnemaye-kharid', field: 'featured_image_url',
    publicPath: '/assets/blog/1791570403741-752820.jpg',
  },

  // عکس سنگین قدیمی مقاله «دم کردن چای ایرانی درست»
  {
    src: 'public/assets/blog/1790008419997-34b8cb.png',
    out: 'public/assets/blog/1790008419997-34b8cb.jpg',
    width: 1200, q: 80, label: 'مقاله دم کردن چای ایرانی',
    json: 'src/data/blogPosts.json', key: 'slug', slug: 'dam-kardan-chai-irani-droost', field: 'featured_image_url',
    publicPath: '/assets/blog/1790008419997-34b8cb.jpg',
  },

  // فایل تکراری عکس بادام (md5 یکسان) — فقط حذف، بدون بهره‌برداری
  { deleteOnly: 'public/assets/products/1791570314903-dafc61.png', label: 'کپی تکراری بادام (استفاده نشده)' },
];

/** به‌روزرسانی مسیر عکس در یک فایل JSON با نگاشت اسلاگ → مسیر عمومی */
function patchJson(jsonRel, key, slug, field, publicPath) {
  const full = path.join(jsonRel);
  const data = JSON.parse(fs.readFileSync(full, 'utf8'));
  let changed = 0;
  for (const row of data) {
    if (row[key] === slug) {
      row[field] = publicPath;
      changed++;
    }
  }
  if (changed) fs.writeFileSync(full, JSON.stringify(data, null, 2) + '\n', 'utf8');
  return changed;
}

(async () => {
  let totalBefore = 0;
  let totalAfter = 0;

  for (const j of jobs) {
    if (j.deleteOnly) {
      if (fs.existsSync(j.deleteOnly)) {
        const size = fs.statSync(j.deleteOnly).size;
        fs.unlinkSync(j.deleteOnly);
        totalBefore += size;
        console.log(`🗑  ${j.label}: حذف شد (${(size / 1024).toFixed(0)}KB آزاد شد → ${j.deleteOnly})`);
      }
      continue;
    }

    if (!fs.existsSync(j.src)) {
      if (j.optional) { console.log(`– رد شد (فایل نیست): ${j.src}`); continue; }
      console.error(`✗ فایل پیدا نشد: ${j.src}`);
      process.exit(1);
    }

    const before = fs.statSync(j.src).size;
    await sharp(j.src)
      .resize({ width: j.width, withoutEnlargement: true })
      .jpeg({ quality: j.q, mozjpeg: true, progressive: true })
      .toFile(j.out);
    const after = fs.statSync(j.out).size;
    const meta = await sharp(j.out).metadata();
    console.log(`✓ ${j.label}: ${meta.width}x${meta.height} | ${(before / 1024).toFixed(0)}KB → ${(after / 1024).toFixed(1)}KB`);
    totalBefore += before;
    totalAfter += after;

    if (j.json) {
      const n = patchJson(j.json, j.key, j.slug, j.field, j.publicPath);
      console.log(`   ↳ ${j.json}: ${n} ردیف به‌روز شد → ${j.publicPath}`);
    }

    // حذف نسخه PNG سنگین پس از ساخت نسخه JPG
    if (path.extname(j.src).toLowerCase() === '.png' && j.src.startsWith('public/')) {
      fs.unlinkSync(j.src);
    }
  }

  if (totalBefore) {
    console.log(`\n✓ مجموع: ${(totalBefore / 1024 / 1024).toFixed(2)}MB → ${(totalAfter / 1024 / 1024).toFixed(2)}MB (صرفه‌جویی ${((1 - totalAfter / totalBefore) * 100).toFixed(0)}%)`);
  }
})().catch(e => { console.error('✗', e.message); process.exit(1); });
