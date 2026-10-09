// بررسی زنده/محلی متن‌های صفحه اصلی در چانک Home
const fs = require('fs');
const https = require('https');

const checks = [
  ['محصولات فروشگاه', true],
  ['برنج ایرانی، چای لاهیجان و بادام آستانه', true],
  ['محبوب‌ترین برنج‌های ما', false],
];

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => resolve(d));
    }).on('error', reject);
  });
}

(async () => {
  const local = fs.readdirSync('dist/assets').find((x) => x.startsWith('Home-'));
  if (local) {
    const c = fs.readFileSync('dist/assets/' + local, 'utf8');
    console.log('=== LOCAL dist (' + local + ') ===');
    for (const [s, want] of checks) console.log((c.includes(s) === want ? 'PASS' : 'FAIL') + ' | ' + (want ? 'has' : 'no') + ' | ' + s);
    const i = c.indexOf('محصولات فروشگاه');
    console.log('context:', JSON.stringify(c.slice(i - 30, i + 260)));
  }

  console.log('=== LIVE ===');
  const html = await get('https://atre-shalizar.ir');
  const idx = (html.match(/index-[A-Za-z0-9_-]+\.js/) || [''])[0];
  const bundle = await get('https://atre-shalizar.ir/assets/' + idx);
  const home = (bundle.match(/Home-[A-Za-z0-9_-]+\.js/) || [''])[0];
  const c = await get('https://atre-shalizar.ir/assets/' + home);
  console.log('live home chunk:', home);
  for (const [s, want] of checks) console.log((c.includes(s) === want ? 'PASS' : 'FAIL') + ' | ' + (want ? 'has' : 'no') + ' | ' + s);
})().catch((e) => console.error(e.message));
