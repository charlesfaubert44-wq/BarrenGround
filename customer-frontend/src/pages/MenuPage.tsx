import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url?: string;
  available: boolean;
}

export default function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [addedItems, setAddedItems] = useState<Set<number>>(new Set());
  const navigate = useNavigate();
  const { items, addItem, getTotalPrice } = useCartStore();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const { isAuthenticated, user, logout } = useAuthStore();

  const { data: menuItems = [], isLoading } = useQuery<MenuItem[]>({
    queryKey: ['menu'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/menu`);
      if (!response.ok) throw new Error('Failed to fetch menu');
      return response.json();
    },
  });

  const categories = ['all', ...new Set(menuItems.map((item) => item.category))];

  const filteredItems =
    selectedCategory === 'all'
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory);

  const handleAddToCart = (item: MenuItem) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
    });

    // Show feedback
    setAddedItems(prev => new Set(prev).add(item.id));
    setTimeout(() => {
      setAddedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(item.id);
        return newSet;
      });
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900">
        <div className="text-center bg-stone-800 rounded-3xl p-8 sm:p-12 shadow-2xl border-4 border-amber-800/50">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 sm:h-20 sm:w-20 border-b-4 border-amber-600 mx-auto mb-6"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl sm:text-4xl">☕</span>
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-stone-100 distressed-text">Brewing your menu...</p>
          <p className="text-stone-300 mt-2 font-semibold">Fresh items loading</p>
        </div>
      </div>
    );
  }

  const getCategoryEmoji = (cat: string) => {
    const emojis: Record<string, string> = {
      'all': '🍽️',
      'coffee': '☕',
      'drip-coffee': '🌿',
      'cold-drinks': '🧊',
      'pastries': '🥐',
      'food': '🍳',
      'specialty': '✨'
    };
    return emojis[cat] || '🍽️';
  };

  const getCategoryShortName = (cat: string) => {
    const shortNames: Record<string, string> = {
      'all': 'All',
      'coffee': 'Coffee',
      'drip-coffee': 'Drip',
      'cold-drinks': 'Cold',
      'pastries': 'Pastries',
      'food': 'Food',
      'specialty': 'Special'
    };
    return shortNames[cat] || cat;
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 relative overflow-hidden">
      {/* Dark texture overlay */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.3) 0px, transparent 1px, transparent 2px, rgba(0,0,0,0.3) 3px)',
      }}></div>

      {/* Wilderness decorative elements */}
      <div className="absolute top-0 left-0 text-9xl opacity-10 float">🌲</div>
      <div className="absolute top-40 right-10 text-8xl opacity-10 float" style={{ animationDelay: '0.5s' }}>⛰️</div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 relative z-10">
        {/* Integrated Header with Navigation */}
        <div className="mb-6 sm:mb-8 fade-in">
          {/* Top bar with logo and actions */}
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition">
              <span className="text-3xl sm:text-4xl">☕</span>
              <span className="text-xl sm:text-2xl font-bold text-stone-100 distressed-text hidden sm:inline drop-shadow-lg">
                BARREN GROUND
              </span>
            </Link>

            {/* Quick Order Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {isAuthenticated ? (
                <>
                  <Link to="/account" className="hidden sm:block text-stone-300 hover:text-stone-100 font-bold text-sm transition">
                    {user?.name.toUpperCase()}
                  </Link>
                  <button
                    onClick={() => { logout(); navigate('/'); }}
                    className="hidden sm:block px-3 py-1.5 bg-stone-700 hover:bg-stone-600 text-stone-100 rounded-lg font-bold text-xs border-2 border-stone-600 transition"
                  >
                    LOGOUT
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="px-2.5 sm:px-4 py-1.5 sm:py-2 bg-stone-700 hover:bg-stone-600 text-stone-100 rounded-lg font-bold text-xs sm:text-sm border-2 border-stone-600 transition"
                >
                  LOGIN
                </Link>
              )}

              <Link
                to="/cart"
                className="relative px-2.5 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-amber-700 to-amber-800 text-stone-100 rounded-lg font-bold text-xs sm:text-sm border-2 border-amber-900 hover:from-amber-600 hover:to-amber-700 transition shadow-lg"
              >
                <span className="flex items-center gap-1 sm:gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="hidden sm:inline">CART</span>
                  {itemCount > 0 && (
                    <span className="bg-green-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-stone-100 -mr-1">
                      {itemCount}
                    </span>
                  )}
                </span>
              </Link>
            </div>
          </div>

          {/* Main Title */}
          <div className="text-center">
            <h1 className="text-3xl sm:text-5xl font-bold text-stone-100 mb-2 distressed-text drop-shadow-2xl" style={{ letterSpacing: '0.05em' }}>
              QUICK ORDER
            </h1>
            <p className="text-xs sm:text-base text-stone-300 font-bold">
              Tap to add · Fast checkout
            </p>
          </div>
        </div>

        {/* Category Filter - Compact to fit mobile width */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-8 slide-in-bottom justify-center">
          {categories.map((category, index) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              style={{ animationDelay: `${index * 50}ms` }}
              className={`px-2 py-1.5 sm:px-5 sm:py-3 rounded-md sm:rounded-lg capitalize transition-all font-bold text-xs sm:text-base shadow-md hover:shadow-lg transform hover:scale-105 border ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-amber-700 to-amber-800 text-stone-100 border-amber-900 scale-105'
                  : 'bg-stone-800 text-stone-300 border-stone-600 hover:bg-stone-700'
              }`}
            >
              <span className="mr-0.5 sm:mr-1">{getCategoryEmoji(category)}</span>
              <span className="sm:hidden">{getCategoryShortName(category)}</span>
              <span className="hidden sm:inline">{category}</span>
            </button>
          ))}
        </div>

        {/* Menu Items Grid - Optimized for quick ordering */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              style={{ animationDelay: `${index * 30}ms` }}
              className="scale-in group"
            >
              <div className="bg-stone-800 rounded-lg sm:rounded-xl shadow-xl overflow-hidden transition-all transform hover:shadow-2xl hover:-translate-y-1 duration-200 border-2 border-amber-800/30 hover:border-amber-600/50">
                {/* Compact image with price */}
                <div className="relative overflow-hidden">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-24 sm:h-32 object-cover"
                    />
                  ) : (
                    <div className="w-full h-24 sm:h-32 bg-gradient-to-br from-stone-700 via-stone-600 to-stone-700 flex items-center justify-center">
                      <span className="text-3xl sm:text-5xl">
                        {item.category === 'coffee' || item.category === 'drip-coffee' ? '☕' :
                         item.category === 'cold-drinks' ? '🧊' :
                         item.category === 'specialty' ? '✨' :
                         item.category === 'food' ? '🍳' : '🥐'}
                      </span>
                    </div>
                  )}

                  {/* Large price badge - Very visible */}
                  <div className="absolute top-1 right-1 sm:top-2 sm:right-2">
                    <div className="bg-amber-600 rounded-md sm:rounded-lg px-2 py-0.5 sm:px-3 sm:py-1 shadow-lg border border-amber-800">
                      <span className="text-xs sm:text-lg font-bold text-white">
                        ${item.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Compact content - Focus on name and quick add */}
                <div className="p-2 sm:p-3">
                  <h3 className="text-sm sm:text-base font-bold text-stone-100 mb-1 sm:mb-2 line-clamp-2 leading-tight">
                    {item.name}
                  </h3>

                  {/* Description hidden on mobile for speed */}
                  <p className="hidden sm:block text-stone-400 mb-2 text-xs line-clamp-1">
                    {item.description}
                  </p>

                  {item.available ? (
                    <button
                      onClick={() => handleAddToCart(item)}
                      className={`w-full py-2 sm:py-3 rounded-md sm:rounded-lg font-bold transition-all duration-200 shadow-lg text-xs sm:text-sm border-2 ${
                        addedItems.has(item.id)
                          ? 'bg-green-600 text-white border-green-800 scale-105'
                          : 'bg-gradient-to-r from-amber-700 to-amber-800 text-white border-amber-900 hover:from-amber-600 hover:to-amber-700 active:scale-95'
                      }`}
                    >
                      {addedItems.has(item.id) ? (
                        <span className="flex items-center justify-center gap-1">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                          Added
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-1">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Add
                        </span>
                      )}
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full bg-stone-700 text-stone-500 py-2 sm:py-3 rounded-md sm:rounded-lg cursor-not-allowed font-bold text-xs sm:text-sm border-2 border-stone-600"
                    >
                      Unavailable
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-16 fade-in">
            <div className="bg-stone-800 rounded-3xl p-8 sm:p-12 max-w-md mx-auto shadow-2xl border-4 border-amber-800/50">
              <div className="text-6xl sm:text-8xl mb-4 sm:mb-6">🔍</div>
              <p className="text-xl sm:text-2xl font-bold text-stone-100 mb-2 distressed-text">No items found</p>
              <p className="text-stone-300 mb-6 font-semibold">Try selecting a different category</p>
              <button
                onClick={() => setSelectedCategory('all')}
                className="bg-gradient-to-r from-amber-700 to-amber-800 text-stone-100 px-6 sm:px-8 py-3 sm:py-4 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all font-bold shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-amber-900"
              >
                View All Items
              </button>
            </div>
          </div>
        )}

        {/* Add spacing for floating checkout button */}
        {items.length > 0 && <div className="h-24 sm:h-20"></div>}
      </div>

      {/* Floating Checkout Button */}
      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-stone-900 via-stone-900 to-transparent pb-safe">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
            <button
              onClick={() => navigate('/cart')}
              className="w-full bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700 text-white py-4 sm:py-5 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg shadow-2xl transition-all transform hover:scale-[1.02] active:scale-95 aurora-pulse border-4 border-amber-900 relative overflow-hidden"
            >
              {/* Animated background shimmer */}
              <div className="absolute inset-0 shimmer"></div>

              <div className="relative z-10 flex items-center justify-between px-4">
                {/* Cart icon and item count */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white animate-pulse">
                      {items.length}
                    </div>
                  </div>
                  <span className="font-bold text-sm sm:text-base">
                    {items.length} {items.length === 1 ? 'Item' : 'Items'}
                  </span>
                </div>

                {/* Checkout text and total */}
                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="text-lg sm:text-xl font-bold">
                    ${getTotalPrice().toFixed(2)}
                  </span>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <span className="text-sm sm:text-base">Checkout</span>
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
