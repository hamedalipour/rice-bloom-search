# انتقال کامل سایت به هاست ایرانی (میهن‌وب‌هاست)

این سند مراحل دقیق انتقال از GitHub Pages به **هاست NodeJS میهن‌وب‌هاست** را
توضیح می‌دهد؛ همان پلنی که پشتیبانی تأیید کرد:
IP ثابت اشتراکی برای درگاه، اجرای دائمی Node روی cPanel، Node 22 و SSL رایگان.

---

## معماری نهایی

```
atre-shalizar.ir        →  public_html (فایل‌های استاتیک dist)  ← Apache/LiteSpeed
www.atre-shalizar.ir    →  301 به بدون www
api.atre-shalizar.ir    →  اپ Node/Express (پنل + API پرداخت)  ← Passenger
زرین‌پال                →  IP خروجی همین سرور (اشتراکی و ثابت)
```

- سایت استاتیک با FTP از GitHub Actions آپلود می‌شود (بدون build روی هاست).
- اپ Node فقط برای `/api/payment/*` و پنل مدیریت است.
- هر دو روی یک سرور و یک IP هستند؛ همین IP را به زرین‌پال می‌دهید.

---

## ۰) پیش‌نیاز خرید

- پلن **هاست NodeJS پلن ۳ (۱GB)** کافی است؛ اگر تصاویر زیادی اضافه می‌کنید، پلن ۴ (۲GB).
- دامنه باید DNS قابل ویرایش داشته باشد (همان‌جا که دامنه را ثبت کرده‌اید).
- دسترسی به cPanel و FTP.

---

## ۱) DNS

ابتدا TTL رکوردهای فعلی را روی ۳۰۰ ثانیه کم کنید. سپس:

| نوع | نام | مقدار |
|---|---|---|
| A | `@` | IP سرور (از cPanel → Server Information) |
| A | `www` | همان IP |
| A | `api` | همان IP |

**حذف کنید** (مربوط به GitHub Pages است):

- Aهای `185.199.108.153` تا `185.199.111.153`
- AAAAهای `2606:50c0:8000::153` تا `2606:50c0:8003::153`

رکوردهای `MX` و `TXT` (ایمیل/SPF/DKIM) را دست نزنید.

بررسی:

```bash
nslookup atre-shalizar.ir 8.8.8.8
nslookup api.atre-shalizar.ir 8.8.8.8
```

---

## ۲) ساخت زیردامنه و اپ Node در cPanel

1. در cPanel → **Domains / Subdomains** زیردامنهٔ `api.atre-shalizar.ir` را بسازید.
   Document Root را خارج از `public_html` بگذارید، مثلاً:
   `/home/USER/apps/atre-api/panel`
2. cPanel → **Setup Node.js App** → Create Application:
   - **Node.js version:** 22
   - **Application mode:** Production
   - **Application root:** `apps/atre-api/panel`
   - **Application URL:** `api.atre-shalizar.ir`
   - **Application startup file:** `server.cjs`

> **چرا Application root همان `panel` است؟** چون cPanel وابستگی‌ها را از
> `package.json` همان پوشه نصب می‌کند. اگر ریشهٔ اپ `apps/atre-api` باشد، cPanel
> سعی می‌کند وابستگی‌های سنگین فرانت‌اند (Vite/React) را هم نصب کند؛ در حالی که
> سرور فقط به `express`، `cors` و `multer` نیاز دارد. مخزن کامل در
> `apps/atre-api` clone می‌شود تا `src/data` و `public/assets` در دسترس سرور باشند.

3. در همان صفحه، **Environment Variables** را وارد کنید:

```
NODE_ENV=production
ZARINPAL_MERCHANT_ID=<merchant-id>
ZARINPAL_SANDBOX=true
FRONTEND_BASE_URL=https://atre-shalizar.ir
API_PUBLIC_URL=https://api.atre-shalizar.ir
ADMIN_USER=<username>
ADMIN_PASS=<strong-password>
ADMIN_ALLOW_IPS=
CORS_ORIGINS=https://atre-shalizar.ir,https://www.atre-shalizar.ir
ALLOW_GIT_PUBLISH=true
```

> `NODE_ENV=production` باعث می‌شود اگر `ADMIN_PASS` خالی باشد، اپ عمداً بالا نیاید.
> `ADMIN_ALLOW_IPS` را بعداً می‌توانید با IP خانه/اداره پر کنید.

4. در cPanel → **Terminal**:

```bash
cd ~/apps
git clone https://github.com/hamedalipour/rice-bloom-search.git atre-api
cd atre-api/panel
npm ci --omit=dev
mkdir -p tmp
touch tmp/restart.txt
```

> اگر مخزن خصوصی است، از توکن/Deploy Key استفاده کنید.
> برای انتشار محتوا از پنل، در ریشهٔ مخزن (`~/apps/atre-api`):
>
> ```bash
> git config user.name "Atre Panel"
> git config user.email "panel@atre-shalizar.ir"
> git remote set-url origin https://<TOKEN>@github.com/hamedalipour/rice-bloom-search.git
> ```
>
> توکن Fine-grained با دسترسی **Contents: Read and write** کافی است.

5. در Setup Node.js App روی **Restart** بزنید.
6. در cPanel → **SSL/TLS Status** برای `atre-shalizar.ir`، `www` و `api` گزینهٔ
   **Run AutoSSL** را بزنید (اگر خودکار فعال نشده بود).

بررسی:

```bash
curl -i https://api.atre-shalizar.ir/api/health
# باید 200 و JSON با sandbox:true برگرداند
curl -i https://api.atre-shalizar.ir/api/data
# باید 401 (نیاز به رمز) برگرداند
```

---

## ۳) تنظیم GitHub برای آپلود استاتیک

در GitHub → Settings → Secrets and variables → Actions:

**Secrets**

| نام | مقدار |
|---|---|
| `FTP_SERVER` | مثلاً `ftp.atre-shalizar.ir` یا IP سرور |
| `FTP_USERNAME` | کاربر FTP |
| `FTP_PASSWORD` | رمز FTP (بدون کاراکتر کاما) |

**Variables**

| نام | مقدار |
|---|---|
| `DEPLOY_FTP` | `true` |
| `VITE_PANEL_API_BASE` | `https://api.atre-shalizar.ir` |
| `FTP_SERVER_DIR` | `/public_html/` — اگر FTP مستقیم به public_html وصل می‌شود: `/` |

سپس از تب Actions workflow **Deploy to Iranian host (FTP)** را یک‌بار دستی اجرا کنید.

> تا قبل از انتقال DNS می‌توانید `DEPLOY_FTP` را `false` بگذارید؛ workflow
> GitHub Pages همچنان نسخهٔ قبلی را منتشر می‌کند و امکان بازگشت سریع وجود دارد.

---

## ۴) تنظیم زرین‌پال

1. در cPanel → Terminal، IP خروجی را بگیرید:

```bash
curl -4 -s https://ifconfig.me
```

2. همین IPv4 را در پنل زرین‌پال به‌عنوان **IP سرور** ثبت کنید.
3. دامنه/آدرس بازگشت: `https://atre-shalizar.ir`
4. ابتدا با `ZARINPAL_SANDBOX=true` یک پرداخت آزمایشی انجام دهید:
   - محصول را به سبد اضافه کنید → `/checkout/` → پرداخت آنلاین
   - پس از بازگشت باید پیام «پرداخت با موفقیت انجام شد» ببینید
   - در `~/apps/atre-api/panel/data/orders.json` سفارش با `status: "paid"` ثبت شود
5. بعد از موفقیت، در Environment Variables مقدار `ZARINPAL_SANDBOX=false` را بگذارید،
   اپ را Restart کنید و یک پرداخت واقعی کوچک تست کنید.

> مبلغ‌ها با `currency: "IRT"` (تومان) ارسال می‌شوند و سرور مبلغ را از روی
> `products.json` دوباره محاسبه می‌کند؛ تغییر قیمت در مرورگر بی‌اثر است.

---

## ۵) انتشار محتوا از پنل

- آدرس پنل: `https://api.atre-shalizar.ir/` (با نام کاربری/رمز Basic Auth)
- ذخیرهٔ محصول/مقاله → دکمهٔ «انتشار» → `git commit/push` → GitHub Actions
  دوباره build می‌کند و با FTP روی `public_html` می‌نشیند.
- `ALLOW_GIT_PUBLISH=true` فقط وقتی معنا دارد که توکن گیت روی سرور تنظیم شده باشد.
- سفارش‌ها در `panel/data/orders.json` ذخیره می‌شوند (در git نیست).

### به‌روزرسانی کد اپ (بدون پنل)

یک Cron Job در cPanel (هر ۱۰ دقیقه):

```bash
cd /home/USER/apps/atre-api && \
  BEFORE=$(git rev-parse HEAD) && \
  git pull --ff-only && \
  AFTER=$(git rev-parse HEAD) && \
  [ "$BEFORE" != "$AFTER" ] && touch panel/tmp/restart.txt
```

---

## ۶) چک‌لیست بعد از انتقال

- [ ] `https://atre-shalizar.ir/` باز می‌شود و گواهی SSL معتبر است
- [ ] `http://` به `https://` و `www` به بدون‌www ریدایرکت می‌شود
- [ ] `/cart/` و `/checkout/` صفحه می‌دهند (نه ۴۰۴)
- [ ] `https://atre-shalizar.ir/sitemap.xml` شامل ۲۲ URL اسلش‌دار است
- [ ] `https://atre-shalizar.ir/robots.txt` درست است
- [ ] `https://api.atre-shalizar.ir/` بدون رمز ۴۰۱ می‌دهد
- [ ] هدر `X-Robots-Tag: noindex` روی API هست
- [ ] پرداخت sandbox موفق و سفارش `paid` ثبت شد
- [ ] پرداخت واقعی با مبلغ درست (تومان) انجام شد
- [ ] در Search Console سایتمپ دوباره Submit شد
- [ ] برای URLهای اصلی «درخواست ایندکس» زده شد

---

## ۷) بازگشت اضطراری

اگر سرور ایران مشکل جدی داشت:

1. DNS را به IPهای GitHub Pages برگردانید.
2. `DEPLOY_FTP` را `false` کنید.
3. نسخهٔ Pages هنوز در دسترس است (workflow قدیمی فعال می‌ماند).

> بعد از اطمینان کامل می‌توانید workflow قدیمی Pages را حذف/غیرفعال کنید.
