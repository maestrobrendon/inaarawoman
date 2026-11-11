import { useEffect, useMemo, useState } from 'react';
import {
  BadgePercent, Plus, Search, Copy, Check, Link2, Trash2, Edit, Pause, Play, RefreshCw, X,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';

interface DiscountCode {
  id: string;
  code: string;
  type: string;
  value: number;
  affiliate_name: string | null;
  affiliate_contact: string | null;
  notes: string | null;
  maximum_uses: number | null;
  uses_count: number | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
}

interface Stats { orders: number; revenue: number; discount: number }

type FormState = {
  id: string | null;
  affiliate_name: string;
  affiliate_contact: string;
  percent: string;
  code: string;
  codeTouched: boolean;
  maximum_uses: string;
  end_date: string;
  notes: string;
};

const EMPTY_FORM: FormState = {
  id: null, affiliate_name: '', affiliate_contact: '', percent: '10', code: '', codeTouched: false,
  maximum_uses: '', end_date: '', notes: '',
};

const naira = (n: number) => `₦${Math.round(n).toLocaleString()}`;

/** e.g. "Ada Eze" + 15 -> "ADAEZE15" */
function codeFromName(name: string, percent: string): string {
  const base = name.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
  const pct = String(Math.round(Number(percent) || 0) || '');
  return base ? `${base}${pct}` : '';
}

function randomCode(name: string): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I
  const prefix = name.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4) || 'INW';
  const bytes = crypto.getRandomValues(new Uint8Array(5));
  return `${prefix}-${Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('')}`;
}

function statusOf(c: DiscountCode): { label: string; tone: string } {
  if (!c.is_active) return { label: 'Paused', tone: 'bg-neutral-100 text-neutral-600' };
  if (c.end_date && new Date(c.end_date) <= new Date()) return { label: 'Expired', tone: 'bg-red-100 text-red-700' };
  if (c.maximum_uses != null && (c.uses_count ?? 0) >= c.maximum_uses) return { label: 'Limit reached', tone: 'bg-amber-100 text-amber-700' };
  return { label: 'Active', tone: 'bg-green-100 text-green-700' };
}

export default function Affiliates() {
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [stats, setStats] = useState<Record<string, Stats>>({});
  const [statsAvailable, setStatsAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://www.inaarawoman.com';
  const linkFor = (code: string) => `${siteUrl}/?ref=${encodeURIComponent(code)}`;

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('discount_codes')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) console.error('Error loading codes:', error);
    setCodes((data as DiscountCode[]) || []);

    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('discount_code, total_amount, discount_amount')
      .not('discount_code', 'is', null);
    if (ordersError) {
      setStatsAvailable(false);
    } else {
      setStatsAvailable(true);
      const s: Record<string, Stats> = {};
      for (const o of orders || []) {
        const k = String(o.discount_code).toUpperCase();
        s[k] ??= { orders: 0, revenue: 0, discount: 0 };
        s[k].orders += 1;
        s[k].revenue += Number(o.total_amount) || 0;
        s[k].discount += Number(o.discount_amount) || 0;
      }
      setStats(s);
    }
    setLoading(false);
  };

  const totals = useMemo(() => {
    const active = codes.filter((c) => statusOf(c).label === 'Active').length;
    const all = Object.values(stats);
    return {
      active,
      orders: all.reduce((a, s) => a + s.orders, 0),
      revenue: all.reduce((a, s) => a + s.revenue, 0),
    };
  }, [codes, stats]);

  const filtered = codes.filter((c) => {
    const q = search.toLowerCase();
    return !q || c.code.toLowerCase().includes(q) || (c.affiliate_name ?? '').toLowerCase().includes(q);
  });

  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied((k) => (k === key ? null : k)), 1500);
    } catch {
      window.prompt('Copy this:', text);
    }
  };

  // ---------- form ----------
  const openNew = () => { setForm({ ...EMPTY_FORM }); setFormError(null); };
  const openEdit = (c: DiscountCode) => {
    setForm({
      id: c.id,
      affiliate_name: c.affiliate_name ?? '',
      affiliate_contact: c.affiliate_contact ?? '',
      percent: String(c.value),
      code: c.code,
      codeTouched: true,
      maximum_uses: c.maximum_uses != null ? String(c.maximum_uses) : '',
      end_date: c.end_date ? c.end_date.slice(0, 10) : '',
      notes: c.notes ?? '',
    });
    setFormError(null);
  };

  const update = (patch: Partial<FormState>) => {
    setForm((f) => {
      if (!f) return f;
      const next = { ...f, ...patch };
      if (!next.codeTouched && !next.id) next.code = codeFromName(next.affiliate_name, next.percent);
      return next;
    });
  };

  const save = async () => {
    if (!form) return;
    const percent = Number(form.percent);
    const code = form.code.trim().toUpperCase().replace(/\s+/g, '');
    if (!form.affiliate_name.trim()) return setFormError('Enter the creator’s name.');
    if (!Number.isFinite(percent) || percent <= 0 || percent > 90) return setFormError('Discount must be between 1% and 90%.');
    if (!/^[A-Z0-9_-]{3,40}$/.test(code)) return setFormError('Code must be 3–40 letters, numbers, - or _.');
    const maxUses = form.maximum_uses.trim() ? Number(form.maximum_uses) : null;
    if (maxUses !== null && (!Number.isInteger(maxUses) || maxUses < 1)) return setFormError('Usage limit must be a whole number, or leave it empty.');

    const values = {
      code,
      type: 'percentage',
      value: percent,
      affiliate_name: form.affiliate_name.trim(),
      affiliate_contact: form.affiliate_contact.trim() || null,
      notes: form.notes.trim() || null,
      maximum_uses: maxUses,
      end_date: form.end_date ? new Date(`${form.end_date}T23:59:59`).toISOString() : null,
      updated_at: new Date().toISOString(),
    };

    setSaving(true);
    setFormError(null);
    const { error } = form.id
      ? await supabase.from('discount_codes').update(values).eq('id', form.id)
      : await supabase.from('discount_codes').insert([{ ...values, is_active: true, start_date: new Date().toISOString() }]);
    setSaving(false);

    if (error) {
      if (error.code === '23505') setFormError(`The code ${code} is already taken. Try another.`);
      else if (error.code === '42703') setFormError('The database needs a quick update before codes can be saved (run npm run db:migrate).');
      else setFormError(error.message || 'Could not save. Please try again.');
      return;
    }
    setForm(null);
    load();
  };

  const toggleActive = async (c: DiscountCode) => {
    setBusy(c.id);
    const { error } = await supabase.from('discount_codes').update({ is_active: !c.is_active, updated_at: new Date().toISOString() }).eq('id', c.id);
    setBusy(null);
    if (error) return alert('Could not update the code.');
    setCodes((list) => list.map((x) => (x.id === c.id ? { ...x, is_active: !c.is_active } : x)));
  };

  const remove = async (c: DiscountCode) => {
    if (!confirm(`Delete ${c.code} (${c.affiliate_name ?? 'no name'})?\n\nThe code and link stop working immediately. Past orders keep their record of the code.`)) return;
    setBusy(c.id);
    const { error } = await supabase.from('discount_codes').delete().eq('id', c.id);
    setBusy(null);
    if (error) return alert('Could not delete the code.');
    setCodes((list) => list.filter((x) => x.id !== c.id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 flex items-center gap-2">
            <BadgePercent className="text-amber-500" size={28} />
            Affiliates
          </h1>
          <p className="text-neutral-500 mt-1 text-sm">
            Create discount codes and links for creators. Shoppers get the discount at checkout.
          </p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus size={16} />
          New affiliate code
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Active codes', value: String(totals.active) },
          { label: 'Orders from affiliates', value: statsAvailable ? String(totals.orders) : '—' },
          { label: 'Affiliate revenue', value: statsAvailable ? naira(totals.revenue) : '—' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4">
            <p className="text-xs uppercase tracking-wide text-neutral-500">{s.label}</p>
            <p className="text-2xl font-semibold text-neutral-900 mt-1 tabular-nums">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Create / edit form */}
      {form && (
        <div className="bg-white rounded-xl shadow-sm border border-amber-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-900">{form.id ? `Edit ${form.code}` : 'New affiliate code'}</h2>
            <button onClick={() => setForm(null)} className="p-1.5 text-neutral-500 hover:text-neutral-800 rounded-lg" aria-label="Close">
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Creator name *">
              <input value={form.affiliate_name} onChange={(e) => update({ affiliate_name: e.target.value })}
                placeholder="e.g. Ada Eze" className={inputCls} autoFocus />
            </Field>
            <Field label="Contact (email, phone or @handle)">
              <input value={form.affiliate_contact} onChange={(e) => update({ affiliate_contact: e.target.value })}
                placeholder="@adaeze" className={inputCls} />
            </Field>
            <Field label="Discount % *">
              <div className="relative">
                <input type="number" min={1} max={90} step={1} value={form.percent}
                  onChange={(e) => update({ percent: e.target.value })} className={`${inputCls} pr-8`} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500">%</span>
              </div>
            </Field>
            <Field label="Code *">
              <div className="flex gap-2">
                <input value={form.code} disabled={!!form.id}
                  onChange={(e) => update({ code: e.target.value.toUpperCase().replace(/\s+/g, ''), codeTouched: true })}
                  placeholder="ADAEZE10" className={`${inputCls} font-mono uppercase disabled:bg-neutral-50 disabled:text-neutral-500`} />
                {!form.id && (
                  <button type="button" title="Generate a random code"
                    onClick={() => update({ code: randomCode(form.affiliate_name), codeTouched: true })}
                    className="px-3 border border-neutral-200 rounded-lg text-neutral-600 hover:bg-neutral-50">
                    <RefreshCw size={16} />
                  </button>
                )}
              </div>
              {form.id && <p className="text-xs text-neutral-500 mt-1">Codes can’t be renamed once shared. Create a new one instead.</p>}
            </Field>
            <Field label="Usage limit (optional)">
              <input type="number" min={1} step={1} value={form.maximum_uses}
                onChange={(e) => update({ maximum_uses: e.target.value })} placeholder="Unlimited" className={inputCls} />
            </Field>
            <Field label="Expires on (optional)">
              <input type="date" value={form.end_date} onChange={(e) => update({ end_date: e.target.value })} className={inputCls} />
            </Field>
            <div className="md:col-span-2">
              <Field label="Notes (optional)">
                <input value={form.notes} onChange={(e) => update({ notes: e.target.value })}
                  placeholder="e.g. 10% commission, paid monthly" className={inputCls} />
              </Field>
            </div>
          </div>

          {form.code && (
            <div className="mt-4 rounded-lg bg-neutral-50 border border-neutral-200 p-3 text-sm">
              <p className="text-neutral-500 text-xs mb-1">Shareable link</p>
              <p className="font-mono text-neutral-800 break-all">{linkFor(form.code.trim().toUpperCase())}</p>
            </div>
          )}

          {formError && <p className="mt-3 text-sm text-red-600">{formError}</p>}

          <div className="mt-5 flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setForm(null)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : form.id ? 'Save changes' : 'Create code'}</Button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
          <input type="text" placeholder="Search by creator or code..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm" />
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-neutral-200 border-t-amber-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-neutral-500 text-sm">Loading affiliate codes...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <BadgePercent className="mx-auto text-neutral-300 mb-4" size={48} />
            <h3 className="text-neutral-900 font-medium mb-2">{search ? 'No codes found' : 'No affiliate codes yet'}</h3>
            <p className="text-neutral-500 text-sm mb-6">
              {search ? `Nothing matches "${search}"` : 'Create a code for a creator, then share the code or the link with them.'}
            </p>
            {!search && <Button onClick={openNew}>Create affiliate code</Button>}
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {filtered.map((c) => {
              const st = statusOf(c);
              const s = stats[c.code.toUpperCase()] ?? { orders: 0, revenue: 0, discount: 0 };
              return (
                <div key={c.id} className="p-4 sm:p-6 hover:bg-neutral-50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-medium text-neutral-900 truncate">{c.affiliate_name || 'Unnamed'}</h3>
                        <span className={`inline-flex px-2 py-0.5 text-[10px] font-medium rounded-full uppercase tracking-wide ${st.tone}`}>{st.label}</span>
                        <span className="inline-flex px-2 py-0.5 text-[11px] font-semibold rounded-full bg-amber-50 text-amber-700">{c.value}% off</span>
                      </div>
                      {c.affiliate_contact && <p className="text-sm text-neutral-500 mb-2">{c.affiliate_contact}</p>}

                      <div className="flex flex-wrap gap-2 mt-2">
                        <button onClick={() => copy(c.code, `${c.id}-code`)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-neutral-200 text-sm font-mono text-neutral-800 hover:bg-white">
                          {copied === `${c.id}-code` ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                          {c.code}
                        </button>
                        <button onClick={() => copy(linkFor(c.code), `${c.id}-link`)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-neutral-200 text-sm text-neutral-700 hover:bg-white">
                          {copied === `${c.id}-link` ? <Check size={14} className="text-green-600" /> : <Link2 size={14} />}
                          {copied === `${c.id}-link` ? 'Link copied' : 'Copy link'}
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500 mt-3">
                        <span>{c.uses_count ?? 0}{c.maximum_uses != null ? ` / ${c.maximum_uses}` : ''} uses</span>
                        {statsAvailable && <><span>•</span><span>{s.orders} orders · {naira(s.revenue)} revenue</span></>}
                        {statsAvailable && s.discount > 0 && <><span>•</span><span>{naira(s.discount)} discounted</span></>}
                        {c.end_date && <><span>•</span><span>Expires {new Date(c.end_date).toLocaleDateString()}</span></>}
                        <span>•</span><span>Created {new Date(c.created_at).toLocaleDateString()}</span>
                      </div>
                      {c.notes && <p className="text-xs text-neutral-500 mt-2 italic">{c.notes}</p>}
                    </div>

                    <div className="flex items-center gap-1">
                      <button onClick={() => toggleActive(c)} disabled={busy === c.id}
                        className="p-2 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded-lg disabled:opacity-50"
                        title={c.is_active ? 'Pause code' : 'Resume code'}>
                        {c.is_active ? <Pause size={18} /> : <Play size={18} />}
                      </button>
                      <button onClick={() => openEdit(c)}
                        className="p-2 text-neutral-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg" title="Edit">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => remove(c)} disabled={busy === c.id}
                        className="p-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50" title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const inputCls =
  'w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-neutral-700 mb-1.5">{label}</span>
      {children}
    </label>
  );
}
