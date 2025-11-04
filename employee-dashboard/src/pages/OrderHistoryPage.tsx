import { useQuery } from '@tanstack/react-query';
import { getRecentOrders } from '../api/orders';

export default function OrderHistoryPage() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders', 'history'],
    queryFn: () => getRecentOrders(50),
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-stone-700 text-stone-300 border-2 border-stone-600';
      case 'cancelled':
        return 'bg-red-900/50 text-red-300 border-2 border-red-600';
      default:
        return 'bg-blue-900/50 text-blue-300 border-2 border-blue-600';
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-stone-100 mb-6 distressed-text drop-shadow-lg">ORDER HISTORY</h1>

      <div className="bg-stone-800 rounded-xl shadow-2xl overflow-hidden border-4 border-amber-800/50">
        {isLoading ? (
          <div className="p-12 text-center">
            <p className="text-stone-300">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-stone-300">No orders found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-stone-900 border-b-2 border-amber-800/50">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold text-stone-200 uppercase tracking-wide">
                  Order #
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-stone-200 uppercase tracking-wide">
                  Customer
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-stone-200 uppercase tracking-wide">
                  Items
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-stone-200 uppercase tracking-wide">
                  Total
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-stone-200 uppercase tracking-wide">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-stone-200 uppercase tracking-wide">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-700">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-stone-700/50 transition">
                  <td className="px-6 py-4 font-medium text-stone-200">#{order.id}</td>
                  <td className="px-6 py-4 text-stone-200">{order.customer_name}</td>
                  <td className="px-6 py-4 text-sm text-stone-300">
                    {order.items.map((item, idx) => (
                      <div key={idx}>
                        <span className="text-amber-600 font-bold">{item.quantity}x</span> {item.menu_item_name}
                      </div>
                    ))}
                  </td>
                  <td className="px-6 py-4 font-semibold text-amber-500">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-stone-400">
                    {new Date(order.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
