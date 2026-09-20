// لایه تایپ‌شده روی داده محصولات.
// منبع حقیقت: products.json — توسط پنل مدیریت محلی (panel/server.cjs) ویرایش می‌شود.
import productsData from "./products.json";

export interface Product {
  id: string;
  name: string;
  slug: string;
  /** اسلاگ انگلیسی دسته‌بندی: tarom | hashemi | fajr | shirodi | chai-siah | chai-sabz | damnoosh */
  category: string;
  price: number;
  originalPrice?: number | null;
  image: string;
  description: string;
  longDescription: string;
  origin: string;
  features: string[];
  weights: { value: string; price: number }[];
  rating: number;
  reviewCount: number;
  inStock: boolean;
  /** سئوی اختصاصی محصول (اختیاری) — در متاتگ‌های صفحه محصول استفاده می‌شود */
  metaTitle?: string | null;
  metaDescription?: string | null;
}

export const products: Product[] = productsData as Product[];

export const categories = [
  { name: "طارم", slug: "tarom" },
  { name: "هاشمی", slug: "hashemi" },
  { name: "فجر", slug: "fajr" },
  { name: "شیرودی", slug: "shirodi" },
  { name: "چای سیاه", slug: "chai-siah" },
  { name: "چای سبز", slug: "chai-sabz" },
  { name: "دمنوش", slug: "damnoosh" },
];

export const categoryName = (slug: string): string =>
  categories.find((c) => c.slug === slug)?.name || slug;

/**
 * صفحات دسته‌بندی اختصاصی (/category/:slug) — برای سئو هر گروه یک URL مستقل دارد.
 * ids: مقادیر category در products.json که در این صفحه نمایش داده می‌شوند.
 */
export const CATEGORY_PAGES = [
  {
    slug: "berenj",
    name: "برنج ایرانی",
    h1: "خرید برنج ایرانی اصل از شالیزارهای شمال",
    ids: ["tarom", "hashemi", "fajr", "shirodi"],
    seoTitle:
      "خرید برنج ایرانی اصل | قیمت روز برنج طارم، هاشمی، فجر و شیرودی – عطر شالیزار",
    seoDescription:
      "خرید آنلاین برنج ایرانی اصل با قیمت روز؛ برنج طارم، هاشمی، فجر و شیرودی برداشت تازه از شالیزارهای گیلان و مازندران، بسته‌بندی ۵ و ۱۰ کیلویی و ارسال سریع به سراسر ایران از فروشگاه عطر شالیزار.",
    intro: [
      "برنج ایرانی سفره‌ی ما را به هیچ برنج خارجی‌ای نمی‌شود بخشید. عطر، لعاب سفید و دانه‌ی بلند و خوش‌پخت برنج شمال، چیزی است که سال‌هاست در سفره‌های ایرانی جا باز کرده است. در فروشگاه عطر شالیزار، برنج را مستقیم از شالیزارهای گیلان و مازندران تهیه می‌کنیم؛ بدون واسطه، با عیار تضمینی و برداشت تازه‌ی هر فصل.",
      "در این صفحه می‌توانید انواع برنج اصل ایرانی را با هم مقایسه کنید: برنج طارم عطری بی‌نظیر و دانه‌ی کشیده دارد، برنج هاشمی معروف به «سلطان برنج‌ها» پادشاه مهمانی‌های ایرانی است، برنج فجر انتخاب اقتصادی و خوش‌پخت هر روزه است و برنج شیرودی برای عطری قوی و قیمتی مناسب، محبوب خانواده‌هاست.",
      "همه‌ی برنج‌ها با ساک‌های ۵ و ۱۰ کیلویی عرضه می‌شوند و پیش از ارسال، شال و عیار برنج به‌صورت دستی کنترل می‌شود. برای راهنمای پخت حرفه‌ای برنج دم‌کشیده، مقاله‌های آموزشی انتهای همین صفحه را از دست ندهید.",
    ],
    blogSlugs: [
      "rahnama-pokht-berenj-irani",
      "tafavot-berenj-tarom-hashemi",
      "negahdari-berenj",
    ],
  },
  {
    slug: "chai",
    name: "چای ایرانی",
    h1: "خرید چای ایرانی اصل لاهیجان – سیاه، سبز و دمنوش",
    ids: ["chai-siah", "chai-sabz", "damnoosh"],
    seoTitle:
      "خرید چای ایرانی اصل لاهیجان | چای سیاه، چای سبز و دمنوش با قیمت مناسب – عطر شالیزار",
    seoDescription:
      "خرید چای ایرانی اصل با قیمت روز؛ چای سیاه بهاره لاهیجان، چای سبز باروتی گیلان و دمنوش گل محمدی، مستقیم از باغ‌های چای شمال کشور با بسته‌بندی مطمئن و ارسال سریع از فروشگاه عطر شالیزار.",
    intro: [
      "چای ایرانی، مزه‌ی اصالت است. چای سیاه بهاره‌ی لاهیجان با رنگ عسلی و عطر باغ‌های گیلان، چای سبز باروتی با طعم ملایم و خواص آنتی‌اکسیدانی، و دمنوش گل محمدی کاشان برای آرامش؛ سه انتخاب برای هر سلیقه‌ای.",
      "ما چای‌ها را مستقیم از باغ‌های چای شمال کشور تأمین می‌کنیم؛ بدون رنگ، بدون عطر افزودنی و با برگ کامل. اگر نمی‌دانید چای اصل لاهیجان را از کجا بخرید یا تفاوت چای سیاه و سبز چیست، مقاله‌های راهنمای انتهای همین صفحه برای شما نوشته شده‌اند.",
      "چای‌ها در بسته‌های ۲۵۰ گرمی و نیم‌کیلویی بسته‌بندی می‌شوند و به‌صورت هم‌زمان با برنج نیز قابل سفارش هستند؛ ترکیبی محبوب برای هدیه و مهمانی.",
    ],
    blogSlugs: [
      "chai-lahijan-chist-rahnemaye-kharid",
      "tafavot-chai-siah-va-chai-sabz",
      "dam-kardan-chai-irani-droost",
    ],
  },
] as const;

