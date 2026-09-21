// Home: مرتب‌سازی ۳ مقاله جدیدترین بر اساس تاریخ
const fs = require('fs');
const p = 'src/pages/Home.tsx';
let c = fs.readFileSync(p, 'utf8');
const oldLine =
  'const latestPosts = blogPosts.filter(post => post.published).slice(0, 3);';
const newBlock = [
  '// ۳ مقاله جدیدترین (مرتب‌سازی بر اساس تاریخ) — برای سئو و تازگی محتوا',
  'const latestPosts = [...blogPosts]',
  '  .filter((post) => post.published)',
  '  .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))',
  '  .slice(0, 3);',
].join('\n');
if (c.includes(oldLine)) {
  c = c.split(oldLine).join(newBlock);
  fs.writeFileSync(p, c, 'utf8');
  console.log('Home.tsx updated');
} else {
  console.log('NOT FOUND in Home.tsx');
}
