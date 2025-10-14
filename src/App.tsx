import { useState } from 'react';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ToastProvider } from './context/ToastContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import WishlistPage from './pages/WishlistPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import FAQPage from './pages/FAQPage';
import LookbookPage from './pages/LookbookPage';
import CheckoutPage from './pages/CheckoutPage';

type Page = 'home' | 'shop' | 'product' | 'wishlist' | 'about' | 'contact' | 'faq' | 'lookbook' | 'checkout';

interface NavigationState {
  page: Page;
  data?: any;
}

function App() {
  const [navigation, setNavigation] = useState<NavigationState>({ page: 'home' });

  const handleNavigate = (page: string, data?: any) => {
    setNavigation({ page: page as Page, data });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
    switch (navigation.page) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
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
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <ToastProvider>
      <CartProvider>
        <WishlistProvider>
          <div className="min-h-screen bg-white">
            <Header onNavigate={handleNavigate} currentPage={navigation.page} />
            <main>{renderPage()}</main>
            <Footer onNavigate={handleNavigate} />
          </div>
        </WishlistProvider>
      </CartProvider>
    </ToastProvider>
  );
}

export default App;
