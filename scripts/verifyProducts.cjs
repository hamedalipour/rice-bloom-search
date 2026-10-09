// بررسی سلامت داده محصولات: قیمت پایه، وزن‌ها و ساختار JSON.
// چند قیمت متفاوت برای یک محصول مشکلی نیست (AggregateOffer بازه را اعلام می‌کند)،
// ولی «قیمت پایه کمتر از ارزان‌ترین وزن» یک باگ واقعی است: قیمت کارت محصول
// از ارزان‌ترین گزینه قابل خرید آن ارزان‌تر نشان داده می‌شود.
const products = require('../src/data/products.json');

let problems = 0;
for (const p of products) {
  const weightPrices = (p.weights || [])
    .map((w) => Number(w.price))
    .filter((n) => Number.isFinite(n) && n > 0);
  const cheapest = weightPrices.length ? Math.min(...weightPrices) : null;
  const base = Number(p.price) || 0;

  const flags = [];
  if (base <= 0) flags.push('قیمت پایه نامعتبر');
  if (cheapest !== null && base < cheapest) {
    flags.push(`قیمت پایه (${base}) از ارزان‌ترین وزن (${cheapest}) کمتر است`);
  }
  if (!p.image) flags.push('تصویر ندارد');
  if (!Array.isArray(p.weights) || p.weights.length === 0) flags.push('وزنی ندارد');

  const mark = flags.length ? '✗' : '✓';
  if (flags.length) problems++;
  console.log(
    `${mark} ${p.slug.padEnd(30)} base=${String(base).padStart(8)} ` +
      `weights=[${weightPrices.join(',')}] ${flags.length ? '=> ' + flags.join(' | ') : ''}`
  );
}

console.log('');
console.log(problems ? `✗ ${problems} محصول مشکل‌دار` : `✓ همه ${products.length} محصول سالم`);
process.exit(problems ? 1 : 0);
