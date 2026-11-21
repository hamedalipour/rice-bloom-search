/**
 * پنل مدیریت محلی — فروشگاه عطر شالیزار
 * ----------------------------------------
 * جایگزین کامل Supabase برای مدیریت محتوا:
 *   - مدیریت محصولات  → src/data/products.json
 *   - مدیریت وبلاگ    → src/data/blogPosts.json
 *   - آپلود تصاویر    → public/assets/{products|blog}/
 *   - انتشار          → git add/commit/push (دیپلوی خودکار با GitHub Actions)
 *
 * اجرا:   node panel/server.cjs
 * آدرس:   http://127.0.0.1:3001   (فقط روی سیستم خودت — بدون احراز هویت لازم)
 *
 * نکته: این سرور هرگز روی اینترنت عمومی دیپلوی نمی‌شود؛ فقط ابزار داخلی لوکال است.
 */

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { execFile } = require('child_process');

const ROOT = path.join(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const ASSET_DIRS = {
  products: path.join(PUBLIC_DIR, 'assets', 'products'),
  blog: path.join(PUBLIC_DIR, 'assets', 'blog'),
};
const DATA_FILES = {
  products: path.join(ROOT, 'src', 'data', 'products.json'),
  blogPosts: path.join(ROOT, 'src', 'data', 'blogPosts.json'),
};

// ---------------------------------------------------------------
// تنظیمات محیط اجرا
// روی هاست اشتراکی، متغیرها از cPanel → Setup Node.js App خوانده می‌شوند.
// برای اجرای محلی، فایل .env ریشه پروژه به‌صورت ساده پارس می‌شود.
// ---------------------------------------------------------------
const ENV_FILE = path.join(ROOT, '.env');
if (fs.existsSync(ENV_FILE)) {
  for (const line of fs.readFileSync(ENV_FILE, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m || process.env[m[1]] !== undefined) continue;
    let v = m[2].trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    )
      v = v.slice(1, -1);
    process.env[m[1]] = v;
  }
}

// Passenger (cPanel) مسیر سوکت یا شماره پورت را در PORT قرار می‌دهد.
// اگر PORT تنظیم شده باشد یعنی روی هاست مدیریت‌شده اجرا می‌شویم و باید همان را bind کنیم.
const PORT_ENV = String(process.env.PORT || '').trim();
const HAS_PORT_ENV = PORT_ENV !== '';
const IS_MANAGED =
  HAS_PORT_ENV ||
  Boolean(process.env.PASSENGER_APP_ENV) ||
  Boolean(process.env.PASSENGER_BASE_URI);
const IS_PRODUCTION =
  process.env.NODE_ENV === 'production' ||
  process.env.PASSENGER_APP_ENV === 'production';
const PORT = Number(PORT_ENV) || 3001;
const HOST = process.env.HOST || '127.0.0.1';

const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || '';
const ADMIN_ALLOW_IPS = (process.env.ADMIN_ALLOW_IPS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

if ((IS_MANAGED || IS_PRODUCTION) && !ADMIN_PASS) {
  console.error(
    '❌ ADMIN_PASS تنظیم نشده است. اجرای پنل روی سرور عمومی بدون رمز مجاز نیست.',
  );
  process.exit(1);
}

const ZARINPAL_MERCHANT_ID = process.env.ZARINPAL_MERCHANT_ID || '';
const ZARINPAL_SANDBOX = process.env.ZARINPAL_SANDBOX !== 'false';

const ALLOWED_ORIGINS = (
  process.env.CORS_ORIGINS ||
  [
    'https://atre-shalizar.ir',
    'https://www.atre-shalizar.ir',
    'http://localhost:8080',
    'http://localhost:5173',
    'http://localhost:4173',
    'http://127.0.0.1:8080',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:4173',
  ].join(',')
)
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

function frontendBase() {
  return (process.env.FRONTEND_BASE_URL || 'https://atre-shalizar.ir').replace(
    /\/+$/,
    '',
  );
}

function apiPublicBase(req) {
  if (process.env.API_PUBLIC_URL)
    return process.env.API_PUBLIC_URL.replace(/\/+$/, '');
  const host = String(req.get('host') || '');
  const forwarded = String(req.get('x-forwarded-proto') || '')
    .split(',')[0]
    .trim();
  const isLocal = /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i.test(host);
  const proto = forwarded || (isLocal ? req.protocol : 'https');
  return `${proto}://${host}`;
}

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);

// مسیرهای عمومی: سلامت سرویس و درگاه پرداخت. بقیهٔ پنل رمز می‌خواهد.
function isPublicApi(req) {
  return (
    req.path === '/api/health' || req.path.startsWith('/api/payment/')
  );
}

function clientIp(req) {
  const xff = String(req.get('x-forwarded-for') || '')
    .split(',')[0]
    .trim();
  return xff || req.socket.remoteAddress || '';
}

// محدودیت ساده و درون‌حافظه‌ای برای جلوگیری از ساخت انبوه سفارش/درخواست پرداخت
const rateBuckets = new Map();
function rateLimit({ windowMs, max, message }) {
  return (req, res, next) => {
    const key = clientIp(req);
    const now = Date.now();
    const bucket = rateBuckets.get(key);

    if (!bucket || now - bucket.start > windowMs) {
      rateBuckets.set(key, { start: now, count: 1 });
      if (rateBuckets.size > 5000) {
        for (const [k, v] of rateBuckets) {
          if (now - v.start > windowMs) rateBuckets.delete(k);
        }
      }
      return next();
    }

    bucket.count += 1;
    if (bucket.count > max) {
      res.set(
        'Retry-After',
        String(Math.ceil((bucket.start + windowMs - now) / 1000)),
      );
      return res.status(429).json({
        ok: false,
        error: message || 'تعداد درخواست‌ها زیاد است؛ چند دقیقه بعد دوباره تلاش کنید.',
      });
    }
    return next();
  };
}

const paymentRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
});

function safeEqual(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

function basicAuth(req, res, next) {
  if (isPublicApi(req)) return next();
  if (!ADMIN_PASS) return next(); // فقط اجرای لوکال (روی سرور در بالا بلاک شده)

  if (ADMIN_ALLOW_IPS.length && !ADMIN_ALLOW_IPS.includes(clientIp(req))) {
    return res.status(403).type('text/plain').send('Forbidden');
  }

  const header = String(req.get('authorization') || '');
  const match = header.match(/^Basic\s+(.+)$/i);
  if (match) {
    const [user, ...rest] = Buffer.from(match[1], 'base64')
      .toString('utf8')
      .split(':');
    const pass = rest.join(':');
    if (safeEqual(user, ADMIN_USER) && safeEqual(pass, ADMIN_PASS)) {
      return next();
    }
  }

  res.set(
    'WWW-Authenticate',
    'Basic realm="Atre Shalizar Admin", charset="UTF-8"',
  );
  return res.status(401).type('text/plain').send('Authentication required');
}

app.use((req, res, next) => {
  res.set('X-Robots-Tag', 'noindex, nofollow');
  next();
});

app.use(
  cors({
    origin(origin, cb) {
      // درخواست‌های بدون Origin (curl/سرور) و دامنه‌های مجاز عبور می‌کنند.
      if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
      return cb(null, false);
    },
  }),
);
app.use(express.json({ limit: '2mb' }));
app.use(basicAuth);

// پیش‌نمایش تصاویر آپلودشده داخل پنل
app.use('/assets', express.static(path.join(PUBLIC_DIR, 'assets')));

// رابط کاربری پنل — فقط index.html؛ server.cjs و data/ نباید عمومی شوند.
app.get(['/', '/index.html'], (req, res) =>
  res.sendFile(path.join(__dirname, 'index.html')),
);

// ---------- IndexNow: اعلام سریع تغییرات به Bing/Yandex/Seznam بعد از هر انتشار ----------
const INDEXNOW_KEY = 'atre-shalizar-idxnow-7f3a9c2e5b8d416a';
const SITE_HOST = 'atre-shalizar.ir';
function pingIndexNow() {
  try {
    const payload = {
      host: SITE_HOST,
      key: INDEXNOW_KEY,
      keyLocation: `https://${SITE_HOST}/${INDEXNOW_KEY}.txt`,
      urlList: [
        `https://${SITE_HOST}/`,
        `https://${SITE_HOST}/shop/`,
        `https://${SITE_HOST}/blog/`,
        `https://${SITE_HOST}/category/berenj/`,
        `https://${SITE_HOST}/category/chai/`,
        ...readJson(DATA_FILES.products).map((p) => `https://${SITE_HOST}/product/${p.slug}/`),
        ...readJson(DATA_FILES.blogPosts)
          .filter((b) => b.published !== false)
          .map((b) => `https://${SITE_HOST}/blog/${b.slug}/`),
      ],
    };
    fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload),
    })
      .then((r) => console.log(`IndexNow: ${r.status} (${payload.urlList.length} URL اعلام شد)`))
      .catch((e) => console.log('IndexNow ping ناموفق (بی‌اهمیت): ' + e.message));
  } catch (e) {
    console.log('IndexNow ping ناموفق (بی‌اهمیت): ' + e.message);
  }
}

// ---------- ابزارهای کمکی ----------
function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, data) {
  // اعتبارسنجی قبل از نوشتن: هرگز فایل خراب روی دیسک نگذار
  const serialized = JSON.stringify(data, null, 2) + '\n';
  JSON.parse(serialized); // sanity check
  // نوشتن اتمیک: ابتدا فایل موقت، سپس rename تا با قطع برق فایل نصفه نماند
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, serialized, 'utf8');
  fs.renameSync(tmp, file);
}

function sanitizeFilename(name) {
  return String(name || 'file').replace(/[^a-zA-Z0-9.-]/g, '_');
}

function ensureAssetDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function listAssets(dir, urlPrefix) {
  ensureAssetDir(dir);
  return fs
    .readdirSync(dir)
    .filter((f) => !f.startsWith('.'))
    .map((f) => {
      const st = fs.statSync(path.join(dir, f));
      return { filename: f, url: `${urlPrefix}/${f}`, size: st.size, modified: st.mtime };
    })
    .sort((a, b) => b.modified - a.modified);
}

function runGit(args) {
  return new Promise((resolve) => {
    execFile(
      'git',
      args,
      { cwd: ROOT, windowsHide: true, maxBuffer: 10 * 1024 * 1024 },
      (error, stdout, stderr) => resolve({ ok: !error, stdout, stderr, error }),
    );
  });
}

// ---------- مسیرهای API ----------
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    service: 'atre-panel',
    time: new Date().toISOString(),
    node: process.version,
    sandbox: ZARINPAL_SANDBOX,
    merchantConfigured: Boolean(ZARINPAL_MERCHANT_ID),
  });
});

// خواندن همه داده‌ها
app.get('/api/data', (req, res) => {
  try {
    res.json({
      ok: true,
      products: readJson(DATA_FILES.products),
      blogPosts: readJson(DATA_FILES.blogPosts),
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ذخیره محصول (ایجاد/ویرایش)
app.post('/api/products/save', (req, res) => {
  try {
    const p = req.body || {};
    if (!p.name || !String(p.name).trim()) return res.status(400).json({ ok: false, error: 'نام محصول الزامی است' });
    if (!p.slug || !/^[a-z0-9-]+$/.test(p.slug)) return res.status(400).json({ ok: false, error: 'اسلاگ فقط حروف کوچک انگلیسی، عدد و خط تیره' });
    if (!Number.isFinite(Number(p.price)) || Number(p.price) <= 0) return res.status(400).json({ ok: false, error: 'قیمت نامعتبر است' });

    const items = readJson(DATA_FILES.products);
    const product = {
      id: p.id || crypto.randomUUID(),
      name: String(p.name).trim(),
      slug: String(p.slug).trim(),
      category: String(p.category || 'tarom'),
      price: Number(p.price),
      originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
      image: p.image || '/placeholder.svg',
      description: String(p.description || ''),
      longDescription: String(p.longDescription || ''),
      origin: String(p.origin || ''),
      features: Array.isArray(p.features) ? p.features.filter(Boolean).map(String) : [],
      weights: Array.isArray(p.weights)
        ? p.weights
            .filter((w) => w && w.value)
            .map((w) => ({ value: String(w.value), price: Number(w.price) || Number(p.price) }))
        : [],
      rating: Math.min(5, Math.max(0, Number(p.rating) || 0)),
      reviewCount: Math.max(0, Number(p.reviewCount) || 0),
      inStock: !!p.inStock,
      metaTitle: p.metaTitle ? String(p.metaTitle).trim().slice(0, 70) : null,
      metaDescription: p.metaDescription ? String(p.metaDescription).trim().slice(0, 165) : null,
    };

    const idx = items.findIndex((x) => x.id === product.id);
    if (idx >= 0) items[idx] = { ...items[idx], ...product };
    else items.unshift(product);
    writeJson(DATA_FILES.products, items);
    res.json({ ok: true, products: items });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// حذف محصول
app.post('/api/products/delete', (req, res) => {
  try {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ ok: false, error: 'شناسه محصول الزامی است' });
    const items = readJson(DATA_FILES.products).filter((x) => x.id !== id);
    writeJson(DATA_FILES.products, items);
    res.json({ ok: true, products: items });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ذخیره مقاله وبلاگ (ایجاد/ویرایش)
app.post('/api/blog/save', (req, res) => {
  try {
    const p = req.body || {};
    if (!p.title || !String(p.title).trim()) return res.status(400).json({ ok: false, error: 'عنوان الزامی است' });
    if (!p.slug || !/^[a-z0-9-]+$/.test(p.slug)) return res.status(400).json({ ok: false, error: 'اسلاگ فقط حروف کوچک انگلیسی، عدد و خط تیره' });

    const items = readJson(DATA_FILES.blogPosts);
    const now = new Date().toISOString();
    const post = {
      id: p.id || crypto.randomUUID(),
      title: String(p.title).trim(),
      slug: String(p.slug).trim(),
      excerpt: String(p.excerpt || ''),
      content: String(p.content || ''),
      featured_image_url: p.featured_image_url || '/placeholder.svg',
      published: !!p.published,
      published_at: p.published ? (p.published_at || now) : null,
      created_at: p.created_at || now,
      updated_at: now,
      meta_title: p.meta_title ? String(p.meta_title) : String(p.title).trim(),
      meta_description: p.meta_description ? String(p.meta_description) : String(p.excerpt || p.title).slice(0, 160),
      tags: p.category ? [String(p.category)] : ['عمومی'],
    };

    const idx = items.findIndex((x) => x.id === post.id);
    if (idx >= 0) items[idx] = { ...items[idx], ...post, id: items[idx].id, created_at: items[idx].created_at };
    else items.unshift(post);
    writeJson(DATA_FILES.blogPosts, items);
    res.json({ ok: true, blogPosts: items });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// حذف مقاله
app.post('/api/blog/delete', (req, res) => {
  try {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ ok: false, error: 'شناسه مقاله الزامی است' });
    const items = readJson(DATA_FILES.blogPosts).filter((x) => x.id !== id);
    writeJson(DATA_FILES.blogPosts, items);
    res.json({ ok: true, blogPosts: items });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// آپلود تصویر: POST /api/upload/products یا /api/upload/blog
const makeUpload = (dir) =>
  multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        ensureAssetDir(dir);
        cb(null, dir);
      },
      filename: (req, file, cb) =>
        cb(null, `${Date.now()}-${crypto.randomBytes(3).toString('hex')}${path.extname(sanitizeFilename(file.originalname))}`),
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) =>
      file.mimetype && file.mimetype.startsWith('image/')
        ? cb(null, true)
        : cb(new Error('فقط فایل تصویری مجاز است')),
  });

['products', 'blog'].forEach((key) => {
  app.post(`/api/upload/${key}`, (req, res) => {
    makeUpload(ASSET_DIRS[key]).single('file')(req, res, (err) => {
      if (err) return res.status(400).json({ ok: false, error: err.message });
      if (!req.file) return res.status(400).json({ ok: false, error: 'فایلی انتخاب نشده است' });
      res.json({ ok: true, url: `/assets/${key}/${req.file.filename}`, filename: req.file.filename });
    });
  });
});

// فهرست تصاویر
app.get('/api/assets/:dir', (req, res) => {
  const dir = ASSET_DIRS[req.params.dir];
  if (!dir) return res.status(400).json({ ok: false, error: 'مسیر نامعتبر' });
  res.json({ ok: true, assets: listAssets(dir, `/assets/${req.params.dir}`) });
});

// حذف تصویر
app.post('/api/assets/delete', (req, res) => {
  try {
    const { dir, filename } = req.body || {};
    const target = ASSET_DIRS[dir];
    if (!target) return res.status(400).json({ ok: false, error: 'مسیر نامعتبر' });
    if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\'))
      return res.status(400).json({ ok: false, error: 'نام فایل نامعتبر است' });
    const fp = path.join(target, filename);
    if (!fs.existsSync(fp)) return res.status(404).json({ ok: false, error: 'فایل یافت نشد' });
    fs.unlinkSync(fp);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// وضعیت گیت
app.get('/api/git/status', async (req, res) => {
  const st = await runGit(['status', '--porcelain', '-b']);
  const log = await runGit(['log', '-3', '--oneline']);
  if (!st.ok) {
    return res.status(500).json({
      ok: false,
      error: st.stderr || 'خطای گیت',
      hint: /Function not implemented|Unable to write/i.test(st.stderr || '')
        ? 'باگ شناخته‌شده گیت روی درایو ReFS است. گیت را به نسخه ۲.۵۰+ آپگرید کن: winget upgrade --id Git.Git'
        : undefined,
    });
  }
  res.json({ ok: true, status: st.stdout, recentCommits: log.stdout });
});

// انتشار: add → commit → push
app.post('/api/git/publish', async (req, res) => {
  if (process.env.ALLOW_GIT_PUBLISH !== 'true') {
    return res.status(403).json({
      ok: false,
      error:
        'انتشار گیت در این سرور غیرفعال است. برای فعال‌سازی ALLOW_GIT_PUBLISH=true را تنظیم کنید.',
    });
  }
  const message =
    (req.body && typeof req.body.message === 'string' && req.body.message.trim()) ||
    `به‌روزرسانی محتوا از پنل مدیریت — ${new Date().toLocaleString('fa-IR')}`;
  const log = [];
  try {
    const add = await runGit(['add', '-A']);
    log.push(add.stdout + add.stderr);
    if (!add.ok) throw Object.assign(new Error('git add ناموفق'), { detail: add.stderr });

    const st = await runGit(['status', '--porcelain']);
    if (!st.stdout.trim()) return res.json({ ok: true, pushed: false, note: 'تغییری برای انتشار وجود ندارد', log });

    const commit = await runGit(['commit', '-m', message]);
    log.push(commit.stdout + commit.stderr);
    if (!commit.ok) throw Object.assign(new Error('git commit ناموفق'), { detail: commit.stderr });

    const push = await runGit(['push', 'origin', 'main']);
    log.push(push.stdout + push.stderr);
    if (!push.ok && /fetch first|rejected|non-fast-forward/i.test(push.stderr + push.stdout)) {
      // ریموت جلوتر است: rebase و تلاش مجدد
      const pull = await runGit(['pull', '--rebase', 'origin', 'main']);
      log.push('⟳ pull --rebase:\n' + pull.stdout + pull.stderr);
      if (!pull.ok)
        return res.status(500).json({
          ok: false,
          pushed: false,
          committed: true,
          error: 'pull --rebase ناموفق بود (احتمالاً تداخل). آن را دستی حل کن.',
          detail: pull.stderr,
          log,
        });
      const push2 = await runGit(['push', 'origin', 'main']);
      log.push(push2.stdout + push2.stderr);
      if (push2.ok) {
        pingIndexNow();
        return res.json({ ok: true, pushed: true, note: 'پس از rebase، تغییرات پوش شد؛ دیپلوی Actions شروع می‌شود.', log });
      }
      return res.status(500).json({
        ok: false,
        pushed: false,
        committed: true,
        error: 'حتی پس از rebase پوش ناموفق بود.',
        detail: push2.stderr,
        log,
      });
    }
    if (!push.ok)
      return res.status(500).json({
        ok: false,
        pushed: false,
        committed: true,
        error: 'کامیت انجام شد ولی push ناموفق بود (اتصال اینترنت/دسترسی را چک کن)',
        detail: push.stderr,
        log,
      });

    pingIndexNow();
    res.json({ ok: true, pushed: true, note: 'تغییرات به گیت‌هاب پوش شد؛ دیپلوی خودکار Actions شروع می‌شود.', log });
  } catch (e) {
    const hint =
      /Function not implemented|Unable to write/i.test(String(e.detail || e.message))
        ? 'باگ شناخته‌شده گیت روی درایو ReFS: گیت را به نسخه ۲.۵۰+ آپگرید کن (winget upgrade --id Git.Git)'
        : undefined;
    res.status(500).json({ ok: false, error: e.message, detail: e.detail, hint, log });
  }
});



// ---------- داده سفارشات ----------
const ORDERS_FILE = path.join(ROOT, 'panel', 'data', 'orders.json');
const ORDERS_DIR = path.dirname(ORDERS_FILE);
if (!fs.existsSync(ORDERS_DIR)) fs.mkdirSync(ORDERS_DIR, { recursive: true });

// تنظیمات زرین‌پال (ZARINPAL_MERCHANT_ID و ZARINPAL_SANDBOX بالای فایل خوانده شده‌اند)
function zarinpalBase() {
  return ZARINPAL_SANDBOX
    ? 'https://sandbox.zarinpal.com/pg/v4/payment'
    : 'https://payment.zarinpal.com/pg/v4/payment';
}
function zarinpalStartUrl(authority) {
  return ZARINPAL_SANDBOX
    ? `https://sandbox.zarinpal.com/pg/StartPay/${authority}`
    : `https://payment.zarinpal.com/pg/StartPay/${authority}`;
}

// ---- صف نوشتن سفارش‌ها: جلوگیری از گم‌شدن سفارش در درخواست‌های هم‌زمان ----
let ordersQueue = Promise.resolve();
function updateOrders(mutator) {
  const run = async () => {
    const orders = readJsonOrders();
    const result = await mutator(orders);
    writeJsonOrders(orders);
    return result;
  };
  const next = ordersQueue.then(run, run);
  ordersQueue = next.catch(() => {});
  return next;
}

// ---- محاسبهٔ مبلغ در سرور (جلوگیری از دست‌کاری قیمت در مرورگر) ----
function calculateOrderTotal(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('اقلام سفارش ارسال نشده است');
  }
  if (items.length > 50) throw new Error('تعداد اقلام سفارش بیش از حد مجاز است');

  const products = readJson(DATA_FILES.products);
  const normalized = [];
  let total = 0;

  for (const raw of items) {
    const product = products.find(
      (p) =>
        String(p.id) === String(raw && raw.id) ||
        (raw && raw.slug && p.slug === raw.slug),
    );
    if (!product) throw new Error('محصول سفارش یافت نشد');
    if (product.inStock === false) {
      throw new Error(`محصول «${product.name}» موجود نیست`);
    }

    const quantity = Number(raw.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      throw new Error('تعداد محصول نامعتبر است');
    }

    const weights = Array.isArray(product.weights) ? product.weights : [];
    let weightValue = null;
    let unitPrice;

    if (raw.weight) {
      const match = weights.find((w) => w.value === raw.weight);
      if (!match) {
        throw new Error(`وزن انتخابی برای «${product.name}» نامعتبر است`);
      }
      weightValue = match.value;
      unitPrice = Number(match.price);
    } else if (weights.length > 0) {
      weightValue = weights[0].value;
      unitPrice = Number(weights[0].price);
    } else {
      unitPrice = Number(product.price);
    }

    if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
      throw new Error('قیمت محصول نامعتبر است');
    }

    total += unitPrice * quantity;
    normalized.push({
      id: product.id,
      slug: product.slug,
      name: product.name,
      weight: weightValue,
      quantity,
      unit_price: unitPrice,
    });
  }

  return { total, items: normalized };
}

// ---- درخواست پرداخت (ساخت سفارش + دریافت Authority از درگاه) ----
app.post('/api/payment/request', paymentRateLimit, async (req, res) => {
  try {
    if (!ZARINPAL_MERCHANT_ID) {
      return res.status(500).json({
        ok: false,
        error: 'درگاه پرداخت پیکربندی نشده است (ZARINPAL_MERCHANT_ID)',
      });
    }

    const {
      amount,
      items,
      description,
      customer_name,
      customer_email,
      customer_mobile,
      customer_address,
    } = req.body || {};

    // مبلغ نهایی را خود سرور از روی محصولات حساب می‌کند؛ amount کلاینت فقط برای مقایسه است.
    const priced = calculateOrderTotal(items);
    const clientAmount = Number(amount);
    if (
      Number.isFinite(clientAmount) &&
      clientAmount > 0 &&
      Math.abs(clientAmount - priced.total) > 1
    ) {
      console.warn('Payment amount mismatch', {
        clientAmount,
        serverAmount: priced.total,
      });
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    // آدرس بازگشت همیشه به همین سرور است؛ از کلاینت گرفته نمی‌شود.
    const callbackUrl = `${apiPublicBase(req)}/api/payment/verify`;

    const order = {
      id,
      created_at: now,
      updated_at: now,
      amount: priced.total,
      currency: 'IRT',
      status: 'pending',
      items: priced.items,
      customer: {
        name: customer_name || '',
        email: customer_email || '',
        mobile: customer_mobile || '',
        address: customer_address || '',
      },
      callback_url: callbackUrl,
      description: description || '',
      authority: null,
      ref_id: null,
      paid_at: null,
    };

    await updateOrders((orders) => {
      orders.unshift(order);
    });

    const payload = {
      merchant_id: ZARINPAL_MERCHANT_ID,
      currency: 'IRT',
      amount: priced.total,
      callback_url: callbackUrl,
      description: description || `سفارش ${id}`,
      metadata: {
        ...(customer_mobile ? { mobile: String(customer_mobile) } : {}),
        ...(customer_email ? { email: String(customer_email) } : {}),
        order_id: id,
      },
    };

    let authority = null;
    let gatewayUrl = null;
    let gatewayMessage = '';

    try {
      const rr = await fetch(`${zarinpalBase()}/request.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = await rr.json();
      const code = data?.data?.code ?? data?.code;
      authority = data?.data?.authority ?? data?.authority ?? null;
      gatewayMessage =
        data?.data?.message || data?.errors?.[0]?.message || '';

      if (code === 100 && authority) {
        gatewayUrl = zarinpalStartUrl(authority);
        await updateOrders((orders) => {
          const target = orders.find((o) => o.id === id);
          if (target) {
            target.authority = authority;
            target.updated_at = new Date().toISOString();
          }
        });
      } else {
        console.error('ZarinPal request error:', data);
        authority = null;
      }
    } catch (e) {
      console.error('ZarinPal request failed:', e.message);
      gatewayMessage = 'اتصال به درگاه پرداخت برقرار نشد';
    }

    // اگر Authority ساخته نشد، سفارش را pending رها نکن.
    if (!authority) {
      await updateOrders((orders) => {
        const target = orders.find((o) => o.id === id);
        if (target) {
          target.status = 'failed';
          target.updated_at = new Date().toISOString();
          target.fail_message = gatewayMessage || 'ایجاد پرداخت ناموفق بود';
        }
      });
    }

    return res.json({
      ok: Boolean(authority),
      authority,
      url: gatewayUrl,
      message: authority
        ? 'درگاه پرداخت ایجاد شد'
        : gatewayMessage || 'اتصال به درگاه پرداخت ناموفق بود',
      orderId: id,
      amount: priced.total,
    });
  } catch (e) {
    const status = /سفارش|محصول|تعداد|وزن|قیمت/.test(e.message) ? 400 : 500;
    return res.status(status).json({ ok: false, error: e.message });
  }
});

// ---- تایید پرداخت: منطق مشترک برای callback گیت‌وی و درخواست دستی ----
async function verifyAuthority(authority) {
  const found = await updateOrders((orders) => {
    const order = orders.find((o) => o.authority === authority);
    if (!order) return { missing: true };
    if (order.status === 'paid') return { order, alreadyPaid: true };
    return { order };
  });

  if (found.missing) {
    return { ok: false, code: 404, message: 'سفارش یافت نشد' };
  }
  if (found.alreadyPaid) {
    return {
      ok: true,
      code: 101,
      message: 'پرداخت قبلاً تایید شده است',
      ref_id: found.order.ref_id,
      card_pan: found.order.card_pan || null,
    };
  }

  const order = found.order;
  let code = null;
  let refId = null;
  let cardPan = null;
  let message = '';

  try {
    const rr = await fetch(`${zarinpalBase()}/verify.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        merchant_id: ZARINPAL_MERCHANT_ID,
        amount: order.amount,
        authority,
      }),
    });
    const data = await rr.json();
    code = data?.data?.code ?? data?.code ?? null;
    refId = data?.data?.ref_id ?? data?.ref_id ?? null;
    cardPan = data?.data?.card_pan ?? data?.card_pan ?? null;
    message = data?.data?.message || data?.errors?.[0]?.message || '';

    if (code !== 100 && code !== 101) {
      console.error('ZarinPal verify error:', data);
    }
  } catch (e) {
    console.error('ZarinPal verify failed:', e.message);
    message = 'خطا در ارتباط با درگاه پرداخت';
  }

  const paid = code === 100 || code === 101;

  await updateOrders((orders) => {
    const target = orders.find((o) => o.authority === authority);
    if (!target) return;
    target.updated_at = new Date().toISOString();
    if (paid) {
      target.status = 'paid';
      target.ref_id = refId || target.ref_id || null;
      target.card_pan = cardPan || target.card_pan || null;
      target.paid_at = target.paid_at || new Date().toISOString();
      target.verify_code = code;
    } else {
      target.status = 'failed';
      target.verify_code = code;
      target.fail_message = message || 'تایید پرداخت ناموفق بود';
    }
  });

  return {
    ok: paid,
    code,
    message: paid
      ? 'پرداخت با موفقیت تایید شد'
      : message || 'تایید پرداخت ناموفق بود',
    ref_id: refId,
    card_pan: cardPan,
  };
}

// ---- callback گیت‌وی: زرین‌پال کاربر را با ?Authority=...&Status=OK برمی‌گرداند ----
app.get('/api/payment/verify', async (req, res) => {
  const authority = String(
    req.query.Authority || req.query.authority || '',
  ).trim();
  const status = String(req.query.Status || req.query.status || '').trim();

  const redirectFail = () =>
    res.redirect(
      302,
      `${frontendBase()}/checkout/?payment=fail${
        authority ? `&authority=${encodeURIComponent(authority)}` : ''
      }`,
    );

  if (!authority) return redirectFail();

  if (status && status.toUpperCase() !== 'OK') {
    await updateOrders((orders) => {
      const order = orders.find((o) => o.authority === authority);
      if (order && order.status === 'pending') {
        order.status = 'canceled';
        order.updated_at = new Date().toISOString();
      }
    });
    return redirectFail();
  }

  const result = await verifyAuthority(authority);
  if (result.ok) {
    return res.redirect(
      302,
      `${frontendBase()}/checkout/?payment=success&authority=${encodeURIComponent(
        authority,
      )}`,
    );
  }
  return redirectFail();
});

// ---- تایید دستی (سازگاری با نسخه‌های قبلی/آزمایش) ----
app.post('/api/payment/verify', paymentRateLimit, async (req, res) => {
  try {
    const authority = String((req.body || {}).authority || '').trim();
    if (!authority) {
      return res
        .status(400)
        .json({ ok: false, error: 'شناسه پرداخت ارسال نشده است' });
    }
    const result = await verifyAuthority(authority);
    const status = result.ok ? 200 : result.code === 404 ? 404 : 400;
    return res.status(status).json(result);
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});

// ---- لیست سفارشات (برای مراجع admin) ----
app.get('/api/orders', (_req, res) => {
  try {
    const orders = readJsonOrders();
    res.json({ ok: true, orders });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

function readJsonOrders() {
  try {
    const parsed = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function writeJsonOrders(data) {
  // حداکثر ۵۰۰۰ سفارش اخیر نگه داشته می‌شود تا فایل بی‌نهایت بزرگ نشود.
  const serialized = JSON.stringify(data.slice(0, 5000), null, 2) + '\n';
  JSON.parse(serialized); // sanity check
  const tmp = `${ORDERS_FILE}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, serialized, 'utf8');
  fs.renameSync(tmp, ORDERS_FILE);
}

// ---------- شروع ----------
function onListening() {
  console.log('');
  console.log('  🌾 پنل مدیریت عطر شالیزار');
  if (HAS_PORT_ENV) {
    console.log('  ▸ اجرا روی Passenger (cPanel)');
    console.log(
      `  ▸ دامنه:      ${process.env.API_PUBLIC_URL || 'https://api.atre-shalizar.ir'}`,
    );
  } else {
    console.log(`  ▸ آدرس:      http://${HOST}:${PORT}`);
  }
  console.log(`  ▸ محصولات:   ${DATA_FILES.products}`);
  console.log(`  ▸ وبلاگ:     ${DATA_FILES.blogPosts}`);
  console.log(`  ▸ تصاویر:    ${ASSET_DIRS.products}`);
  console.log(
    `  ▸ درگاه:     ${ZARINPAL_SANDBOX ? 'sandbox' : 'production'}${
      ZARINPAL_MERCHANT_ID ? '' : ' (merchant تنظیم نشده)'
    }`,
  );
  console.log('  ▸ برای بستن این پنجره را ببند (Ctrl+C)');
  console.log('');
}

// روی هاست مدیریت‌شده، پلتفرم خودش پورت/سوکت را تعیین می‌کند و باید همهٔ
// اینترفیس‌ها bind شود؛ اجرای دستی فقط روی لوکال‌هاست.
const server = HAS_PORT_ENV
  ? app.listen(PORT, onListening)
  : app.listen(PORT, HOST, onListening);

server.on('error', (e) => {
  if (e && e.code === 'EADDRINUSE') {
    console.error('');
    console.error(
      `⛔ پورت ${PORT} اشغال است — احتمالاً پنل قبلاً در یک پنجره دیگر باز است.`,
    );
    console.error(
      '   راه‌حل: پنجره قبلی پنل را ببند، یا در Task Manager پردازه node را End Task کن.',
    );
    console.error('');
  } else {
    console.error('⛔ خطا در اجرای سرور پنل:', e && e.message ? e.message : e);
  }
  process.exit(1);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
  });
}

