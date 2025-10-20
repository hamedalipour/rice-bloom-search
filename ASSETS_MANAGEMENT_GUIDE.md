# 📁 راهنمای کامل مدیریت Assets

## 🎯 خلاصه

سیستم جدید مدیریت Assets به شما امکان می‌دهد:
- ✅ تصاویر موجود در پوشه assets را مشاهده کنید
- ✅ تصاویر جدید آپلود کنید
- ✅ تصاویر را در محصولات استفاده کنید
- ✅ تصاویر غیرضروری را حذف کنید
- ✅ همه تغییرات را به صورت Real-time ببینید

---

## 🚀 راه‌اندازی (یک‌بار)

### گام 1: نصب وابستگی‌ها

```bash
npm install
```

این دستور پکیج‌های زیر را نصب می‌کند:
- `express` - سرور آپلود
- `multer` - مدیریت فایل‌های آپلودی
- `cors` - امنیت Cross-Origin
- `concurrently` - اجرای همزمان سرورها

### گام 2: ساختار پوشه‌ها

پوشه‌های زیر به صورت خودکار ایجاد می‌شوند:

```
public/
  └── assets/
      └── products/        ← تصاویر محصولات اینجا ذخیره می‌شوند
          ├── .index.json  ← فهرست خودکار فایل‌ها
          └── [uploaded images]

server/
  └── upload-server.js     ← سرور آپلود فایل
```

---

## 🎮 استفاده

### روش 1: اجرای کامل (پیشنهادی)

این روش هم سرور اصلی و هم سرور آپلود را اجرا می‌کند:

```bash
npm run dev:full
```

یا:

```bash
npm run dev
```

سپس در ترمینال دوم:

```bash
npm run upload-server
```

### روش 2: فقط سرور اصلی

اگر فقط می‌خواهید از تصاویر static استفاده کنید:

```bash
npm run dev
```

---

## 📸 آپلود تصویر در پنل ادمین

### مرحله به مرحله:

1. **وارد پنل ادمین شوید**: `/admin/products`

2. **فرم محصول را باز کنید**:
   - برای محصول جدید: "افزودن محصول جدید"
   - برای ویرایش: آیکون مداد

3. **در قسمت تصویر محصول**:
   - روی دکمه **"انتخاب از پوشه Assets"** کلیک کنید
   - پنجره Asset Selector باز می‌شود

4. **آپلود تصویر جدید**:
   - روی دکمه **"آپلود تصویر جدید"** کلیک کنید
   - فایل تصویر را انتخاب کنید (JPG, PNG, WebP)
   - منتظر بمانید تا آپلود تمام شود
   - تصویر به صورت خودکار در لیست ظاهر می‌شود

5. **انتخاب تصویر**:
   - روی تصویر مورد نظر کلیک کنید
   - علامت چک ✓ روی تصویر نمایش داده می‌شود
   - آدرس تصویر در فرم قرار می‌گیرد

6. **ذخیره محصول**:
   - روی "افزودن" یا "ذخیره" کلیک کنید
   - تصویر با محصول ذخیره می‌شود

---

## 🎨 ویژگی‌های Asset Selector

### 1. نمایش تصاویر

- **تصاویر Static** (با نشان آبی "ثابت"):
  - تصاویر موجود در `src/assets`
  - قابل حذف نیستند
  - همیشه در دسترس هستند

- **تصاویر آپلود شده**:
  - تصاویر موجود در `public/assets/products`
  - قابل حذف هستند
  - با آیکون سطل زباله 🗑️

### 2. اطلاعات هر تصویر

برای هر تصویر نمایش داده می‌شود:
- 🖼️ پیش‌نمایش تصویر
- 📝 نام فایل
- 📏 حجم فایل
- 📅 تاریخ آخرین تغییر (برای فایل‌های آپلودی)

### 3. عملیات

- **بروزرسانی** 🔄: لیست تصاویر را به‌روز می‌کند
- **آپلود** ⬆️: تصویر جدید اضافه می‌کند
- **حذف** 🗑️: تصویر آپلودی را حذف می‌کند (فقط برای تصاویر غیر static)

---

## ⚙️ API Endpoints

سرور آپلود این endpoint ها را فراهم می‌کند:

### 1. آپلود تصویر

```http
POST /api/upload-asset
Content-Type: multipart/form-data

Body:
  file: [image file]
```

**Response:**
```json
{
  "success": true,
  "path": "/assets/products/1234567890_image.jpg",
  "filename": "1234567890_image.jpg",
  "size": 245678,
  "mimetype": "image/jpeg"
}
```

### 2. حذف تصویر

```http
DELETE /api/delete-asset?filename=1234567890_image.jpg
```

**Response:**
```json
{
  "success": true,
  "message": "فایل با موفقیت حذف شد"
}
```

### 3. لیست تصاویر

```http
GET /api/list-assets
```

**Response:**
```json
{
  "success": true,
  "assets": [
    {
      "filename": "1234567890_image.jpg",
      "name": "image.jpg",
      "size": 245678,
      "lastModified": "2025-01-20T10:30:00.000Z",
      "path": "/assets/products/1234567890_image.jpg"
    }
  ],
  "count": 1
}
```

### 4. Health Check

```http
GET /api/health
```

**Response:**
```json
{
  "status": "ok",
  "service": "assets-upload-server",
  "version": "1.0.0"
}
```

---

## 📋 محدودیت‌ها و قوانین

### فرمت‌های مجاز:
- ✅ JPG / JPEG
- ✅ PNG
- ✅ WebP
- ✅ GIF
- ❌ سایر فرمت‌ها (PDF, SVG, etc.)

### محدودیت حجم:
- حداکثر: **5 مگابایت**
- توصیه: کمتر از 1 مگابایت برای performance بهتر

### نام‌گذاری خودکار:
فایل‌ها با این فرمت نام‌گذاری می‌شوند:
```
[timestamp]_[original-filename]
```

مثال:
```
1705746600000_rice-hashemi.jpg
```

این از تکراری بودن نام‌ها جلوگیری می‌کند.

---

## 🛠️ توسعه و سفارشی‌سازی

### تغییر محدودیت حجم

در `server/upload-server.js`:

```javascript
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB به جای 5MB
  },
  // ...
});
```

### تغییر پورت سرور آپلود

در `server/upload-server.js`:

```javascript
const PORT = 3002; // به جای 3001
```

همچنین در `vite.config.ts`:

```typescript
proxy: {
  "/api": {
    target: "http://localhost:3002", // تغییر پورت
    changeOrigin: true,
  },
}
```

### اضافه کردن فرمت‌های جدید

در `server/upload-server.js`:

```javascript
fileFilter: (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('فرمت فایل مجاز نیست'), false);
  }
}
```

---

## 🐛 عیب‌یابی

### مشکل: سرور آپلود راه‌اندازی نمی‌شود

**علت**: پورت 3001 در حال استفاده است

**راه حل**:
1. فرآیندی که پورت را اشغال کرده را ببندید
2. یا پورت را تغییر دهید (بخش بالا را ببینید)

```bash
# پیدا کردن فرآیند روی پورت 3001 (Windows)
netstat -ano | findstr :3001

# کشتن فرآیند
taskkill /PID [PID_NUMBER] /F
```

### مشکل: تصاویر آپلود شده نمایش داده نمی‌شوند

**علت**: سرور آپلود اجرا نشده است

**راه حل**:
```bash
npm run upload-server
```

یا:
```bash
npm run dev:full
```

### مشکل: خطای CORS

**علت**: سرور اصلی و سرور آپلود روی domain های مختلف هستند

**راه حل**: 
سرور آپلود از CORS استفاده می‌کند. مطمئن شوید که:
```javascript
app.use(cors()); // در upload-server.js
```

### مشکل: فایل آپلود می‌شود ولی در لیست نیست

**راه حل**:
1. روی دکمه "بروزرسانی" کلیک کنید
2. یا Asset Selector را ببندید و دوباره باز کنید

### مشکل: خطای 413 (Payload Too Large)

**علت**: حجم فایل بیش از حد مجاز است

**راه حل**:
- فایل کوچک‌تری انتخاب کنید (کمتر از 5MB)
- یا محدودیت حجم را افزایش دهید (بخش سفارشی‌سازی)

---

## 📊 ساختار کد

### Components:

```
src/components/
  ├── AssetSelector.tsx       ← کامپوننت اصلی انتخاب تصویر
  ├── ImageUpload.tsx         ← آپلود مستقیم (قدیمی)
  └── ProductForm.tsx         ← فرم محصول که از AssetSelector استفاده می‌کند
```

### Hooks:

```
src/hooks/
  └── useAssets.ts            ← مدیریت assets (fetch, upload, delete)
```

### Server:

```
server/
  └── upload-server.js        ← سرور Express برای آپلود
```

### Public Assets:

```
public/
  └── assets/
      └── products/
          ├── .index.json     ← فهرست فایل‌ها (auto-generated)
          └── [images]        ← تصاویر آپلود شده
```

---

## 🔐 امنیت

### محافظت در مقابل حملات:

1. **Directory Traversal**: 
   - نام فایل‌ها sanitize می‌شوند
   - کاراکترهای خطرناک (`../`, `\`, `/`) حذف می‌شوند

2. **File Type Validation**:
   - فقط فایل‌های image مجاز هستند
   - بررسی MIME type

3. **File Size Limit**:
   - حداکثر 5MB

4. **CORS**:
   - فقط در development فعال است
   - در production باید محدود شود

### توصیه برای Production:

```javascript
// در upload-server.js برای production:
app.use(cors({
  origin: 'https://yourdomain.com',
  methods: ['GET', 'POST', 'DELETE'],
  credentials: true
}));
```

---

## 🚀 Deploy (Production)

### نکات مهم:

1. **سرور آپلود نباید در production اجرا شود**
   - این سرور فقط برای development است
   - در production از Supabase Storage استفاده کنید

2. **تصاویر آپلود شده را commit نکنید**
   - فایل `.gitignore` شامل `public/assets/products/*` است
   - فقط `.index.json` commit می‌شود

3. **استفاده از CDN**:
   - تصاویر را روی CDN قرار دهید
   - از Supabase Storage استفاده کنید

---

## 📚 مثال‌های استفاده

### مثال 1: آپلود و استفاده از تصویر

```typescript
// در ProductForm.tsx
const handleImageUpload = async (file: File) => {
  const assetPath = await uploadAsset(file);
  if (assetPath) {
    setFormData(prev => ({ ...prev, image_url: assetPath }));
  }
};
```

### مثال 2: لیست تمام تصاویر

```typescript
// استفاده از hook
const { assets, loading } = useAssets();

// نمایش تصاویر
{assets.map(asset => (
  <img src={asset.path} alt={asset.name} />
))}
```

### مثال 3: حذف تصویر

```typescript
const handleDelete = async (filename: string) => {
  const success = await deleteAsset(filename);
  if (success) {
    console.log('تصویر حذف شد');
  }
};
```

---

## 🎯 نکات و ترفندها

### ✨ بهترین روش‌ها:

1. **برای محصولات از تصاویر با کیفیت استفاده کنید**
   - حداقل 800x800 پیکسل
   - فرمت WebP برای performance بهتر

2. **نام‌های توصیفی**:
   - `rice-hashemi-premium.jpg` ✅
   - `IMG_1234.jpg` ❌

3. **بهینه‌سازی قبل از آپلود**:
   - از ابزارهای فشرده‌سازی استفاده کنید
   - TinyPNG، ImageOptim، etc.

4. **پاکسازی منظم**:
   - تصاویر استفاده نشده را حذف کنید
   - فضای دیسک را مدیریت کنید

### 🎨 طراحی UI:

- تصاویر در grid زیبا نمایش داده می‌شوند
- پیش‌نمایش در اندازه مناسب
- اطلاعات کامل هر تصویر
- انیمیشن‌های نرم
- Responsive برای موبایل

---

## 📝 Changelog

### نسخه 1.0.0 (2025-01-20)

✨ ویژگی‌های جدید:
- سیستم کامل مدیریت Assets
- آپلود تصویر با drag & drop
- پیش‌نمایش لحظه‌ای
- حذف تصاویر
- Auto-refresh لیست تصاویر
- نمایش اطلاعات کامل فایل

🔧 بهبودها:
- استفاده از hook سفارشی `useAssets`
- UI/UX بهتر برای Asset Selector
- Error handling پیشرفته
- Validation کامل فایل‌ها

---

## 🆘 پشتیبانی

اگر مشکلی داشتید:

1. فایل‌های لاگ را بررسی کنید:
   - Console مرورگر (F12)
   - Terminal سرور آپلود

2. مستندات را بخوانید:
   - این فایل (`ASSETS_MANAGEMENT_GUIDE.md`)
   - README.md اصلی پروژه

3. مشکلات شناخته شده:
   - سرور آپلود باید اجرا باشد
   - پوشه assets باید وجود داشته باشد
   - دسترسی‌های لازم برای نوشتن فایل

---

## ✅ چک‌لیست قبل از استفاده

- [ ] `npm install` اجرا شده
- [ ] پوشه `public/assets/products` ایجاد شده
- [ ] سرور آپلود اجرا شده (`npm run upload-server`)
- [ ] سرور اصلی اجرا شده (`npm run dev`)
- [ ] تصویر تست آپلود کرده‌ام
- [ ] تصویر در لیست نمایش داده می‌شود
- [ ] تصویر را در محصول استفاده کرده‌ام
- [ ] همه چیز کار می‌کند! 🎉

---

**نسخه**: 1.0.0  
**تاریخ**: 20 دی 1403 (January 2025)  
**وضعیت**: ✅ آماده استفاده

🚀 **موفق باشید!**