-- ============================================================================
--  SECURITY RLS HARDENING — فروشگاه عطر شالیزار
--  این فایل را کامل در Supabase SQL Editor اجرا کنید (Dashboard → SQL Editor).
--
--  ⚠️  این اسکریپت همه Policy های جداول products / blog_posts / user_profiles /
--      orders و پالیسی‌های باکت product-images را حذف و از نو با حالت امن می‌سازد.
--      قبل از اجرا، بخش «تشخیص» را اجرا کنید و خروجی را برای مقایسه ذخیره کنید.
-- ============================================================================

-- ============================================================================
-- بخش ۰) تشخیص — وضعیت فعلی پالیسی‌ها را ببینید (فقط SELECT، بی‌خطر)
-- ============================================================================
SELECT schemaname, tablename, policyname, cmd, roles
FROM pg_policies
WHERE tablename IN ('products', 'blog_posts', 'user_profiles', 'orders')
   OR (schemaname = 'storage' AND tablename = 'objects')
ORDER BY tablename, policyname;

-- آیا جدول‌ها RLS دارند؟ (rowsecurity = false یعنی جدول کاملاً باز است!)
SELECT c.relname AS table_name, c.relrowsecurity AS rls_enabled
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relname IN ('products','blog_posts','user_profiles','orders');

-- ============================================================================
-- بخش ۱) حذف همه پالیسی‌های موجود روی جداول هدف (شروع تمیز)
-- ============================================================================
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE (schemaname = 'public' AND tablename IN ('products','blog_posts','user_profiles','orders'))
       OR (schemaname = 'storage' AND tablename = 'objects'
           AND (policyname ILIKE '%image%' OR policyname ILIKE '%product%'))
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- ============================================================================
-- بخش ۲) تابع کمکی is_admin — SECURITY DEFINER تا RLS پروفایل‌ها روی خودش
--        بازگشتی (recursion) نشود
-- ============================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ============================================================================
-- بخش ۳) محصولات — عمومی فقط بخواند، ادمین بنویسد
--        (پالیسی خطرناک «Allow all operations for testing» با USING (true)
--         و پالیسی email LIKE '%admin%' اینجا برای همیشه حذف می‌شوند)
-- ============================================================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_public_select" ON products
  FOR SELECT USING (true);

CREATE POLICY "products_admin_insert" ON products
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "products_admin_update" ON products
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "products_admin_delete" ON products
  FOR DELETE USING (public.is_admin());

-- ============================================================================
-- بخش ۴) مقالات وبلاگ — منتشرشده‌ها عمومی، بقیه فقط ادمین
-- ============================================================================
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "blog_public_select" ON blog_posts
  FOR SELECT USING (published = true OR public.is_admin());

CREATE POLICY "blog_admin_write" ON blog_posts
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "blog_admin_update" ON blog_posts
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "blog_admin_delete" ON blog_posts
  FOR DELETE USING (public.is_admin());

-- ============================================================================
-- بخش ۵) پروفایل کاربران — هر کاربر فقط ردیف خودش + جلوگیری از خودارتقایی نقش
-- ============================================================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON user_profiles
  FOR SELECT USING (id = auth.uid() OR public.is_admin());

CREATE POLICY "profiles_insert_self" ON user_profiles
  FOR INSERT WITH CHECK (id = auth.uid() AND role = 'customer');

CREATE POLICY "profiles_update_own" ON user_profiles
  FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_admin_all" ON user_profiles
  FOR ALL USING (public.is_admin());

-- ترینگات: تغییر role فقط از SQL Editor (که auth.uid() خالی دارد) ممکن است
CREATE OR REPLACE FUNCTION public.guard_user_profiles()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.role IS DISTINCT FROM OLD.role
       AND auth.uid() IS NOT DISTINCT FROM OLD.id THEN
      RAISE EXCEPTION 'تغییر نقش کاربر از سمت کلاینت مجاز نیست';
    END IF;
  END IF;
  IF TG_OP = 'INSERT' AND auth.uid() IS NOT NULL THEN
    -- ثبت‌نام از طریق سایت همیشه با نقش customer شروع می‌شود
    NEW.role := 'customer';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS guard_user_profiles_trigger ON user_profiles;
CREATE TRIGGER guard_user_profiles_trigger
  BEFORE INSERT OR UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_user_profiles();

-- ============================================================================
-- بخش ۶) سفارش‌ها — ثبت مهمان مجاز، خواندن/ویرایش فقط ادمین
--        (نام، تلفن و آدرس مشتریان = داده شخصی و باید محافظت شود)
-- ============================================================================
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- مهمان‌ها فقط می‌توانند سفارش جدید (در وضعیت pending) ثبت کنند
CREATE POLICY "orders_guest_insert" ON orders
  FOR INSERT WITH CHECK (status = 'pending');

CREATE POLICY "orders_admin_select" ON orders
  FOR SELECT USING (public.is_admin());

CREATE POLICY "orders_admin_update" ON orders
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "orders_admin_delete" ON orders
  FOR DELETE USING (public.is_admin());

-- ترینگات: سفارش غیرادمین همیشه با status='pending' ثبت می‌شود و مبلغ منفی رد می‌شود
CREATE OR REPLACE FUNCTION public.guard_orders()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM 'pending' AND NOT public.is_admin() THEN
    NEW.status := 'pending';
  END IF;
  IF NEW.total_amount IS NULL OR NEW.total_amount < 0 THEN
    RAISE EXCEPTION 'مبلغ سفارش نامعتبر است';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS guard_orders_trigger ON orders;
CREATE TRIGGER guard_orders_trigger
  BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION public.guard_orders();

-- ============================================================================
-- بخش ۷) باکت تصاویر محصولات — عمومی فقط بخواند، نوشتن/حذف فقط ادمین
--        (تا الان هر کاربر لاگین‌شده می‌توانست همه تصاویر را حذف/جایگزین کند!)
-- ============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "product_images_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "product_images_admin_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "product_images_admin_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "product_images_admin_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'product-images' AND public.is_admin());

-- ============================================================================
-- بخش ۸) راستی‌آزمایی نهایی
-- ============================================================================
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('products','blog_posts','user_profiles','orders')
   OR (schemaname = 'storage' AND tablename = 'objects')
ORDER BY tablename, policyname;

-- ✅ پس از اجرا، این موارد را تست کنید:
--    ۱) حالت مهمان: صفحه فروشگاه و محصولات کار کند (خواندن عمومی)
--    ۲) حالت مهمان: ثبت سفارش کار کند
--    ۳) اکانت ادمین: پنل /admin و آپلود تصویر کار کند
--    ۴) اکانت مشتری عادی: /admin باز نشود و آپلود تصویر خطای دسترسی بدهد


