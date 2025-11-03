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
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Order History</h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <p className="text-gray-600">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-600">No orders found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                  Order #
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                  Customer
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                  Items
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                  Total
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">#{order.id}</td>
                  <td className="px-6 py-4">{order.customer_name}</td>
                  <td className="px-6 py-4 text-sm">
                    {order.items.map((item, idx) => (
                      <div key={idx}>
                        {item.quantity}x {item.menu_item_name}
                      </div>
                    ))}
                  </td>
                  <td className="px-6 py-4 font-semibold text-amber-900">
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
                  <td className="px-6 py-4 text-sm text-gray-600">
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
