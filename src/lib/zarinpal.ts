/**
 * کلاینت اتصال به درگاه پرداخت زرین‌پال (ZarinPal).
 *
 * قبل از اجرا باید در فایل .env (راه‌اندازی توسعه) یا متغیرهای محیطی میزبانی
 * فعلی مقدارهای زیر را تنظیم کنید:
 *   VITE_ZARINPAL_MERCHANT_ID  → کدmercial گirit شده از زرین‌پال
 *   VITE_ZARINPAL_CALLBACK_URL → آدرس مسیر verify در سرور backend
 *   VITE_ZARINPAL_SANDBOX      → "true" برای محیط آزمایشی (پیش‌فرض true)
 *
 * درخواست‌ها از طریق سرور backend (panel/server.cjs) ارسال می‌شود تا
 * Merchant Key یا کلید پنهان در مرورگر فاش نشود.
 */

export interface ZarinpalRequestInput {
  amount: number;                 //TOMAN (زرین‌پال در این سایت بر اساس تومان محاسبه می‌شود)
  callback_url: string;
  description: string;
  customer_name?: string;
  customer_email?: string;
  customer_mobile?: string;
}

export interface ZarinpalRequestResponse {
  ok: boolean;
  authority?: string;
  url?: string;                   // لینک ادامه پرداخت در درگاه
  code?: number;
  message?: string;
}

export interface ZarinpalVerifyInput {
  authority: string;
  amount: number;
}

export interface ZarinpalVerifyResponse {
  ok: boolean;
  code?: number;
  message?: string;
  ref_id?: string;
  card_pan?: string;
  card_hash?: string;
  fee_type?: string;
  fee?: number;
}

/**
 * آدرس پایه زرین‌پال (سندباکس یا اصلی) بر اساس متغیر محیطی.
 */
function baseUrl() {
  const sandbox = import.meta.env.VITE_ZARINPAL_SANDBOX !== 'false';
  return sandbox
    ? 'https://sandbox.zarinpal.com/pg/v4/payment'
    : 'https://api.zarinpal.com/pg/v4/payment';
}

/**
 * آدرس شروع پرداخت (StartPay) در درگاه زرین‌پال.
 */
export function zarinpalStartUrl(authority: string): string {
  const sandbox = import.meta.env.VITE_ZARINPAL_SANDBOX !== 'false';
  return sandbox
    ? `https://sandbox.zarinpal.com/pg/StartPay/${authority}`
    : `https://www.zarinpal.com/pg/StartPay/${authority}`;
}

/**
 * درخواست ایجاد پرداخت (PaymentRequest) از طریق backend.
 * سرور از Merchant Key استفاده می‌کند و authority را برمی‌گرداند.
 */
export async function requestPayment(input: ZarinpalRequestInput): Promise<ZarinpalRequestResponse> {
  const apiBase = import.meta.env.VITE_PANEL_API_BASE || 'http://127.0.0.1:3001';
  const res = await fetch(`${apiBase}/api/payment/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const json = await res.json();
  if (!json.ok) {
    return { ok: false, code: json.code, message: json.message || 'خطا در ایجاد پرداخت' };
  }
  return {
    ok: true,
    authority: json.authority,
    url: json.url,
    message: json.message,
  };
}

/**
 * تایید پرداخت (PaymentVerification) پس از بازگشت کاربر از درگاه.
 * این تابع از طریق backend صدا زده می‌شود (کلید Merchant remains سرور-side).
 */
export async function verifyPayment(input: ZarinpalVerifyInput): Promise<ZarinpalVerifyResponse> {
  const apiBase = import.meta.env.VITE_PANEL_API_BASE || 'http://127.0.0.1:3001';
  const res = await fetch(`${apiBase}/api/payment/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const json = await res.json();
  if (!json.ok) {
    return { ok: false, code: json.code, message: json.message || 'تایید پرداخت ناموفق بود' };
  }
  return {
    ok: true,
    code: json.code,
    message: json.message,
    ref_id: json.ref_id,
    card_pan: json.card_pan,
    card_hash: json.card_hash,
    fee_type: json.fee_type,
    fee: json.fee,
  };
}

/**
 * فرمت قیمت به تومان با جداکننده فارسی.
 */
export const priceFmt = (n: number) => Number(n || 0).toLocaleString('fa-IR');
