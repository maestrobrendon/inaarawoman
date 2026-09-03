// ============================================================================
// Homepage CMS content — single source of truth
// ----------------------------------------------------------------------------
// The storefront homepage + header banner render from this shape. Every field
// has a hardcoded default here, so the site renders identically whether or not
// the `homepage_content` table has been populated (or even exists yet). The
// admin Homepage Manager edits the very same shape and upserts it row-by-row
// (`section_key` -> `content` jsonb).
// ============================================================================

import { supabase } from './supabase';

// ── Types ───────────────────────────────────────────────────────────────────

export interface BannerContent {
  enabled: boolean;
  /** Phrases cycled in the top marquee strip. */
  messages: string[];
}

export interface HeroContent {
  image: string;
  /** First line, e.g. "Every version of". */
  headline_top: string;
  /** Large run before the small stacked run, e.g. "Of Her". */
  headline_lead: string;
  /** Small stacked run, e.g. "has\nsomewhere". */
  headline_small: string;
  /** Large run after the small run, e.g. "To Exist". */
  headline_tail: string;
  label_left: string;
  label_right: string;
}

export interface RailContent {
  title: string;
  show: boolean;
}

export interface MarqueeContent {
  words: string[];
}

export interface SeasonalDropContent {
  show: boolean;
  image: string;
  heading: string;
  cta_label: string;
  cta_link: string;
}

export interface CategoryCard {
  eyebrow: string;
  /** `\n` marks the line break in the headline. */
  title: string;
  image: string;
  href: string;
  size: 'large' | 'small';
}

export interface CategoriesContent {
  show: boolean;
  heading: string;
  cards: CategoryCard[];
}

export interface CollectionTab {
  name: string;
  image: string;
  /** Tailwind object-position classes, e.g. "object-[24%_center] md:object-center". */
  object_position: string;
}

export interface CollectionsContent {
  show: boolean;
  tabs: CollectionTab[];
}

export interface ConfidenceItem {
  /** Key into ICON_MAP in the homepage. */
  icon: string;
  title: string;
  description: string;
}

export interface ConfidenceContent {
  show: boolean;
  heading: string;
  items: ConfidenceItem[];
}

export interface InstagramContent {
  show: boolean;
  heading: string;
  handle: string;
}

export interface HomepageContent {
  banner: BannerContent;
  hero: HeroContent;
  new_arrivals: RailContent;
  marquee: MarqueeContent;
  seasonal_drop: SeasonalDropContent;
  categories: CategoriesContent;
  collections: CollectionsContent;
  best_sellers: RailContent;
  confidence: ConfidenceContent;
  instagram: InstagramContent;
}

export type HomepageSectionKey = keyof HomepageContent;

/**
 * Rows for this CMS live in `homepage_content` under `home_`-prefixed keys
 * (e.g. `home_hero`) so they never collide with the legacy rows already in
 * that table from the previous homepage design.
 */
export const DB_KEY_PREFIX = 'home_';
export const dbKey = (k: HomepageSectionKey) => `${DB_KEY_PREFIX}${k}`;

// ── Defaults (mirror the original hardcoded homepage) ────────────────────────

const HERO_IMAGE =
  'https://res.cloudinary.com/du5nhfcgd/image/upload/v1788210022/Regal_Recline_in_Cobalt_and_Crimson_anuwia.png';
const COLLECTIONS_IMAGE =
  'https://res.cloudinary.com/du5nhfcgd/image/upload/v1788210023/Regal_Turquoise_in_an_Opulent_Parlor_lpw2ow.png';
const SEASONAL_BANNER =
  'https://res.cloudinary.com/du5nhfcgd/image/upload/v1788210664/Fierce_Glamour_in_Burgundy_and_Gold_ohafdu.png';
const CATEGORY_IMAGE_A =
  'https://res.cloudinary.com/du5nhfcgd/image/upload/v1788210660/ChatGPT_Image_Aug_31_2026_06_05_50_PM_p0une4.png';
const CATEGORY_IMAGE_B =
  'https://res.cloudinary.com/du5nhfcgd/image/upload/v1788210662/Glamorous_Ivory_Gown_Portrait_f7plar.png';

export const HOMEPAGE_DEFAULTS: HomepageContent = {
  banner: {
    enabled: true,
    messages: ['New Season Sale'],
  },
  hero: {
    image: HERO_IMAGE,
    headline_top: 'Every version of',
    headline_lead: 'Of Her',
    headline_small: 'has\nsomewhere',
    headline_tail: 'To Exist',
    label_left: 'Est. 2022\nShaped by light',
    label_right: 'Expressive by nature.\nConfident by choice.',
  },
  new_arrivals: {
    title: 'New Arrival is here',
    show: true,
  },
  marquee: {
    words: ['Made To Last', 'Designed To Move'],
  },
  seasonal_drop: {
    show: true,
    image: SEASONAL_BANNER,
    heading: 'Seasonal\nDrop',
    cta_label: 'Shop Now',
    cta_link: '/shop',
  },
  categories: {
    show: true,
    heading: 'Shop by Categories',
    cards: [
      {
        eyebrow: 'For Women',
        title: 'Built For Daily\nConfidence',
        image: CATEGORY_IMAGE_A,
        href: '/shop?category=women',
        size: 'large',
      },
      {
        eyebrow: 'For Women',
        title: 'Designed For\nModern Living',
        image: CATEGORY_IMAGE_B,
        href: '/shop?category=women',
        size: 'small',
      },
      {
        eyebrow: 'For Kids',
        title: 'Comfort For Every\nAdventure',
        image: SEASONAL_BANNER,
        href: '/shop?category=kids',
        size: 'small',
      },
    ],
  },
  collections: {
    show: true,
    tabs: [
      { name: 'Summer', image: COLLECTIONS_IMAGE, object_position: 'object-[24%_center] md:object-center' },
      { name: 'Uzuri', image: HERO_IMAGE, object_position: 'object-[56%_center] md:object-center' },
      { name: 'Nivara', image: SEASONAL_BANNER, object_position: 'object-[50%_top]' },
      { name: 'Amata', image: CATEGORY_IMAGE_A, object_position: 'object-[50%_top]' },
    ],
  },
  best_sellers: {
    title: 'Best Sellers',
    show: true,
  },
  confidence: {
    show: true,
    heading: 'Shop With Confidence',
    items: [
      {
        icon: 'Globe',
        title: 'Worldwide Shipping',
        description:
          'We ship to over 100 countries with fast, reliable delivery. Track your order wherever you are.',
      },
      {
        icon: 'Leaf',
        title: 'Sustainable Cloths',
        description:
          'Every piece is made from responsibly sourced materials. Wear with purpose, live with less impact.',
      },
      {
        icon: 'RotateCcw',
        title: 'Free 30 Days Returns',
        description:
          'Not satisfied? Return within 30 days for a full refund. No questions asked, totally hassle-free.',
      },
      {
        icon: 'ShieldCheck',
        title: 'Secure Payments',
        description:
          'Shop safely with encrypted checkout. We support all major payment methods for your convenience.',
      },
    ],
  },
  instagram: {
    show: true,
    heading: 'Follow us on Instagram',
    handle: '@inaarawoman_',
  },
};

// ── Merge + fetch ───────────────────────────────────────────────────────────

/** Shallow-merge a partial DB row over the section default (one level deep). */
function mergeSection<K extends HomepageSectionKey>(
  key: K,
  stored: unknown,
): HomepageContent[K] {
  const base = HOMEPAGE_DEFAULTS[key];
  if (!stored || typeof stored !== 'object' || Array.isArray(stored)) return base;
  return { ...base, ...(stored as object) } as HomepageContent[K];
}

export function mergeHomepageContent(
  rows: { section_key: string; content: unknown }[] | null | undefined,
): HomepageContent {
  const merged: HomepageContent = { ...HOMEPAGE_DEFAULTS };
  if (!rows) return merged;
  for (const row of rows) {
    if (!row.section_key.startsWith(DB_KEY_PREFIX)) continue; // skip legacy rows
    const k = row.section_key.slice(DB_KEY_PREFIX.length) as HomepageSectionKey;
    if (k in merged) {
      // @ts-expect-error index write is sound — k is a checked key
      merged[k] = mergeSection(k, row.content);
    }
  }
  return merged;
}

let cache: Promise<HomepageContent> | null = null;

/**
 * Fetch + merge all homepage content. Cached for the page's lifetime; call
 * `clearHomepageContentCache()` after an admin save to force a refetch.
 * Never throws — a missing table / network error falls back to defaults.
 */
export function fetchHomepageContent(force = false): Promise<HomepageContent> {
  if (force) cache = null;
  if (cache) return cache;
  cache = (async () => {
    try {
      const { data, error } = await supabase
        .from('homepage_content')
        .select('section_key, content')
        .like('section_key', `${DB_KEY_PREFIX}%`)
        .eq('is_active', true);
      if (error) throw error;
      return mergeHomepageContent(data);
    } catch (err) {
      console.warn('[homepageContent] falling back to defaults:', err);
      return HOMEPAGE_DEFAULTS;
    }
  })();
  return cache;
}

export function clearHomepageContentCache() {
  cache = null;
}
