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
const PORT = 3001;
const HOST = '127.0.0.1'; // فقط لوکال — به اینترنت باز نمی‌شود

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// پیش‌نمایش تصاویر آپلودشده داخل پنل
app.use('/assets', express.static(path.join(PUBLIC_DIR, 'assets')));

// ---------- ابزارهای کمکی ----------
function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, data) {
  // اعتبارسنجی قبل از نوشتن: هرگز فایل خراب روی دیسک نگذار
  const serialized = JSON.stringify(data, null, 2) + '\n';
  JSON.parse(serialized); // sanity check
  fs.writeFileSync(file, serialized, 'utf8');
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
  res.json({ ok: true, service: 'local-admin-panel', time: new Date().toISOString() });
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
      if (push2.ok)
        return res.json({ ok: true, pushed: true, note: 'پس از rebase، تغییرات پوش شد؛ دیپلوی Actions شروع می‌شود.', log });
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

    res.json({ ok: true, pushed: true, note: 'تغییرات به گیت‌هاب پوش شد؛ دیپلوی خودکار Actions شروع می‌شود.', log });
  } catch (e) {
    const hint =
      /Function not implemented|Unable to write/i.test(String(e.detail || e.message))
        ? 'باگ شناخته‌شده گیت روی درایو ReFS: گیت را به نسخه ۲.۵۰+ آپگرید کن (winget upgrade --id Git.Git)'
        : undefined;
    res.status(500).json({ ok: false, error: e.message, detail: e.detail, hint, log });
  }
});



// ---------- شروع ----------
app.listen(PORT, HOST, () => {
  console.log('');
  console.log('  🌾 پنل مدیریت عطر شالیزار');
  console.log(`  ▸ آدرس:      http://${HOST}:${PORT}`);
  console.log(`  ▸ محصولات:   ${DATA_FILES.products}`);
  console.log(`  ▸ وبلاگ:     ${DATA_FILES.blogPosts}`);
  console.log(`  ▸ تصاویر:    ${ASSET_DIRS.products}`);
  console.log('');
});
