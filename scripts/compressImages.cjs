/**
 * فشرده‌سازی یک‌جای تصاویر پروژه (sharp — از قبل در dependencies).
 * اجرا:  node scripts/compressImages.cjs
 *
 * - کیفیت jpeg ۷۸-۸۲ با mozjpeg و progressive
 * - ریسایز متناسب با محل نمایش (هیرو ۱۶۰۰، محصولات ۸۰۰، اوگرافیک ۱۲۰۰)
 * - اگر صرفه‌جویی کمتر از ۵٪ باشد، فایل دست‌نخورده می‌ماند
 * - نام و پسوند فایل‌ها عوض نمی‌شود تا هیچ ارجاعی نشکند
 */
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');

const JOBS = [
  // [مسیر, عرض حداکثر, کیفیت]
  { file: 'public/hero-rice-field.jpg', width: 1600, q: 80 },
  { file: 'public/og-image.jpg', width: 1200, q: 82 },
  { file: 'public/tarom.jpg', width: 800, q: 78 },
  { file: 'public/hashemi.jpg', width: 800, q: 78 },
  { file: 'public/fajr.jpg', width: 800, q: 78 },
  { file: 'public/shirodi.jpg', width: 800, q: 78 },
  { file: 'src/assets/rice-tarom.jpg', width: 800, q: 80 },
  { file: 'src/assets/rice-hashemi.jpg', width: 800, q: 80 },
  { file: 'src/assets/rice-shirudi.jpg', width: 800, q: 80 },
  { file: 'src/assets/rice-fajr.jpg', width: 800, q: 80 },
  { file: 'src/assets/about-us.jpg', width: 1000, q: 80 },
  { file: 'src/assets/1.jpg', width: 800, q: 80 }, // PNG با پسوند اشتباه — به jpeg واقعی تبدیل می‌شود
];

// تصاویر آپلودشده از پنل
function addDir(relDir, width, q) {
  const abs = path.join(ROOT, relDir);
  if (!fs.existsSync(abs)) return;
  for (const f of fs.readdirSync(abs)) {
    if (/\.(jpe?g|jfif)$/i.test(f)) {
      JOBS.push({ file: path.join(relDir, f).replace(/\\/g, '/'), width, q });
    }
  }
}
addDir('public/assets/products', 800, 80);
addDir('public/assets/blog', 900, 80);

(async () => {
  let before = 0, after = 0, changed = 0;
  for (const job of JOBS) {
    const abs = path.join(ROOT, job.file);
    if (!fs.existsSync(abs)) { console.log('⚠ نبود:', job.file); continue; }
    const startSize = fs.statSync(abs).size;
    before += startSize;
    try {
      // خواندن با fs و دادن بافر به sharp — دور زدن باگ I/O درایو ReFS در libvips
      const inputBuf = fs.readFileSync(abs);
      const img = sharp(inputBuf).rotate(); // حفظ جهت EXIF
      const meta = await img.metadata();
      const pipeline = (meta.width && meta.width > job.width)
        ? img.resize({ width: job.width, withoutEnlargement: true })
        : img;
      const buf = await pipeline
        .jpeg({ quality: job.q, mozjpeg: true, progressive: true })
        .toBuffer();
      if (buf.length < startSize * 0.95) {
        fs.writeFileSync(abs, buf);
        after += buf.length;
        changed++;
        console.log(
          `✔ ${job.file}: ${(startSize/1024).toFixed(0)}KB → ${(buf.length/1024).toFixed(0)}KB` +
          ` (${meta.width}x${meta.height}${meta.width > job.width ? ' → ' + job.width + 'w' : ''})`
        );
      } else {
        after += startSize;
        console.log(`— ${job.file}: بدون تغییر (${(startSize/1024).toFixed(0)}KB)`);
      }
    } catch (e) {
      after += startSize;
      console.log(`✖ ${job.file}: ${e.message}`);
    }
  }
  console.log('──────────────────────────────');
  console.log(`مجموع قبل: ${(before/1024/1024).toFixed(2)}MB | بعد: ${(after/1024/1024).toFixed(2)}MB | ذخیره: ${(((before-after)/1024/1024)).toFixed(2)}MB (${changed} فایل)`);
})();
