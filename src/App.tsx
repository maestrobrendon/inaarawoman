import { useState, useEffect } from 'react';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ToastProvider } from './context/ToastContext';
import { AdminAuthProvider, useAdminAuth } from './contexts/AdminAuthContext';
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
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import ProductList from './pages/admin/ProductList';
import ProductForm from './pages/admin/ProductForm';
import HomepageManager from './pages/admin/HomepageManager';
import OrdersList from './pages/admin/OrdersList';
import OrderDetails from './pages/admin/OrderDetails';
import CustomersList from './pages/admin/CustomersList';

type Page = 'home' | 'shop' | 'product' | 'wishlist' | 'about' | 'contact' | 'faq' | 'lookbook' | 'checkout' | '404' | 'admin-login' | 'admin-dashboard' | 'admin-products' | 'admin-product-form' | 'admin-homepage';

interface NavigationState {
  page: Page;
  data?: any;
}

function AdminApp() {
  const [adminPage, setAdminPage] = useState('dashboard');
  const [adminData, setAdminData] = useState<any>(null);
  const { isAdmin, loading } = useAdminAuth();
  const [navigation, setNavigation] = useState<NavigationState>({ page: 'admin-login' });

  useEffect(() => {
    if (isAdmin && navigation.page === 'admin-login') {
      setNavigation({ page: 'admin-dashboard' });
    }
  }, [isAdmin]);

  const handleAdminNavigate = (page: string, data?: any) => {
    setAdminPage(page);
    setAdminData(data);
  };

  const handleLoginSuccess = () => {
    setNavigation({ page: 'admin-dashboard' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <p className="text-neutral-600">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  const renderAdminPage = () => {
    switch (adminPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'products':
        return <ProductList onNavigate={handleAdminNavigate} />;
      case 'product-form':
        return (
          <ProductForm
            mode={adminData?.mode || 'new'}
            productId={adminData?.id}
            onNavigate={handleAdminNavigate}
          />
        );
      case 'homepage':
        return <HomepageManager />;
      case 'orders':
        return <OrdersList onNavigate={handleAdminNavigate} />;
      case 'order-details':
        return <OrderDetails orderId={adminData?.id} onNavigate={handleAdminNavigate} />;
      case 'customers':
        return <CustomersList onNavigate={handleAdminNavigate} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AdminLayout currentPage={adminPage} onNavigate={handleAdminNavigate}>
      {renderAdminPage()}
    </AdminLayout>
  );
}

function App() {
  const [navigation, setNavigation] = useState<NavigationState>({ page: 'home' });

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    const path = window.location.pathname;
    if (path.startsWith('/admin')) {
      setNavigation({ page: 'admin-login' });
    }
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
    if (navigation.page.startsWith('admin')) {
      return <AdminApp />;
    }

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

  const isAdminRoute = navigation.page.startsWith('admin');

  return (
    <AdminAuthProvider>
      <ToastProvider>
        <CartProvider>
          <WishlistProvider>
            <div className="min-h-screen bg-white">
              {!isAdminRoute && (
                <>
                  <CustomCursor />
                  <LoadingBar />
                  <EnhancedHeader onNavigate={handleNavigate} currentPage={navigation.page} />
                </>
              )}
              <main>
                {isAdminRoute ? (
                  renderPage()
                ) : (
                  <PageTransition pageKey={navigation.page}>
                    {renderPage()}
                  </PageTransition>
                )}
              </main>
              {!isAdminRoute && <EnhancedFooter onNavigate={handleNavigate} />}
            </div>
          </WishlistProvider>
        </CartProvider>
      </ToastProvider>
    </AdminAuthProvider>
  );
}

export default App;
