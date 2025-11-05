import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { getOrdersByStatus, updateOrderStatus as apiUpdateOrderStatus } from '../api/orders';
import { useWebSocket } from '../hooks/useWebSocket';

export default function KitchenQueuePage() {
  const queryClient = useQueryClient();
  const { on, off, isConnected } = useWebSocket();
  const [, setCurrentTime] = useState(new Date());

  const { data: activeOrders = [] } = useQuery({
    queryKey: ['orders', 'active'],
    queryFn: () => getOrdersByStatus(['received', 'preparing', 'ready']),
    refetchInterval: isConnected ? false : 10000,
  });

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // WebSocket event handlers
  useEffect(() => {
    const handleNewOrder = (order: any) => {
      console.log('New order received:', order);
      queryClient.invalidateQueries({ queryKey: ['orders', 'active'] });
    };

    const handleOrderUpdated = (order: any) => {
      console.log('Order updated:', order);
      queryClient.invalidateQueries({ queryKey: ['orders', 'active'] });
    };

    on('new_order', handleNewOrder);
    on('order_updated', handleOrderUpdated);

    return () => {
      off('new_order', handleNewOrder);
      off('order_updated', handleOrderUpdated);
    };
  }, [on, off, queryClient]);

  // Helper: Check if item is a kitchen item (not coffee/espresso drinks)
  const isKitchenItem = (itemName: string) => {
    const name = itemName.toLowerCase();
    const coffeeKeywords = ['coffee', 'espresso', 'latte', 'cappuccino', 'americano', 'mocha', 'macchiato', 'cortado', 'flat white'];
    return !coffeeKeywords.some(keyword => name.includes(keyword));
  };

  // Filter orders to only show those with kitchen items
  const ordersWithKitchenItems = activeOrders
    .map((order: any) => ({
      ...order,
      items: order.items.filter((item: any) => isKitchenItem(item.name || item.menu_item_name)),
    }))
    .filter((order: any) => order.items.length > 0); // Only keep orders that have kitchen items

  // Calculate time until pickup and urgency level
  const getPickupUrgency = (pickupTime: string) => {
    const pickup = new Date(pickupTime);
    const now = new Date();
    const minutesUntil = Math.floor((pickup.getTime() - now.getTime()) / 60000);

    if (minutesUntil <= 0) {
      return { level: 'overdue', minutesUntil, label: 'OVERDUE!' };
    } else if (minutesUntil <= 10) {
      return { level: 'urgent', minutesUntil, label: 'URGENT' };
    } else if (minutesUntil <= 20) {
      return { level: 'ready-to-start', minutesUntil, label: 'START NOW' };
    } else if (minutesUntil <= 30) {
      return { level: 'soon', minutesUntil, label: 'SOON' };
    } else {
      return { level: 'scheduled', minutesUntil, label: 'SCHEDULED' };
    }
  };

  const formatTimeUntil = (minutes: number) => {
    if (minutes <= 0) return 'NOW';
    if (minutes < 60) return `in ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `in ${hours}h ${mins}m` : `in ${hours}h`;
  };

  // Separate orders into in-progress (≤30 min) and scheduled (>30 min)
  const inProgressOrders = ordersWithKitchenItems.filter((order: any) => {
    if (!order.pickup_time) return true; // No pickup time = treat as in-progress
    const urgency = getPickupUrgency(order.pickup_time);
    return urgency.level === 'overdue' || urgency.level === 'urgent' || urgency.level === 'ready-to-start' || urgency.level === 'soon';
  });

  const scheduledOrders = ordersWithKitchenItems.filter((order: any) => {
    if (!order.pickup_time) return false;
    const urgency = getPickupUrgency(order.pickup_time);
    return urgency.level === 'scheduled';
  });

  // Count orders that need to start (10-20 min away)
  const ordersToStart = ordersWithKitchenItems.filter((order: any) => {
    if (!order.pickup_time) return false;
    const urgency = getPickupUrgency(order.pickup_time);
    return urgency.level === 'ready-to-start';
  });

  // Sort each group by pickup time
  const sortByPickupTime = (a: any, b: any) => {
    if (!a.pickup_time && !b.pickup_time) return 0;
    if (!a.pickup_time) return 1;
    if (!b.pickup_time) return -1;
    const urgencyA = getPickupUrgency(a.pickup_time);
    const urgencyB = getPickupUrgency(b.pickup_time);
    return urgencyA.minutesUntil - urgencyB.minutesUntil;
  };

  const sortedInProgress = [...inProgressOrders].sort(sortByPickupTime);
  const sortedScheduled = [...scheduledOrders].sort(sortByPickupTime);

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
        return 'bg-blue-900/50 text-blue-300 border-2 border-blue-600';
      case 'preparing':
        return 'bg-yellow-900/50 text-yellow-300 border-2 border-yellow-600';
      case 'ready':
        return 'bg-green-900/50 text-green-300 border-2 border-green-600';
      default:
        return 'bg-stone-700 text-stone-300 border-2 border-stone-600';
    }
  };

  const renderOrderCard = (order: any) => {
    const urgency = order.pickup_time ? getPickupUrgency(order.pickup_time) : null;
    const isOverdue = urgency?.level === 'overdue';
    const isUrgent = urgency?.level === 'urgent';
    const isReadyToStart = urgency?.level === 'ready-to-start';
    const isSoon = urgency?.level === 'soon';

    // Dynamic styling based on urgency
    let bgGradient = 'from-blue-700 to-blue-800';
    let borderColor = 'border-blue-500';
    let textColor = 'text-blue-200';
    let badgeBg = 'bg-blue-600';
    let pulseClass = '';

    if (isOverdue) {
      bgGradient = 'from-red-700 to-red-900';
      borderColor = 'border-red-500';
      textColor = 'text-red-200';
      badgeBg = 'bg-red-500';
      pulseClass = 'animate-pulse';
    } else if (isUrgent) {
      bgGradient = 'from-orange-700 to-red-800';
      borderColor = 'border-orange-500';
      textColor = 'text-orange-200';
      badgeBg = 'bg-orange-500';
      pulseClass = 'animate-pulse';
    } else if (isReadyToStart) {
      bgGradient = 'from-yellow-600 to-yellow-700';
      borderColor = 'border-yellow-500';
      textColor = 'text-yellow-200';
      badgeBg = 'bg-yellow-500';
      pulseClass = 'animate-pulse';
    } else if (isSoon) {
      bgGradient = 'from-amber-700 to-orange-800';
      borderColor = 'border-amber-500';
      textColor = 'text-amber-200';
      badgeBg = 'bg-amber-500';
    }

    return (
      <div
        key={order.id}
        className="bg-stone-800 rounded-xl shadow-2xl p-8 hover:shadow-amber-900/20 transition border-4 border-amber-800/50"
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-3xl font-bold text-amber-400">{order.customer_name}</h3>
            <p className="text-lg text-stone-300 font-semibold">Order #{order.id}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`px-4 py-2 rounded-xl text-sm font-bold uppercase ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
          </div>
        </div>

        {/* Pickup Time */}
        {order.pickup_time && urgency && (
          <div className={`bg-gradient-to-r ${bgGradient} border-2 ${borderColor} rounded-lg p-4 mb-3 shadow-lg ${pulseClass}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className={`text-xs ${textColor} font-bold uppercase tracking-wide`}>Pickup Time</span>
              </div>
              <span className={`${badgeBg} text-white px-3 py-1 rounded-full text-xs font-bold uppercase shadow-lg`}>
                {urgency.label}
              </span>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white font-mono">
                {new Date(order.pickup_time).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })}
              </div>
              <div className={`text-sm ${textColor} mt-1 font-bold`}>
                {formatTimeUntil(urgency.minutesUntil)}
              </div>
            </div>
          </div>
        )}

        {/* Kitchen Items Only */}
        <div className="bg-stone-900/50 rounded-xl p-5 mb-6 border-2 border-stone-700">
          <h4 className="text-sm font-bold text-amber-600 uppercase mb-3 tracking-wide">🍽️ KITCHEN ITEMS:</h4>
          <div className="space-y-3">
            {order.items.map((item: any, idx: number) => (
              <div key={idx} className="border-l-4 border-amber-600 pl-4 py-2 bg-stone-800/50 rounded">
                <div className="flex items-baseline gap-3">
                  <span className="text-amber-400 font-bold text-4xl min-w-[70px]">{item.quantity}×</span>
                  <span className="font-bold text-white text-2xl">{item.name || item.menu_item_name}</span>
                </div>
                {item.customizations && (
                  <div className="mt-2 ml-[82px] space-y-1">
                    {/* Regular customizations */}
                    {Object.entries(item.customizations)
                      .filter(([k]) => k !== 'notes')
                      .length > 0 && (
                      <p className="text-stone-300 text-lg">
                        {Object.entries(item.customizations)
                          .filter(([k]) => k !== 'notes')
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(', ')}
                      </p>
                    )}
                    {/* Notes with special styling */}
                    {item.customizations.notes && (
                      <div className="text-lg bg-amber-900/30 border-l-4 border-amber-500 pl-3 py-2 text-amber-200 font-semibold">
                        💬 {item.customizations.notes}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {order.status === 'received' && (
            <button
              onClick={() => updateOrderStatus(order.id, 'preparing')}
              className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 text-white py-6 rounded-xl hover:from-yellow-700 hover:to-yellow-800 transition font-bold uppercase text-2xl shadow-xl active:scale-95 border-4 border-yellow-500"
            >
              ▶️ START COOKING
            </button>
          )}
          {order.status === 'preparing' && (
            <button
              onClick={() => updateOrderStatus(order.id, 'ready')}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-6 rounded-xl hover:from-green-700 hover:to-green-800 transition font-bold uppercase text-2xl shadow-xl active:scale-95 border-4 border-green-500"
            >
              ✓ FOOD READY
            </button>
          )}
          {order.status === 'ready' && (
            <div className="w-full bg-green-900/50 border-4 border-green-500 text-green-200 py-6 rounded-xl text-center font-bold uppercase text-2xl">
              ✓ READY FOR PICKUP
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-4xl font-bold text-stone-100 distressed-text drop-shadow-lg">KITCHEN QUEUE</h1>
          <div className="bg-amber-600 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-lg flex items-center gap-2">
            <span>🍽️</span>
            <span>FOOD ONLY</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-4 h-4 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
          <span className="text-base text-stone-200 font-bold">
            {isConnected ? 'LIVE' : 'OFFLINE'}
          </span>
        </div>
      </div>

      {/* Alert Banner for Kitchen Orders Ready to Start */}
      {ordersToStart.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-600 to-orange-600 border-4 border-yellow-500 rounded-xl p-6 mb-8 shadow-2xl animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white text-yellow-600 rounded-full p-4">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-white uppercase">🍳 TIME TO COOK!</h3>
                <p className="text-xl text-yellow-100 font-semibold mt-1">
                  {ordersToStart.length} kitchen {ordersToStart.length === 1 ? 'order needs' : 'orders need'} to start (10-20 min until pickup)
                </p>
              </div>
            </div>
            <div className="bg-white text-yellow-600 rounded-xl px-8 py-4 font-bold text-5xl shadow-xl">
              {ordersToStart.length}
            </div>
          </div>
        </div>
      )}

      {/* IN PROGRESS Section */}
      <div>
        <div className="flex items-center gap-4 mb-6 bg-gradient-to-r from-orange-900/50 to-red-900/50 border-l-8 border-orange-500 p-5 rounded-lg shadow-xl">
          <span className="text-4xl">⚡</span>
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-orange-300 distressed-text">IN PROGRESS</h2>
            <p className="text-orange-200 font-semibold text-sm mt-1">Pickup in ≤30 minutes - Cook these NOW!</p>
          </div>
          <div className="bg-orange-600 text-white px-6 py-3 rounded-xl font-bold text-3xl shadow-lg">
            {sortedInProgress.length}
          </div>
        </div>

        {sortedInProgress.length === 0 ? (
          <div className="bg-stone-800 rounded-xl shadow-2xl p-12 text-center border-4 border-stone-700">
            <p className="text-xl text-stone-400">✓ All caught up! No urgent kitchen items.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {sortedInProgress.map(renderOrderCard)}
          </div>
        )}
      </div>

      {/* SCHEDULED Section */}
      {sortedScheduled.length > 0 && (
        <div className="mt-12">
          <div className="flex items-center gap-4 mb-6 bg-gradient-to-r from-blue-900/50 to-blue-800/50 border-l-8 border-blue-500 p-5 rounded-lg shadow-xl">
            <span className="text-4xl">📅</span>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-blue-300 distressed-text">SCHEDULED</h2>
              <p className="text-blue-200 font-semibold text-sm mt-1">Pickup in &gt;30 minutes - Prepare closer to pickup time</p>
            </div>
            <div className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-3xl shadow-lg">
              {sortedScheduled.length}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {sortedScheduled.map(renderOrderCard)}
          </div>
        </div>
      )}

      {ordersWithKitchenItems.length === 0 && (
        <div className="bg-stone-800 rounded-xl shadow-2xl p-12 text-center border-4 border-amber-800/50">
          <p className="text-xl text-stone-300">No kitchen orders</p>
          <p className="text-sm text-stone-400 mt-2">Current orders only contain drinks (prepared at front counter)</p>
        </div>
      )}
    </div>
  );
}
