import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { getOrdersByStatus, updateOrderStatus as apiUpdateOrderStatus } from '../api/orders';

export default function OrderQueuePage() {
  const queryClient = useQueryClient();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prevOrderCountRef = useRef<number>(0);

  const { data: orders = [] } = useQuery({
    queryKey: ['orders', 'active'],
    queryFn: () => getOrdersByStatus(['received', 'preparing', 'ready']),
    refetchInterval: 5000, // Poll every 5 seconds
  });

  // Play sound when new orders arrive
  useEffect(() => {
    if (orders.length > prevOrderCountRef.current) {
      // Play notification sound for new orders
      audioRef.current?.play().catch((e) => console.log('Audio play failed:', e));
    }
    prevOrderCountRef.current = orders.length;
  }, [orders.length]);

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      await apiUpdateOrderStatus(orderId, newStatus);
      queryClient.invalidateQueries({ queryKey: ['orders', 'active'] });
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received':
        return 'bg-blue-100 text-blue-800';
      case 'preparing':
        return 'bg-yellow-100 text-yellow-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      {/* Hidden audio element for notifications */}
      <audio ref={audioRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuJ0/LLeCsFKH/L7+GNPQ=="></source>
      </audio>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Order Queue</h1>
        <div className="flex items-center gap-4">
          {/* Auto-refresh indicator */}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-gray-600">
              Auto-refresh (5s)
            </span>
          </div>

          {/* Order Count */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔔</span>
            <span className="bg-red-500 text-white px-3 py-1 rounded-full font-semibold">
              {orders.length}
            </span>
          </div>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-xl text-gray-600">No active orders</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{order.customer_name}</h3>
                  <p className="text-sm text-gray-600">
                    Order #{order.id}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="text-sm">
                    <span className="font-medium">
                      {item.quantity}x {item.name}
                    </span>
                    {item.customizations && (
                      <p className="text-gray-600 text-xs">
                        {Object.entries(item.customizations)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(', ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <span className="font-bold text-lg text-amber-900">
                  ${order.total.toFixed(2)}
                </span>
                <span className="text-sm text-gray-600">
                  {new Date(order.created_at).toLocaleTimeString()}
                </span>
              </div>

              <div className="mt-4 flex gap-2">
                {order.status === 'received' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateOrderStatus(order.id, 'preparing');
                    }}
                    className="flex-1 bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600 transition"
                  >
                    Start Preparing
                  </button>
                )}
                {order.status === 'preparing' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateOrderStatus(order.id, 'ready');
                    }}
                    className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600 transition"
                  >
                    Mark Ready
                  </button>
                )}
                {order.status === 'ready' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateOrderStatus(order.id, 'completed');
                    }}
                    className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600 transition"
                  >
                    Complete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
