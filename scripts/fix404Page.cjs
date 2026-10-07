// بازنویسی 404.html به صفحه ۴۰۴ واقعی (بدون ریدایرکت نرم به خانه)
const fs = require('fs');
const html = `<!doctype html>
<html lang="fa" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex, nofollow" />
    <title>صفحه پیدا نشد | عطر شالیزار</title>
    <meta name="description" content="صفحه مورد نظر شما پیدا نشد. به صفحه اصلی یا فروشگاه عطر شالیزار بروید." />
    <link rel="icon" type="image/png" href="/favicon.png" />
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: Tahoma, Arial, sans-serif; background: #f8faf9; color: #1a1a1a; min-height: 100vh; display: flex; align-items: center; justify-content: center; text-align: center; padding: 24px; }
      .card { background: #fff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 48px 32px; max-width: 520px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06); }
      h1 { font-size: 64px; color: #16a34a; margin-bottom: 8px; }
      h2 { font-size: 20px; margin-bottom: 12px; }
      p { color: #6b7280; line-height: 1.9; margin-bottom: 24px; font-size: 14px; }
      nav a { display: inline-block; margin: 6px; padding: 10px 20px; background: #16a34a; color: #fff; text-decoration: none; border-radius: 10px; font-size: 14px; }
      nav a.alt { background: #fff; color: #16a34a; border: 1px solid #16a34a; }
      .phone { margin-top: 24px; font-size: 13px; color: #9ca3af; }
    </style>
  </head>
  <body>
    <main class="card">
      <h1>۴۰۴</h1>
      <h2>صفحه مورد نظر پیدا نشد</h2>
      <p>
        شاید آدرس را اشتباه تایپ کرده‌اید یا این صفحه دیگر وجود ندارد.
        از لینک‌های زیر ادامه دهید یا برای سفارش تلفنی با ما تماس بگیرید.
      </p>
      <nav>
        <a href="/">صفحه اصلی</a>
        <a href="/shop">فروشگاه</a>
        <a class="alt" href="/blog">وبلاگ</a>
      </nav>
      <div class="phone">تلفن سفارشات: ۰۹۳۵۴۲۹۹۷۸۵</div>
    </main>
  </body>
</html>
`;
fs.writeFileSync('public/404.html', html, 'utf8');
console.log('404.html rewritten (' + html.length + ' chars)');
