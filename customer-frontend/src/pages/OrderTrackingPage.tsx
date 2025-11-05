import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { apiRequest } from '../api/client';
import { useAuthStore } from '../store/authStore';

interface Order {
  id: number;
  trackingToken: string;
  customer_name: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    customizations?: any;
  }>;
  total: number;
  pickupTime: string;
  status: 'received' | 'preparing' | 'ready' | 'cancelled';
  received_at: string;
  preparing_at?: string;
  ready_at?: string;
  cancelled_at?: string;
  cannot_complete_reason?: string;
  created_at: string;
}

export default function OrderTrackingPage() {
  const { token } = useParams<{ token: string }>();
  const { isAuthenticated } = useAuthStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setSocket] = useState<Socket | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [, setPickupTimeRemaining] = useState<number>(0);
  const [customerStatus, setCustomerStatus] = useState<'on-my-way' | 'delayed' | 'wont-make-it' | null>(null);

  // Fetch order by tracking token
  useEffect(() => {
    if (!token) {
      setError('No tracking token provided');
      setIsLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const data = await apiRequest<Order>(`/api/orders/track/${token}`);
        setOrder(data);
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch order:', err);
        setError(err.message || 'Order not found');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [token]);

  // Connect to WebSocket for real-time updates
  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8888';
    const newSocket = io(wsUrl);

    newSocket.on('order_updated', (updatedOrder: Order) => {
      if (updatedOrder.trackingToken === token) {
        setOrder(updatedOrder);
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [token]);

  // Calculate elapsed time since order received
  useEffect(() => {
    if (!order || !order.received_at) return;

    const updateElapsedTime = () => {
      const receivedTime = new Date(order.received_at).getTime();
      const now = Date.now();
      const elapsed = Math.floor((now - receivedTime) / 1000); // seconds
      setElapsedTime(elapsed);
    };

    updateElapsedTime();
    const interval = setInterval(updateElapsedTime, 1000);

    return () => clearInterval(interval);
  }, [order]);

  // Calculate pickup time remaining (10 minutes from ready_at)
  useEffect(() => {
    if (!order || !order.ready_at || order.status !== 'ready') return;

    const updatePickupTime = () => {
      const readyTime = new Date(order.ready_at!).getTime();
      const pickupDeadline = readyTime + 10 * 60 * 1000; // 10 minutes
      const now = Date.now();
      const remaining = Math.max(0, pickupDeadline - now);
      setPickupTimeRemaining(remaining);
    };

    updatePickupTime();
    const interval = setInterval(updatePickupTime, 1000);

    return () => clearInterval(interval);
  }, [order]);

  const formatElapsedTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPickupTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusStep = (status: string) => {
    const steps = ['received', 'preparing', 'ready'];
    return steps.indexOf(status) + 1;
  };

  const isStepCompleted = (stepStatus: string) => {
    if (!order) return false;
    if (order.status === 'cancelled') return false;
    const currentStep = getStatusStep(order.status);
    const thisStep = getStatusStep(stepStatus);
    return currentStep >= thisStep;
  };

  const isStepActive = (stepStatus: string) => {
    if (!order) return false;
    return order.status === stepStatus;
  };

  const handleCustomerStatus = async (status: 'on-my-way' | 'delayed' | 'wont-make-it') => {
    try {
      setCustomerStatus(status);

      // Call API to update customer status
      await apiRequest(`/api/orders/track/${token}/customer-status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerStatus: status }),
      });
    } catch (error) {
      console.error('Failed to update customer status:', error);
      // Reset status on error
      setCustomerStatus(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-amber-600 mx-auto mb-4"></div>
          <p className="text-xl text-stone-300">Loading order...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-stone-800 rounded-2xl shadow-2xl p-8 text-center border-2 border-amber-600">
          <div className="w-20 h-20 bg-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-stone-100 mb-4 distressed-text uppercase">Track Your Orders</h1>
          <p className="text-stone-300 mb-6 leading-relaxed">
            Create a free account to track your orders in real-time, save your favorites, and unlock exclusive membership rewards!
          </p>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-sm text-stone-300 bg-stone-900/50 rounded-lg p-3">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Real-time order status updates</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-stone-300 bg-stone-900/50 rounded-lg p-3">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Save favorites & order history</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-stone-300 bg-stone-900/50 rounded-lg p-3">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Exclusive membership discounts</span>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              to="/register"
              state={{ returnTo: `/track/${token}` }}
              className="block w-full bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700 text-white py-4 rounded-xl font-bold shadow-xl transition-all uppercase tracking-wider"
            >
              Create Free Account
            </Link>
            <Link
              to="/login"
              state={{ returnTo: `/track/${token}` }}
              className="block w-full bg-stone-700 hover:bg-stone-600 text-white py-4 rounded-xl font-bold shadow-xl transition-all uppercase tracking-wider"
            >
              Login
            </Link>
            <Link
              to="/menu"
              className="block w-full text-stone-400 hover:text-amber-500 py-2 text-center transition-all"
            >
              Back to Menu →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-stone-800 rounded-2xl shadow-2xl p-8 text-center border-2 border-red-600/50">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-stone-100 mb-4">Order Not Found</h1>
          <p className="text-stone-300 mb-6">{error || 'Unable to find order with this tracking number'}</p>
          <Link
            to="/menu"
            className="block w-full bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700 text-white py-3 rounded-xl font-bold shadow-xl transition-all"
          >
            Back to Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {/* Header Card */}
        <div className="bg-stone-800 rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 border-2 border-stone-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-4">
            <h1 className="text-xl sm:text-3xl font-bold text-stone-100 distressed-text">
              ORDER TRACKING
            </h1>
            <div className="sm:text-right">
              <p className="text-xs text-stone-400 uppercase tracking-wide">Order #</p>
              <p className="text-xl sm:text-2xl font-bold text-amber-500">#{order.id}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            <div className="bg-stone-900/50 border border-stone-600 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <p className="text-xs text-stone-400 uppercase tracking-wide mb-1">Tracking Number</p>
              <p className="text-sm sm:text-lg font-bold text-amber-500 font-mono break-all">{order.trackingToken}</p>
            </div>
            <div className="bg-gradient-to-r from-green-700 to-green-800 border-2 border-green-500 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-lg shadow-green-900/50">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-green-200 uppercase tracking-wide font-bold">Pickup Time</p>
              </div>
              <p className="text-lg sm:text-2xl font-bold text-white">{formatPickupTime(order.pickupTime)}</p>
            </div>
          </div>
        </div>

        {/* Status Timeline */}
        {order.status !== 'cancelled' ? (
          <div className="bg-stone-800 rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-8 border-2 border-stone-700">
            <h2 className="text-lg sm:text-xl font-bold text-stone-100 mb-4 sm:mb-6 uppercase tracking-wide">Order Status</h2>

            {/* Timeline */}
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute left-4 sm:left-6 top-0 bottom-0 w-0.5 sm:w-1 bg-stone-700"></div>
              <div
                className="absolute left-4 sm:left-6 top-0 w-0.5 sm:w-1 bg-gradient-to-b from-green-600 to-green-500 transition-all duration-1000"
                style={{
                  height: `${((getStatusStep(order.status) - 1) / 2) * 100}%`
                }}
              ></div>

              {/* Timeline Steps */}
              <div className="space-y-6 sm:space-y-8 relative">
                {/* Received */}
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className={`w-8 h-8 sm:w-12 sm:h-12 flex-shrink-0 rounded-full flex items-center justify-center border-2 sm:border-4 z-10 transition-all ${
                    isStepCompleted('received')
                      ? 'bg-green-600 border-green-600 shadow-lg shadow-green-600/50'
                      : 'bg-stone-800 border-stone-700'
                  }`}>
                    <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1 pt-0 sm:pt-2">
                    <h3 className="text-base sm:text-lg font-bold text-stone-100">Order Received</h3>
                    <p className="text-xs sm:text-sm text-stone-400">Your order has been confirmed</p>
                    {order.received_at && (
                      <p className="text-xs text-amber-500 mt-1">
                        {new Date(order.received_at).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Preparing */}
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className={`w-8 h-8 sm:w-12 sm:h-12 flex-shrink-0 rounded-full flex items-center justify-center border-2 sm:border-4 z-10 transition-all ${
                    isStepActive('preparing')
                      ? 'bg-amber-600 border-amber-600 shadow-lg shadow-amber-600/50 animate-pulse'
                      : isStepCompleted('preparing')
                      ? 'bg-green-600 border-green-600 shadow-lg shadow-green-600/50'
                      : 'bg-stone-800 border-stone-700'
                  }`}>
                    <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div className="flex-1 pt-0 sm:pt-2">
                    <h3 className="text-base sm:text-lg font-bold text-stone-100">Preparing</h3>
                    <p className="text-xs sm:text-sm text-stone-400">Your order is being prepared</p>
                    {order.preparing_at && (
                      <p className="text-xs text-amber-500 mt-1">
                        Started at {new Date(order.preparing_at).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Ready */}
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className={`w-8 h-8 sm:w-12 sm:h-12 flex-shrink-0 rounded-full flex items-center justify-center border-2 sm:border-4 z-10 transition-all ${
                    isStepActive('ready')
                      ? 'bg-green-600 border-green-600 shadow-lg shadow-green-600/50 animate-pulse'
                      : isStepCompleted('ready')
                      ? 'bg-green-600 border-green-600 shadow-lg shadow-green-600/50'
                      : 'bg-stone-800 border-stone-700'
                  }`}>
                    <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 pt-0 sm:pt-2">
                    <h3 className="text-base sm:text-lg font-bold text-green-400">Ready for Pickup!</h3>
                    <p className="text-xs sm:text-sm text-stone-300 font-semibold">Your order is ready at the counter</p>
                    {order.ready_at && (
                      <div className="mt-2 sm:mt-3 space-y-2 sm:space-y-3">
                        <p className="text-xs text-amber-400">
                          Ready at {new Date(order.ready_at).toLocaleTimeString()}
                        </p>
                        <div className="bg-gradient-to-r from-stone-800 to-stone-900 border-2 border-stone-600 rounded-lg p-3 sm:p-4">
                          <p className="text-xs text-stone-300 uppercase tracking-wide mb-2 sm:mb-3 font-bold">Update Staff</p>
                          {customerStatus ? (
                            <div className="text-center space-y-2">
                              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm ${
                                customerStatus === 'on-my-way' ? 'bg-green-700 text-white' :
                                customerStatus === 'delayed' ? 'bg-amber-700 text-white' :
                                'bg-red-700 text-white'
                              }`}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>
                                  {customerStatus === 'on-my-way' ? "On my way!" :
                                   customerStatus === 'delayed' ? "Just delayed" :
                                   "Won't make it"}
                                </span>
                              </div>
                              <p className="text-xs text-stone-400">Staff has been notified</p>
                              <button
                                onClick={() => setCustomerStatus(null)}
                                className="text-xs text-stone-400 hover:text-stone-200 underline transition"
                              >
                                Change status
                              </button>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <button
                                onClick={() => handleCustomerStatus('on-my-way')}
                                className="bg-gradient-to-r from-green-700 to-green-800 hover:from-green-600 hover:to-green-700 text-white py-2 px-3 rounded-lg font-bold transition-all transform hover:scale-105 uppercase tracking-wide text-xs sm:text-sm"
                              >
                                On my way!
                              </button>
                              <button
                                onClick={() => handleCustomerStatus('delayed')}
                                className="bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700 text-white py-2 px-3 rounded-lg font-bold transition-all transform hover:scale-105 uppercase tracking-wide text-xs sm:text-sm"
                              >
                                Just delayed
                              </button>
                              <button
                                onClick={() => handleCustomerStatus('wont-make-it')}
                                className="bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 text-white py-2 px-3 rounded-lg font-bold transition-all transform hover:scale-105 uppercase tracking-wide text-xs sm:text-sm"
                              >
                                Won't make it
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Elapsed Time */}
            {order.status !== 'ready' && (
              <div className="mt-8 bg-stone-900/50 border-2 border-amber-600 rounded-xl p-4 text-center">
                <p className="text-sm text-stone-400 uppercase tracking-wide mb-1">Time Elapsed</p>
                <p className="text-3xl font-bold text-amber-500 font-mono">{formatElapsedTime(elapsedTime)}</p>
              </div>
            )}
          </div>
        ) : (
          /* Cancelled Status */
          <div className="bg-stone-800 rounded-2xl shadow-2xl p-6 sm:p-8 border-2 border-red-600/50">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-red-500 mb-4">Order Cancelled</h2>
              {order.cannot_complete_reason && (
                <div className="bg-stone-900/50 border border-red-600 rounded-xl p-4 mb-4">
                  <p className="text-sm text-stone-400 uppercase tracking-wide mb-2">Reason</p>
                  <p className="text-stone-100">{order.cannot_complete_reason}</p>
                </div>
              )}
              <p className="text-stone-300 mb-6">
                We apologize for the inconvenience. Please contact us or place a new order.
              </p>
              <Link
                to="/menu"
                className="inline-block bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700 text-white px-8 py-3 rounded-xl font-bold shadow-xl transition-all"
              >
                Back to Menu
              </Link>
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="bg-stone-800 rounded-2xl shadow-2xl p-6 border-2 border-stone-700">
          <h2 className="text-xl font-bold text-stone-100 mb-4 uppercase tracking-wide">Order Items</h2>
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div key={index} className="bg-stone-900/50 border border-stone-600 rounded-xl p-4 flex justify-between items-start">
                <div>
                  <p className="font-bold text-stone-100">
                    {item.quantity}x {item.name}
                  </p>
                  {item.customizations && Object.keys(item.customizations).length > 0 && (
                    <div className="mt-1 space-y-1">
                      {/* Regular customizations */}
                      {Object.entries(item.customizations)
                        .filter(([key, value]) => value && value !== 'None' && key !== 'notes')
                        .length > 0 && (
                        <p className="text-sm text-amber-500">
                          {Object.entries(item.customizations)
                            .filter(([key, value]) => value && value !== 'None' && key !== 'notes')
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(', ')}
                        </p>
                      )}
                      {/* Notes with special styling */}
                      {item.customizations.notes && (
                        <div className="text-sm bg-amber-900/20 border-l-2 border-amber-500 pl-2 py-1 text-amber-300">
                          <span className="font-semibold">💬 Note:</span> <em>{item.customizations.notes}</em>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-lg font-bold text-stone-100">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t-2 border-stone-700 flex justify-between items-center">
            <p className="text-xl font-bold text-stone-100 uppercase">Total</p>
            <p className="text-2xl font-bold text-amber-500">${order.total.toFixed(2)}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Link
            to="/menu"
            className="flex-1 bg-gradient-to-r from-green-700 to-green-800 hover:from-green-600 hover:to-green-700 text-white py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-center shadow-xl transition-all uppercase tracking-wider text-sm sm:text-base"
          >
            Order More
          </Link>
          <Link
            to="/"
            className="flex-1 bg-stone-700 hover:bg-stone-600 text-white py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-center shadow-xl transition-all uppercase tracking-wider text-sm sm:text-base"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
