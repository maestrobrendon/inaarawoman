// Creator / affiliate discount codes on the storefront.
// A creator's link is any page with ?ref=CODE (e.g. inaarawoman.com/?ref=ADA15).
// The code is remembered for 30 days and applied automatically at checkout.

const KEY = 'iw_ref';
const TTL_MS = 30 * 24 * 60 * 60 * 1000;

export type AppliedDiscount = { code: string; percent: number; affiliate: string | null };

export function normaliseCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, '');
}

/** Call once on page load: stores ?ref= / ?code= from the URL. */
export function captureRefFromUrl(): void {
  try {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref') || params.get('code');
    if (ref) rememberCode(ref);
  } catch { /* storage unavailable: link still works if the code is typed */ }
}

export function rememberCode(code: string): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ code: normaliseCode(code), savedAt: Date.now() }));
  } catch { /* ignore */ }
}

export function storedCode(): string | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const { code, savedAt } = JSON.parse(raw);
    if (typeof code !== 'string' || Date.now() - savedAt > TTL_MS) {
      localStorage.removeItem(KEY);
      return null;
    }
    return code;
  } catch {
    return null;
  }
}

export function forgetCode(): void {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}

export async function checkCode(code: string): Promise<{ ok: true; discount: AppliedDiscount } | { ok: false; message: string }> {
  try {
    const res = await fetch('/api/discount', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ code: normaliseCode(code) }),
    });
    const body = await res.json().catch(() => ({}));
    if (res.ok && body.code) return { ok: true, discount: { code: body.code, percent: body.percent, affiliate: body.affiliate } };
    return { ok: false, message: body.error || 'This code is not valid' };
  } catch {
    return { ok: false, message: 'Could not check the code. Please try again.' };
  }
}

/** Discount in the same unit as `subtotal` (NGN), rounded to whole naira. */
export function discountAmount(subtotal: number, percent: number): number {
  return Math.round((subtotal * Math.min(Math.max(percent, 0), 100)) / 100);
}
