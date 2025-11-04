import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiRequest } from '../api/client';

export default function OrderSuccessPage() {
  const [searchParams] = useSearchParams();
  const [trackingToken] = useState(searchParams.get('token'));
  const [orderId] = useState(searchParams.get('orderId'));
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await apiRequest<any>(`/api/orders/${orderId}`);
        setOrder(data);
      } catch (error) {
        console.error('Failed to fetch order:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);


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

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-xl text-stone-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full">
        {/* Main Success Card */}
        <div className="bg-stone-800 rounded-2xl shadow-2xl p-6 sm:p-10 text-center border-4 border-green-600/50">
          {/* Success Icon */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
            <svg className="w-10 h-10 sm:w-14 sm:h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Congratulations Text */}
          <h1 className="text-3xl sm:text-5xl font-bold text-stone-100 mb-4 distressed-text">
            CONGRATULATIONS!
          </h1>

          <p className="text-xl sm:text-2xl text-green-400 mb-8 font-bold">
            Your order has been placed
          </p>

          {/* Order Info */}
          {order && (
            <div className="space-y-4 mb-8">
              <div className="bg-stone-900/50 border-2 border-stone-600 rounded-xl p-4">
                <p className="text-sm text-stone-400 uppercase tracking-wide mb-1">Order Number</p>
                <p className="text-2xl sm:text-3xl font-bold text-amber-500">#{order.id}</p>
              </div>

              <div className="bg-stone-900/50 border-2 border-stone-600 rounded-xl p-4">
                <p className="text-sm text-stone-400 uppercase tracking-wide mb-1">Pickup Time</p>
                <p className="text-lg sm:text-xl font-bold text-stone-100">{formatPickupTime(order.pickupTime)}</p>
              </div>

              {trackingToken && (
                <div className="bg-stone-900/50 border-2 border-amber-600 rounded-xl p-4">
                  <p className="text-sm text-stone-400 uppercase tracking-wide mb-1">Tracking Number</p>
                  <p className="text-lg sm:text-xl font-bold text-amber-500 font-mono">{trackingToken}</p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {trackingToken && (
              <Link
                to={`/track/${trackingToken}`}
                className="block w-full bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700 text-white py-4 rounded-xl font-bold text-lg shadow-xl transition-all transform hover:scale-105 uppercase tracking-wider"
              >
                Track Your Order
              </Link>
            )}

            <Link
              to="/menu"
              className="block w-full bg-gradient-to-r from-green-700 to-green-800 hover:from-green-600 hover:to-green-700 text-white py-4 rounded-xl font-bold text-lg shadow-xl transition-all transform hover:scale-105 uppercase tracking-wider"
            >
              Order More Items
            </Link>

            <Link
              to="/"
              className="block w-full text-stone-400 hover:text-amber-500 py-3 text-center transition-all font-semibold"
            >
              Return to Home →
            </Link>
          </div>

          {/* Footer */}
          <p className="text-sm text-stone-500 mt-8 font-semibold">
            Northern roasted. Community powered.
          </p>
        </div>
      </div>
    </div>
  );
}
