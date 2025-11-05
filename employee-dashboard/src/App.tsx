import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DashboardLayout from './components/layout/DashboardLayout';
import { useAuthStore } from './store/authStore';

// Lazy load all page components for better code splitting
const LoginPage = lazy(() => import('./pages/LoginPage'));
const OrderQueuePage = lazy(() => import('./pages/OrderQueuePage'));
const KitchenQueuePage = lazy(() => import('./pages/KitchenQueuePage'));
const OrderHistoryPage = lazy(() => import('./pages/OrderHistoryPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const MenuManagementPage = lazy(() => import('./pages/MenuManagementPage'));
const LiveCartsPage = lazy(() => import('./pages/LiveCartsPage'));
const PromoManagementPage = lazy(() => import('./pages/PromoManagementPage'));
const NewsManagementPage = lazy(() => import('./pages/NewsManagementPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Loading component for Suspense fallback
const LoadingFallback = () => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center">
    <div className="text-blue-500 text-lg">Loading...</div>
  </div>
);

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
              path="/"
              element={
                isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" />
              }
            >
              <Route index element={<OrderQueuePage />} />
              <Route path="kitchen" element={<KitchenQueuePage />} />
              <Route path="live-carts" element={<LiveCartsPage />} />
              <Route path="history" element={<OrderHistoryPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="menu" element={<MenuManagementPage />} />
              <Route path="promos" element={<PromoManagementPage />} />
              <Route path="news" element={<NewsManagementPage />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
