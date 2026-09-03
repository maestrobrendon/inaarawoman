import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Home,
  Save,
  Eye,
  EyeOff,
  RefreshCw,
  ChevronRight,
  Plus,
  Trash2,
  Type,
  Image as ImageIcon,
  ShoppingBag,
  Megaphone,
  Sparkles,
  Layout,
  Shield,
  Instagram,
  AlertCircle,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';
import { useUnsavedGuard } from '../../hooks/useUnsavedGuard';
import MediaUpload from '../../components/admin/MediaUpload';
import {
  HOMEPAGE_DEFAULTS,
  HomepageContent,
  HomepageSectionKey,
  mergeHomepageContent,
  clearHomepageContentCache,
  dbKey,
  DB_KEY_PREFIX,
} from '../../lib/homepageContent';

// ── Small field primitives ──────────────────────────────────────────────────

const inputCls =
  'w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20';

function TextField({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-neutral-700">{label}</label>
      <input
        className={inputCls}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint && <p className="mt-1 text-[11px] text-neutral-400">{hint}</p>}
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  rows = 3,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  hint?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-neutral-700">{label}</label>
      <textarea
        className={`${inputCls} resize-none`}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint && <p className="mt-1 text-[11px] text-neutral-400">{hint}</p>}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
  description,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  description?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-neutral-900">{label}</p>
        {description && <p className="mt-0.5 text-xs text-neutral-500">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors ${
          checked ? 'bg-amber-500' : 'bg-neutral-200'
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

function StringList({
  label,
  items,
  onChange,
  placeholder,
  max = 8,
}: {
  label: string;
  items: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  max?: number;
}) {
  const set = (i: number, v: string) => onChange(items.map((it, j) => (j === i ? v : it)));
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-neutral-700">{label}</label>
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              className={inputCls}
              value={it}
              placeholder={placeholder}
              onChange={(e) => set(i, e.target.value)}
            />
            <button
              type="button"
              onClick={() => onChange(items.filter((_, j) => j !== i))}
              className="flex-shrink-0 rounded-lg p-2 text-neutral-400 hover:bg-red-50 hover:text-red-500"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {items.length < max && (
          <button
            type="button"
            onClick={() => onChange([...items, ''])}
            className="flex items-center gap-1.5 text-sm font-medium text-amber-600 hover:underline"
          >
            <Plus size={14} /> Add
          </button>
        )}
      </div>
    </div>
  );
}

interface SectionCardProps {
  title: string;
  icon: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  badge?: string;
  badgeOk?: boolean;
  children: React.ReactNode;
}

function SectionCard({ title, icon, open, onToggle, badge, badgeOk, children }: SectionCardProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-5 py-4 hover:bg-neutral-50"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600">
            {icon}
          </div>
          <span className="font-medium text-neutral-900">{title}</span>
          {badge && (
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                badgeOk ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'
              }`}
            >
              {badge}
            </span>
          )}
        </div>
        <ChevronRight
          size={18}
          className={`text-neutral-400 transition-transform ${open ? 'rotate-90' : ''}`}
        />
      </button>
      <div className="collapsible" data-open={open}>
        <div>
          <div className="space-y-4 border-t border-neutral-100 px-5 pb-6 pt-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

const ICON_OPTIONS = [
  'Globe',
  'Leaf',
  'RotateCcw',
  'ShieldCheck',
  'Truck',
  'Headphones',
  'Shield',
  'CreditCard',
  'Sparkles',
  'Heart',
];

// ── Main ────────────────────────────────────────────────────────────────────

const SECTION_ORDER: HomepageSectionKey[] = [
  'banner',
  'hero',
  'new_arrivals',
  'marquee',
  'seasonal_drop',
  'categories',
  'collections',
  'best_sellers',
  'confidence',
  'instagram',
];

export default function HomepageManager() {
  const { showToast } = useToast();
  const [content, setContent] = useState<HomepageContent>(HOMEPAGE_DEFAULTS);
  const originalRef = useRef<string>(JSON.stringify(HOMEPAGE_DEFAULTS));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState<Set<string>>(new Set(['banner']));
  const [showPreview, setShowPreview] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  const dirty = useMemo(
    () => JSON.stringify(content) !== originalRef.current,
    [content],
  );
  useUnsavedGuard(dirty);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from('homepage_content')
          .select('section_key, content')
          .like('section_key', `${DB_KEY_PREFIX}%`)
          .eq('is_active', true);
        if (error) throw error;
        const merged = mergeHomepageContent(data);
        setContent(merged);
        originalRef.current = JSON.stringify(merged);
      } catch (err) {
        console.error('Load homepage content failed:', err);
        showToast('Could not load saved content — showing defaults', 'error');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = (k: string) =>
    setOpen((prev) => {
      const n = new Set(prev);
      n.has(k) ? n.delete(k) : n.add(k);
      return n;
    });

  function patch<K extends HomepageSectionKey>(key: K, updates: Partial<HomepageContent[K]>) {
    setContent((prev) => ({ ...prev, [key]: { ...prev[key], ...updates } }));
  }

  async function saveAll() {
    setSaving(true);
    try {
      const rows = SECTION_ORDER.map((key) => ({
        section_key: dbKey(key),
        content: content[key],
        is_active: true,
        updated_at: new Date().toISOString(),
      }));
      const { error } = await supabase
        .from('homepage_content')
        .upsert(rows, { onConflict: 'section_key' });
      if (error) throw error;
      originalRef.current = JSON.stringify(content);
      clearHomepageContentCache();
      setPreviewKey((k) => k + 1);
      showToast('Homepage updated', 'success');
    } catch (err) {
      console.error('Save homepage content failed:', err);
      showToast(
        err instanceof Error ? err.message : 'Save failed — please try again',
        'error',
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-7 w-7 animate-spin text-amber-500" />
          <p className="text-sm text-neutral-600">Loading homepage content…</p>
        </div>
      </div>
    );
  }

  const editor = (
    <div className="space-y-4">
      {/* Banner */}
      <SectionCard
        title="Announcement Banner"
        icon={<Megaphone size={18} />}
        open={open.has('banner')}
        onToggle={() => toggle('banner')}
        badge={content.banner.enabled ? 'Visible' : 'Hidden'}
        badgeOk={content.banner.enabled}
      >
        <Toggle
          label="Show banner"
          checked={content.banner.enabled}
          onChange={(v) => patch('banner', { enabled: v })}
          description="The scrolling strip above the header"
        />
        <StringList
          label="Messages (cycled in the strip)"
          items={content.banner.messages}
          onChange={(messages) => patch('banner', { messages })}
          placeholder="e.g. New Season Sale"
          max={6}
        />
      </SectionCard>

      {/* Hero */}
      <SectionCard
        title="Hero"
        icon={<ImageIcon size={18} />}
        open={open.has('hero')}
        onToggle={() => toggle('hero')}
      >
        <MediaUpload
          label="Background image"
          value={content.hero.image}
          onChange={(image) => patch('hero', { image })}
          aspectRatio="aspect-[16/9]"
        />
        <TextField
          label="Headline — line 1"
          value={content.hero.headline_top}
          onChange={(v) => patch('hero', { headline_top: v })}
          placeholder="Every version of"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Large word — before"
            value={content.hero.headline_lead}
            onChange={(v) => patch('hero', { headline_lead: v })}
            placeholder="Of Her"
          />
          <TextField
            label="Large word — after"
            value={content.hero.headline_tail}
            onChange={(v) => patch('hero', { headline_tail: v })}
            placeholder="To Exist"
          />
        </div>
        <TextArea
          label="Small stacked text (between the large words)"
          value={content.hero.headline_small}
          onChange={(v) => patch('hero', { headline_small: v })}
          rows={2}
          hint="Use a line break for the stack. Leave empty to hide."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextArea
            label="Corner label — left"
            value={content.hero.label_left}
            onChange={(v) => patch('hero', { label_left: v })}
            rows={2}
          />
          <TextArea
            label="Corner label — right"
            value={content.hero.label_right}
            onChange={(v) => patch('hero', { label_right: v })}
            rows={2}
          />
        </div>
      </SectionCard>

      {/* New arrivals */}
      <SectionCard
        title="New Arrivals rail"
        icon={<ShoppingBag size={18} />}
        open={open.has('new_arrivals')}
        onToggle={() => toggle('new_arrivals')}
        badge={content.new_arrivals.show ? 'Visible' : 'Hidden'}
        badgeOk={content.new_arrivals.show}
      >
        <Toggle
          label="Show section"
          checked={content.new_arrivals.show}
          onChange={(v) => patch('new_arrivals', { show: v })}
        />
        <TextField
          label="Section title"
          value={content.new_arrivals.title}
          onChange={(v) => patch('new_arrivals', { title: v })}
        />
        <p className="rounded-lg bg-blue-50 p-3 text-xs text-blue-700">
          Products come from those marked <strong>New</strong> in the product editor.
        </p>
      </SectionCard>

      {/* Marquee */}
      <SectionCard
        title="Marquee strip"
        icon={<Type size={18} />}
        open={open.has('marquee')}
        onToggle={() => toggle('marquee')}
      >
        <StringList
          label="Words (repeated across the strip)"
          items={content.marquee.words}
          onChange={(words) => patch('marquee', { words })}
          placeholder="e.g. Made To Last"
          max={6}
        />
      </SectionCard>

      {/* Seasonal drop */}
      <SectionCard
        title="Seasonal Drop"
        icon={<Sparkles size={18} />}
        open={open.has('seasonal_drop')}
        onToggle={() => toggle('seasonal_drop')}
        badge={content.seasonal_drop.show ? 'Visible' : 'Hidden'}
        badgeOk={content.seasonal_drop.show}
      >
        <Toggle
          label="Show section"
          checked={content.seasonal_drop.show}
          onChange={(v) => patch('seasonal_drop', { show: v })}
        />
        <MediaUpload
          label="Lifestyle image"
          value={content.seasonal_drop.image}
          onChange={(image) => patch('seasonal_drop', { image })}
          aspectRatio="aspect-[4/5]"
        />
        <TextArea
          label="Heading"
          value={content.seasonal_drop.heading}
          onChange={(v) => patch('seasonal_drop', { heading: v })}
          rows={2}
          hint="Line break allowed, e.g. 'Seasonal' / 'Drop'."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Button label"
            value={content.seasonal_drop.cta_label}
            onChange={(v) => patch('seasonal_drop', { cta_label: v })}
          />
          <TextField
            label="Button link"
            value={content.seasonal_drop.cta_link}
            onChange={(v) => patch('seasonal_drop', { cta_link: v })}
            placeholder="/shop"
          />
        </div>
      </SectionCard>

      {/* Categories */}
      <SectionCard
        title="Shop by Categories"
        icon={<Layout size={18} />}
        open={open.has('categories')}
        onToggle={() => toggle('categories')}
        badge={content.categories.show ? 'Visible' : 'Hidden'}
        badgeOk={content.categories.show}
      >
        <Toggle
          label="Show section"
          checked={content.categories.show}
          onChange={(v) => patch('categories', { show: v })}
        />
        <TextField
          label="Section heading"
          value={content.categories.heading}
          onChange={(v) => patch('categories', { heading: v })}
        />
        {content.categories.cards.map((card, i) => (
          <div key={i} className="space-y-3 rounded-xl bg-neutral-50 p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-neutral-900">
                Card {i + 1} {i === 0 && <span className="text-neutral-400">(large)</span>}
              </h4>
              {content.categories.cards.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    patch('categories', {
                      cards: content.categories.cards.filter((_, j) => j !== i),
                    })
                  }
                  className="rounded-lg p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
            <MediaUpload
              label="Image"
              value={card.image}
              onChange={(image) =>
                patch('categories', {
                  cards: content.categories.cards.map((c, j) =>
                    j === i ? { ...c, image } : c,
                  ),
                })
              }
              aspectRatio="aspect-[4/5]"
            />
            <TextField
              label="Eyebrow"
              value={card.eyebrow}
              onChange={(eyebrow) =>
                patch('categories', {
                  cards: content.categories.cards.map((c, j) =>
                    j === i ? { ...c, eyebrow } : c,
                  ),
                })
              }
            />
            <TextArea
              label="Title"
              value={card.title}
              rows={2}
              hint="Line break allowed."
              onChange={(title) =>
                patch('categories', {
                  cards: content.categories.cards.map((c, j) =>
                    j === i ? { ...c, title } : c,
                  ),
                })
              }
            />
            <TextField
              label="Link"
              value={card.href}
              onChange={(href) =>
                patch('categories', {
                  cards: content.categories.cards.map((c, j) =>
                    j === i ? { ...c, href } : c,
                  ),
                })
              }
              placeholder="/shop?category=women"
            />
          </div>
        ))}
        {content.categories.cards.length < 5 && (
          <button
            type="button"
            onClick={() =>
              patch('categories', {
                cards: [
                  ...content.categories.cards,
                  {
                    eyebrow: 'For Women',
                    title: 'New Category',
                    image: '',
                    href: '/shop',
                    size: 'small' as const,
                  },
                ],
              })
            }
            className="flex items-center gap-1.5 text-sm font-medium text-amber-600 hover:underline"
          >
            <Plus size={14} /> Add card
          </button>
        )}
      </SectionCard>

      {/* Collections */}
      <SectionCard
        title="Collections Preview"
        icon={<Layout size={18} />}
        open={open.has('collections')}
        onToggle={() => toggle('collections')}
        badge={content.collections.show ? 'Visible' : 'Hidden'}
        badgeOk={content.collections.show}
      >
        <Toggle
          label="Show section"
          checked={content.collections.show}
          onChange={(v) => patch('collections', { show: v })}
        />
        {content.collections.tabs.map((tab, i) => (
          <div key={i} className="space-y-3 rounded-xl bg-neutral-50 p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-neutral-900">Tab {i + 1}</h4>
              {content.collections.tabs.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    patch('collections', {
                      tabs: content.collections.tabs.filter((_, j) => j !== i),
                    })
                  }
                  className="rounded-lg p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
            <TextField
              label="Tab name"
              value={tab.name}
              onChange={(name) =>
                patch('collections', {
                  tabs: content.collections.tabs.map((t, j) =>
                    j === i ? { ...t, name } : t,
                  ),
                })
              }
            />
            <MediaUpload
              label="Image"
              value={tab.image}
              onChange={(image) =>
                patch('collections', {
                  tabs: content.collections.tabs.map((t, j) =>
                    j === i ? { ...t, image } : t,
                  ),
                })
              }
              aspectRatio="aspect-video"
            />
            <TextField
              label="Focus point (advanced)"
              value={tab.object_position}
              onChange={(object_position) =>
                patch('collections', {
                  tabs: content.collections.tabs.map((t, j) =>
                    j === i ? { ...t, object_position } : t,
                  ),
                })
              }
              hint="CSS object-position classes, e.g. object-[50%_top] or object-center"
            />
          </div>
        ))}
        {content.collections.tabs.length < 6 && (
          <button
            type="button"
            onClick={() =>
              patch('collections', {
                tabs: [
                  ...content.collections.tabs,
                  { name: 'New Tab', image: '', object_position: 'object-center' },
                ],
              })
            }
            className="flex items-center gap-1.5 text-sm font-medium text-amber-600 hover:underline"
          >
            <Plus size={14} /> Add tab
          </button>
        )}
      </SectionCard>

      {/* Best sellers */}
      <SectionCard
        title="Best Sellers rail"
        icon={<Sparkles size={18} />}
        open={open.has('best_sellers')}
        onToggle={() => toggle('best_sellers')}
        badge={content.best_sellers.show ? 'Visible' : 'Hidden'}
        badgeOk={content.best_sellers.show}
      >
        <Toggle
          label="Show section"
          checked={content.best_sellers.show}
          onChange={(v) => patch('best_sellers', { show: v })}
        />
        <TextField
          label="Section title"
          value={content.best_sellers.title}
          onChange={(v) => patch('best_sellers', { title: v })}
        />
        <p className="rounded-lg bg-blue-50 p-3 text-xs text-blue-700">
          Products come from those marked <strong>Best Seller</strong> in the product editor.
        </p>
      </SectionCard>

      {/* Confidence */}
      <SectionCard
        title="Shop With Confidence"
        icon={<Shield size={18} />}
        open={open.has('confidence')}
        onToggle={() => toggle('confidence')}
        badge={content.confidence.show ? 'Visible' : 'Hidden'}
        badgeOk={content.confidence.show}
      >
        <Toggle
          label="Show section"
          checked={content.confidence.show}
          onChange={(v) => patch('confidence', { show: v })}
        />
        <TextField
          label="Heading"
          value={content.confidence.heading}
          onChange={(v) => patch('confidence', { heading: v })}
        />
        {content.confidence.items.map((item, i) => (
          <div key={i} className="space-y-3 rounded-xl bg-neutral-50 p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-neutral-900">Item {i + 1}</h4>
              {content.confidence.items.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    patch('confidence', {
                      items: content.confidence.items.filter((_, j) => j !== i),
                    })
                  }
                  className="rounded-lg p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Icon</label>
              <select
                className={inputCls}
                value={item.icon}
                onChange={(e) =>
                  patch('confidence', {
                    items: content.confidence.items.map((it, j) =>
                      j === i ? { ...it, icon: e.target.value } : it,
                    ),
                  })
                }
              >
                {ICON_OPTIONS.map((ic) => (
                  <option key={ic} value={ic}>
                    {ic}
                  </option>
                ))}
              </select>
            </div>
            <TextField
              label="Title"
              value={item.title}
              onChange={(title) =>
                patch('confidence', {
                  items: content.confidence.items.map((it, j) =>
                    j === i ? { ...it, title } : it,
                  ),
                })
              }
            />
            <TextArea
              label="Description"
              value={item.description}
              rows={2}
              onChange={(description) =>
                patch('confidence', {
                  items: content.confidence.items.map((it, j) =>
                    j === i ? { ...it, description } : it,
                  ),
                })
              }
            />
          </div>
        ))}
        {content.confidence.items.length < 6 && (
          <button
            type="button"
            onClick={() =>
              patch('confidence', {
                items: [
                  ...content.confidence.items,
                  { icon: 'ShieldCheck', title: 'New benefit', description: '' },
                ],
              })
            }
            className="flex items-center gap-1.5 text-sm font-medium text-amber-600 hover:underline"
          >
            <Plus size={14} /> Add item
          </button>
        )}
      </SectionCard>

      {/* Instagram */}
      <SectionCard
        title="Instagram"
        icon={<Instagram size={18} />}
        open={open.has('instagram')}
        onToggle={() => toggle('instagram')}
        badge={content.instagram.show ? 'Visible' : 'Hidden'}
        badgeOk={content.instagram.show}
      >
        <Toggle
          label="Show section"
          checked={content.instagram.show}
          onChange={(v) => patch('instagram', { show: v })}
        />
        <TextField
          label="Heading"
          value={content.instagram.heading}
          onChange={(v) => patch('instagram', { heading: v })}
        />
        <TextField
          label="Handle"
          value={content.instagram.handle}
          onChange={(v) => patch('instagram', { handle: v })}
          placeholder="@inaarawoman_"
        />
        <p className="rounded-lg bg-blue-50 p-3 text-xs text-blue-700">
          Tiles use the live Instagram feed when configured, otherwise recent product photos.
        </p>
      </SectionCard>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-semibold text-neutral-900">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
              <Home className="text-amber-600" size={22} />
            </span>
            Homepage Manager
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Every field here maps to a live section of the storefront homepage.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPreview((v) => !v)}
            className="flex items-center gap-2 rounded-xl border border-neutral-200 px-4 py-2 text-sm hover:bg-neutral-50"
          >
            {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
            {showPreview ? 'Hide preview' : 'Live preview'}
          </button>
          <button
            onClick={saveAll}
            disabled={saving || !dirty}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              dirty
                ? 'bg-amber-500 text-white hover:bg-amber-600'
                : 'cursor-not-allowed bg-neutral-100 text-neutral-400'
            }`}
          >
            {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>

      {dirty && (
        <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-amber-600" size={18} />
            <p className="text-sm text-amber-800">You have unsaved changes</p>
          </div>
          <button
            onClick={saveAll}
            className="text-sm font-medium text-amber-700 hover:text-amber-900"
          >
            Save now
          </button>
        </div>
      )}

      {showPreview ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="max-h-[calc(100vh-220px)] overflow-y-auto pr-1">{editor}</div>
          <div className="sticky top-4 hidden h-[calc(100vh-160px)] overflow-hidden rounded-2xl border border-neutral-200 bg-white lg:block">
            <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-2">
              <span className="text-xs font-medium text-neutral-500">Live preview</span>
              <button
                onClick={() => setPreviewKey((k) => k + 1)}
                className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-800"
              >
                <RefreshCw size={12} /> Refresh
              </button>
            </div>
            <iframe
              key={previewKey}
              src="/"
              title="Homepage preview"
              className="h-[calc(100%-37px)] w-full"
            />
          </div>
        </div>
      ) : (
        editor
      )}
    </div>
  );
}
