import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { Order } from './types';

export function AppContent() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [pageParam, setPageParam] = useState<string>('');
  const [selectedProductSlug, setSelectedProductSlug] = useState<string>('');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const navigateTo = (page: string, param: string = '') => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentPage(page);
    setPageParam(param);
  };

  const handleSelectProduct = (slug: string) => {
    setSelectedProductSlug(slug);
    navigateTo('detail');
  };

  const handleOrderSuccess = (order: Order) => {
    setCompletedOrder(order);
    navigateTo('order-success');
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      {/* Header */}
      <Navbar onNavigate={navigateTo} activePage={currentPage} />

      {/* Main Content Pages */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            onNavigate={navigateTo}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentPage === 'catalog' && (
          <CatalogPage
            initialQuery={pageParam}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentPage === 'detail' && (
          <ProductDetailPage
            slug={selectedProductSlug}
            onNavigate={navigateTo}
          />
        )}

        {currentPage === 'checkout' && (
          <CheckoutPage
            onBack={() => navigateTo('home')}
            onOrderSuccess={handleOrderSuccess}
          />
        )}

        {currentPage === 'order-success' && completedOrder && (
          <OrderSuccessPage
            order={completedOrder}
            onNavigate={navigateTo}
          />
        )}

        {currentPage === 'tracking' && (
          <OrderTrackingPage />
        )}

        {currentPage === 'login' && (
          <LoginPage
            onSuccess={() => navigateTo('home')}
            onNavigateRegister={() => navigateTo('register')}
          />
        )}

        {currentPage === 'register' && (
          <RegisterPage
            onSuccess={() => navigateTo('home')}
            onNavigateLogin={() => navigateTo('login')}
          />
        )}

        {currentPage === 'admin' && (
          <AdminDashboardPage
            onNavigateHome={() => navigateTo('home')}
          />
        )}
      </main>

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        onCheckout={() => navigateTo('checkout')}
        onExplore={() => navigateTo('catalog')}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}
