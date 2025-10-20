# 🚨 حل خطای 22P02: خطای نوع داده

## خطا
```
Database error code: 22P02
خطا در ذخیره محصول: خطای پایگاه داده
```

## 🔍 علت
خطای **22P02** به معنی "invalid input syntax for type" است.  
این خطا زمانی رخ می‌دهد که نوع داده‌ای که ارسال می‌کنید با نوع فیلد در پایگاه داده مطابقت ندارد.

**مشکلات احتمالی:**
- فیلد `features` باید `TEXT[]` باشد ولی ممکن است `JSONB` باشد
- فیلد `weights` باید `JSONB` باشد ولی ممکن است `TEXT[]` باشد
- فیلد `price` باید `NUMERIC` باشد ولی ممکن است `TEXT` باشد

## ✅ راه حل سریع (3 دقیقه)

### گام 1: اجرای SQL در Supabase

1. به پنل Supabase بروید → **SQL Editor**
2. این کد را کپی و پیست کنید:

```sql
-- اصلاح نوع features به TEXT[]
ALTER TABLE products ALTER COLUMN features TYPE TEXT[]
USING CASE
  WHEN features IS NULL THEN '{}'::TEXT[]
  WHEN pg_typeof(features) = 'jsonb'::regtype THEN
    ARRAY(SELECT jsonb_array_elements_text(features))
  ELSE features
END;

ALTER TABLE products ALTER COLUMN features SET DEFAULT '{}';
ALTER TABLE products ALTER COLUMN features DROP NOT NULL;

-- اصلاح نوع weights به JSONB
ALTER TABLE products ALTER COLUMN weights TYPE JSONB
USING CASE
  WHEN weights IS NULL THEN '[]'::JSONB
  WHEN weights::TEXT = '' THEN '[]'::JSONB
  ELSE weights::JSONB
END;

ALTER TABLE products ALTER COLUMN weights SET DEFAULT '[]'::JSONB;
ALTER TABLE products ALTER COLUMN weights DROP NOT NULL;

-- اصلاح نوع قیمت‌ها
ALTER TABLE products ALTER COLUMN price TYPE NUMERIC(10,2) USING price::numeric;
ALTER TABLE products ALTER COLUMN original_price TYPE NUMERIC(10,2) USING original_price::numeric;
ALTER TABLE products ALTER COLUMN original_price DROP NOT NULL;

-- اصلاح فیلدهای دیگر
ALTER TABLE products ALTER COLUMN category_id DROP NOT NULL;
ALTER TABLE products ALTER COLUMN image_url DROP NOT NULL;
ALTER TABLE products ALTER COLUMN in_stock SET DEFAULT true;

-- پاکسازی داده‌های نامعتبر
UPDATE products
SET
  features = COALESCE(features, '{}'),
  weights = COALESCE(weights, '[]'::JSONB),
  category_id = NULLIF(category_id, ''),
  image_url = NULLIF(image_url, ''),
  in_stock = COALESCE(in_stock, true)
WHERE
  features IS NULL
  OR weights IS NULL;
```

3. روی **Run** کلیک کنید

### گام 2: بررسی نوع داده‌ها

بررسی کنید که نوع‌ها درست شده‌اند:

```sql
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'products'
AND column_name IN ('features', 'weights', 'price', 'category_id', 'image_url');
```

**نتیجه باید:**
- `features` → `ARRAY` (TEXT[])
- `weights` → `jsonb`
- `price` → `numeric`
- `category_id` → `text` (nullable: YES)
- `image_url` → `text` (nullable: YES)

### گام 3: تست Insert

این کوئری را اجرا کنید تا مطمئن شوید همه چیز کار می‌کند:

```sql
INSERT INTO products (
  name,
  slug,
  category_id,
  price,
  description,
  long_description,
  origin,
  features,
  weights,
  in_stock
) VALUES (
  'تست محصول',
  'test-' || floor(random() * 10000)::TEXT,
  'hashemi',
  50000,
  'توضیحات تست',
  'توضیحات کامل',
  'گیلان',
  ARRAY['ویژگی ۱', 'ویژگی ۲'],
  '[{"value": "1kg", "price": 50000}]'::JSONB,
  true
) RETURNING id, name, category_id, features, weights;
```

اگر این کوئری بدون خطا اجرا شد، یعنی مشکل حل شده است.

### گام 4: پاک کردن Cache و تست

1. Cache مرورگر را پاک کنید: **Ctrl + Shift + R**
2. از حساب خود Logout کنید
3. دوباره Login کنید
4. به پنل ادمین بروید: `/admin/products`
5. سعی کنید محصول جدید اضافه کنید

## 🔧 اگر هنوز خطا دارید

### بررسی Console مرورگر

1. پنل ادمین را باز کنید
2. **F12** را بزنید
3. به تب **Console** بروید
4. سعی کنید محصول ذخیره کنید
5. به دنبال این پیام‌ها بگردید:

```
Data types: { ... }
Features content: [ ... ]
Weights content: [ ... ]
```

این لاگ‌ها نوع داده‌های ارسال شده را نشان می‌دهند.

### اسکریپت تست کامل

برای تست کامل‌تر، فایل `CHECK_AND_FIX_TYPES.sql` را در SQL Editor اجرا کنید.  
این اسکریپت:
- ✅ تمام نوع‌ها را چک می‌کند
- ✅ مشکلات را اصلاح می‌کند
- ✅ تست insert انجام می‌دهد
- ✅ گزارش کامل می‌دهد

## 📊 نمونه داده‌های صحیح

### Features (باید array باشد):
```javascript
// ✅ صحیح
features: ['دانه بلند', 'عطر خوب', 'درجه یک']

// ❌ اشتباه
features: '["دانه بلند", "عطر خوب"]'  // string نباشد
features: {"0": "دانه بلند"}           // object نباشد
```

### Weights (باید JSONB array باشد):
```javascript
// ✅ صحیح
weights: [
  { value: "1kg", price: 50000 },
  { value: "2kg", price: 95000 }
]

// ❌ اشتباه
weights: "1kg, 2kg"                    // string نباشد
weights: '["1kg", "2kg"]'              // array of strings نباشد
```

### Price (باید number باشد):
```javascript
// ✅ صحیح
price: 50000
price: 50000.50

// ❌ اشتباه
price: "50000"        // string نباشد
price: "50,000"       // با کاما نباشد
```

## 🎯 چک‌لیست نهایی

- [ ] SQL را در Supabase اجرا کردم
- [ ] نوع `features` حالا `ARRAY` است
- [ ] نوع `weights` حالا `jsonb` است
- [ ] نوع `price` حالا `numeric` است
- [ ] تست Insert موفق بود
- [ ] Cache مرورگر را پاک کردم
- [ ] دوباره login کردم
- [ ] محصول جدید اضافه کردم و کار کرد

## 🆘 هنوز مشکل دارید؟

اگر بعد از انجام همه مراحل بالا هنوز خطا می‌گیرید:

1. **اسکرین‌شات از Console بگیرید** (F12 → Console)
2. **این کوئری را اجرا کنید و نتیجه را بفرستید:**
   ```sql
   SELECT column_name, data_type, udt_name
   FROM information_schema.columns
   WHERE table_name = 'products';
   ```
3. **یکی از محصولات موجود را ببینید:**
   ```sql
   SELECT id, name, category_id, 
          pg_typeof(features) as features_type,
          pg_typeof(weights) as weights_type,
          features, weights
   FROM products
   LIMIT 1;
   ```

## ✨ بعد از حل مشکل

وقتی مشکل حل شد:
- محصولات شما با دسته‌بندی ذخیره می‌شوند ✅
- خطای 22P02 دیگر نمی‌آید ✅
- فرم‌ها بدون مشکل کار می‌کنند ✅

---

**نکته مهم:** این خطا ربطی به RLS policies یا دسترسی ادمین ندارد.  
فقط مربوط به نوع داده‌هاست. پس نگران نباشید!