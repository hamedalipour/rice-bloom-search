// فشرده‌سازی ۳ عکس جدید چای (از dist → public/assets) + به‌روزرسانی JSONها
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const jobs = [
  { src: 'dist/chai-siah.png', out: 'public/assets/chai-siah.jpg', width: 900, q: 82, label: 'چای سیاه (محصول)' },
  { src: 'dist/chai-sabz.png', out: 'public/assets/chai-sabz.jpg', width: 900, q: 82, label: 'چای سبز (محصول)' },
  { src: 'dist/chai-lahijan-chist.png', out: 'public/assets/chai-lahijan-chist.jpg', width: 1200, q: 80, label: 'مقاله چای لاهیجان' },
];

(async () => {
  for (const j of jobs) {
    const before = fs.statSync(j.src).size;
    const img = sharp(j.src).resize({ width: j.width, withoutEnlargement: true }).jpeg({ quality: j.q, mozjpeg: true, progressive: true });
    await img.toFile(j.out);
    const after = fs.statSync(j.out).size;
    const meta = await sharp(j.out).metadata();
    console.log(`✓ ${j.label}: ${j.out} | ${meta.width}x${meta.height} | ${(before/1024).toFixed(0)}KB → ${(after/1024).toFixed(1)}KB`);
  }

  // محصولات
  const prodPath = path.join('src', 'data', 'products.json');
  const products = JSON.parse(fs.readFileSync(prodPath, 'utf8'));
  for (const p of products) {
    if (p.slug === 'chai-siah-lahijan-daraje-yek') p.image = '/assets/chai-siah.jpg';
    if (p.slug === 'chai-sabz-barooti-gilan') p.image = '/assets/chai-sabz.jpg';
  }
  fs.writeFileSync(prodPath, JSON.stringify(products, null, 2) + '\n', 'utf8');

  // وبلاگ
  const blogPath = path.join('src', 'data', 'blogPosts.json');
  const posts = JSON.parse(fs.readFileSync(blogPath, 'utf8'));
  for (const b of posts) {
    if (b.slug === 'chai-lahijan-chist-rahnemaye-kharid') b.featured_image_url = '/assets/chai-lahijan-chist.jpg';
  }
  fs.writeFileSync(blogPath, JSON.stringify(posts, null, 2) + '\n', 'utf8');

  console.log('✓ products.json + blogPosts.json به‌روز شدند');
})().catch(e => { console.error('✗', e.message); process.exit(1); });
