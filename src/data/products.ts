export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  description: string;
  longDescription: string;
  origin: string;
  features: string[];
  weights: { value: string; price: number }[];
  rating: number;
  reviewCount: number;
  inStock: boolean;
}

export const products: Product[] = [
  {
    id: "1",
    name: "برنج طارم محلی درجه یک",
    slug: "berenj-tarom-mahali-daraje-yek",
    category: "طارم",
    price: 285000,
    originalPrice: 320000,
    image: "/src/assets/rice-tarom.jpg",
    description: "برنج طارم محلی با کیفیت عالی و عطر و طعم بی‌نظیر",
    longDescription: "برنج طارم محلی درجه یک از بهترین شالیزارهای شمال کشور تهیه شده است. این برنج با دانه‌های بلند و باریک، عطر خاص و ری کردن مناسب برای پخت انواع غذاهای ایرانی ایده‌آل است.",
    origin: "گیلان - لاهیجان",
    features: [
      "دانه بلند و باریک",
      "عطر و طعم منحصر به فرد",
      "ری کردن عالی",
      "مناسب برای پلو و دم‌کشیده",
      "بدون شکستگی"
    ],
    weights: [
      { value: "5 کیلوگرم", price: 285000 },
      { value: "10 کیلوگرم", price: 550000 },
      { value: "25 کیلوگرم", price: 1300000 }
    ],
    rating: 4.8,
    reviewCount: 127,
    inStock: true
  },
  {
    id: "2",
    name: "برنج هاشمی معطر",
    slug: "berenj-hashemi-moattar",
    category: "هاشمی",
    price: 320000,
    image: "/src/assets/rice-hashemi.jpg",
    description: "برنج هاشمی معطر با رایحه دلنشین و کیفیت استثنایی",
    longDescription: "برنج هاشمی یکی از مرغوب‌ترین انواع برنج ایرانی است که با عطر خاص و دانه‌های بلند خود شناخته می‌شود. این برنج برای مهمانی‌ها و مجالس خاص بسیار مناسب است.",
    origin: "مازندران - آمل",
    features: [
      "عطر و بوی فوق‌العاده",
      "دانه کشیده و یکدست",
      "کیفیت درجه یک",
      "پخت آسان",
      "مناسب برای مجالس"
    ],
    weights: [
      { value: "5 کیلوگرم", price: 320000 },
      { value: "10 کیلوگرم", price: 620000 },
      { value: "25 کیلوگرم", price: 1480000 }
    ],
    rating: 4.9,
    reviewCount: 203,
    inStock: true
  },
  {
    id: "3",
    name: "برنج فجر گیلان",
    slug: "berenj-fajr-gilan",
    category: "فجر",
    price: 245000,
    image: "/src/assets/rice-fajr.jpg",
    description: "برنج فجر با قیمت مناسب و کیفیت مطلوب",
    longDescription: "برنج فجر گیلان یک گزینه اقتصادی و با کیفیت برای استفاده روزمره است. این برنج با دانه‌های متوسط و پخت راحت، انتخاب مناسبی برای خانواده‌های ایرانی است.",
    origin: "گیلان - رشت",
    features: [
      "قیمت مناسب",
      "کیفیت خوب",
      "دانه متوسط",
      "پخت راحت",
      "مناسب مصرف روزانه"
    ],
    weights: [
      { value: "5 کیلوگرم", price: 245000 },
      { value: "10 کیلوگرم", price: 475000 },
      { value: "25 کیلوگرم", price: 1150000 }
    ],
    rating: 4.5,
    reviewCount: 89,
    inStock: true
  },
  {
    id: "4",
    name: "برنج شیرودی سنتی",
    slug: "berenj-shirudi-sonati",
    category: "شیرودی",
    price: 295000,
    image: "/src/assets/rice-shirudi.jpg",
    description: "برنج شیرودی اصیل با طعم سنتی",
    longDescription: "برنج شیرودی از منطقه شیرود مازندران با روش سنتی کشت و برداشت می‌شود. این برنج با دانه‌های کوچکتر و طعم خاص خود محبوبیت زیادی دارد.",
    origin: "مازندران - شیرود",
    features: [
      "کشت سنتی",
      "طعم اصیل",
      "دانه کوچک",
      "چسبندگی مناسب",
      "مناسب برای کته"
    ],
    weights: [
      { value: "5 کیلوگرم", price: 295000 },
      { value: "10 کیلوگرم", price: 570000 },
      { value: "25 کیلوگرم", price: 1380000 }
    ],
    rating: 4.7,
    reviewCount: 156,
    inStock: true
  }
];

export const categories = [
  { name: "طارم", slug: "tarom", count: 1 },
  { name: "هاشمی", slug: "hashemi", count: 1 },
  { name: "فجر", slug: "fajr", count: 1 },
  { name: "شیرودی", slug: "shirudi", count: 1 }
];
