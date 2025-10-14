import { useState } from 'react';
import { ShoppingBag, Heart, Search, Menu, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import CartDrawer from '../cart/CartDrawer';

interface HeaderProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export default function Header({ onNavigate, currentPage }: HeaderProps) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { itemCount } = useCart();

  const navigation = [
    { name: 'Shop', page: 'shop' },
    { name: 'Collections', page: 'shop' },
    { name: 'Lookbook', page: 'lookbook' },
    { name: 'About', page: 'about' }
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <button
              className="lg:hidden p-2 -ml-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <div className="flex items-center gap-8">
              <button
                onClick={() => onNavigate('home')}
                className="font-serif text-2xl font-semibold tracking-wide text-neutral-900 hover:text-neutral-700 transition-colors"
              >
                INAARA WOMAN
              </button>

              <nav className="hidden lg:flex items-center gap-8">
                {navigation.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => onNavigate(item.page)}
                    className={`text-sm font-medium transition-colors ${
                      currentPage === item.page
                        ? 'text-neutral-900'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => onNavigate('shop')}
                className="p-2 text-neutral-600 hover:text-neutral-900 transition-colors"
                aria-label="Search"
              >
                <Search size={20} />
              </button>

              <button
                onClick={() => onNavigate('wishlist')}
                className="p-2 text-neutral-600 hover:text-neutral-900 transition-colors"
                aria-label="Wishlist"
              >
                <Heart size={20} />
              </button>

              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-neutral-600 hover:text-neutral-900 transition-colors"
                aria-label="Shopping cart"
              >
                <ShoppingBag size={20} />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-neutral-900 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-neutral-200 bg-white">
            <nav className="px-4 py-4 space-y-2">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    onNavigate(item.page);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-3 rounded-sm transition-colors ${
                    currentPage === item.page
                      ? 'bg-neutral-100 text-neutral-900 font-medium'
                      : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </nav>
          </div>
        )}
      </header>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} onNavigate={onNavigate} />
    </>
  );
}
