# 🚀 راهنمای سریع: حل مشکل دسته‌بندی

## مشکل
دسته‌بندی محصولات در پنل ادمین ذخیره نمی‌شود و تغییر نمی‌کند.

## راه حل (فقط 2 دقیقه!)

### گام 1: اجرای SQL در Supabase ⚡

1. به پنل Supabase بروید → **SQL Editor**
2. این کد را کپی و اجرا کنید:

```sql
-- افزودن ستون‌های جدید
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;

-- انتقال داده‌ها
UPDATE products SET category_id = category WHERE category_id IS NULL AND category IS NOT NULL;
UPDATE products SET image_url = image WHERE image_url IS NULL AND image IS NOT NULL;

-- حذف ستون‌های قدیمی
ALTER TABLE products DROP COLUMN IF EXISTS category;
ALTER TABLE products DROP COLUMN IF EXISTS image;

-- تنظیم محدودیت‌ها
ALTER TABLE products ALTER COLUMN category_id DROP NOT NULL;
ALTER TABLE products ALTER COLUMN image_url DROP NOT NULL;
ALTER TABLE products ALTER COLUMN description SET DEFAULT 'توضیحی ارائه نشده';
ALTER TABLE products ALTER COLUMN long_description SET DEFAULT 'توضیحات کامل ارائه نشده';
ALTER TABLE products ALTER COLUMN origin SET DEFAULT 'نامشخص';

-- ایجاد ایندکس
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);

-- به‌روزرسانی RLS Policies
DROP POLICY IF EXISTS "Allow admin users to insert products" ON products;
DROP POLICY IF EXISTS "Allow admin users to update products" ON products;

CREATE POLICY "Allow admin users to insert products" ON products FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND
  (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
   OR auth.jwt() ->> 'email' = 'hamedalipour38@gmail.com')
);

CREATE POLICY "Allow admin users to update products" ON products FOR UPDATE
USING (
  auth.role() = 'authenticated' AND
  (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
   OR auth.jwt() ->> 'email' = 'hamedalipour38@gmail.com')
)
WITH CHECK (
  auth.role() = 'authenticated' AND
  (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
   OR auth.jwt() ->> 'email' = 'hamedalipour38@gmail.com')
);
```

### گام 2: بررسی نقش ادمین 👤

در SQL Editor این کد را اجرا کنید:

```sql
-- بررسی نقش
SELECT email, role FROM user_profiles WHERE email = 'hamedalipour38@gmail.com';

-- اگر admin نبود، این را اجرا کنید:
UPDATE user_profiles SET role = 'admin' WHERE email = 'hamedalipour38@gmail.com';
```

### گام 3: تست کنید ✅

1. Cache مرورگر را پاک کنید (Ctrl + Shift + R)
2. به پنل ادمین بروید: `/admin/products`
3. محصول جدید اضافه کنید
4. **دسته‌بندی** را انتخاب کنید
5. ذخیره کنید

## ✨ تمام!

اگر مشکل حل نشد:
- Console مرورگر (F12) را چک کنید
- مطمئن شوید که لاگین کرده‌اید
- فایل `FIX_CATEGORY_GUIDE.md` را برای راهنمای کامل ببینید

## 🧪 تست اتوماتیک (اختیاری)

```bash
node test_category_fix.js
```

این اسکریپت همه چیز را تست می‌کند و مشکلات احتمالی را نشان می‌دهد.

---

**نکته**: تمام فایل‌های کد قبلاً آپدیت شده‌اند. فقط SQL را اجرا کنید!