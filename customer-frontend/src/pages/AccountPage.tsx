import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { getUserOrders } from '../api/orders';

export default function AccountPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { addItem } = useCartStore();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['user-orders'],
    queryFn: getUserOrders,
    enabled: isAuthenticated,
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!isAuthenticated || !user) {
    navigate('/login');
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received':
        return 'bg-blue-600 text-white';
      case 'preparing':
        return 'bg-yellow-600 text-white';
      case 'ready':
        return 'bg-green-600 text-white';
      case 'cancelled':
        return 'bg-red-600 text-white';
      default:
        return 'bg-stone-600 text-white';
    }
  };

  const handleReorder = (order: any) => {
    // Add all items from the order to the cart
    order.items.forEach((item: any) => {
      // Add item multiple times for the quantity
      for (let i = 0; i < item.quantity; i++) {
        addItem({
          id: item.menu_item_id,
          name: item.menu_item_name,
          price: item.price_snapshot,
          customizations: item.customizations || {},
        });
      }
    });
    // Navigate to cart
    navigate('/cart');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 py-4 sm:py-8 lg:py-12">
      {/* Dark texture overlay */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.3) 0px, transparent 1px, transparent 2px, rgba(0,0,0,0.3) 3px)',
      }}></div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 relative z-10">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-100 mb-4 sm:mb-6 lg:mb-8 distressed-text drop-shadow-lg">MY ACCOUNT</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Profile Section */}
            <div className="bg-stone-800 rounded-xl shadow-2xl p-4 sm:p-6 border-2 sm:border-4 border-amber-800/50">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6 text-stone-100 distressed-text">PROFILE INFORMATION</h2>
              <div className="space-y-3 sm:space-y-4">
                <div className="bg-stone-900/50 rounded-lg p-3 sm:p-4 border border-stone-700 sm:border-2">
                  <label className="text-xs sm:text-sm text-stone-400 uppercase tracking-wide font-bold">Name</label>
                  <p className="text-base sm:text-lg text-stone-100 font-semibold">{user.name}</p>
                </div>
                <div className="bg-stone-900/50 rounded-lg p-3 sm:p-4 border border-stone-700 sm:border-2">
                  <label className="text-xs sm:text-sm text-stone-400 uppercase tracking-wide font-bold">Email</label>
                  <p className="text-base sm:text-lg text-stone-100 font-semibold break-all">{user.email}</p>
                </div>
                {user.phone && (
                  <div className="bg-stone-900/50 rounded-lg p-3 sm:p-4 border border-stone-700 sm:border-2">
                    <label className="text-xs sm:text-sm text-stone-400 uppercase tracking-wide font-bold">Phone</label>
                    <p className="text-base sm:text-lg text-stone-100 font-semibold">{user.phone}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Order History */}
            <div className="bg-stone-800 rounded-xl shadow-2xl p-4 sm:p-6 border-2 sm:border-4 border-amber-800/50">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6 text-stone-100 distressed-text">ORDER HISTORY</h2>

              {isLoading ? (
                <div className="text-center py-6 sm:py-8">
                  <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-4 border-amber-600 mx-auto mb-4"></div>
                  <p className="text-sm sm:text-base text-stone-300">Loading orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8 sm:py-12 bg-stone-900/50 rounded-lg border border-stone-700 sm:border-2">
                  <svg className="w-12 h-12 sm:w-16 sm:h-16 text-stone-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <p className="text-stone-400 text-base sm:text-lg">You haven't placed any orders yet.</p>
                  <button
                    onClick={() => navigate('/menu')}
                    className="mt-3 sm:mt-4 bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700 text-white py-2 px-4 sm:px-6 rounded-lg font-bold transition-all transform hover:scale-105 text-sm sm:text-base"
                  >
                    Browse Menu
                  </button>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-stone-900/50 border border-stone-700 sm:border-2 rounded-lg sm:rounded-xl p-3 sm:p-6 hover:border-amber-600 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 sm:mb-4 gap-2 sm:gap-3">
                        <div>
                          <h3 className="font-bold text-lg sm:text-xl text-amber-500">Order #{order.id}</h3>
                          <p className="text-xs sm:text-sm text-stone-400 font-semibold">
                            {new Date(order.created_at).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(
                            order.status
                          )} shadow-lg self-start`}
                        >
                          {order.status}
                        </span>
                      </div>

                      <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-stone-300 bg-stone-800/50 rounded-lg p-2">
                            <span className="font-medium text-sm sm:text-base">
                              <span className="text-amber-500 font-bold">{item.quantity}x</span> {item.menu_item_name}
                            </span>
                            <span className="font-bold text-sm sm:text-base whitespace-nowrap ml-2">${(item.price_snapshot * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-3 sm:pt-4 border-t border-stone-700 sm:border-t-2 gap-3">
                        <span className="font-bold text-xl sm:text-2xl text-amber-500">
                          Total: ${order.total.toFixed(2)}
                        </span>
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                          <button
                            onClick={() => handleReorder(order)}
                            className="w-full sm:w-auto bg-gradient-to-r from-green-700 to-green-800 hover:from-green-600 hover:to-green-700 text-white py-2 px-4 sm:px-6 rounded-lg font-bold transition-all transform hover:scale-105 uppercase tracking-wide text-xs sm:text-sm"
                          >
                            Reorder
                          </button>
                          {order.status !== 'cancelled' && order.tracking_token && (
                            <button
                              onClick={() => navigate(`/track/${order.tracking_token}`)}
                              className="w-full sm:w-auto bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700 text-white py-2 px-4 sm:px-6 rounded-lg font-bold transition-all transform hover:scale-105 uppercase tracking-wide text-xs sm:text-sm"
                            >
                              Track
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            <div className="bg-stone-800 rounded-xl shadow-2xl p-4 sm:p-6 border-2 sm:border-4 border-amber-800/50">
              <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-stone-100 distressed-text uppercase">Quick Actions</h2>
              <div className="space-y-2 sm:space-y-3">
                <button
                  onClick={() => navigate('/membership')}
                  className="w-full bg-gradient-to-r from-green-700 to-green-800 hover:from-green-600 hover:to-green-700 text-white py-2.5 sm:py-3 rounded-lg font-bold transition-all transform hover:scale-105 uppercase tracking-wide text-xs sm:text-sm"
                >
                  Membership
                </button>
                <button
                  onClick={() => navigate('/menu')}
                  className="w-full bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700 text-white py-2.5 sm:py-3 rounded-lg font-bold transition-all transform hover:scale-105 uppercase tracking-wide text-xs sm:text-sm"
                >
                  Browse Menu
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 text-white py-2.5 sm:py-3 rounded-lg font-bold transition-all transform hover:scale-105 uppercase tracking-wide text-xs sm:text-sm"
                >
                  Logout
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-900 to-amber-800 rounded-xl shadow-2xl p-4 sm:p-6 border-2 sm:border-4 border-amber-600/50">
              <h3 className="text-base sm:text-lg font-bold text-white mb-2 sm:mb-3 distressed-text uppercase">Pro Tip</h3>
              <p className="text-amber-100 text-xs sm:text-sm leading-relaxed">
                Use the <strong>Reorder</strong> button to quickly add your favorite orders to your cart!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
