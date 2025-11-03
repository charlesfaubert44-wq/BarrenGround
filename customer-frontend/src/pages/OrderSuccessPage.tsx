import { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';

export default function OrderSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [trackingToken] = useState(searchParams.get('token'));
  const [orderId] = useState(searchParams.get('orderId'));
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${orderId}`);
        if (response.ok) {
          const data = await response.json();
          setOrder(data);
        }
      } catch (error) {
        console.error('Failed to fetch order:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  // Hide confetti after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Generate confetti elements
  const generateConfetti = () => {
    const colors = ['#f59e0b', '#d97706', '#92400e', '#fbbf24', '#f97316', '#22c55e', '#10b981'];
    const confettiElements = [];
    for (let i = 0; i < 50; i++) {
      confettiElements.push(
        <div
          key={i}
          className="confetti"
          style={{
            left: `${Math.random() * 100}%`,
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
          }}
        />
      );
    }
    return confettiElements;
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-amber-900 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading your order...</p>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-green-50 via-amber-50 to-white py-12 px-4 relative overflow-hidden">
      {/* Confetti */}
      {showConfetti && generateConfetti()}

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Success Header */}
        <div className="bg-gradient-to-br from-white to-green-50 rounded-3xl shadow-2xl p-8 text-center mb-6 border-2 border-green-100 celebrate">
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl bounce-in">
            <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-500 mb-4">
            Order Placed Successfully! 🎉
          </h1>

          <p className="text-xl text-gray-700 mb-6 leading-relaxed">
            Thank you for your order. We're preparing your delicious items now!
          </p>

          {trackingToken && (
            <div className="bg-gradient-to-br from-amber-100 to-orange-100 border-2 border-amber-300 rounded-2xl p-6 mb-4 shadow-lg scale-in" style={{ animationDelay: '0.3s' }}>
              <p className="text-sm text-gray-700 mb-2 font-semibold">Your Order Tracking Number</p>
              <p className="text-2xl sm:text-3xl font-bold text-amber-900 mb-3 font-mono tracking-wide">
                {trackingToken}
              </p>
              <p className="text-sm text-gray-700">
                Use this number to track your order status ✨
              </p>
            </div>
          )}
        </div>

        {/* Order Details */}
        {order && (
          <div className="bg-gradient-to-br from-white to-amber-50 rounded-3xl shadow-2xl p-6 sm:p-8 mb-6 border-2 border-amber-100 fade-in" style={{ animationDelay: '0.5s' }}>
            <h2 className="text-3xl font-bold mb-6 gradient-text">Order Details</h2>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-amber-900 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <div>
                  <p className="font-semibold text-gray-900">Order Number</p>
                  <p className="text-gray-600">#{order.id}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-amber-900 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-semibold text-gray-900">Pickup Time</p>
                  <p className="text-gray-600">{formatPickupTime(order.pickupTime)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-amber-900 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 mb-2">Items Ordered</p>
                  <div className="space-y-2">
                    {order.items && order.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>{item.quantity}x {item.name || item.menu_item_name}</span>
                        <span className="font-semibold">${((item.price || item.price_snapshot) * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Paid</span>
                  <span className="text-amber-900">${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="bg-gradient-to-br from-white to-amber-50 rounded-3xl shadow-2xl p-6 border-2 border-amber-100 scale-in" style={{ animationDelay: '0.7s' }}>
          <div className="space-y-3">
            {trackingToken && (
              <button
                onClick={() => navigate(`/track/${trackingToken}`)}
                className="w-full bg-gradient-to-r from-amber-900 via-orange-800 to-amber-900 text-white py-4 rounded-xl hover:shadow-2xl transition-all font-bold text-lg shadow-xl flex items-center justify-center gap-2 transform hover:scale-105 pulse-glow"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                Track My Order
              </button>
            )}

            <Link
              to="/menu"
              className="block w-full border-2 border-amber-900 text-amber-900 py-4 rounded-xl hover:bg-amber-900 hover:text-white transition-all font-bold text-lg text-center transform hover:scale-105"
            >
              Order More Items ☕
            </Link>

            <Link
              to="/account"
              className="block w-full text-gray-700 hover:text-amber-900 py-3 text-center transition-all font-semibold"
            >
              View Order History →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
