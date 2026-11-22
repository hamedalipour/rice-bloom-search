/**
 * کلاینت اتصال به درگاه پرداخت زرین‌پال (ZarinPal).
 *
 * متغیرهای build (Vite):
 *   VITE_PANEL_API_BASE     → آدرس سرور API، مثلاً https://api.atre-shalizar.ir
 *   VITE_ZARINPAL_SANDBOX   → "false" برای درگاه واقعی
 *
 * Merchant ID فقط روی سرور (panel/server.cjs) نگهداری می‌شود و هرگز
 * داخل باندل مرورگر قرار نمی‌گیرد.
 */

export interface ZarinpalRequestInput {
  amount: number;                 // مبلغ به تومان (سرور با currency=IRT ارسال می‌کند)
  items: Array<{
    id: string;
    slug?: string;
    weight?: string | null;
    quantity: number;
  }>;
  description: string;
  customer_name?: string;
  customer_email?: string;
  customer_mobile?: string;
  customer_address?: string;
}

export interface ZarinpalRequestResponse {
  ok: boolean;
  authority?: string;
  url?: string;                   // لینک ادامه پرداخت در درگاه
  code?: number;
  message?: string;
  orderId?: string;
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
 * آدرس پایه API. در توسعه خالی است و Vite آن را به localhost:3001 پروکسی می‌کند؛
 * در production باید VITE_PANEL_API_BASE=https://api.atre-shalizar.ir ست شود.
 * هرگز نباید مقدار پیش‌فرض 127.0.0.1 داخل باندل production برود.
 */
const API_BASE = (import.meta.env.VITE_PANEL_API_BASE || '').replace(/\/+$/, '');

/**
 * آدرس شروع پرداخت (StartPay) — فقط به‌عنوان fallback اگر سرور url برنگرداند.
 */
export function zarinpalStartUrl(authority: string): string {
  const sandbox = import.meta.env.VITE_ZARINPAL_SANDBOX !== 'false';
  return sandbox
    ? `https://sandbox.zarinpal.com/pg/StartPay/${authority}`
    : `https://payment.zarinpal.com/pg/StartPay/${authority}`;
}

/**
 * درخواست ایجاد پرداخت (PaymentRequest) از طریق backend.
 * سرور از Merchant Key استفاده می‌کند و authority را برمی‌گرداند.
 */
export async function requestPayment(input: ZarinpalRequestInput): Promise<ZarinpalRequestResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/payment/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.ok) {
      return {
        ok: false,
        code: json.code,
        message: json.error || json.message || 'خطا در ایجاد پرداخت',
      };
    }
    return {
      ok: true,
      authority: json.authority,
      url: json.url,
      message: json.message,
      orderId: json.orderId,
    };
  } catch {
    return {
      ok: false,
      message: 'اتصال به سرور پرداخت برقرار نشد. لطفاً دوباره تلاش کنید.',
    };
  }
}

/**
 * تایید پرداخت (PaymentVerification) پس از بازگشت کاربر از درگاه.
 * این تابع از طریق backend صدا زده می‌شود (کلید Merchant remains سرور-side).
 */
export async function verifyPayment(input: ZarinpalVerifyInput): Promise<ZarinpalVerifyResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/payment/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.ok) {
      return {
        ok: false,
        code: json.code,
        message: json.error || json.message || 'تایید پرداخت ناموفق بود',
      };
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
  } catch {
    return { ok: false, message: 'اتصال به سرور پرداخت برقرار نشد.' };
  }
}

/**
 * فرمت قیمت به تومان با جداکننده فارسی.
 */
export const priceFmt = (n: number) => Number(n || 0).toLocaleString('fa-IR');
