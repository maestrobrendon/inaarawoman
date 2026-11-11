// Who may do what. Admins (valid session cookie, active admin_users row) may
// use every table. Visitors get only what the storefront needs — tighter than
// the old Supabase rules, which let anyone read all orders and customers.
import { QueryError, parseSelect, type Filter, type QueryRequest } from './query.js';

const PUBLIC_READ = new Set([
  'products', 'product_images', 'product_variants', 'collections', 'collection_products',
  'categories', 'homepage_content', 'store_settings', 'reviews', 'shipping_zones',
]);

// Checkout looks a customer up by email to bump their totals; it never needs more than this.
const CUSTOMER_PUBLIC_COLS = 'id, total_orders, total_spent';
const CUSTOMER_WRITABLE = new Set([
  'email', 'first_name', 'last_name', 'phone', 'address', 'city', 'state', 'country',
  'postal_code', 'total_orders', 'total_spent', 'currency', 'updated_at',
]);

const deny = (r: QueryRequest) => {
  throw new QueryError(`permission denied: ${r.action} on ${r.table}`, '42501', 403);
};

const hasEq = (filters: Filter[] | undefined, col: string) =>
  !!filters?.some((f) => 'column' in f && f.column === col && f.op === 'eq' && f.value != null && f.value !== '');

/** Tables reached through embeds (e.g. images:product_images(*)) must be readable too. */
function embeddedTables(sel: string | null | undefined): string[] {
  if (!sel) return [];
  const out: string[] = [];
  const walk = (items: ReturnType<typeof parseSelect>) =>
    items.forEach((i) => { if (i.kind === 'embed') { out.push(i.table); walk(i.inner); } });
  walk(parseSelect(sel));
  return out;
}

/** Returns the (possibly narrowed) request a visitor may run, or throws. */
export function authorizePublic(r: QueryRequest): QueryRequest {
  const sel = r.action === 'select' ? r.columns : r.returning;
  for (const t of embeddedTables(sel)) if (!PUBLIC_READ.has(t)) deny({ ...r, table: t });

  switch (r.action) {
    case 'select':
      if (PUBLIC_READ.has(r.table)) return r;
      if (r.table === 'customers' && hasEq(r.filters, 'email')) return { ...r, columns: CUSTOMER_PUBLIC_COLS };
      if (r.table === 'wishlist_items' && hasEq(r.filters, 'session_id')) return r;
      return deny(r);

    case 'insert':
      if (r.table === 'orders' || r.table === 'order_items') return r;
      if (r.table === 'wishlist_items') return r;
      if (r.table === 'newsletter_subscribers') return { ...r, returning: null };
      if (r.table === 'customers') {
        const rows = Array.isArray(r.values) ? r.values : [r.values ?? {}];
        if (rows.some((row) => Object.keys(row).some((k) => !CUSTOMER_WRITABLE.has(k)))) return deny(r);
        return { ...r, returning: r.returning == null ? null : CUSTOMER_PUBLIC_COLS };
      }
      return deny(r);

    case 'update':
      if (r.table === 'customers' && hasEq(r.filters, 'email')) {
        const vals = (r.values ?? {}) as Record<string, unknown>;
        if (Object.keys(vals).some((k) => !CUSTOMER_WRITABLE.has(k))) return deny(r);
        return { ...r, returning: r.returning == null ? null : CUSTOMER_PUBLIC_COLS };
      }
      return deny(r);

    case 'delete':
      if (r.table === 'wishlist_items' && hasEq(r.filters, 'session_id')) return { ...r, returning: null };
      return deny(r);

    default:
      return deny(r);
  }
}
