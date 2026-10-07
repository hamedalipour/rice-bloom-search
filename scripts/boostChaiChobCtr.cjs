// بهینه‌سازی CTR عنوان/توضیح مقاله «چای چوب» بر اساس داده GSC (۲۷ نمایش، جایگاه ۶.۵)
const fs = require('fs');
const FILE = 'src/data/blogPosts.json';
const posts = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const p = posts.find((x) => x.slug === 'chai-chob-chist-tafavot-ba-chai-siah');
if (!p) { console.log('post not found'); process.exit(1); }
p.meta_title = 'چای چوب چیست و چه فرقی با چای سیاه دارد؟ + راهنمای خرید ۱۴۰۵';
p.meta_description =
  'چای چوب چیست و چه فرقی با چای سیاه دارد؟ طعم، رنگ، عطر، دم‌آوری و فواید چای چوب + راهنمای تشخیص اصل و خرید چای چوب شمال از عطر شالیزار.';
p.updated_at = new Date().toISOString();
fs.writeFileSync(FILE, JSON.stringify(posts, null, 2) + '\n', 'utf8');
console.log('meta updated: ' + p.meta_title);
