import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

interface OrderItem {
  id: number;
  menu_item_name: string;
  quantity: number;
  price_snapshot: number;
}

interface ScheduledOrder {
  id: number;
  guest_name?: string;
  guest_email?: string;
  user_email?: string;
  total: number;
  status: string;
  scheduled_time: string;
  items: OrderItem[];
  customer_name: string;
}

export default function ScheduledOrdersPage() {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  // Fetch scheduled orders for the selected date
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['scheduled-orders', selectedDate],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/scheduling/scheduled-orders?date=${selectedDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error('Failed to fetch scheduled orders');
      }
      return response.json();
    },
    enabled: !!selectedDate,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const orders = data?.orders || [];
  const ordersByTime = data?.ordersByTime || {};

  // Get date range (today + next 7 days)
  const getDateRange = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 8; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      });
    }
    return dates;
  };

  const dateRange = getDateRange();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Scheduled Orders</h1>
        <p className="text-gray-600">View and manage orders scheduled for future pickup</p>
      </div>

      {/* Date Selector */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <label htmlFor="date-select" className="block text-sm font-medium text-gray-700 mb-2">
          Select Date
        </label>
        <div className="flex flex-wrap gap-2">
          {dateRange.map((date) => (
            <button
              key={date.value}
              onClick={() => setSelectedDate(date.value)}
              className={`
                px-4 py-2 rounded-lg font-medium transition-all
                ${selectedDate === date.value
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {date.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading scheduled orders...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Failed to load scheduled orders. Please try again.</p>
          <button
            onClick={() => refetch()}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && orders.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Scheduled Orders</h3>
          <p className="text-gray-600">There are no orders scheduled for this date.</p>
        </div>
      )}

      {/* Orders Timeline */}
      {!isLoading && !error && orders.length > 0 && (
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">{orders.length}</div>
                <div className="text-sm text-gray-600 mt-1">Total Orders</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">
                  ${orders.reduce((sum: number, order: ScheduledOrder) => sum + Number(order.total), 0).toFixed(2)}
                </div>
                <div className="text-sm text-gray-600 mt-1">Total Revenue</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">{Object.keys(ordersByTime).length}</div>
                <div className="text-sm text-gray-600 mt-1">Time Slots</div>
              </div>
            </div>
          </div>

          {/* Orders List */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Orders for {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {orders.map((order: ScheduledOrder) => (
                <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-2xl font-bold text-gray-900">
                            {new Date(order.scheduled_time).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true,
                            })}
                          </span>
                        </div>
                        <span className={`
                          px-3 py-1 rounded-full text-xs font-semibold
                          ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'ready' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'}
                        `}>
                          {order.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="font-medium">{order.customer_name}</span>
                        </div>
                        {(order.guest_email || order.user_email) && (
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span>{order.guest_email || order.user_email}</span>
                          </div>
                        )}
                        <div className="text-xs text-gray-500">Order #{order.id}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">${Number(order.total).toFixed(2)}</div>
                      <div className="text-sm text-gray-600">{order.items.length} items</div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mt-4 bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Order Items:</h4>
                    <div className="space-y-2">
                      {order.items.map((item: OrderItem) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-gray-700">
                            <span className="font-medium">{item.quantity}x</span> {item.menu_item_name}
                          </span>
                          <span className="text-gray-600">${(item.price_snapshot * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
