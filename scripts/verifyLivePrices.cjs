// تست زنده‌ی سایت: قیمت بادام، برچسب وزن‌ها و AggregateOffer در JSON-LD.
//
// نکته‌ی مهم طراحی: نام چانک‌ها روی سایت زنده با بیلد محلی متفاوت است، چون Vite
// هش را از محتوا می‌سازد و CI با محیط خودش بیلد می‌کند. پس نام چانک را حدس
// نمی‌زنیم؛ از HTML صفحه‌ی محصول و از ارجاع‌های داخل باندل استخراج می‌کنیم و
// چانک‌ها را می‌خوانیم تا آن‌چه داده‌ی مورد نظر را دارد پیدا شود.
//
// اسکریپت است نه فرمان ترمینال — چون ترمینال PowerShell متن فارسی را خراب می‌کند.
const https = require('https');
const { URL } = require('url');

const BASE = 'https://atre-shalizar.ir';

const get = (u, depth = 0) =>
  new Promise((res, rej) => {
    if (depth > 5) return rej(new Error('too many redirects'));
    https
      .get(u, { headers: { 'accept-encoding': 'identity' } }, (r) => {
        // دامنه اسلش انتهایی اضافه می‌کند (۳۰۱) — دنبالش برو
        if (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location) {
          r.resume();
          return get(new URL(r.headers.location, u).href, depth + 1).then(res, rej);
        }
        const c = [];
        r.on('data', (d) => c.push(d));
        r.on('end', () =>
          res({ status: r.statusCode, body: Buffer.concat(c).toString('utf8') })
        );
      })
      .on('error', rej);
  });

/**
 * عدد را در باندل مینیفای‌شده پیدا می‌کند.
 * Vite اعداد را علمی می‌نویسد و کوتاه‌ترین شکل را انتخاب می‌کند:
 *   950000 → 95e4 , 475000 → 475e3 , 1900000 → 19e5
 * پس جستجوی رشته‌ی خام عدد کافی نیست و همه‌ی شکل‌های ممکن ساخته می‌شوند.
 */
function hasNumber(body, n) {
  if (body.includes(String(n))) return true;
  const s = String(n);
  for (let i = 1; i < s.length; i++) {
    const head = s.slice(0, i);
    const tail = s.slice(i).replace(/0+$/, '');
    const exp = s.length - i;
    const forms = [`${head}e${exp}`];
    if (tail) forms.push(`${head}.${tail}e${exp}`);
    for (const f of forms) if (body.includes(f)) return true;
  }
  return false;
}

/** اولین چانک زنده‌ای که شرط را دارد (با پیمایش HTML + ارجاع‌های lazy) */
async function findLiveChunk(matchFn) {
  const seen = new Set();
  // نام چانک‌های lazy از لاگ بیلد CI گرفته می‌شود (هش محتواست و با بیلد محلی فرق دارد).
  // اگر نسخه‌ی دیپلوی‌شده عوض شد، این اسکریپت به‌جای «رد شدن» صادقانه FAIL می‌دهد.
  const LAZY_CHUNKS = ['useProducts-JwXv20LL.js', 'seo-C6yRACXM.js'];

  const seeds = [
    `${BASE}/`,
    `${BASE}/product/badam-astane/`,
    `${BASE}/shop/`,
    `${BASE}/blog/`,
    `${BASE}/category/berenj/`,
    `${BASE}/category/chai/`,
  ];

  // ۱) اول چانک‌های lazy شناخته‌شده را بررسی کن
  for (const name of LAZY_CHUNKS) {
    if (seen.has('c:' + name)) continue;
    seen.add('c:' + name);
    const cr = await get(`${BASE}/assets/${name}`);
    if (cr.status === 200 && matchFn(cr.body)) return { name, body: cr.body };
  }

  // ۲) بعد HTML صفحات و چانک‌های ارجاع‌شده در آن‌ها
  while (seeds.length) {
    const url = seeds.shift();
    if (seen.has(url)) continue;
    seen.add(url);

    const r = await get(url);
    if (r.status !== 200) continue;

    const chunks = [
      ...new Set([...r.body.matchAll(/assets\/([A-Za-z0-9_.-]+\.js)/g)].map((m) => m[1])),
    ];

    for (const name of chunks) {
      if (seen.has('c:' + name)) continue;
      seen.add('c:' + name);
      const cr = await get(`${BASE}/assets/${name}`);
      if (cr.status !== 200) continue;
      if (matchFn(cr.body)) return { name, body: cr.body };
      // چانک‌های lazy ارجاع‌شده را هم به صف اضافه کن
      for (const m of cr.body.matchAll(/["'(]\.\/([A-Za-z0-9_-]+-[A-Za-z0-9_-]{6,12}\.js)/g)) {
        if (!seen.has('c:' + m[1])) seeds.push(`${BASE}/assets/${m[1]}`);
      }
    }
  }
  return null;
}

(async () => {
  const results = [];
  const check = (name, ok, detail) => {
    results.push({ name, ok, detail });
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  (' + detail + ')' : ''}`);
  };

  // ۱) چانک داده‌ی محصول (lazy: useProducts)
  const data = await findLiveChunk((b) => b.includes('badam-astane') && /weights:/.test(b));
  check('live product-data chunk found', !!data, data ? data.name : '');
  if (data) {
    const start = data.body.indexOf('badam-astane');
    const seg = data.body.slice(start, start + 1700);
    const m = seg.match(/price:\s*([\d.e+]+)/);
    const basePrice = m ? Number(m[1]) : null;
    check('badam base price = 950000', basePrice === 950000, `got ${basePrice}`);
    check('weight label نیم کیلو present', seg.includes('نیم کیلو'));
    check('old label ۵۰۰ گرم removed', !seg.includes('۵۰۰ گرم'));
    check('nim kilo price 475000', hasNumber(seg, 475000));
    check('do kilo price 1900000', hasNumber(seg, 1900000));
  }

  // ۲) JSON-LD چندقیمتی
  const seo = await findLiveChunk((b) => b.includes('AggregateOffer'));
  check('live AggregateOffer chunk found', !!seo, seo ? seo.name : '');
  if (seo) {
    check(
      'lowPrice/highPrice deployed',
      seo.body.includes('lowPrice') && seo.body.includes('highPrice')
    );
  }

  // ۳) صفحه‌ی محصول سالم است و عکس درست دارد
  const page = await get(`${BASE}/product/badam-astane/`);
  check('product page HTTP 200', page.status === 200, `HTTP ${page.status}`);
  check('og:image is badam photo', page.body.includes('1791570387524-307e9f.jpg'));

  const failed = results.filter((r) => !r.ok).length;
  console.log('');
  console.log(
    failed ? `RESULT: ${failed} FAILED of ${results.length}` : `RESULT: ALL ${results.length} PASS`
  );
  process.exit(failed ? 1 : 0);
})().catch((e) => {
  console.error('ERR: ' + e.message);
  process.exit(1);
});
