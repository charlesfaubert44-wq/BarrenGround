import { Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotalPrice } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 text-6xl sm:text-8xl opacity-10 float">🌲</div>
        <div className="absolute bottom-20 right-20 text-7xl sm:text-9xl opacity-10 float" style={{ animationDelay: '1s' }}>⛰️</div>

        {/* Dark texture overlay */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.3) 0px, transparent 1px, transparent 2px, rgba(0,0,0,0.3) 3px)',
        }}></div>

        <div className="text-center px-4 fade-in relative z-10 max-w-md mx-auto">
          <div className="text-6xl sm:text-8xl mb-4 sm:mb-6 float">🛒</div>
          <h1 className="text-3xl sm:text-5xl font-bold text-stone-100 mb-3 sm:mb-4 distressed-text drop-shadow-2xl" style={{ letterSpacing: '0.1em' }}>
            YOUR CART IS EMPTY
          </h1>
          <p className="text-base sm:text-xl text-stone-300 mb-6 sm:mb-8 font-bold">
            Start your Northern roasted coffee journey today
          </p>
          <Link
            to="/menu"
            className="inline-block bg-gradient-to-r from-amber-700 to-amber-800 text-stone-100 px-6 sm:px-12 py-3 sm:py-4 rounded-xl hover:from-amber-600 hover:to-amber-700 transition font-bold text-base sm:text-lg shadow-2xl transform hover:scale-105 border-2 border-amber-900 distressed-text"
            style={{ letterSpacing: '0.08em' }}
          >
            EXPLORE MENU
          </Link>
        </div>
      </div>
    );
  }

  // Order Summary Component (reusable for mobile and desktop)
  const OrderSummaryContent = () => (
    <div className="bg-stone-800 rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 border-2 border-amber-800/50 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 text-4xl sm:text-6xl opacity-10 float">⛰️</div>
      <div className="absolute bottom-0 left-0 text-3xl sm:text-5xl opacity-10 float" style={{ animationDelay: '0.5s' }}>🌲</div>

      <div className="relative z-10">
        <div className="text-center mb-3 sm:mb-4">
          <div className="text-2xl sm:text-3xl mb-1">🧾</div>
          <h2 className="text-lg sm:text-2xl font-bold text-stone-100 distressed-text drop-shadow-lg" style={{ letterSpacing: '0.08em' }}>
            ORDER SUMMARY
          </h2>
        </div>

        <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4 bg-stone-900 p-3 sm:p-4 rounded-lg border-2 border-amber-800/50">
          <div className="flex justify-between text-stone-300 text-sm sm:text-base">
            <span className="font-semibold">Subtotal</span>
            <span className="font-bold">${getTotalPrice().toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-stone-300 text-sm sm:text-base">
            <span className="font-semibold">Tax (8%)</span>
            <span className="font-bold">${(getTotalPrice() * 0.08).toFixed(2)}</span>
          </div>
          <div className="border-t-2 border-amber-700 pt-2 sm:pt-3 flex justify-between text-base sm:text-xl font-bold">
            <span className="text-amber-400">Total</span>
            <span className="text-amber-400">
              ${(getTotalPrice() * 1.08).toFixed(2)}
            </span>
          </div>
        </div>

        <Link
          to="/checkout"
          className="block w-full bg-gradient-to-r from-amber-700 to-amber-800 text-stone-100 text-center py-2.5 sm:py-4 rounded-lg sm:rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all font-bold text-sm sm:text-base shadow-2xl transform hover:scale-105 mb-2 sm:mb-3 border-2 border-amber-900 distressed-text"
          style={{ letterSpacing: '0.08em' }}
        >
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="hidden sm:inline">PROCEED TO CHECKOUT</span>
            <span className="sm:hidden">CHECKOUT</span>
          </span>
        </Link>

        <Link
          to="/menu"
          className="block w-full text-center py-2 sm:py-3 text-stone-300 hover:bg-stone-700 transition-all font-bold border-2 border-stone-600 rounded-lg sm:rounded-xl text-xs sm:text-sm"
        >
          <span className="flex items-center justify-center gap-1 sm:gap-2">
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Continue Shopping
          </span>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 relative overflow-hidden">
      {/* Wilderness background elements */}
      <div className="absolute top-0 left-0 text-9xl opacity-10 float">🌲</div>
      <div className="absolute top-40 right-10 text-8xl opacity-10 float" style={{ animationDelay: '0.5s' }}>⛰️</div>
      <div className="absolute bottom-20 left-20 text-7xl opacity-10 float" style={{ animationDelay: '1s' }}>🏕️</div>

      {/* Dark texture overlay */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.3) 0px, transparent 1px, transparent 2px, rgba(0,0,0,0.3) 3px)',
      }}></div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 relative z-10">
        {/* Header with back button */}
        <div className="mb-4 sm:mb-6 fade-in">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <Link to="/menu" className="flex items-center gap-2 text-stone-300 hover:text-stone-100 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="font-bold text-sm">BACK TO MENU</span>
            </Link>
            <div className="text-2xl sm:text-4xl float">🛒</div>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold text-stone-100 mb-2 distressed-text drop-shadow-2xl text-center" style={{ letterSpacing: '0.1em' }}>
            YOUR CART
          </h1>
          <p className="text-stone-300 text-sm sm:text-base font-bold text-center">
            {items.length} {items.length === 1 ? 'item' : 'items'} ready for checkout
          </p>
        </div>

        {/* Order Summary at Top on Mobile Only */}
        <div className="lg:hidden mb-4">
          <OrderSummaryContent />
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item, idx) => (
              <div
                key={item.cartItemId}
                className="bg-stone-800 rounded-lg shadow-lg p-3 sm:p-4 hover:shadow-2xl transition-all scale-in border-2 border-amber-800/50"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="flex items-center gap-3">
                  {/* Item Info */}
                  <div className="flex-grow">
                    <h3 className="text-sm sm:text-lg font-bold text-stone-100 mb-1">
                      {item.name}
                    </h3>
                    {item.customizations && Object.keys(item.customizations).length > 0 && (
                      <div className="text-xs mb-1 space-y-0.5">
                        {Object.entries(item.customizations).map(([key, value]) => {
                          if (!value) return null;

                          // Special styling for notes
                          if (key === 'notes') {
                            return (
                              <div key={key} className="bg-amber-900/20 border-l-2 border-amber-500 pl-2 py-1 mt-1 text-amber-300">
                                <span className="font-semibold">💬 Note:</span> <em>{value}</em>
                              </div>
                            );
                          }

                          // Regular customizations
                          return (
                            <div key={key} className="text-amber-400">
                              <span className="font-semibold capitalize">{key}:</span> {value}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <p className="text-stone-300 font-semibold text-xs sm:text-sm">
                      ${item.price.toFixed(2)} each
                    </p>
                  </div>

                  {/* Quantity Controls - Compact */}
                  <div className="flex items-center gap-1.5 sm:gap-2 bg-stone-900 rounded-lg px-1.5 py-1 border border-amber-800/50">
                    <button
                      onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                      className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-amber-700 to-amber-800 text-stone-100 hover:from-amber-600 hover:to-amber-700 flex items-center justify-center transition font-bold text-xs sm:text-sm"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="w-6 sm:w-8 text-center font-bold text-sm sm:text-base text-stone-100">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                      className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-amber-700 to-amber-800 text-stone-100 hover:from-amber-600 hover:to-amber-700 flex items-center justify-center transition font-bold text-xs sm:text-sm"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  {/* Price & Remove */}
                  <div className="text-right flex flex-col items-end gap-1">
                    <p className="text-base sm:text-xl font-bold text-amber-400">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                    <button
                      onClick={() => removeItem(item.cartItemId)}
                      className="text-red-400 hover:text-red-300 text-xs font-bold transition px-2 py-0.5 rounded border border-red-600/50 hover:bg-red-900/30"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary on Desktop (Sticky Side Panel) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-4">
              <OrderSummaryContent />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
