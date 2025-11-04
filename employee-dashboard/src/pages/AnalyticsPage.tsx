import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../api/client';

interface AnalyticsStats {
  today: {
    orders: number;
    revenue: number;
    avgOrderValue: number;
  };
  peakHours: Array<{ hour: number; count: number }>;
  popularItems: Array<{ name: string; quantity: number }>;
  statusDistribution: {
    received: number;
    preparing: number;
    ready: number;
    completed: number;
    cancelled: number;
  };
  revenueTrend: Array<{ date: string; revenue: number }>;
  avgPrepTime: number;
  completionRate: number;
}

export default function AnalyticsPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['analytics', 'stats'],
    queryFn: async () => {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8888';
      return apiRequest<AnalyticsStats>(`${apiUrl}/api/analytics/stats`);
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const formatHour = (hour: number) => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour} ${ampm}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-amber-600 mx-auto mb-4"></div>
          <p className="text-xl text-stone-300">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const maxPeakCount = Math.max(...stats.peakHours.map(h => h.count), 1);
  const maxPopularQty = Math.max(...stats.popularItems.map(i => i.quantity), 1);
  const maxRevenue = Math.max(...stats.revenueTrend.map(d => d.revenue), 1);
  const totalOrders = Object.values(stats.statusDistribution).reduce((sum, count) => sum + count, 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-stone-100 distressed-text drop-shadow-lg">ANALYTICS</h1>
        <p className="text-sm text-stone-400">Updated 1 minute ago</p>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-stone-800 rounded-xl shadow-2xl p-6 border-4 border-amber-800/50">
          <h3 className="text-sm text-stone-300 mb-2 font-semibold uppercase tracking-wide">Today's Orders</h3>
          <p className="text-4xl font-bold text-amber-500">{stats.today.orders}</p>
          <p className="text-xs text-stone-500 mt-2">Total orders placed today</p>
        </div>

        <div className="bg-stone-800 rounded-xl shadow-2xl p-6 border-4 border-amber-800/50">
          <h3 className="text-sm text-stone-300 mb-2 font-semibold uppercase tracking-wide">Today's Revenue</h3>
          <p className="text-4xl font-bold text-green-500">${stats.today.revenue.toFixed(2)}</p>
          <p className="text-xs text-stone-500 mt-2">Total revenue generated today</p>
        </div>

        <div className="bg-stone-800 rounded-xl shadow-2xl p-6 border-4 border-amber-800/50">
          <h3 className="text-sm text-stone-300 mb-2 font-semibold uppercase tracking-wide">Average Order Value</h3>
          <p className="text-4xl font-bold text-blue-500">${stats.today.avgOrderValue.toFixed(2)}</p>
          <p className="text-xs text-stone-500 mt-2">Per order average</p>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-stone-800 rounded-xl shadow-2xl p-6 border-4 border-amber-800/50">
          <h3 className="text-sm text-stone-300 mb-2 font-semibold uppercase tracking-wide">Average Prep Time</h3>
          <p className="text-4xl font-bold text-purple-500">{stats.avgPrepTime.toFixed(1)} min</p>
          <p className="text-xs text-stone-500 mt-2">From received to completed</p>
        </div>

        <div className="bg-stone-800 rounded-xl shadow-2xl p-6 border-4 border-amber-800/50">
          <h3 className="text-sm text-stone-300 mb-2 font-semibold uppercase tracking-wide">Completion Rate</h3>
          <p className="text-4xl font-bold text-green-500">{stats.completionRate.toFixed(1)}%</p>
          <p className="text-xs text-stone-500 mt-2">Successfully completed orders</p>
        </div>
      </div>

      {/* Peak Hours */}
      {stats.peakHours.length > 0 && (
        <div className="bg-stone-800 rounded-xl shadow-2xl p-6 border-4 border-amber-800/50">
          <h2 className="text-xl font-bold mb-6 text-stone-100 distressed-text uppercase">PEAK HOURS (Last 24h)</h2>
          <div className="space-y-3">
            {stats.peakHours.map((hour) => (
              <div key={hour.hour} className="flex items-center gap-4">
                <div className="w-20 text-sm font-bold text-stone-300">{formatHour(hour.hour)}</div>
                <div className="flex-1">
                  <div className="bg-stone-700 rounded-full h-8 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-600 to-amber-500 h-full flex items-center justify-end pr-3 transition-all duration-500"
                      style={{ width: `${(hour.count / maxPeakCount) * 100}%` }}
                    >
                      <span className="text-white font-bold text-sm">{hour.count}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Popular Items */}
      {stats.popularItems.length > 0 && (
        <div className="bg-stone-800 rounded-xl shadow-2xl p-6 border-4 border-amber-800/50">
          <h2 className="text-xl font-bold mb-6 text-stone-100 distressed-text uppercase">POPULAR ITEMS</h2>
          <div className="space-y-3">
            {stats.popularItems.map((item, index) => (
              <div key={item.name} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center font-bold text-white text-sm">
                  #{index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-stone-100">{item.name}</span>
                    <span className="text-sm text-amber-500 font-bold">{item.quantity} sold</span>
                  </div>
                  <div className="bg-stone-700 rounded-full h-6 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-green-600 to-green-500 h-full transition-all duration-500"
                      style={{ width: `${(item.quantity / maxPopularQty) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Revenue Trend */}
      <div className="bg-stone-800 rounded-xl shadow-2xl p-6 border-4 border-amber-800/50">
        <h2 className="text-xl font-bold mb-6 text-stone-100 distressed-text uppercase">REVENUE TREND (Last 7 Days)</h2>
        <div className="space-y-3">
          {stats.revenueTrend.map((day) => (
            <div key={day.date} className="flex items-center gap-4">
              <div className="w-24 text-sm font-bold text-stone-300">{formatDate(day.date)}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-stone-400">Revenue</span>
                  <span className="text-sm text-green-500 font-bold">${day.revenue.toFixed(2)}</span>
                </div>
                <div className="bg-stone-700 rounded-full h-6 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-blue-500 h-full transition-all duration-500"
                    style={{ width: `${(day.revenue / maxRevenue) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status Distribution */}
      <div className="bg-stone-800 rounded-xl shadow-2xl p-6 border-4 border-amber-800/50">
        <h2 className="text-xl font-bold mb-6 text-stone-100 distressed-text uppercase">ORDER STATUS DISTRIBUTION</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-blue-900/30 border-2 border-blue-600 rounded-xl p-4 text-center">
            <p className="text-xs text-blue-400 uppercase font-bold mb-2">Received</p>
            <p className="text-3xl font-bold text-blue-300">{stats.statusDistribution.received}</p>
            {totalOrders > 0 && (
              <p className="text-xs text-blue-500 mt-2">
                {((stats.statusDistribution.received / totalOrders) * 100).toFixed(0)}%
              </p>
            )}
          </div>

          <div className="bg-yellow-900/30 border-2 border-yellow-600 rounded-xl p-4 text-center">
            <p className="text-xs text-yellow-400 uppercase font-bold mb-2">Preparing</p>
            <p className="text-3xl font-bold text-yellow-300">{stats.statusDistribution.preparing}</p>
            {totalOrders > 0 && (
              <p className="text-xs text-yellow-500 mt-2">
                {((stats.statusDistribution.preparing / totalOrders) * 100).toFixed(0)}%
              </p>
            )}
          </div>

          <div className="bg-green-900/30 border-2 border-green-600 rounded-xl p-4 text-center">
            <p className="text-xs text-green-400 uppercase font-bold mb-2">Ready</p>
            <p className="text-3xl font-bold text-green-300">{stats.statusDistribution.ready}</p>
            {totalOrders > 0 && (
              <p className="text-xs text-green-500 mt-2">
                {((stats.statusDistribution.ready / totalOrders) * 100).toFixed(0)}%
              </p>
            )}
          </div>

          <div className="bg-stone-700 border-2 border-stone-600 rounded-xl p-4 text-center">
            <p className="text-xs text-stone-400 uppercase font-bold mb-2">Completed</p>
            <p className="text-3xl font-bold text-stone-300">{stats.statusDistribution.completed}</p>
            {totalOrders > 0 && (
              <p className="text-xs text-stone-500 mt-2">
                {((stats.statusDistribution.completed / totalOrders) * 100).toFixed(0)}%
              </p>
            )}
          </div>

          <div className="bg-red-900/30 border-2 border-red-600 rounded-xl p-4 text-center">
            <p className="text-xs text-red-400 uppercase font-bold mb-2">Cancelled</p>
            <p className="text-3xl font-bold text-red-300">{stats.statusDistribution.cancelled}</p>
            {totalOrders > 0 && (
              <p className="text-xs text-red-500 mt-2">
                {((stats.statusDistribution.cancelled / totalOrders) * 100).toFixed(0)}%
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
