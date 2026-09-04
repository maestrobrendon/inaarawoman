import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from '../../lib/motion/compat';
import { gsap, ScrollTrigger, useGSAP, MQ, Marquee } from '../../lib/motion';
import { Search, Heart, ShoppingBag, ChevronDown, Menu, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useHomepageContent } from '../../hooks/useHomepageContent';
import CartDrawer from '../cart/CartDrawer';

const LOGO = 'https://res.cloudinary.com/dusynu0kv/image/upload/v1765001554/z0mkjqsdbnr4ppai6ukp.png';

const NAV: { name: string; path: string; dropdown?: boolean }[] = [
  { name: 'Shop', path: '/shop', dropdown: true },
  { name: 'Collections', path: '/lookbook' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
];

const SHOP_MENU = [
  { name: 'All Products', path: '/shop' },
  { name: 'New Arrivals', path: '/shop?sort=newest' },
  { name: 'Best Sellers', path: '/shop?sort=bestsellers' },
  { name: 'Dresses', path: '/shop?category=dresses' },
  { name: 'Two Piece', path: '/shop?category=two-piece' },
];

function PromoTicker() {
  const { content } = useHomepageContent();
  const { enabled, messages } = content.banner;
  const list = messages.filter((m) => m.trim());
  if (!enabled || list.length === 0) return null;
  return (
    <Marquee className="h-[26px] w-full bg-[#1a1a1a] text-white" duration={34}>
      {Array.from({ length: Math.max(12, list.length * 3) }).map((_, i) => (
        <span key={i} className="mx-[38px] text-[11px] font-semibold uppercase tracking-[0.14em]">
          {list[i % list.length]}
        </span>
      ))}
    </Marquee>
  );
}

function CountBadge({ count, dark }: { count: number; dark: boolean }) {
  return (
    <span
      className={`absolute -right-2 -top-2 flex h-[15px] min-w-[15px] items-center justify-center rounded-full px-1 text-[9px] font-semibold leading-none ${
        dark ? 'bg-[#1a1a1a] text-white' : 'bg-white text-[#1a1a1a]'
      }`}
    >
      {count}
    </span>
  );
}

export default function InaaraHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  const [scrolled, setScrolled] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const currencyRef = useRef<HTMLDivElement>(null);

  const { itemCount } = useCart();
  const { wishlistIds } = useWishlist();
  const { currency, setCurrency, currencies } = useCurrency();
  const { content } = useHomepageContent();
  const bannerShown =
    content.banner.enabled && content.banner.messages.some((m) => m.trim());

  const wishlistCount = wishlistIds ? wishlistIds.size : 0;
  const transparent = isHome && !scrolled;

  const rowRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);

  // Scroll-linked header: eases (short scrub) from transparent-over-hero to a
  // solid blurred bar, shrinking the row + logo ~15%. Transform + opacity only.
  useGSAP(
    () => {
      const st = ScrollTrigger.create({
        start: 'top top-=8',
        end: 'top top-=88',
        onUpdate: (self) => setScrolled(self.progress > 0.15),
      });

      const mm = gsap.matchMedia();
      mm.add(MQ.motionOk, () => {
        gsap.set(bgRef.current, { opacity: isHome ? 0 : 1 });
        const tween = gsap.timeline({
          scrollTrigger: { start: 'top top-=8', end: 'top top-=88', scrub: 0.3 },
        });
        if (isHome) tween.to(bgRef.current, { opacity: 1 }, 0);
        tween
          .to(rowRef.current, { scale: 0.9, transformOrigin: 'center top' }, 0)
          .to(logoRef.current, { scale: 0.88 }, 0);
        return () => {
          tween.scrollTrigger?.kill();
          tween.kill();
        };
      });
      mm.add(MQ.reduce, () => {
        gsap.set(bgRef.current, { opacity: 1 });
      });

      return () => {
        st.kill();
        mm.revert();
      };
    },
    { dependencies: [isHome] },
  );

  useEffect(() => {
    setMobileOpen(false);
    setShopOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (currencyRef.current && !currencyRef.current.contains(e.target as Node)) {
        setCurrencyOpen(false);
      }
    };
    if (currencyOpen) document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [currencyOpen]);

  const linkColor = transparent ? 'text-white' : 'text-[#1a1a1a]';
  const iconColor = transparent ? 'text-white' : 'text-[#1a1a1a]';

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50">
        <PromoTicker />

        <div className="relative w-full">
          <div
            ref={bgRef}
            aria-hidden
            className="absolute inset-0 border-b border-[#e8e6e3] bg-white/95 backdrop-blur-md"
            style={{ opacity: isHome ? 0 : 1 }}
          />
          <div
            ref={rowRef}
            className="relative mx-auto flex h-[75px] max-w-[1360px] items-center px-5 [&_a]:transition-colors [&_button]:transition-colors sm:px-8 lg:px-[50px]"
          >
            {/* Logo */}
            <Link to="/" className="flex shrink-0 items-center" aria-label="INAARA home">
              <img
                ref={logoRef}
                src={LOGO}
                alt="INAARA"
                className={`h-6 w-auto origin-left object-contain transition-[filter] duration-300 ${transparent ? 'brightness-0 invert' : ''}`}
              />
            </Link>

            {/* Center nav */}
            <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-[30px] lg:flex">
              {NAV.map((item) =>
                item.dropdown ? (
                  <div
                    key={item.name}
                    className="relative"
                    onMouseEnter={() => setShopOpen(true)}
                    onMouseLeave={() => setShopOpen(false)}
                  >
                    <button
                      onClick={() => navigate(item.path)}
                      className={`flex items-center gap-1.5 text-[13px] font-medium uppercase tracking-[0.08em] transition-opacity hover:opacity-70 ${linkColor}`}
                    >
                      {item.name}
                      <ChevronDown
                        size={11}
                        className={`transition-transform duration-200 ${shopOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                    <AnimatePresence>
                      {shopOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.18 }}
                          className="absolute left-1/2 top-full w-52 -translate-x-1/2 pt-4"
                        >
                          <div className="overflow-hidden rounded-lg border border-[#ece9e7] bg-white py-2 shadow-xl">
                            {SHOP_MENU.map((s) => (
                              <Link
                                key={s.name}
                                to={s.path}
                                className="block px-4 py-2.5 text-[13px] text-[#4a4a4a] transition-colors hover:bg-[#f7f5f3] hover:text-[#1a1a1a]"
                              >
                                {s.name}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`text-[13px] font-medium uppercase tracking-[0.08em] transition-opacity hover:opacity-70 ${linkColor}`}
                  >
                    {item.name}
                  </Link>
                )
              )}
            </nav>

            {/* Utility icons */}
            <div className={`ml-auto flex items-center gap-[18px] ${iconColor}`}>
              <button
                aria-label="Search"
                onClick={() => navigate('/shop')}
                className="transition-opacity hover:opacity-70"
              >
                <Search size={17} strokeWidth={1.75} />
              </button>

              <button
                aria-label="Wishlist"
                onClick={() => navigate('/wishlist')}
                className="relative transition-opacity hover:opacity-70"
              >
                <Heart
                  size={17}
                  strokeWidth={1.75}
                  className={wishlistCount > 0 && !transparent ? 'fill-[#1a1a1a]' : ''}
                />
                <CountBadge count={wishlistCount} dark={!transparent} />
              </button>

              <button
                aria-label="Cart"
                onClick={() => setCartOpen(true)}
                className="relative transition-opacity hover:opacity-70"
              >
                <ShoppingBag size={17} strokeWidth={1.75} />
                <CountBadge count={itemCount} dark={!transparent} />
              </button>

              <div className="relative hidden sm:block" ref={currencyRef}>
                <button
                  aria-label="Select language and region"
                  onClick={() => setCurrencyOpen((v) => !v)}
                  className="flex items-center transition-opacity hover:opacity-70"
                >
                  <span className="text-[17px] leading-none">{currency.flag}</span>
                </button>
                <AnimatePresence>
                  {currencyOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.18 }}
                      className="absolute right-0 top-full mt-3 w-44 overflow-hidden rounded-lg border border-[#ece9e7] bg-white py-1 shadow-xl"
                    >
                      {currencies.map((c) => (
                        <button
                          key={c.code}
                          onClick={() => {
                            setCurrency(c);
                            setCurrencyOpen(false);
                          }}
                          className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13px] transition-colors hover:bg-[#f7f5f3] ${
                            c.code === currency.code ? 'font-semibold text-[#1a1a1a]' : 'text-[#4a4a4a]'
                          }`}
                        >
                          <span className="text-base leading-none">{c.flag}</span>
                          <span>{c.code}</span>
                          <span className="ml-auto text-[#9a9a9a]">{c.symbol}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                aria-label="Menu"
                onClick={() => setMobileOpen(true)}
                className="transition-opacity hover:opacity-70 lg:hidden"
              >
                <Menu size={19} strokeWidth={1.75} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/50 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-[61] w-4/5 max-w-xs bg-white p-6 shadow-2xl lg:hidden"
            >
              <div className="mb-8 flex items-center justify-between">
                <img src={LOGO} alt="INAARA" className="h-6 w-auto object-contain" />
                <button aria-label="Close menu" onClick={() => setMobileOpen(false)}>
                  <X size={20} />
                </button>
              </div>
              <nav className="flex flex-col">
                {NAV.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className="border-b border-[#efedea] py-4 text-[14px] font-medium uppercase tracking-[0.08em] text-[#1a1a1a]"
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
              <div className="mt-6 flex flex-wrap gap-2">
                {currencies.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => setCurrency(c)}
                    className={`rounded-full border px-3 py-1.5 text-[12px] ${
                      c.code === currency.code
                        ? 'border-[#1a1a1a] bg-[#1a1a1a] text-white'
                        : 'border-[#e0ddd9] text-[#4a4a4a]'
                    }`}
                  >
                    {c.flag} {c.code}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer keeps non-home pages clear of the fixed header (75px row +
          26px promo strip when the banner is showing) */}
      {!isHome && <div style={{ height: bannerShown ? 101 : 75 }} />}

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
