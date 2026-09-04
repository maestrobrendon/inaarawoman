// ============================================================================
// Store settings — the storefront-facing slice of the admin `store_settings`
// key/value table. Each admin key is one row (`key`, `value` jsonb). Every
// field has a default here so the storefront renders correctly whether or not
// the row exists (or is readable).
// ============================================================================

import { supabase } from './supabase';

export interface StoreSettings {
  store_name: string;
  store_email: string;
  store_phone: string;
  store_whatsapp: string;
  store_address: string;
  /** Order subtotal (in NGN) at/above which shipping is free. 0 = disabled. */
  free_shipping_threshold: number;
  /** Percent, e.g. 7.5. Only applied when `enable_tax` is true. */
  tax_rate: number;
  enable_tax: boolean;
  /** "Only N left" threshold on product pages. */
  low_stock_threshold: number;
}

export const STORE_SETTINGS_DEFAULTS: StoreSettings = {
  store_name: 'Inaara Woman',
  store_email: 'info.inaarawoman@gmail.com',
  store_phone: '',
  store_whatsapp: '',
  store_address: '',
  free_shipping_threshold: 0,
  tax_rate: 0,
  enable_tax: false,
  low_stock_threshold: 5,
};

type Raw = { key: string; value: unknown };

function coerce<K extends keyof StoreSettings>(
  key: K,
  raw: unknown,
): StoreSettings[K] {
  const fallback = STORE_SETTINGS_DEFAULTS[key];
  // `value` may arrive as a JSON string ('"INAARA"', '5', 'true') or already parsed.
  let v: unknown = raw;
  if (typeof raw === 'string') {
    try {
      v = JSON.parse(raw);
    } catch {
      v = raw;
    }
  }
  if (typeof fallback === 'number') {
    const n = typeof v === 'number' ? v : parseFloat(String(v));
    return (Number.isFinite(n) ? n : fallback) as StoreSettings[K];
  }
  if (typeof fallback === 'boolean') {
    return (typeof v === 'boolean' ? v : v === 'true') as StoreSettings[K];
  }
  return (v == null || v === '' ? fallback : String(v)) as StoreSettings[K];
}

export function mergeStoreSettings(rows: Raw[] | null | undefined): StoreSettings {
  const out: StoreSettings = { ...STORE_SETTINGS_DEFAULTS };
  if (!rows) return out;
  for (const row of rows) {
    if (row.key in out) {
      const k = row.key as keyof StoreSettings;
      // @ts-expect-error checked key
      out[k] = coerce(k, row.value);
    }
  }
  return out;
}

let cache: Promise<StoreSettings> | null = null;

/** Fetch + merge store settings. Cached for the page's lifetime; never throws. */
export function fetchStoreSettings(force = false): Promise<StoreSettings> {
  if (force) cache = null;
  if (cache) return cache;
  cache = (async () => {
    try {
      const { data, error } = await supabase.from('store_settings').select('key, value');
      if (error) throw error;
      return mergeStoreSettings(data);
    } catch (err) {
      console.warn('[storeSettings] falling back to defaults:', err);
      return STORE_SETTINGS_DEFAULTS;
    }
  })();
  return cache;
}

export function clearStoreSettingsCache() {
  cache = null;
}
