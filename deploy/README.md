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

> اگر DNS روی **Cloudflare** است (وضعیت فعلی این دامنه):
> هر سه رکورد را با **Proxy status = DNS only** (ابر خاکستری) بسازید.
> حالت Proxied برای `api` باعث می‌شود درگاه زرین‌پال IP اشتراکی سرور را نبیند و
> تأیید پرداخت رد شود. رکوردهای `AAAA` قدیمی GitHub Pages را هم پاک کنید، وگرنه
> مرورگرهای IPv6 همچنان نسخهٔ قدیمی را می‌بینند.

بررسی:

```bash
nslookup atre-shalizar.ir 8.8.8.8
nslookup api.atre-shalizar.ir 8.8.8.8
```

---

## ۲) ساخت زیردامنه و اپ Node در cPanel

### ۲.۱) گرفتن کد و نصب وابستگی‌های سرور

در cPanel → **Terminal**:

```bash
mkdir -p ~/apps
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

### ۲.۲) ساخت زیردامنه

در cPanel → **Domains / Subdomains** زیردامنهٔ `api.atre-shalizar.ir` را بسازید و
Document Root را خارج از `public_html` بگذارید:

```
/home/USER/apps/atre-api/panel
```

> این پوشه را در مرحلهٔ قبل ساخته‌اید؛ اگر cPanel هنگام ساخت زیردامنه هشدار داد،
> مسیر را دقیقاً همین بگذارید.

### ۲.۳) ساخت اپ Node

cPanel → **Setup Node.js App** → Create Application:

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

سپس در همان صفحه، **Environment Variables** را وارد کنید:

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
> اگر cPanel دکمهٔ **Run NPM Install** نشان داد، می‌توانید یک‌بار بزنید؛ چون
> `package.json` همین پوشه فقط سه وابستگی سبک دارد.

**راه مطمئن‌تر (توصیه‌شده):** همین متغیرها را در فایل `~/apps/atre-api/.env`
بگذارید. `server.cjs` این فایل را خودش می‌خواند و مقدارهای موجود در محیط cPanel را
بازنویسی نمی‌کند:

```bash
cat > ~/apps/atre-api/.env <<'EOF'
NODE_ENV=production
ZARINPAL_MERCHANT_ID=
ZARINPAL_SANDBOX=true
FRONTEND_BASE_URL=https://atre-shalizar.ir
API_PUBLIC_URL=https://api.atre-shalizar.ir
ADMIN_USER=admin
ADMIN_PASS=یک-رمز-قوی
CORS_ORIGINS=https://atre-shalizar.ir,https://www.atre-shalizar.ir
ALLOW_GIT_PUBLISH=false
EOF
chmod 600 ~/apps/atre-api/.env
```

> تجربه: ویرایش Environment Variables از UI در چند نوبت با بازسازی اپ از دست رفت و
> باعث ری‌استارت ناخواسته شد؛ فایل `.env` پایدارتر است. این فایل هم با قواعد
> امنیتی `.htaccess` (بخش ۲.۵) از دسترس عمومی خارج می‌شود.

### ۲.۴) ری‌استارت و SSL

1. در Setup Node.js App روی **Restart** بزنید (یا `touch ~/apps/atre-api/panel/tmp/restart.txt`).

> ⚠️ **AutoSSL روی این پلن فعال نیست.** هم دکمهٔ «رایگان SSL» در پنل
> («متاسفانه عملیات با خطا مواجه شد») و هم `uapi SSL start_autossl_check`
> با خطای `You do not have the feature "autossl"` رد می‌شوند. گواهی را باید
> دستی با Let's Encrypt گرفت.

**گرفتن گواهی با acme.sh (تست‌شده و کار می‌کند):**

```bash
# ۱) پیش‌نیاز: DNS باید همین حالا به این سرور اشاره کند (چالش HTTP-01)
cd ~ && curl -sSf https://get.acme.sh | sh -s email=admin@atre-shalizar.ir
~/.acme.sh/acme.sh --set-default-ca --server letsencrypt

# ۲) صدور برای هر سه نام؛ هر دامنه webroot خودش را دارد
~/.acme.sh/acme.sh --issue \
  -d atre-shalizar.ir     -w /home/USER/public_html \
  -d www.atre-shalizar.ir -w /home/USER/public_html \
  -d api.atre-shalizar.ir -w /home/USER/apps/atre-api/panel \
  --keylength 2048
```

نکته‌ها:
- کلید **RSA 2048** بزنید؛ نسخهٔ cPanel این هاست کلید EC را در `install_ssl` رد می‌کند
  (`Invalid base64` + `need "key_algorithm"`).
- `--keylength 2048` عمداً آمده است.
- پوشهٔ `panel` به‌عنوان webroot کار می‌کند چون LiteSpeed فایل‌های
  `/.well-known/acme-challenge/` را قبل از Passenger سرو می‌کند (تست شد: ۲۰۰).

**نصب گواهی در cPanel (روش درست):**

مقدار PEM چندخطی را با آرگومان خط فرمان به `uapi` ندهید؛ خراب می‌شود. با HTTP API
و بدنهٔ form-encoded نصب کنید:

```bash
~/.acme.sh/acme.sh --install-cert -d atre-shalizar.ir \
  --key-file /home/USER/apps/.le-key.pem \
  --fullchain-file /home/USER/apps/.le-fullchain.pem \
  --reloadcmd "bash /home/USER/apps/reinstall-cert.sh"
```

`reinstall-cert.sh` (توکن API را از cPanel → Manage API Tokens بسازید):

```bash
curl -k -s -H "Authorization: cpanel USER:TOKEN" \
  --data-urlencode "domain=$dom" \
  --data-urlencode "cert@$CERT" \
  --data-urlencode "key@$KEY" \
  --data-urlencode "cabundle@$CA" \
  https://127.0.0.1:2083/execute/SSL/install_ssl
```

اجرای این اسکریپت برای سه دامنهٔ `atre-shalizar.ir`، `www` و `api` انجام می‌شود.
کرون خودکار acme.sh (ساعت ۱، ۷، ۱۳، ۱۹) تمدید می‌کند و `reloadcmd` گواهی تازه را
دوباره در cPanel نصب می‌کند؛ پس از تمدید کاری لازم نیست.

بررسی:

```bash
curl -sI https://atre-shalizar.ir/ | head -3     # 200 و HSTS
curl -i https://api.atre-shalizar.ir/api/health   # 200 و JSON با sandbox:true
curl -i https://api.atre-shalizar.ir/api/data     # 401 (نیاز به رمز)
```

### ۲.۵) قواعد امنیتی `.htaccess` (اجباری)

بدون این بلوک، فایل `server.cjs` و `data/orders.json` (شامل آدرس و تلفن مشتری‌ها)
به‌صورت مستقیم قابل دانلود می‌شوند. cPanel هنگام ساخت اپ یک `.htaccess` می‌سازد؛
این بخش را به انتهای آن اضافه کنید (نمونهٔ کامل: `panel/.htaccess.example`):

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteRule (^|/)(server\.cjs|package\.json|package-lock\.json|stderr\.log)$ - [F,L]
  RewriteRule (^|/)\.env - [F,L]
  RewriteRule ^(data|node_modules|tmp|public)(/|$) - [F,L]
</IfModule>
```

نکات مهم این استک (LiteSpeed + Passenger):

- `<FilesMatch>…Require all denied</FilesMatch>` **نادیده گرفته می‌شود**؛ فقط
  `mod_rewrite` با پرچم `[F,L]` واقعاً فایل را می‌بندد.
- هرگز `[R=404,L]` ننویسید؛ Passenger را از کار می‌اندازد و همهٔ `/api/*` ها ۴۰۳ می‌شوند.
- بررسی از بیرون: `/server.cjs` باید ۴۰۳ بدهد و `/api/health` باید ۲۰۰ بماند.
- اگر اپ را Destroy/Create کردید، این بلوک را دوباره اضافه کنید.

### ۲.۶) گیرهای شناخته‌شدهٔ این هاست

| مشکل | علت | راه‌حل |
|---|---|---|
| `sshing` روی پورت ۲۲ قطع می‌شود (`kex_exchange_identification`) | فایروال هاست | کارها را با Cron + اسکریپت یا FTP انجام دهید |
| بعد از چند درخواست پشت‌سرهم، صفحهٔ CAPTCHA یا قطع cPanel | BitNinja WAF، IP شما را گری‌لیست می‌کند | `ftp://` را باز کنید و `your_IP_is_greylisted_README.txt` را بخوانید؛ لینک `spam_delist` را در مرورگر باز و CAPTCHA را حل کنید (تعداد محدود) |
| `curl http://127.0.0.1/api/...` روی خود سرور ۴۰۳ می‌دهد | درخواست محلی به vhost دیگری می‌رسد | فقط تست بیرونی معتبر است |
| UI با `https://IP:2083` باز نمی‌شود | گواهی خودامضا | از `http://IP:2082` استفاده کنید |
| اپ پس از ری‌استارت بالا نمی‌آید | ثبت قدیمی `PassengerApps` با `/usr/bin/node` | اپ را در Node.js Selector حذف و دوباره بسازید (Node 22، Production، root=`apps/atre-api/panel`) |


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

---

## ۸) وضعیت انتقال (آخرین به‌روزرسانی)

**انجام‌شده**

- [x] ساخت زیردامنهٔ `api.atre-shalizar.ir` با docroot در `apps/atre-api/panel`
- [x] اپ Node 22 روی Passenger ساخته شد و `https://…/api/health` بیرونی ۲۰۰ می‌دهد
- [x] `.env` روی سرور تنظیم شد (`ZARINPAL_SANDBOX=true`، بدون merchant ID)
- [x] قواعد امنیتی `.htaccess` اعمال شد؛ `/server.cjs` و `/data/orders.json` → ۴۰۳
- [x] Secrets/Variables گیت‌هاب تنظیم و استاتیک با FTP روی `public_html` منتشر شد
      (`index.php`, `css/`, `images/`, `js/`, `php.ini` پاک شدند؛ `cgi-bin/` حفظ شد)
- [x] سایت روی IP سرور با SNI دامنه تست شد: HTML درست، canonical و متا درست
- [x] رکوردهای DNS در Cloudflare به `89.39.208.237` تغییر کرد (DNS only، بدون پروکسی)
- [x] گواهی **Let's Encrypt** برای `atre-shalizar.ir`، `www` و `api` صادر و نصب شد
      (اعتبار تا ۲۰ فوریه ۲۰۲۷) + تمدید خودکار با acme.sh و نصب دوباره در cPanel
- [x] HSTS فعال شد؛ `http→https` و `www→بدون www` با گواهی معتبر تست شد
- [x] IP خروجی سرور برای زرین‌پال تأیید شد: `89.39.208.237`

**باقی‌مانده (نیازمند دسترسی یا تصمیم شما)**

- [ ] ثبت `ZARINPAL_MERCHANT_ID` در `.env` و `ZARINPAL_SANDBOX=false`
- [ ] ثبت IP `89.39.208.237` در پنل زرین‌پال
- [ ] تست پرداخت واقعی + ادغام PR معماری و Submit سایتمپ در Search Console

