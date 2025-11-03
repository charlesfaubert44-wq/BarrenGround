import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Guest checkout form
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [pickupTime, setPickupTime] = useState('');

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items, navigate]);

  const subtotal = getTotalPrice();
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  if (items.length === 0) {
    return null;
  }

  // Generate default pickup times (next 15 min intervals for next 4 hours)
  const generatePickupTimes = () => {
    const times = [];
    const now = new Date();
    // Start from 30 minutes from now
    now.setMinutes(now.getMinutes() + 30);
    // Round to next 15 min
    now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15);
    now.setSeconds(0);

    for (let i = 0; i < 16; i++) {
      const time = new Date(now);
      time.setMinutes(time.getMinutes() + (i * 15));
      times.push(time);
    }
    return times;
  };

  const pickupTimes = generatePickupTimes();

  const handlePlaceOrder = async () => {
    if (!isAuthenticated && (!guestName || !guestEmail)) {
      setError('Please fill in your name and email');
      return;
    }

    if (!pickupTime) {
      setError('Please select a pickup time');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const orderData = {
        items: items.map(item => ({
          menu_item_id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          customizations: item.customizations,
        })),
        total: total,
        pickupTime: pickupTime,
        guestInfo: isAuthenticated ? undefined : {
          name: guestName,
          email: guestEmail,
          phone: guestPhone || undefined,
        },
        userId: isAuthenticated && user ? user.id : undefined,
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(isAuthenticated ? { 'Authorization': `Bearer ${localStorage.getItem('auth-token')}` } : {}),
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const order = await response.json();

      // Clear cart
      clearCart();

      // Redirect to order success page with tracking token
      navigate(`/order-success?token=${order.trackingToken}&orderId=${order.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-amber-50 via-orange-50 to-white py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-8 fade-in">Checkout 🛒</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Customer Information */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gradient-to-br from-white to-amber-50 rounded-3xl shadow-2xl p-6 border-2 border-amber-100 scale-in">
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 gradient-text">
                {isAuthenticated ? 'Your Information' : 'Guest Checkout'}
              </h2>

              {isAuthenticated ? (
                <div className="space-y-3 bg-amber-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-amber-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <p><strong>Name:</strong> {user?.name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-amber-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <p><strong>Email:</strong> {user?.email}</p>
                  </div>
                  {user?.phone && (
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-amber-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <p><strong>Phone:</strong> {user.phone}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="guestName" className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="guestName"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-900 focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label htmlFor="guestEmail" className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="guestEmail"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-900 focus:border-transparent"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="guestPhone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone (optional)
                    </label>
                    <input
                      type="tel"
                      id="guestPhone"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-900 focus:border-transparent"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Pickup Time */}
            <div className="bg-gradient-to-br from-white to-amber-50 rounded-3xl shadow-2xl p-6 border-2 border-amber-100 scale-in" style={{ animationDelay: '0.1s' }}>
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 gradient-text">Pickup Time ⏰</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {pickupTimes.map((time, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPickupTime(time.toISOString())}
                    className={`p-3 rounded-xl border-2 transition-all font-semibold transform hover:scale-105 ${
                      pickupTime === time.toISOString()
                        ? 'border-amber-900 bg-gradient-to-br from-amber-900 to-orange-800 text-white shadow-xl'
                        : 'border-amber-300 hover:border-amber-900 hover:bg-amber-50 bg-white'
                    }`}
                  >
                    <div className="text-sm font-bold">
                      {time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                    </div>
                    <div className="text-xs opacity-80">
                      {time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Place Order Button */}
            <div className="bg-gradient-to-br from-white to-green-50 rounded-3xl shadow-2xl p-6 border-2 border-green-100 scale-in" style={{ animationDelay: '0.2s' }}>
              {error && (
                <div className="bg-red-100 border-2 border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4 flex items-center gap-2 font-semibold">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}

              <button
                onClick={handlePlaceOrder}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-600 via-green-500 to-green-600 text-white py-4 rounded-xl hover:shadow-2xl transition-all font-bold text-xl shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:scale-105 pulse-glow"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Placing Order...
                  </span>
                ) : (
                  'Place Order 🎉'
                )}
              </button>

              <p className="text-sm text-gray-600 text-center mt-3 font-medium">
                By placing this order, you agree to our terms and conditions
              </p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-white to-amber-50 rounded-3xl shadow-2xl p-6 sticky top-20 border-2 border-amber-100 fade-in">
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 gradient-text">Order Summary</h2>

              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {items.map((item, idx) => (
                  <div key={idx} className="flex justify-between py-2 border-b-2 border-amber-100">
                    <span className="flex-1 text-gray-800">
                      <span className="font-bold text-amber-900">{item.quantity}x</span> {item.name}
                    </span>
                    <span className="font-bold text-amber-900 text-lg">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-amber-200 pt-4 space-y-3">
                <div className="flex justify-between text-gray-700 text-lg">
                  <span className="font-semibold">Subtotal</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700 text-lg">
                  <span className="font-semibold">Tax (8%)</span>
                  <span className="font-semibold">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-2xl sm:text-3xl font-bold border-t-2 border-amber-300 pt-4">
                  <span className="text-gray-900">Total</span>
                  <span className="text-amber-900">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
