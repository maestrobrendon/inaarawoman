import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  gsap,
  ScrollTrigger,
  useGSAP,
  EASE,
  MQ,
  Marquee,
  SplitReveal,
  useRevealOnScroll,
  useMagnetic,
  useTapFeedback,
} from '../lib/motion';
import {
  Heart,
  ChevronLeft,
  ChevronRight,
  Asterisk,
  ArrowUpRight,
  Globe,
  Leaf,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ProductWithImages, ProductImage } from '../types';
import { useCurrency } from '../context/CurrencyContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { getProductImageUrl, getFullImageUrl } from '../utils/cloudinaryUpload';
import { useInstagramFeed } from '../hooks/useInstagramFeed';

// ============================================
// DESIGN CONSTANTS
// ============================================

const HERO_IMAGE =
  'https://res.cloudinary.com/du5nhfcgd/image/upload/v1788210022/Regal_Recline_in_Cobalt_and_Crimson_anuwia.png';
const COLLECTIONS_IMAGE =
  'https://res.cloudinary.com/du5nhfcgd/image/upload/v1788210023/Regal_Turquoise_in_an_Opulent_Parlor_lpw2ow.png';

// Seasonal Drop left-panel lifestyle photo (static asset — swap for the real one).
const SEASONAL_BANNER =
  'https://res.cloudinary.com/du5nhfcgd/image/upload/v1788210664/Fierce_Glamour_in_Burgundy_and_Gold_ohafdu.png';

const CATEGORY_CARDS = [
  {
    eyebrow: 'For Women',
    title: 'Built For Daily\nConfidence',
    image:
      'https://res.cloudinary.com/du5nhfcgd/image/upload/v1788210660/ChatGPT_Image_Aug_31_2026_06_05_50_PM_p0une4.png',
    href: '/shop?category=women',
    size: 'large' as const,
    pos: 'object-[28%_top] md:object-[75%_top]',
  },
  {
    eyebrow: 'For Women',
    title: 'Designed For\nModern Living',
    image:
      'https://res.cloudinary.com/du5nhfcgd/image/upload/v1788210662/Glamorous_Ivory_Gown_Portrait_f7plar.png',
    href: '/shop?category=women',
    size: 'small' as const,
    pos: 'object-[28%_top] md:object-[75%_top]',
  },
  {
    eyebrow: 'For Kids',
    title: 'Comfort For Every\nAdventure',
    image:
      'https://res.cloudinary.com/du5nhfcgd/image/upload/v1788210664/Fierce_Glamour_in_Burgundy_and_Gold_ohafdu.png',
    href: '/shop?category=kids',
    size: 'small' as const,
    pos: 'object-[28%_top] md:object-[75%_top]',
  },
];

// Collections preview — tabbed hero. One hero photo + 2 preview products per tab.
const COLLECTION_TABS = ['Summer', 'Uzuri', 'Nivara', 'Amata'];
const COLLECTION_HEROES = [
  COLLECTIONS_IMAGE,
  HERO_IMAGE,
  SEASONAL_BANNER,
  'https://res.cloudinary.com/du5nhfcgd/image/upload/v1788210660/ChatGPT_Image_Aug_31_2026_06_05_50_PM_p0une4.png',
];
// Per-image object-position so the model stays framed when the tall mobile
// viewport hard-crops these wide photos (desktop is wide enough for centre).
const COLLECTION_POS = [
  'object-[24%_center] md:object-center', // Summer — model seated far left
  'object-[56%_center] md:object-center', // Uzuri — reclining, centre-right
  'object-[50%_top]', // Nivara — portrait, keep the head
  'object-[50%_top]', // Amata — portrait, keep the head
];

const TICKER_WORDS = ['Made To Last', 'Designed To Move'];

// Section heading — Inter Bold 51.1px / -1.68px tracking / 61.6px line-height (Figma).
const SECTION_HEADING =
  'font-bold text-[#1a1a1a] tracking-[-0.033em] text-[2.35rem] leading-[1.06] md:text-[51px] md:leading-[61.6px] md:tracking-[-1.68px]';

const CONFIDENCE_ITEMS = [
  {
    icon: Globe,
    title: 'Worldwide Shipping',
    description: 'We ship to over 100 countries with fast, reliable delivery. Track your order wherever you are.',
  },
  {
    icon: Leaf,
    title: 'Sustainable Cloths',
    description: 'Every piece is made from responsibly sourced materials. Wear with purpose, live with less impact.',
  },
  {
    icon: RotateCcw,
    title: 'Free 30 Days Returns',
    description: 'Not satisfied? Return within 30 days for a full refund. No questions asked, totally hassle-free.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Payments',
    description: 'Shop safely with encrypted checkout. We support all major payment methods for your convenience.',
  },
];

// ============================================
// HELPERS
// ============================================

const imgUrl = (image: string | ProductImage | undefined): string => {
  if (!image) return '';
  if (typeof image === 'string') return image;
  return image.image_url || image.cloudinary_url || '';
};

const primaryImage = (p: ProductWithImages): string => {
  if (p.main_image) return typeof p.main_image === 'string' ? p.main_image : imgUrl(p.main_image as unknown as ProductImage);
  if (p.images && p.images.length > 0) return imgUrl(p.images[0]);
  return '';
};

const secondaryImage = (p: ProductWithImages): string => {
  if (p.images && p.images.length > 1) return imgUrl(p.images[1]);
  return primaryImage(p);
};

const comparePrice = (p: ProductWithImages): number | null => {
  const compare = p.compare_at_price ?? null;
  if (compare && compare > p.price) return compare;
  return null;
};

const discountPct = (p: ProductWithImages): number | null => {
  const compare = comparePrice(p);
  if (!compare) return null;
  return Math.round(((compare - p.price) / compare) * 100);
};

// Section wrapper: staggers its matching children into view once on scroll.
// Replaces the old useReveal + framer variants pattern.
function RevealGroup({
  children,
  className,
  selector = ':scope > *',
  stagger = 0.08,
  y = 24,
}: {
  children: React.ReactNode;
  className?: string;
  selector?: string;
  stagger?: number;
  y?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useRevealOnScroll(ref, { selector, stagger, y });
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

// Horizontal product rail. Reveals its cards with a staggered rise on scroll,
// and on mobile (touch) scales down the cards that aren't snapped to centre so
// the active one "pops" — transform/opacity only, driven by quickTo.
function MobileCarousel({
  children,
  className,
  selector,
  trackRef,
}: {
  children: React.ReactNode;
  className?: string;
  selector: string;
  trackRef: React.RefObject<HTMLDivElement>;
}) {
  const outer = useRef<HTMLDivElement>(null);
  useRevealOnScroll(outer, { selector, stagger: 0.08, y: 24 });

  useGSAP(
    () => {
      const track = trackRef.current;
      if (!track) return;
      const mm = gsap.matchMedia();
      mm.add(`${MQ.motionOk} and (max-width: 1023px)`, () => {
        const cards = gsap.utils.toArray<HTMLElement>(track.querySelectorAll(selector));
        const setters = cards.map((c) => ({
          s: gsap.quickTo(c, 'scale', { duration: 0.3, ease: 'power2.out' }),
          o: gsap.quickTo(c, 'opacity', { duration: 0.3, ease: 'power2.out' }),
        }));
        const update = () => {
          const mid = track.scrollLeft + track.clientWidth / 2;
          cards.forEach((c, i) => {
            const cc = c.offsetLeft + c.offsetWidth / 2;
            const d = Math.min(Math.abs(cc - mid) / c.offsetWidth, 1);
            setters[i].s(gsap.utils.mapRange(0, 1, 1, 0.95, d));
            setters[i].o(gsap.utils.mapRange(0, 1, 1, 0.85, d));
          });
        };
        update();
        track.addEventListener('scroll', update, { passive: true });
        return () => track.removeEventListener('scroll', update);
      });
      return () => mm.revert();
    },
    { scope: outer, dependencies: [] },
  );

  return (
    <div ref={outer}>
      <div ref={trackRef} className={className} style={{ scrollbarWidth: 'none' }}>
        {children}
      </div>
    </div>
  );
}

// ============================================
// PRODUCT CARDS
// ============================================

type Swatch = { name: string; hex: string };

const swatchesOf = (p: ProductWithImages): Swatch[] => {
  // Products store colours in `color_options`; `colors` is usually an empty array
  // (which is truthy, so `colors || color_options` would wrongly pick `[]`).
  const raw = (p.colors && p.colors.length ? p.colors : p.color_options) || [];
  return (raw as Swatch[])
    .filter((c) => c && c.hex)
    .map((c) => ({ name: (c.name || '').trim(), hex: c.hex }));
};

function useCardWishlist(product: ProductWithImages) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { showToast } = useToast();
  const inWishlist = isInWishlist(product.id);
  const toggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await toggleWishlist({ ...product, images: product.images?.map((i) => imgUrl(i)) || [] } as any);
      showToast(inWishlist ? 'Removed from wishlist' : 'Added to wishlist', 'success');
    } catch {
      showToast('Failed to update wishlist', 'error');
    }
  };
  return { inWishlist, toggle };
}

// Swatch — 24px (or 18px) white ring with a coloured inner dot; first ring is #828282.
// `onSelect` (mobile) lets a tap crossfade the card image to that variant.
function SwatchDots({
  colors,
  size = 24,
  onSelect,
  activeIndex,
}: {
  colors: Swatch[];
  size?: number;
  onSelect?: (index: number) => void;
  activeIndex?: number;
}) {
  if (colors.length === 0) return null;
  const inset = size >= 24 ? 2 : 3;
  const interactive = !!onSelect;
  return (
    <div className="flex items-center gap-[3px] shrink-0">
      {colors.slice(0, 3).map((c, i) => (
        <button
          key={i}
          type="button"
          title={c.name}
          aria-label={c.name || `Colour ${i + 1}`}
          disabled={!interactive}
          onClick={
            interactive
              ? (e) => {
                  e.stopPropagation();
                  onSelect?.(i);
                }
              : undefined
          }
          className={`grid place-items-center rounded-full bg-white border ${
            i === 0 ? 'border-[#828282]' : 'border-black/[0.09]'
          } ${interactive ? 'cursor-pointer' : 'cursor-default'} ${
            activeIndex === i ? 'ring-2 ring-[#1a1a1a] ring-offset-1' : ''
          }`}
          style={{ width: size, height: size }}
        >
          <span
            className="rounded-full"
            style={{ width: `calc(100% - ${inset}px)`, height: `calc(100% - ${inset}px)`, background: c.hex }}
          />
        </button>
      ))}
    </div>
  );
}

// New Arrivals / Best Sellers card — 401 x 471 (Figma), white, rounded-xl, hairline shadow.
function ProductCard({ product, grid = false }: { product: ProductWithImages; grid?: boolean }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const { formatPrice } = useCurrency();
  const { inWishlist, toggle } = useCardWishlist(product);

  const primary = primaryImage(product);
  const secondary = secondaryImage(product);
  const compare = comparePrice(product);
  const pct = discountPct(product);
  const swatches = swatchesOf(product);

  // Mobile "discovery moment": tapping a swatch crossfades the main image to
  // the matching gallery photo (falls back to the primary if none).
  const gallery = (product.images ?? []).map((i) => imgUrl(i)).filter(Boolean);
  const [variant, setVariant] = useState(0);
  const mainImgRef = useRef<HTMLImageElement>(null);
  const variantSrc = getProductImageUrl(gallery[variant] || primary);
  const selectVariant = useCallback((i: number) => {
    setVariant(i);
    const el = mainImgRef.current;
    if (el) {
      gsap.fromTo(el, { opacity: 0.3 }, { opacity: 1, duration: 0.25, ease: 'power2.out' });
    }
  }, []);

  return (
    <div
      data-tap
      className={`product-card group cursor-pointer overflow-hidden rounded-xl bg-white shadow-[0px_0px_3.8px_1px_rgba(0,0,0,0.04),0px_0px_0px_1px_rgba(0,0,0,0.04)] ${
        grid ? 'w-full' : 'w-[clamp(258px,78vw,401px)] shrink-0'
      }`}
      onClick={() => navigate(`/product/${product.id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative aspect-[401/393] overflow-hidden bg-[#f5f5f5]">
        {primary && (
          <img
            ref={mainImgRef}
            src={variantSrc}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className={`absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-500 group-hover:scale-[1.03] ${
              hovered && secondary !== primary && variant === 0 ? 'opacity-0' : 'opacity-100'
            }`}
          />
        )}
        {secondary && secondary !== primary && (
          <img
            src={getProductImageUrl(secondary)}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className={`absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-500 group-hover:scale-[1.03] ${
              hovered && variant === 0 ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}
        {!primary && (
          <div className="flex h-full w-full items-center justify-center text-xs text-neutral-300">No image</div>
        )}

        {/* Tag wrap */}
        <div className="absolute left-[15px] top-[15px] flex items-center gap-[7px]">
          {pct !== null && (
            <span className="rounded-full bg-[#d32222] px-2 py-1 text-[11.6px] font-medium leading-none text-white">
              -{pct}%
            </span>
          )}
          {product.is_new && (
            <span className="rounded-full border border-[#ece9e7] bg-white px-3 py-[3px] text-[11.3px] font-bold leading-[14.4px] tracking-[-0.24px] text-[#1a1a1a]">
              New
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={toggle}
          aria-label="Toggle wishlist"
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full border border-[#ece9e7] bg-white"
        >
          <Heart size={16} strokeWidth={1.5} className={inWishlist ? 'fill-[#1a1a1a] text-[#1a1a1a]' : 'text-neutral-500'} />
        </button>

        {product.stock_quantity === 0 && (
          <div className="absolute inset-0 grid place-items-center bg-white/70">
            <span className="text-xs tracking-[0.05em] text-neutral-600">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Grid cards (Best Sellers, 2-up on mobile) are too narrow for a
          name/price + swatches row without the swatches overrunning the price,
          so there the swatches drop to their own line. Rail cards keep the row. */}
      <div
        className={`px-4 ${
          grid
            ? 'flex flex-col gap-1.5 py-3'
            : 'flex h-[78px] items-center justify-between gap-2'
        }`}
      >
        <div className="min-w-0">
          <p
            className={`truncate font-medium text-[#1a1a1a] ${
              grid ? 'text-[14px] leading-[18px]' : 'text-[17px] leading-[21.6px]'
            }`}
          >
            {product.name}
          </p>
          <div className={`flex flex-wrap items-center gap-x-2 gap-y-0.5 ${grid ? 'mt-0.5' : 'mt-1'}`}>
            <span className={`font-medium text-[#1a1a1a] ${grid ? 'text-[13.5px]' : 'text-[16.5px]'}`}>
              {formatPrice(product.price)}
            </span>
            {compare && (
              <span
                className={`font-medium tracking-[-0.36px] text-[#757575] line-through ${
                  grid ? 'text-[12px]' : 'text-[15px]'
                }`}
              >
                {formatPrice(compare)}
              </span>
            )}
          </div>
        </div>
        <SwatchDots
          colors={swatches}
          size={grid ? 18 : 24}
          onSelect={gallery.length > 1 ? selectVariant : undefined}
          activeIndex={gallery.length > 1 ? variant : undefined}
        />
      </div>
    </div>
  );
}

// Seasonal Drop grid card — smaller, flush, hairline #cecece borders only.
function SeasonalCard({ product }: { product: ProductWithImages }) {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const { inWishlist, toggle } = useCardWishlist(product);
  const compare = comparePrice(product);
  const pct = discountPct(product);
  const primary = primaryImage(product);

  return (
    <div
      className="group relative flex h-full min-h-[320px] cursor-pointer flex-col overflow-hidden border-[0.75px] border-[#cecece] bg-white"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div className="relative flex-1 overflow-hidden bg-[#f5f5f5]">
        {primary ? (
          <img
            src={getProductImageUrl(primary)}
            alt={product.name}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-neutral-300">No image</div>
        )}
        {pct !== null && (
          <span className="absolute left-[11px] top-[11px] rounded-full bg-[#d32222] px-2 py-[3px] text-[9px] font-medium leading-none text-white">
            -{pct}%
          </span>
        )}
        <button
          onClick={toggle}
          aria-label="Toggle wishlist"
          className="absolute right-2 top-2 z-10 grid h-[27px] w-[27px] place-items-center rounded-full border-[0.75px] border-[#ece9e7] bg-white"
        >
          <Heart size={13} strokeWidth={1.5} className={inWishlist ? 'fill-[#1a1a1a] text-[#1a1a1a]' : 'text-neutral-500'} />
        </button>
      </div>

      <div className="flex h-[58px] shrink-0 items-center justify-between gap-1.5 px-3">
        <div className="min-w-0">
          <p className="truncate text-[13px] font-medium leading-[16.2px] text-[#1a1a1a]">{product.name}</p>
          <div className="mt-0.5 flex items-center gap-1.5">
            <span className="text-[12.2px] font-medium text-[#1a1a1a]">{formatPrice(product.price)}</span>
            {compare && (
              <span className="text-[11.7px] font-medium tracking-[-0.27px] text-[#757575] line-through">
                {formatPrice(compare)}
              </span>
            )}
          </div>
        </div>
        <SwatchDots colors={swatchesOf(product)} size={18} />
      </div>
    </div>
  );
}

// ============================================
// SECTIONS
// ============================================

function Hero() {
  // Figma nodes 20:2543/20:2544 - reference canvas 1440 x 814.
  // Instrument Serif Regular, colour #FEF9F3, tracking -1% of font size.
  const bigSize = 'text-[clamp(1.6rem,6.6vw,103.35px)]';
  const labelSize = 'text-[clamp(12px,1.44vw,20.67px)]';

  const section = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = section.current;
      if (!root) return;
      const mm = gsap.matchMedia();

      // Corner labels settle in just after the headline stagger begins.
      mm.add(MQ.reduce, () => {
        gsap.set('.hero-corner-label', { opacity: 1, y: 0 });
      });
      mm.add(MQ.motionOk, () => {
        gsap.set('.hero-corner-label', { willChange: 'transform,opacity' });
        gsap.from('.hero-corner-label', {
          opacity: 0,
          y: 12,
          duration: 0.6,
          delay: 0.3,
          ease: EASE.out,
          stagger: 0.08,
          onComplete: () => gsap.set('.hero-corner-label', { clearProps: 'willChange' }),
        });
      });

      // Background image parallax - lags the page slightly as you scroll past.
      // Aggressive on desktop, barely perceptible on mobile.
      mm.add(
        {
          isMobile: `${MQ.motionOk} and (max-width: 1023px)`,
          isDesktop: `${MQ.motionOk} and (min-width: 1024px)`,
        },
        (ctx) => {
          const { isMobile } = ctx.conditions as { isMobile: boolean };
          gsap.to('.hero-bg', {
            yPercent: isMobile ? 4 : 12,
            ease: 'none',
            scrollTrigger: {
              trigger: root,
              start: 'top top',
              end: 'bottom top',
              scrub: true,
            },
          });
        },
      );

      return () => mm.revert();
    },
    { scope: section, dependencies: [] },
  );

  return (
    <section
      ref={section}
      className="hero-section relative flex w-full flex-col justify-end overflow-hidden bg-neutral-900 h-screen-mobile md:h-[min(56.53vw,90svh)] md:min-h-[560px]"
    >
      <img
        src={getFullImageUrl(HERO_IMAGE)}
        alt="Regal recline in cobalt and crimson"
        className="hero-bg absolute inset-0 h-[112%] w-full object-cover object-center"
        style={{ willChange: 'transform' }}
      />
      {/* Legibility wash — heavier toward the bottom so the bottom-anchored
          headline always has contrast behind it, even on short viewports. */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-black/5 to-black/55" />

      <p className={`hero-corner-label absolute left-[3.4%] top-[37.2%] w-[8vw] min-w-[92px] text-center font-serif text-[#FEF9F3] tracking-[-0.01em] leading-[1.2] whitespace-pre-line ${labelSize}`}>
        {'Est. 2022\nShaped by light'}
      </p>

      <p className={`hero-corner-label absolute right-[4.2%] top-[36.2%] w-[12vw] min-w-[150px] text-center font-serif text-[#FEF9F3] tracking-[-0.01em] leading-[1.2] whitespace-pre-line ${labelSize}`}>
        {'Expressive by nature.\nConfident by choice.'}
      </p>

      {/* Headline — the last flex child, so it's anchored to the bottom of the
          column and its top offset scales with hero height automatically.
          `pb` is real breathing room (clamped) so it never touches the edge.
          Per-character flip-up reveal on load, one continuous left-to-right
          stagger across both size runs. */}
      <SplitReveal
        as="h1"
        trigger="load"
        className={`hero-headline relative z-10 mx-auto w-[92%] max-w-[1323px] pb-[clamp(28px,7vh,104px)] text-center font-serif text-[#FEF9F3] tracking-[-0.01em] leading-[0.95] ${bigSize}`}
      >
        <span className="block">Every version of</span>
        <span className="block">
          <span className="whitespace-nowrap">Of&nbsp;Her</span>{' '}
          <span className="inline-block align-middle text-[43%] leading-[0.9] text-center -translate-y-[0.04em]">
            has
            <br />
            somewhere
          </span>{' '}
          <span className="whitespace-nowrap">To&nbsp;Exist</span>
        </span>
      </SplitReveal>
    </section>
  );
}

interface RailProps {
  title: string;
  products: ProductWithImages[];
  loading: boolean;
}

function ProductRail({ title, products, loading }: RailProps) {
  const navigate = useNavigate();
  const railRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 1 | -1) => {
    railRef.current?.scrollBy({ left: dir * 425, behavior: 'smooth' });
  };

  const arrowBtn =
    'grid h-[34px] w-[34px] place-items-center rounded-full bg-[rgba(214,214,214,0.65)] text-[#1a1a1a] transition-colors hover:bg-[rgba(214,214,214,0.95)]';

  return (
    <section className="bg-white py-16 md:py-20">
      <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-[50px]">
        <h2 className={SECTION_HEADING}>{title}</h2>

        <div className="mb-5 mt-6 flex items-center justify-end gap-2">
          <button
            onClick={() => navigate('/shop')}
            className="mr-2 text-[13.1px] font-bold tracking-[-0.28px] text-[#757575] transition-colors hover:text-[#1a1a1a]"
          >
            View More
          </button>
          <button onClick={() => scroll(-1)} aria-label="Previous" className={arrowBtn}>
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => scroll(1)} aria-label="Next" className={arrowBtn}>
            <ChevronRight size={18} />
          </button>
        </div>

        {loading ? (
          <div className="flex gap-6 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-[clamp(258px,78vw,401px)] shrink-0 animate-pulse">
                <div className="mb-3 aspect-[401/393] rounded-xl bg-neutral-200" />
                <div className="mb-2 h-4 w-3/4 rounded bg-neutral-200" />
                <div className="h-4 w-1/2 rounded bg-neutral-200" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="py-10 text-sm text-neutral-400">Nothing to show here yet.</p>
        ) : (
          <MobileCarousel
            trackRef={railRef}
            className="scrollbar-hide -mx-5 flex snap-x snap-mandatory gap-6 overflow-x-auto px-5 py-2 sm:mx-0 sm:px-0"
            selector=".snap-start"
          >
            {products.map((p) => (
              <div key={p.id} className="snap-start">
                <ProductCard product={p} />
              </div>
            ))}
          </MobileCarousel>
        )}
      </div>
    </section>
  );
}

// Full-width infinite marquee — "* MADE TO LAST * DESIGNED TO MOVE * ..."
// `reverse` runs it right-to-left for variety when it sits near another marquee.
function Ticker({ reverse = false }: { reverse?: boolean }) {
  const run = Array.from({ length: 6 }, (_, i) => TICKER_WORDS[i % TICKER_WORDS.length]);
  return (
    <Marquee
      className="flex h-[72px] items-center bg-white md:h-24"
      direction={reverse ? 'right' : 'left'}
      duration={26}
      pauseOnHover
    >
      {run.map((word, i) => (
        <span key={i} className="flex items-center">
          <Asterisk strokeWidth={1.5} className="mx-5 h-9 w-9 text-[#1a1a1a] md:mx-7 md:h-[42px] md:w-[42px]" />
          <span className="text-[26px] font-medium uppercase leading-none tracking-[-0.03em] text-[#1a1a1a] md:text-[42px] md:tracking-[-1.305px]">
            {word}
          </span>
        </span>
      ))}
    </Marquee>
  );
}

function SeasonalDrop({ products }: { products: ProductWithImages[] }) {
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const grid = products.slice(0, 4);

  // Editorial clip-path wipe (left -> right), tile by tile as the collage scrolls in.
  useRevealOnScroll(ref, { selector: '.seasonal-tile', stagger: 0.1, variant: 'wipe' });

  if (grid.length === 0) return null;

  return (
    <section className="bg-white py-14 md:py-20">
      <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-[50px]">
        <div
          ref={ref}
          className="flex flex-col overflow-hidden rounded-2xl border-[0.75px] border-[#cecece] lg:h-[714px] lg:flex-row"
        >
          {/* Left — lifestyle banner */}
          <div className="seasonal-tile relative h-[420px] overflow-hidden lg:h-full lg:w-[45%]">
            <img
              src={getFullImageUrl(SEASONAL_BANNER)}
              alt="Seasonal Drop"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/45 via-black/10 to-transparent" />
            <div className="relative z-10 flex flex-col items-start gap-3 p-[18px]">
              <h2
                className="text-[38px] font-bold leading-[1.02] tracking-[-1.44px] text-white md:text-[46.4px] md:leading-[48px]"
                style={{ textShadow: '0px 1px 6px rgba(0,0,0,0.4)' }}
              >
                Seasonal
                <br />
                Drop
              </h2>
              <button
                onClick={() => navigate('/shop')}
                className="rounded-full bg-white px-[13px] py-[7px] text-[12px] leading-[14.4px] text-[#1a1a1a] shadow-[0px_0.75px_1.5px_0px_rgba(0,0,0,0.05)]"
              >
                Shop Now
              </button>
            </div>
          </div>

          {/* Right — flush 2×2 grid (hairline borders, no gap) */}
          <div className="grid grid-cols-2 grid-rows-2 lg:w-[55%]">
            {grid.map((p) => (
              <div key={p.id} className="seasonal-tile h-full">
                <SeasonalCard product={p} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Bento card — light-grey tile, full-bleed photo, copy overlaid top-left (Figma 12:1309).
function CategoryCard({ card, big = false }: { card: (typeof CATEGORY_CARDS)[number]; big?: boolean }) {
  const navigate = useNavigate();
  const btnRef = useRef<HTMLButtonElement>(null);
  useMagnetic(btnRef);
  return (
    <div
      data-tap
      onClick={() => navigate(card.href)}
      className="category-card group relative h-full min-h-[300px] cursor-pointer overflow-hidden rounded-xl bg-[#f5f5f5]"
    >
      <img
        src={getProductImageUrl(card.image)}
        alt={card.title.replace('\n', ' ')}
        loading="lazy"
        decoding="async"
        className={`absolute inset-0 h-full w-full object-cover ${card.pos} transition-transform duration-300 group-hover:scale-105`}
      />
      {/* Keeps the top-left copy legible over the full-bleed photo. */}
      <div
        className={`absolute inset-0 bg-gradient-to-r from-[#f5f5f5] via-[#f5f5f5]/75 to-transparent ${
          big ? 'to-[52%]' : 'to-[58%]'
        }`}
      />
      <div className="relative z-10 h-full p-[27px]">
        <span className="text-[12px] uppercase tracking-[0.5px] text-[#757575]">{card.eyebrow}</span>
        <h3
          className={`mt-2 max-w-[62%] whitespace-pre-line font-bold leading-[1.15] tracking-[-0.02em] text-[#1a1a1a] ${
            big ? 'text-[26px]' : 'text-[22px] md:text-[24px]'
          }`}
        >
          {card.title}
        </h3>
        {/* Fixed offset ~ 27px pad + eyebrow row + ~2-line headline (Figma). */}
        <button
          ref={btnRef}
          className="absolute left-[27px] top-[164px] rounded-full bg-[#1a1a1a] px-4 py-2 text-[13px] text-white transition-colors hover:bg-[#333]"
        >
          Shop Now
        </button>
      </div>
    </div>
  );
}

function ShopByCategories() {
  const [large, ...rest] = CATEGORY_CARDS;

  return (
    <section className="bg-white py-14 md:py-20">
      <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-[50px]">
        <h2 className="mb-8 text-[2.4rem] font-bold tracking-[-0.033em] text-[#1a1a1a] md:text-[46px] md:tracking-[-1.5px]">
          Shop by Categories
        </h2>
        <RevealGroup
          selector=".category-card"
          stagger={0.15}
          className="grid grid-cols-1 gap-[7.5px] lg:h-[547.5px] lg:grid-cols-[421.875fr_515.625fr]"
        >
          <CategoryCard card={large} big />
          <div className="grid grid-rows-2 gap-[7.5px]">
            {rest.map((card) => (
              <CategoryCard key={card.title} card={card} />
            ))}
          </div>
        </RevealGroup>
      </div>
    </section>
  );
}

// Small floating product-preview card that sits over the collections hero.
function FloatingCard({
  product,
  side,
}: {
  product: ProductWithImages;
  side: 'left' | 'right';
}) {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  return (
    <button
      onClick={() => navigate(`/product/${product.id}`)}
      className={`absolute bottom-[30px] z-10 hidden w-[175px] overflow-hidden rounded-lg bg-white text-left shadow-[0_6px_20px_rgba(0,0,0,0.22)] transition-transform hover:-translate-y-0.5 sm:block ${
        side === 'left' ? 'left-[30px]' : 'right-[30px]'
      }`}
    >
      <div className="h-[167px] w-full bg-[#f5f5f5]">
        <img
          src={getProductImageUrl(primaryImage(product))}
          alt={product.name}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex h-[43px] items-center justify-between gap-2 px-3">
        <div className="min-w-0">
          <p className="truncate text-[12px] font-medium leading-tight text-[#1a1a1a]">{product.name}</p>
          <p className="text-[10px] text-[#757575]">{formatPrice(product.price)}</p>
        </div>
        <span className="grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full border border-[#ece9e7]">
          <ArrowUpRight size={11} className="text-[#1a1a1a]" />
        </span>
      </div>
    </button>
  );
}

// Tabbed collections hero. A short pin-and-reveal beat on desktop (image eases
// 1.1 -> 1, tab words stagger in) once; a plain scroll reveal on mobile (no pin
// — pinning fights the mobile address-bar collapse). Tab switch crossfades the
// photo via GSAP and slides a shared underline (transform only) to the tab.
function CollectionsPreview({ products }: { products: ProductWithImages[] }) {
  const [active, setActive] = useState(0);
  const pair = products.slice(active * 2, active * 2 + 2);
  const section = useRef<HTMLElement>(null);
  const imgs = useRef<HTMLImageElement[]>([]);
  const navRef = useRef<HTMLElement>(null);
  const underline = useRef<HTMLSpanElement>(null);

  const moveUnderline = useCallback((i: number) => {
    const nav = navRef.current;
    const bar = underline.current;
    if (!nav || !bar) return;
    const btn = nav.querySelectorAll<HTMLButtonElement>('[data-tab]')[i];
    if (!btn) return;
    const nb = nav.getBoundingClientRect();
    const bb = btn.getBoundingClientRect();
    gsap.to(bar, {
      x: bb.left - nb.left,
      scaleX: bb.width / 100,
      duration: 0.4,
      ease: EASE.out,
    });
  }, []);

  // Tab crossfade + underline slide.
  useGSAP(
    () => {
      imgs.current.forEach((el, i) => {
        if (!el) return;
        gsap.to(el, { opacity: i === active ? 1 : 0, duration: 0.5, ease: 'power2.out' });
      });
      moveUnderline(active);
    },
    { scope: section, dependencies: [active] },
  );

  // Pin-and-reveal beat.
  useGSAP(
    () => {
      const root = section.current;
      if (!root) return;
      const mm = gsap.matchMedia();

      mm.add(MQ.reduce, () => {
        gsap.set('.collections-word', { opacity: 1, y: 0 });
        moveUnderline(0);
      });

      mm.add(
        {
          isMobile: `${MQ.motionOk} and (max-width: 1023px)`,
          isDesktop: `${MQ.motionOk} and (min-width: 1024px)`,
        },
        (ctx) => {
          const { isMobile } = ctx.conditions as { isMobile: boolean };

          gsap.set('.collections-word', { opacity: 0, y: 20, willChange: 'transform,opacity' });
          ScrollTrigger.create({
            trigger: root,
            start: isMobile ? 'top 80%' : 'top 60%',
            once: true,
            onEnter: () => {
              gsap.to('.collections-word', {
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: EASE.out,
                stagger: 0.08,
                onComplete: () => gsap.set('.collections-word', { clearProps: 'willChange' }),
              });
              moveUnderline(active);
            },
          });

          const activeImg = () => imgs.current[active];
          gsap.fromTo(
            '.collections-media',
            { scale: 1.1 },
            {
              scale: 1,
              ease: 'none',
              scrollTrigger: isMobile
                ? { trigger: root, start: 'top bottom', end: 'top top', scrub: true }
                : { trigger: root, start: 'top top', end: '+=70%', pin: true, scrub: true },
            },
          );
          void activeImg;
        },
      );
      return () => mm.revert();
    },
    { scope: section, dependencies: [] },
  );

  return (
    <section
      ref={section}
      className="relative w-full overflow-hidden bg-neutral-900 h-[min(100svh,1000px)] min-h-[720px]"
    >
      <div className="collections-media absolute inset-0" style={{ willChange: 'transform' }}>
        {COLLECTION_HEROES.map((src, i) => (
          <img
            key={i}
            ref={(el) => {
              if (el) imgs.current[i] = el;
            }}
            src={getFullImageUrl(src)}
            alt={COLLECTION_TABS[i]}
            loading={i === 0 ? undefined : 'lazy'}
            decoding="async"
            className={`absolute inset-0 h-full w-full object-cover ${COLLECTION_POS[i]}`}
            style={{ opacity: i === 0 ? 1 : 0 }}
          />
        ))}
      </div>
      <div className="absolute inset-0 bg-black/25" />

      <nav
        ref={navRef}
        className="absolute inset-x-0 top-[100px] z-10 flex flex-nowrap justify-center gap-x-5 px-4 sm:gap-x-8 md:top-[120px]"
      >
        {COLLECTION_TABS.map((name, i) => (
          <button
            key={name}
            data-tab
            data-cursor
            onClick={() => setActive(i)}
            className={`collections-word relative whitespace-nowrap text-lg font-medium text-white transition-opacity sm:text-2xl md:text-[30px] ${
              i === active ? 'opacity-100' : 'opacity-60 hover:opacity-100'
            }`}
          >
            {name}
          </button>
        ))}
        <span
          ref={underline}
          aria-hidden
          className="pointer-events-none absolute -bottom-2 left-0 block h-px w-[100px] origin-left bg-white"
          style={{ transform: 'scaleX(0)' }}
        />
      </nav>

      {pair[0] && <FloatingCard product={pair[0]} side="left" />}
      {pair[1] && <FloatingCard product={pair[1]} side="right" />}
    </section>
  );
}

function BestSellers({ products, loading }: { products: ProductWithImages[]; loading: boolean }) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState('All');
  const firstRender = useRef(true);

  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))];
  const filtered = active === 'All' ? products : products.filter((p) => p.category === active);

  // On tab change: quick fade-out, DOM swaps, staggered fade-in of the new set.
  useGSAP(
    () => {
      const el = gridRef.current;
      if (!el || firstRender.current) {
        firstRender.current = false;
        return;
      }
      gsap.killTweensOf(el.children);
      gsap.fromTo(
        el.children,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.3, ease: EASE.out, stagger: 0.04, overwrite: true },
      );
    },
    { scope: gridRef, dependencies: [active] },
  );

  return (
    <section className="py-14 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <h2 className={`mb-6 ${SECTION_HEADING}`}>Best Sellers</h2>

        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`text-xs font-semibold px-4 py-1.5 rounded-full capitalize transition-colors ${
                active === cat ? 'bg-[#1a1a1a] text-white' : 'bg-[#f1f1f1] text-[#1a1a1a] hover:bg-neutral-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[5/6] bg-neutral-200 rounded-xl mb-3" />
                <div className="h-4 bg-neutral-200 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-neutral-400 text-sm py-10">
            No best sellers yet. Mark products as a Best Seller in the admin dashboard.
          </p>
        ) : (
          <RevealGroup
            selector=".product-card"
            stagger={0.06}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5"
          >
            <div ref={gridRef} className="contents">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} grid />
              ))}
            </div>
          </RevealGroup>
        )}

        {/* Shop with confidence */}
        <div className="mt-12 bg-[#f1f1f1] rounded-2xl p-7 md:p-10">
          <h3 className="mb-8 text-2xl font-bold tracking-[-0.02em] text-[#1a1a1a] md:text-[28px]">Shop With Confidence</h3>
          <RevealGroup selector=".usp-item" stagger={0.1} y={18} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CONFIDENCE_ITEMS.map((item) => (
              <div key={item.title} className="usp-item">
                <item.icon size={22} strokeWidth={1.5} className="text-[#1a1a1a] mb-3" />
                <h4 className="text-sm font-medium text-[#1a1a1a] mb-1.5 capitalize">{item.title}</h4>
                <p className="text-xs leading-relaxed text-[#444]">{item.description}</p>
              </div>
            ))}
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}

const INSTAGRAM_URL = 'https://www.instagram.com/inaarawoman_/';

function InstagramSection({ products }: { products: ProductWithImages[] }) {
  const { posts, loading } = useInstagramFeed(12);

  // Real IG feed when configured; otherwise fall back to product imagery.
  const tiles: { image: string; permalink: string; caption?: string }[] = posts.length
    ? posts
    : products
        .map((p) => primaryImage(p))
        .filter(Boolean)
        .slice(0, 12)
        .map((src) => ({ image: getProductImageUrl(src), permalink: INSTAGRAM_URL }));

  return (
    <section className="bg-white py-14 md:py-20">
      <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-[50px]">
        <div className="mb-10 text-center">
          <h2 className={SECTION_HEADING}>Follow us on Instagram</h2>
          <p className="mx-auto mt-3 max-w-md text-xs text-[#757575]">
            See how our community styles their favourite pieces, from everyday essentials to new arrivals.
          </p>
        </div>

        <div className="rounded-2xl bg-[#1a1a1a] p-2.5 sm:p-3">
          <RevealGroup selector=".ig-tile" stagger={0.05} y={16} className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
            {loading && !tiles.length
              ? [...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-square animate-pulse rounded-lg bg-white/10" />
                ))
              : tiles.slice(0, 12).map((t, i) => (
                  <a
                    key={i}
                    href={t.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ig-tile group relative aspect-square overflow-hidden rounded-lg"
                  >
                    <img
                      src={t.image}
                      alt={t.caption || `INAARA on Instagram ${i + 1}`}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/25" />
                  </a>
                ))}
          </RevealGroup>
        </div>

        <div className="mt-8 text-center">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-[#1a1a1a] transition-colors hover:text-[#757575]"
          >
            @inaarawoman_
          </a>
        </div>
      </div>
    </section>
  );
}

// ============================================
// MAIN
// ============================================

export default function InaaraHomePage() {
  const [newArrivals, setNewArrivals] = useState<ProductWithImages[]>([]);
  const [bestSellers, setBestSellers] = useState<ProductWithImages[]>([]);
  const [seasonal, setSeasonal] = useState<ProductWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const root = useRef<HTMLDivElement>(null);

  // One delegated tap-feedback listener for every [data-tap] on the page.
  useTapFeedback(root);

  // Late images change section heights — keep ScrollTrigger's positions honest.
  useGSAP(() => {
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener('load', onLoad);
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 1500);
    return () => {
      window.removeEventListener('load', onLoad);
      window.clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    void load();
  }, []);

  // Products arriving shifts layout below the fold — refresh triggers once settled.
  useEffect(() => {
    if (loading) return;
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 200);
    return () => window.clearTimeout(t);
  }, [loading]);

  const load = async () => {
    setLoading(true);
    try {
      const [newRes, bestRes, anyRes] = await Promise.all([
        supabase.from('products').select('*').eq('is_new', true).order('created_at', { ascending: false }).limit(10),
        supabase.from('products').select('*').eq('is_bestseller', true).order('created_at', { ascending: false }).limit(12),
        supabase.from('products').select('*').order('created_at', { ascending: false }).limit(10),
      ]);

      const newItems = (newRes.data as ProductWithImages[]) || [];
      const bestItems = (bestRes.data as ProductWithImages[]) || [];
      const anyItems = (anyRes.data as ProductWithImages[]) || [];

      setNewArrivals(newItems.length ? newItems : anyItems);
      setBestSellers(bestItems.length ? bestItems : anyItems);
      setSeasonal(anyItems);
    } catch (err) {
      console.error('InaaraHomePage load error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={root} className="min-h-screen bg-white">
      <Hero />
      <ProductRail title="New Arrival is here" products={newArrivals} loading={loading} />
      <Ticker />
      <SeasonalDrop products={seasonal} />
      <ShopByCategories />
      <CollectionsPreview products={seasonal} />
      <BestSellers products={bestSellers} loading={loading} />
      <InstagramSection products={seasonal} />
    </div>
  );
}
