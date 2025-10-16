import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { ShoppingBag, Heart, Search, Menu, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import CartDrawer from '../cart/CartDrawer';

export default function EnhancedHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPage = location.pathname;
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [cartBounce, setCartBounce] = useState(false);

  const { itemCount } = useCart();
  const { wishlistIds } = useWishlist();
  const { scrollY } = useScroll();

  if (!wishlistIds) return null;

  const headerHeight = useTransform(scrollY, [0, 100], [80, 64]);
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.98]);

  const navigation = [
    { name: 'Shop', path: '/shop' },
    { name: 'Collections', path: '/shop' },
    { name: 'Lookbook', path: '/lookbook' },
    { name: 'About', path: '/about' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (itemCount > 0) {
      setCartBounce(true);
      setTimeout(() => setCartBounce(false), 600);
    }
  }, [itemCount]);

  const scrollProgress = useTransform(scrollY, [0, document.documentElement.scrollHeight - window.innerHeight], [0, 100]);

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 right-0 h-0.5 bg-[#D4AF37] origin-left z-50"
        style={{ scaleX: useTransform(scrollProgress, [0, 100], [0, 1]) }}
      />

      <motion.header
        className={`sticky top-0 z-40 bg-white border-b border-neutral-200 transition-all duration-300 ${
          scrolled ? 'shadow-md backdrop-blur-md bg-white/95' : ''
        }`}
        style={{ height: headerHeight, opacity: headerOpacity }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex h-full items-center justify-between">
            <button
              className="lg:hidden p-2 -ml-2 relative z-10"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <motion.div
                animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </motion.div>
            </button>

            <div className="flex items-center gap-8">
              <Link to="/">
                <motion.div
                  className="font-serif text-2xl font-semibold tracking-wide text-neutral-900 hover:text-neutral-700 transition-colors"
                  animate={{ scale: scrolled ? 0.9 : 1 }}
                  transition={{ duration: 0.3 }}
                >
                  INAARA WOMAN
                </motion.div>
              </Link>

              <nav className="hidden lg:flex items-center gap-8">
                {navigation.map((item) => (
                  <Link key={item.name} to={item.path}>
                    <motion.div
                      className={`text-sm font-medium transition-colors relative group ${
                        currentPage === item.path
                          ? 'text-neutral-900'
                          : 'text-neutral-600 hover:text-[#D4AF37]'
                      }`}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {item.name}
                      <motion.span
                        className="absolute -bottom-1 left-0 h-0.5 bg-[#D4AF37]"
                        initial={{ width: 0 }}
                        whileHover={{ width: '100%' }}
                        transition={{ duration: 0.3 }}
                      />
                    </motion.div>
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <AnimatePresence mode="wait">
                {isSearchExpanded ? (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 200, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search..."
                      className="w-full px-3 py-1.5 text-sm border-2 border-[#D4AF37] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
                      autoFocus
                      onBlur={() => {
                        if (!searchQuery) setIsSearchExpanded(false);
                      }}
                    />
                  </motion.div>
                ) : (
                  <motion.button
                    onClick={() => setIsSearchExpanded(true)}
                    className="p-2 text-neutral-600 hover:text-[#D4AF37] transition-colors"
                    aria-label="Search"
                    whileHover={{ scale: 1.1, rotate: 15 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Search size={20} />
                  </motion.button>
                )}
              </AnimatePresence>

              <motion.div
                onClick={() => navigate('/wishlist')}
                className="relative p-2 text-neutral-600 hover:text-red-500 transition-colors cursor-pointer"
                aria-label="Wishlist"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Heart size={20} className={wishlistIds.size > 0 ? 'fill-red-500 text-red-500' : ''} />
                {wishlistIds.size > 0 && (
                  <motion.span
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  >
                    {wishlistIds.size}
                  </motion.span>
                )}
              </motion.div>

              <motion.button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-neutral-600 hover:text-neutral-900 transition-colors"
                aria-label="Shopping cart"
                animate={cartBounce ? {
                  y: [0, -10, 0],
                  transition: { duration: 0.6, ease: "easeOut" }
                } : {}}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ShoppingBag size={20} />
                {itemCount > 0 && (
                  <motion.span
                    className="absolute -top-1 -right-1 bg-neutral-900 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                    key={itemCount}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  >
                    {itemCount}
                  </motion.span>
                )}
              </motion.button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm lg:hidden"
                style={{ top: scrolled ? '64px' : '80px' }}
                onClick={() => setIsMobileMenuOpen(false)}
              />

              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed right-0 top-0 bottom-0 w-3/4 max-w-sm bg-white shadow-2xl lg:hidden overflow-y-auto"
                style={{ top: scrolled ? '64px' : '80px' }}
              >
                <nav className="px-6 py-8 space-y-1">
                  {navigation.map((item, index) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <motion.div
                        className={`block w-full text-left px-4 py-4 rounded-lg transition-colors relative group ${
                          currentPage === item.path
                            ? 'bg-neutral-100 text-neutral-900 font-medium'
                            : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                        }`}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {item.name}
                        <motion.span
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-[#D4AF37] rounded-r"
                          whileHover={{ height: '70%' }}
                          transition={{ duration: 0.3 }}
                        />
                      </motion.div>
                    </Link>
                  ))}
                </nav>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.header>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
