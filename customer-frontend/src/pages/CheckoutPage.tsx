import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { useMembershipStore } from '../store/membershipStore';
import { getMembershipStatus } from '../api/membership';
import { getBalance } from '../api/loyalty';
import { apiRequest } from '../api/client';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const { membership, setMembership } = useMembershipStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [useMembership, setUseMembership] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Loyalty points
  const [usePoints, setUsePoints] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);

  // Guest checkout form
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [pickupTime, setPickupTime] = useState('');

  // Fetch membership status
  const { data: statusData } = useQuery({
    queryKey: ['membershipStatus'],
    queryFn: getMembershipStatus,
    enabled: isAuthenticated,
  });

  // Fetch loyalty points balance
  const { data: loyaltyBalance } = useQuery({
    queryKey: ['loyaltyBalance'],
    queryFn: getBalance,
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (statusData?.membership) {
      setMembership(statusData.membership);
    }
  }, [statusData, setMembership]);

  useEffect(() => {
    // Don't redirect if we're currently placing an order
    if (items.length === 0 && !isPlacingOrder) {
      navigate('/cart');
    }
  }, [items, navigate, isPlacingOrder]);

  // Check if cart has a coffee item
  const hasCoffeeInCart = items.some(item =>
    item.name.toLowerCase().includes('coffee') ||
    item.name.toLowerCase().includes('espresso') ||
    item.name.toLowerCase().includes('latte') ||
    item.name.toLowerCase().includes('cappuccino') ||
    item.name.toLowerCase().includes('americano') ||
    item.name.toLowerCase().includes('mocha')
  );

  const canUseMembership = membership?.status === 'active' &&
                           membership?.canRedeemToday &&
                           membership?.coffees_remaining > 0 &&
                           hasCoffeeInCart;

  // Calculate membership discount
  let membershipDiscount = 0;
  if (useMembership && canUseMembership) {
    const coffeeItem = items.find(item =>
      item.name.toLowerCase().includes('coffee') ||
      item.name.toLowerCase().includes('espresso') ||
      item.name.toLowerCase().includes('latte') ||
      item.name.toLowerCase().includes('cappuccino') ||
      item.name.toLowerCase().includes('americano') ||
      item.name.toLowerCase().includes('mocha')
    );
    if (coffeeItem) {
      membershipDiscount = coffeeItem.price;
    }
  }

  const subtotal = getTotalPrice();

  // Calculate points discount (100 points = $5)
  const pointsDiscount = usePoints && pointsToRedeem >= 100 ? (pointsToRedeem / 100) * 5 : 0;

  // Calculate max redeemable points
  const maxRedeemablePoints = loyaltyBalance?.points
    ? Math.min(
        Math.floor(loyaltyBalance.points / 100) * 100, // Round down to nearest 100
        Math.floor((subtotal - membershipDiscount) / 5) * 100 // Can't exceed order total
      )
    : 0;

  const subtotalAfterDiscount = Math.max(0, subtotal - membershipDiscount - pointsDiscount);
  const tax = subtotalAfterDiscount * 0.08;
  const total = subtotalAfterDiscount + tax;

  if (items.length === 0) {
    return null;
  }

  // Generate default pickup times (next 15 min intervals for next 4 hours)
  // Use useMemo to prevent regeneration on every render
  const pickupTimes = useMemo(() => {
    const times = [];
    const now = new Date();

    // Add ASAP option (20 minutes from now)
    const asap = new Date();
    asap.setMinutes(asap.getMinutes() + 20);
    asap.setMinutes(Math.ceil(asap.getMinutes() / 5) * 5);
    asap.setSeconds(0);
    asap.setMilliseconds(0);
    times.push({ time: asap, label: 'ASAP', timeString: asap.toISOString() });

    // Start from 30 minutes from now for scheduled times
    now.setMinutes(now.getMinutes() + 30);
    now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15);
    now.setSeconds(0);
    now.setMilliseconds(0);

    for (let i = 0; i < 15; i++) {
      const time = new Date(now);
      time.setMinutes(time.getMinutes() + (i * 15));
      time.setMilliseconds(0);
      times.push({ time, label: null, timeString: time.toISOString() });
    }
    return times;
  }, []);

  // Auto-select ASAP if nothing selected
  useEffect(() => {
    if (!pickupTime && pickupTimes.length > 0) {
      setPickupTime(pickupTimes[0].timeString);
    }
  }, [pickupTime, pickupTimes]);

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
    setIsPlacingOrder(true);
    setError('');

    try {
      const orderData = {
        items: items.map(item => ({
          menu_item_id: item.id,
          menu_item_name: item.name,
          quantity: item.quantity,
          price_snapshot: item.price,
          customizations: item.customizations,
        })),
        total: total,
        pickup_time: pickupTime,
        useMembership: useMembership && canUseMembership,
        redeemPoints: usePoints && pointsToRedeem >= 100 ? pointsToRedeem : undefined,
        guest_name: !isAuthenticated ? guestName : undefined,
        guest_email: !isAuthenticated ? guestEmail : undefined,
        guest_phone: !isAuthenticated && guestPhone ? guestPhone : undefined,
      };

      const order = await apiRequest<{id: number, trackingToken: string}>('/api/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });

      // Clear cart first
      clearCart();

      // Navigate to order success page - isPlacingOrder flag prevents redirect to /cart
      navigate(`/order-success?token=${order.trackingToken}&orderId=${order.id}`);
    } catch (err: any) {
      // Handle different error formats from the backend
      let errorMessage = 'Failed to place order. Please try again.';
      if (err.error) {
        errorMessage = err.error;
        // Include details if available (development mode)
        if (err.details) {
          errorMessage += `: ${err.details}`;
        }
      } else if (err.errors && Array.isArray(err.errors)) {
        // Handle express-validator errors array
        errorMessage = err.errors.map((e: any) => e.msg || e.message).join(', ');
      } else if (err.message) {
        errorMessage = err.message;
      }
      console.error('Order placement error:', err);
      setError(errorMessage);
      setIsPlacingOrder(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 relative overflow-hidden py-8 sm:py-12">
      {/* Dark texture overlay */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.3) 0px, transparent 1px, transparent 2px, rgba(0,0,0,0.3) 3px)',
      }}></div>

      {/* Wilderness decorative elements */}
      <div className="absolute top-0 left-0 text-9xl opacity-10 float">🌲</div>
      <div className="absolute top-40 right-10 text-8xl opacity-10 float" style={{ animationDelay: '0.5s' }}>⛰️</div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-stone-100 mb-8 fade-in distressed-text drop-shadow-lg">CHECKOUT</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Customer Information */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-stone-800 rounded-xl shadow-2xl p-6 border-4 border-amber-800/50 scale-in">
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-stone-100 distressed-text">
                {isAuthenticated ? 'YOUR INFORMATION' : 'GUEST CHECKOUT'}
              </h2>

              {isAuthenticated ? (
                <div className="space-y-3 bg-stone-900/50 rounded-lg p-4 border-2 border-stone-700">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <p className="text-stone-200 font-semibold"><strong>Name:</strong> {user?.name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <p className="text-stone-200 font-semibold"><strong>Email:</strong> {user?.email}</p>
                  </div>
                  {user?.phone && (
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <p className="text-stone-200 font-semibold"><strong>Phone:</strong> {user.phone}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="guestName" className="block text-sm font-bold text-stone-200 mb-2 uppercase tracking-wide">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="guestName"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      required
                      className="w-full px-4 py-3 border-2 border-stone-600 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-amber-600 bg-stone-900 text-stone-100 font-medium"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label htmlFor="guestEmail" className="block text-sm font-bold text-stone-200 mb-2 uppercase tracking-wide">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="guestEmail"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 border-2 border-stone-600 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-amber-600 bg-stone-900 text-stone-100 font-medium"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="guestPhone" className="block text-sm font-bold text-stone-200 mb-2 uppercase tracking-wide">
                      Phone (optional)
                    </label>
                    <input
                      type="tel"
                      id="guestPhone"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-stone-600 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-amber-600 bg-stone-900 text-stone-100 font-medium"
                      placeholder="(867) 123-4567"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Membership Section */}
            {canUseMembership && (
              <div className="bg-gradient-to-r from-green-800 to-emerald-800 rounded-xl shadow-2xl p-6 border-4 border-green-600/50 scale-in" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="useMembership"
                      checked={useMembership}
                      onChange={(e) => setUseMembership(e.target.checked)}
                      className="w-5 h-5 rounded border-2 border-white focus:ring-2 focus:ring-green-400"
                    />
                    <label htmlFor="useMembership" className="text-xl font-bold text-white cursor-pointer distressed-text">
                      ☕ USE MEMBERSHIP COFFEE
                    </label>
                  </div>
                  <div className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-lg">
                    -${membershipDiscount.toFixed(2)}
                  </div>
                </div>
                <p className="text-green-100 text-sm mt-3 ml-8">
                  You have <strong>{membership?.coffees_remaining} coffees</strong> remaining this period
                </p>
              </div>
            )}

            {/* Loyalty Points Section */}
            {isAuthenticated && loyaltyBalance && loyaltyBalance.points >= 100 && (
              <div className="bg-gradient-to-r from-amber-800 to-orange-800 rounded-xl shadow-2xl p-6 border-4 border-amber-600/50 scale-in" style={{ animationDelay: canUseMembership ? '0.2s' : '0.1s' }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="usePoints"
                      checked={usePoints}
                      onChange={(e) => {
                        setUsePoints(e.target.checked);
                        if (e.target.checked && maxRedeemablePoints >= 100) {
                          setPointsToRedeem(Math.min(100, maxRedeemablePoints));
                        } else {
                          setPointsToRedeem(0);
                        }
                      }}
                      disabled={maxRedeemablePoints < 100}
                      className="w-5 h-5 rounded border-2 border-white focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
                    />
                    <label htmlFor="usePoints" className="text-xl font-bold text-white cursor-pointer distressed-text">
                      ⭐ USE LOYALTY POINTS
                    </label>
                  </div>
                  {pointsDiscount > 0 && (
                    <div className="bg-amber-600 text-white px-4 py-2 rounded-lg font-bold text-lg">
                      -${pointsDiscount.toFixed(2)}
                    </div>
                  )}
                </div>

                {usePoints && maxRedeemablePoints >= 100 && (
                  <div className="mt-4 space-y-3 bg-white/10 rounded-lg p-4">
                    <div className="flex justify-between text-white text-sm">
                      <span>Points to redeem:</span>
                      <span className="font-bold">{pointsToRedeem} pts = ${((pointsToRedeem / 100) * 5).toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min={100}
                      max={maxRedeemablePoints}
                      step={100}
                      value={pointsToRedeem}
                      onChange={(e) => setPointsToRedeem(Number(e.target.value))}
                      className="w-full h-2 bg-white/30 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #fff 0%, #fff ${((pointsToRedeem - 100) / (maxRedeemablePoints - 100)) * 100}%, rgba(255,255,255,0.3) ${((pointsToRedeem - 100) / (maxRedeemablePoints - 100)) * 100}%, rgba(255,255,255,0.3) 100%)`
                      }}
                    />
                    <div className="flex justify-between text-xs text-amber-100">
                      <span>100 pts ($5)</span>
                      <span>{maxRedeemablePoints} pts (${((maxRedeemablePoints / 100) * 5).toFixed(2)})</span>
                    </div>
                  </div>
                )}

                <p className="text-amber-100 text-sm mt-3 ml-8">
                  You have <strong>{loyaltyBalance.points} points</strong> available
                  {maxRedeemablePoints < loyaltyBalance.points && maxRedeemablePoints >= 100 && (
                    <span className="block mt-1 text-xs">
                      (max {maxRedeemablePoints} redeemable on this order)
                    </span>
                  )}
                </p>
              </div>
            )}

            {/* Pickup Time */}
            <div className="bg-stone-800 rounded-xl shadow-2xl p-6 border-4 border-amber-800/50 scale-in" style={{ animationDelay: canUseMembership ? '0.2s' : '0.1s' }}>
              <div className="mb-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-stone-100 distressed-text mb-2">PICKUP TIME</h2>
                <p className="text-stone-400 text-sm">⏰ Select when you'd like to pick up your order</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-2">
                {pickupTimes.map((timeObj, idx) => {
                  const isSelected = pickupTime === timeObj.timeString;
                  const isAsap = timeObj.label === 'ASAP';

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        console.log('Clicked time:', timeObj.timeString);
                        setPickupTime(timeObj.timeString);
                        setError('');
                      }}
                      className={`p-4 rounded-xl border-2 transition-all font-bold transform active:scale-95 min-h-[90px] flex flex-col items-center justify-center relative ${
                        isSelected
                          ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-2xl shadow-green-600/50 border-green-500 scale-105'
                          : isAsap
                          ? 'border-amber-500 bg-amber-900/20 text-amber-300 hover:bg-amber-800/30 hover:border-amber-400'
                          : 'border-stone-600 hover:border-green-600 hover:bg-stone-700 bg-stone-900 text-stone-200'
                      }`}
                    >
                      {isAsap && (
                        <div className="absolute top-1 right-1 bg-amber-500 text-stone-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          FAST
                        </div>
                      )}
                      {timeObj.label && (
                        <div className="text-xl font-bold mb-1">{timeObj.label}</div>
                      )}
                      <div className={`${timeObj.label ? 'text-sm' : 'text-base sm:text-lg'} font-bold`}>
                        {timeObj.time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                      </div>
                      <div className="text-xs sm:text-sm opacity-80 mt-1">
                        {timeObj.time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      {isSelected && (
                        <div className="mt-2 absolute bottom-2">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              {pickupTime && (
                <div className="mt-4 bg-green-900/30 border-2 border-green-600 rounded-lg p-3 text-center">
                  <p className="text-green-300 font-bold text-sm">
                    ✓ Your order will be ready for pickup at{' '}
                    {new Date(pickupTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                  </p>
                </div>
              )}
            </div>

            {/* Place Order Button */}
            <div className="bg-stone-800 rounded-xl shadow-2xl p-6 border-4 border-amber-800/50 scale-in" style={{ animationDelay: canUseMembership ? '0.3s' : '0.2s' }}>
              {error && (
                <div className="bg-red-900/50 border-2 border-red-600 text-red-200 px-4 py-3 rounded-lg mb-4 flex items-center gap-2 font-semibold">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}

              <button
                onClick={handlePlaceOrder}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-700 to-green-800 text-white py-4 rounded-lg hover:opacity-90 transition-all font-bold text-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 uppercase tracking-wider distressed-text"
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
                  'Place Order'
                )}
              </button>

              <p className="text-sm text-stone-400 text-center mt-3 font-semibold">
                Northern roasted. Community powered.
              </p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-stone-800 rounded-xl shadow-2xl p-6 sticky top-20 border-4 border-amber-800/50 fade-in">
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-stone-100 distressed-text">ORDER SUMMARY</h2>

              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {items.map((item, idx) => (
                  <div key={idx} className="py-2 border-b-2 border-stone-600">
                    <div className="flex justify-between">
                      <span className="flex-1 text-stone-200 font-medium">
                        <span className="font-bold text-amber-600">{item.quantity}x</span> {item.name}
                      </span>
                      <span className="font-bold text-stone-100 text-lg">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                    {item.customizations && Object.keys(item.customizations).length > 0 && (
                      <div className="mt-1 ml-6 space-y-0.5">
                        {/* Regular customizations */}
                        {Object.entries(item.customizations)
                          .filter(([key, value]) => value && key !== 'notes')
                          .map(([key, value]) => (
                            <div key={key} className="text-xs text-amber-400">
                              <span className="font-semibold capitalize">{key}:</span> {value}
                            </div>
                          ))}
                        {/* Notes with special styling */}
                        {item.customizations.notes && (
                          <div className="text-xs bg-amber-900/20 border-l-2 border-amber-500 pl-2 py-1 mt-1 text-amber-300">
                            <span className="font-semibold">💬 Note:</span> <em>{item.customizations.notes}</em>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="border-t-4 border-amber-800/50 pt-4 space-y-3">
                <div className="flex justify-between text-stone-200 text-lg">
                  <span className="font-bold">Subtotal</span>
                  <span className="font-bold">${subtotal.toFixed(2)}</span>
                </div>
                {useMembership && membershipDiscount > 0 && (
                  <div className="flex justify-between text-green-400 text-lg">
                    <span className="font-bold">☕ Membership Discount</span>
                    <span className="font-bold">-${membershipDiscount.toFixed(2)}</span>
                  </div>
                )}
                {usePoints && pointsDiscount > 0 && (
                  <div className="flex justify-between text-amber-400 text-lg">
                    <span className="font-bold">⭐ Points Discount</span>
                    <span className="font-bold">-${pointsDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-200 text-lg">
                  <span className="font-bold">Tax (8%)</span>
                  <span className="font-bold">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-2xl sm:text-3xl font-bold border-t-4 border-amber-700 pt-4">
                  <span className="text-stone-100 distressed-text">TOTAL</span>
                  <span className="text-amber-500">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
