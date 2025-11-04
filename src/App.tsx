import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { CurrencyProvider } from './context/CurrencyContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ToastProvider } from './context/ToastContext';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import AnnouncementBanner from './components/ui/AnnouncementBanner';
import EnhancedHeader from './components/layout/EnhancedHeader';
import EnhancedFooter from './components/layout/EnhancedFooter';
import ClingrHomePage from './pages/ClingrHomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CollectionPage from './pages/CollectionPage';
import WishlistPage from './pages/WishlistPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import FAQPage from './pages/FAQPage';
import LookbookPage from './pages/LookbookPage';
import CheckoutPage from './pages/CheckoutPage';
import NotFoundPage from './pages/NotFoundPage';
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
import CustomerDetails from './pages/admin/CustomerDetails';
import CollectionsList from './pages/admin/CollectionsList';
import CollectionForm from './pages/admin/CollectionForm';
import Settings from './pages/admin/Settings';
import ProtectedRoute from './components/ProtectedRoute';
import { Analytics } from "@vercel/analytics/next"

// Policy Pages
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import ShippingReturnsPage from './pages/ShippingReturnsPage';
import ShippingPolicyPage from './pages/ShippingPolicyPage';
import TermsConditionsPage from './pages/TermsConditionsPage';
import CookiePolicyPage from './pages/CookiePolicyPage';

import { useEffect } from 'react';

function PublicLayout() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <>
      <LoadingBar />
      <AnnouncementBanner />
      <EnhancedHeader />
      <main>
        <PageTransition pageKey={location.pathname}>
          <Routes>
            <Route path="/" element={<ClingrHomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/collection/:slug" element={<CollectionPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/lookbook" element={<LookbookPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            
            {/* Policy Pages */}
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/shipping-returns" element={<ShippingReturnsPage />} />
            <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
            <Route path="/terms-conditions" element={<TermsConditionsPage />} />
            <Route path="/cookie-policy" element={<CookiePolicyPage />} />
            
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </PageTransition>
      </main>
      <EnhancedFooter />
    </>
  );
}

function AdminRoutes() {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/new" element={<ProductForm mode="new" />} />
        <Route path="/products/edit/:id" element={<ProductForm mode="edit" />} />
        <Route path="/homepage" element={<HomepageManager />} />
        <Route path="/orders" element={<OrdersList />} />
        <Route path="/orders/:id" element={<OrderDetails />} />
        <Route path="/customers" element={<CustomersList />} />
        <Route path="/customers/:id" element={<CustomerDetails />} />
        <Route path="/collections" element={<CollectionsList />} />
        <Route path="/collections/new" element={<CollectionForm mode="new" />} />
        <Route path="/collections/edit/:id" element={<CollectionForm mode="edit" />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <CurrencyProvider>
          <ToastProvider>
            <CartProvider>
              <WishlistProvider>
                <div className="min-h-screen bg-white">
                  <Routes>
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route
                      path="/admin/*"
                      element={
                        <ProtectedRoute>
                          <AdminRoutes />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/*" element={<PublicLayout />} />
                  </Routes>
                </div>
              </WishlistProvider>
            </CartProvider>
          </ToastProvider>
        </CurrencyProvider>
      </AdminAuthProvider>
      <SpeedInsights />
      <Analytics />
    </BrowserRouter>
  );
}

export default App;