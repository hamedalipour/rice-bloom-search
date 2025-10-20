# راهنمای حل مشکل دسته‌بندی در پنل ادمین محصولات

## 🔴 مشکل
در پنل ادمین، هنگام افزودن یا ویرایش محصولات، دسته‌بندی ذخیره نمی‌شود و تغییر نمی‌کند.

## 🔍 علت مشکل
ساختار جدول `products` در پایگاه داده با کد فرانت‌اند مطابقت ندارد:
- جدول قدیمی از فیلد `category` استفاده می‌کند
- کد جدید از فیلد `category_id` استفاده می‌کند
- همچنین مشکل مشابه برای فیلد تصویر (`image` در مقابل `image_url`)

## ✅ راه حل (3 مرحله ساده)

### مرحله 1️⃣: اجرای اسکریپت SQL در Supabase

1. به پنل Supabase خود بروید
2. از منوی سمت چپ، گزینه **SQL Editor** را انتخاب کنید
3. روی **New query** کلیک کنید
4. محتوای فایل `FIX_CATEGORY_ISSUE.sql` را کپی کنید
5. در SQL Editor پیست کنید
6. روی دکمه **Run** کلیک کنید

**نتیجه مورد انتظار:**
```
✓ All required columns exist
✓ Old "category" column removed
✓ Old "image" column removed
Found 4 RLS policies on products table
====================================
FIX COMPLETED SUCCESSFULLY!
====================================
```

### مرحله 2️⃣: بررسی ساختار جدول

بعد از اجرای اسکریپت، این کوئری را اجرا کنید تا ساختار جدول را ببینید:

```sql
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'products'
ORDER BY ordinal_position;
```

**باید این فیلدها را ببینید:**
- ✅ `category_id` (TEXT, nullable)
- ✅ `image_url` (TEXT, nullable)
- ✅ `name` (TEXT, NOT NULL)
- ✅ `slug` (TEXT, NOT NULL)
- ✅ `price` (numeric, NOT NULL)
- ✅ `description` (TEXT, nullable با default)
- ✅ `long_description` (TEXT, nullable با default)
- ✅ `origin` (TEXT, nullable با default)
- ✅ `features` (ARRAY, TEXT[])
- ✅ `weights` (JSONB)

### مرحله 3️⃣: تست کردن

1. به پنل ادمین بروید: `/admin/products`
2. روی "افزودن محصول جدید" کلیک کنید
3. فرم را پر کنید:
   - نام محصول: تست
   - اسلاگ: test-product
   - **دسته‌بندی**: برنج هاشمی (یا هر دسته دیگر)
   - قیمت: 100000
   - سایر فیلدها را هم پر کنید
4. روی "افزودن" کلیک کنید
5. بررسی کنید که محصول با دسته‌بندی صحیح ذخیره شده است

## 🔧 عیب‌یابی

### اگر هنوز مشکل دارید:

#### 1. بررسی دسترسی ادمین
```sql
-- بررسی کنید که کاربر شما ادمین است
SELECT id, email, role 
FROM user_profiles 
WHERE email = 'hamedalipour38@gmail.com';
```

نتیجه باید `role = 'admin'` باشد.

اگر نبود، این کوئری را اجرا کنید:
```sql
UPDATE user_profiles 
SET role = 'admin' 
WHERE email = 'hamedalipour38@gmail.com';
```

#### 2. بررسی RLS Policies
```sql
-- نمایش تمام policies روی جدول products
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'products';
```

باید 4 policy ببینید:
- `Allow read access to products for all users` (SELECT)
- `Allow admin users to insert products` (INSERT)
- `Allow admin users to update products` (UPDATE)
- `Allow admin users to delete products` (DELETE)

#### 3. تست دسترسی مستقیم
این کوئری را در SQL Editor اجرا کنید:
```sql
-- تست insert
INSERT INTO products (name, slug, category_id, price, description, long_description, origin)
VALUES ('تست محصول', 'test-product-' || floor(random() * 1000), 'hashemi', 50000, 'توضیحات', 'توضیحات کامل', 'گیلان')
RETURNING *;
```

اگر این کار کرد، یعنی مشکل در RLS policies است.

#### 4. بررسی Console در مرورگر
1. پنل ادمین را باز کنید
2. F12 را بزنید تا Console باز شود
3. سعی کنید محصول جدید اضافه کنید
4. پیام‌های خطا را بخوانید

**خطاهای متداول:**
- `"column does not exist"` → اسکریپت SQL را دوباره اجرا کنید
- `"permission denied"` → دسترسی ادمین را چک کنید
- `"duplicate key"` → اسلاگ تکراری است، اسلاگ دیگری انتخاب کنید
- `"null value violates not-null constraint"` → یکی از فیلدهای اجباری خالی است

## 📝 توضیحات تکمیلی

### تغییرات انجام شده در کد

فایل‌های زیر آپدیت شده‌اند:

1. **`src/hooks/useProducts.ts`**
   - استفاده از `category_id` به جای `category`
   - استفاده از `image_url` به جای `image`
   - بهبود error handling

2. **`src/components/ProductForm.tsx`**
   - فرم از `category_id` استفاده می‌کند
   - validation بهتر برای فیلدها

3. **`supabase/migrations/008_fix_category_field.sql`**
   - Migration جدید برای تغییر ساختار جدول

4. **`FIX_CATEGORY_ISSUE.sql`**
   - اسکریپت SQL مستقل که می‌توانید مستقیماً اجرا کنید

### مقادیر معتبر برای category_id

```javascript
'hashemi'   // برنج هاشمی
'tarom'     // برنج طارم
'fajr'      // برنج فجر
'shirodi'   // برنج شیرودی
'general'   // عمومی
null        // بدون دسته‌بندی (مجاز است)
```

### ساختار weights (اختیاری)

```json
[
  { "value": "1kg", "price": 50000 },
  { "value": "2kg", "price": 95000 },
  { "value": "5kg", "price": 230000 }
]
```

### ساختار features (اختیاری)

```json
[
  "دانه بلند و باریک",
  "عطر و طعم خوب",
  "کیفیت درجه یک"
]
```

## 🎯 چک‌لیست نهایی

قبل از تماس برای پشتیبانی، موارد زیر را بررسی کنید:

- [ ] اسکریپت `FIX_CATEGORY_ISSUE.sql` با موفقیت اجرا شد
- [ ] کاربر شما role ادمین دارد
- [ ] RLS policies صحیح هستند (4 policy)
- [ ] فیلدهای `category_id` و `image_url` در جدول وجود دارند
- [ ] فیلدهای `category` و `image` قدیمی حذف شده‌اند
- [ ] Cache مرورگر را پاک کرده‌اید (Ctrl + Shift + R)
- [ ] Console مرورگر را برای خطاها بررسی کرده‌اید

## 🆘 پشتیبانی

اگر بعد از انجام تمام مراحل بالا همچنان مشکل دارید:

1. اسکرین‌شات از Console مرورگر بگیرید (F12)
2. نتیجه این کوئری را بفرستید:
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'products';
```
3. نتیجه این کوئری را بفرستید:
```sql
SELECT email, role FROM user_profiles WHERE email = 'hamedalipour38@gmail.com';
```

## ✨ موفق باشید!

بعد از انجام این مراحل، مشکل دسته‌بندی باید حل شود و بتوانید محصولات را با دسته‌بندی صحیح ذخیره کنید.