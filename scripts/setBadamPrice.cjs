// اصلاح قیمت پایه محصول بادام آستانه + یکنواخت‌سازی برچسب وزن‌ها.
// دلایل:
//  ۱) قیمت پایه ۴۵۰,۰۰۰ بود در حالی که ارزان‌ترین وزن (نیم‌کیلو) ۴۷۵,۰۰۰ تومان بود؛
//     یعنی قیمت کارت محصول از ارزان‌ترین گزینه سایت ارزان‌تر نشان داده می‌شد.
//  ۲) برچسب «۵۰۰ گرم» به «نیم کیلو» تغییر می‌کند تا با «۱ کیلو»/«۲ کیلو» یکدست باشد.
//  ۳) چون محصول چند قیمت متفاوت دارد، داده ساختاریافته به AggregateOffer تغییر کرد
//     (بازه واقعی lowPrice/highPrice) تا قیمت اعلامی گوگل با سایت ناهمگار نشود.
const fs = require('fs');
const path = require('path');

const TARGET_SLUG = 'badam-astane';
const NEW_PRICE = 950000;
// برچسب قدیمی → جدید برای وزن‌های بادام
const WEIGHT_LABELS = { '۵۰۰ گرم': 'نیم کیلو' };

const file = path.join(__dirname, '..', 'src', 'data', 'products.json');
const products = JSON.parse(fs.readFileSync(file, 'utf8'));

const idx = products.findIndex((p) => p.slug === TARGET_SLUG);
if (idx < 0) {
  console.error('✗ محصول پیدا نشد: ' + TARGET_SLUG);
  process.exit(1);
}

const p = products[idx];
const beforePrice = p.price;

if (beforePrice !== NEW_PRICE) {
  p.price = NEW_PRICE;
  console.log(`✓ قیمت پایه کارت: ${beforePrice} → ${NEW_PRICE} تومان`);
} else {
  console.log(`– قیمت پایه از قبل ${NEW_PRICE} بود؛ تغییری لازم نبود.`);
}

// یکنواخت‌سازی برچسب وزن‌ها
let labelsChanged = 0;
for (const w of p.weights || []) {
  if (WEIGHT_LABELS[w.value]) {
    console.log(`✓ برچسب وزن: «${w.value}» → «${WEIGHT_LABELS[w.value]}» (${w.price} تومان)`);
    w.value = WEIGHT_LABELS[w.value];
    labelsChanged++;
  }
}

// ذخیره فقط اگر چیزی تغییر کرده باشد
if (beforePrice !== NEW_PRICE || labelsChanged > 0) {
  fs.writeFileSync(file, JSON.stringify(products, null, 2) + '\n', 'utf8');
} else {
  console.log('– تغییری برای ذخیره نبود.');
}

// گزارش نهایی قیمت‌ها
const rows = (p.weights || [])
  .map((w) => `${w.value}: ${w.price}`)
  .join(' | ');
console.log(`  وزن‌ها → ${rows}`);
console.log(`  قیمت پایه (کارت/خانه/فروشگاه) → ${p.price} تومان`);

