import { useState, useEffect } from 'react';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ToastProvider } from './context/ToastContext';
import EnhancedHeader from './components/layout/EnhancedHeader';
import EnhancedFooter from './components/layout/EnhancedFooter';
import EnhancedHomePage from './pages/EnhancedHomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import WishlistPage from './pages/WishlistPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import FAQPage from './pages/FAQPage';
import LookbookPage from './pages/LookbookPage';
import CheckoutPage from './pages/CheckoutPage';
import NotFoundPage from './pages/NotFoundPage';
import CustomCursor from './components/ui/CustomCursor';
import PageTransition from './components/animations/PageTransition';
import LoadingBar from './components/ui/LoadingBar';

type Page = 'home' | 'shop' | 'product' | 'wishlist' | 'about' | 'contact' | 'faq' | 'lookbook' | 'checkout' | '404';

interface NavigationState {
  page: Page;
  data?: any;
}

function App() {
  const [navigation, setNavigation] = useState<NavigationState>({ page: 'home' });

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  const handleNavigate = (page: string, data?: any) => {
    window.dispatchEvent(new Event('pageTransitionStart'));
    setNavigation({ page: page as Page, data });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      window.dispatchEvent(new Event('pageTransitionComplete'));
    }, 500);
  };

  const renderPage = () => {
    switch (navigation.page) {
      case 'home':
        return <EnhancedHomePage onNavigate={handleNavigate} />;
      case 'shop':
        return <ShopPage onNavigate={handleNavigate} initialFilters={navigation.data} />;
      case 'product':
        return <ProductDetailPage productId={navigation.data?.id} onNavigate={handleNavigate} />;
      case 'wishlist':
        return <WishlistPage onNavigate={handleNavigate} />;
      case 'about':
        return <AboutPage onNavigate={handleNavigate} />;
      case 'contact':
        return <ContactPage />;
      case 'faq':
        return <FAQPage />;
      case 'lookbook':
        return <LookbookPage onNavigate={handleNavigate} />;
      case 'checkout':
        return <CheckoutPage onNavigate={handleNavigate} />;
      case '404':
        return <NotFoundPage onNavigate={handleNavigate} />;
      default:
        return <NotFoundPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <ToastProvider>
      <CartProvider>
        <WishlistProvider>
          <div className="min-h-screen bg-white">
            <CustomCursor />
            <LoadingBar />
            <EnhancedHeader onNavigate={handleNavigate} currentPage={navigation.page} />
            <main>
              <PageTransition pageKey={navigation.page}>
                {renderPage()}
              </PageTransition>
            </main>
            <EnhancedFooter onNavigate={handleNavigate} />
          </div>
        </WishlistProvider>
      </CartProvider>
    </ToastProvider>
  );
}

export default App;
