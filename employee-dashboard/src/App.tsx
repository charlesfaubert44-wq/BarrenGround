import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DashboardLayout from './components/layout/DashboardLayout';
import LoginPage from './pages/LoginPage';
import OrderQueuePage from './pages/OrderQueuePage';
import KitchenQueuePage from './pages/KitchenQueuePage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import AnalyticsPage from './pages/AnalyticsPage';
import MenuManagementPage from './pages/MenuManagementPage';
import LiveCartsPage from './pages/LiveCartsPage';
import PromoManagementPage from './pages/PromoManagementPage';
import NewsManagementPage from './pages/NewsManagementPage';
import { useAuthStore } from './store/authStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
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
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
