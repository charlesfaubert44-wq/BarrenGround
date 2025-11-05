import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { apiRequest } from '../api/client';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number | string; // API returns string, needs parsing
  category: string;
  image_url?: string;
  available: boolean;
}

interface CustomizationState {
  size: string;
  milk: string;
  temperature: string;
  extras: string[];
  quantity: number;
  notes: string;
}

export default function MenuPage() {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [customizations, setCustomizations] = useState<Record<number, CustomizationState>>({});
  const navigate = useNavigate();
  const { items, addItem, getTotalPrice } = useCartStore();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const { isAuthenticated, user, logout } = useAuthStore();

  const { data: menuItems = [], isLoading } = useQuery<MenuItem[]>({
    queryKey: ['menu'],
    queryFn: async () => {
      return apiRequest<MenuItem[]>('/api/menu');
    },
  });

  const getCustomization = (itemId: number): CustomizationState => {
    return customizations[itemId] || {
      size: 'Medium',
      milk: 'Whole Milk',
      temperature: 'Hot',
      extras: [],
      quantity: 1,
      notes: '',
    };
  };

  const updateCustomization = (itemId: number, updates: Partial<CustomizationState>) => {
    setCustomizations(prev => ({
      ...prev,
      [itemId]: { ...getCustomization(itemId), ...updates }
    }));
  };

  const toggleExtra = (itemId: number, extra: string) => {
    const current = getCustomization(itemId);
    const newExtras = current.extras.includes(extra)
      ? current.extras.filter(e => e !== extra)
      : [...current.extras, extra];
    updateCustomization(itemId, { extras: newExtras });
  };

  const handleAddToCart = (item: MenuItem) => {
    const custom = getCustomization(item.id);
    const customizationObj: Record<string, string> = {};

    if (custom.size !== 'Medium') customizationObj.size = custom.size;
    if (custom.milk !== 'Whole Milk') customizationObj.milk = custom.milk;
    if (custom.temperature !== 'Hot') customizationObj.temperature = custom.temperature;
    if (custom.extras.length > 0) customizationObj.extras = custom.extras.join(', ');
    if (custom.notes.trim()) customizationObj.notes = custom.notes.trim();

    for (let i = 0; i < custom.quantity; i++) {
      addItem({
        id: item.id,
        name: item.name,
        price: parseFloat(String(item.price)),
        customizations: Object.keys(customizationObj).length > 0 ? customizationObj : undefined,
      });
    }

    // Reset customization and close modal
    setCustomizations(prev => {
      const newCustom = { ...prev };
      delete newCustom[item.id];
      return newCustom;
    });
    setSelectedItem(null);
  };

  const getSizePrice = (basePrice: number | string, size: string) => {
    const price = parseFloat(String(basePrice));
    if (size === 'Small') return price - 0.50;
    if (size === 'Large') return price + 0.50;
    return price;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900">
        <div className="text-center bg-stone-800 rounded-3xl p-12 shadow-2xl border-4 border-amber-800/50">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-amber-600 mx-auto mb-6"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl">☕</span>
            </div>
          </div>
          <p className="text-2xl font-bold text-stone-100">Brewing your menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-stone-900/95 backdrop-blur-lg border-b-2 border-amber-800/30 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-3xl">☕</span>
              <span className="text-xl font-bold text-stone-100 hidden sm:inline">
                BARREN GROUND
              </span>
            </Link>

            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <Link to="/account" className="hidden sm:block text-stone-300 hover:text-stone-100 font-bold text-sm">
                    {user?.name.toUpperCase()}
                  </Link>
                  <button
                    onClick={() => { logout(); navigate('/'); }}
                    className="hidden sm:block px-3 py-1.5 bg-stone-700 hover:bg-stone-600 text-stone-100 rounded-lg font-bold text-xs"
                  >
                    LOGOUT
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-2 bg-stone-700 hover:bg-stone-600 text-stone-100 rounded-lg font-bold text-sm"
                >
                  LOGIN
                </Link>
              )}

              <Link
                to="/cart"
                className="relative px-4 py-2 bg-gradient-to-r from-amber-700 to-amber-800 text-stone-100 rounded-lg font-bold text-sm hover:from-amber-600 hover:to-amber-700 shadow-lg flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {itemCount > 0 && (
                  <span className="bg-green-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Menu Title */}
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <h1 className="text-5xl font-bold text-stone-100 mb-3">Our Menu</h1>
        <p className="text-stone-300 text-lg">Tap any item to customize and add to cart</p>
      </div>

      {/* Menu Items Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="bg-stone-800 rounded-xl overflow-hidden shadow-lg border-2 border-stone-700 hover:border-amber-600 transition-all hover:scale-[1.02] text-left"
            >
              {/* Image */}
              <div className="w-full h-48 bg-stone-700 flex items-center justify-center">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-6xl">☕</span>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-bold text-stone-100">{item.name}</h3>
                  <span className="text-xl font-bold text-amber-500 ml-2">
                    ${parseFloat(String(item.price)).toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-stone-400 line-clamp-2">{item.description}</p>
                <div className="mt-3 text-xs text-amber-400 font-semibold uppercase">
                  Tap to customize →
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Customization Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedItem(null)}>
          <div
            className="bg-stone-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto border-4 border-amber-800/50"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-stone-900 border-b-2 border-amber-800/50 p-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <span className="text-3xl">☕</span>
                <div>
                  <h2 className="text-xl font-bold text-stone-100">{selectedItem.name}</h2>
                  <p className="text-sm text-stone-400">{selectedItem.description}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-stone-400 hover:text-stone-100 transition p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {(() => {
                const custom = getCustomization(selectedItem.id);
                const totalPrice = getSizePrice(selectedItem.price, custom.size) * custom.quantity;

                return (
                  <>
                    {/* Size Selection */}
                    {['coffee', 'cold-drinks'].includes(selectedItem.category) && (
                      <div>
                        <label className="block text-sm font-bold text-amber-400 mb-3">SIZE</label>
                        <div className="grid grid-cols-3 gap-3">
                          {['Small', 'Medium', 'Large'].map((size) => (
                            <button
                              key={size}
                              onClick={() => updateCustomization(selectedItem.id, { size })}
                              className={`py-3 px-4 rounded-xl font-bold transition-all ${
                                custom.size === size
                                  ? 'bg-amber-600 text-white shadow-lg'
                                  : 'bg-stone-700 text-stone-300 hover:bg-stone-600'
                              }`}
                            >
                              {size}
                              <div className="text-xs mt-1">
                                ${getSizePrice(selectedItem.price, size).toFixed(2)}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Milk Selection */}
                    {['coffee'].includes(selectedItem.category) && selectedItem.name !== 'Espresso' && (
                      <div>
                        <label className="block text-sm font-bold text-amber-400 mb-3">MILK</label>
                        <div className="grid grid-cols-2 gap-2">
                          {['Whole Milk', 'Oat Milk', 'Almond Milk', 'Skim Milk'].map((milk) => (
                            <button
                              key={milk}
                              onClick={() => updateCustomization(selectedItem.id, { milk })}
                              className={`py-2 px-3 rounded-lg font-bold text-sm transition-all ${
                                custom.milk === milk
                                  ? 'bg-amber-600 text-white shadow-lg'
                                  : 'bg-stone-700 text-stone-300 hover:bg-stone-600'
                              }`}
                            >
                              {milk}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Temperature */}
                    {['coffee'].includes(selectedItem.category) && (
                      <div>
                        <label className="block text-sm font-bold text-amber-400 mb-3">TEMPERATURE</label>
                        <div className="grid grid-cols-2 gap-3">
                          {['Hot', 'Iced'].map((temp) => (
                            <button
                              key={temp}
                              onClick={() => updateCustomization(selectedItem.id, { temperature: temp })}
                              className={`py-3 px-4 rounded-xl font-bold transition-all ${
                                custom.temperature === temp
                                  ? 'bg-amber-600 text-white shadow-lg'
                                  : 'bg-stone-700 text-stone-300 hover:bg-stone-600'
                              }`}
                            >
                              {temp === 'Hot' ? '🔥 Hot' : '🧊 Iced'}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Extras */}
                    {['coffee', 'cold-drinks'].includes(selectedItem.category) && (
                      <div>
                        <label className="block text-sm font-bold text-amber-400 mb-3">EXTRAS (Optional)</label>
                        <div className="grid grid-cols-2 gap-2">
                          {['Extra Shot', 'Vanilla', 'Caramel', 'Whipped Cream'].map((extra) => (
                            <button
                              key={extra}
                              onClick={() => toggleExtra(selectedItem.id, extra)}
                              className={`py-2 px-3 rounded-lg font-bold text-sm transition-all ${
                                custom.extras.includes(extra)
                                  ? 'bg-green-600 text-white shadow-lg'
                                  : 'bg-stone-700 text-stone-300 hover:bg-stone-600'
                              }`}
                            >
                              {custom.extras.includes(extra) ? '✓ ' : ''}
                              {extra}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quantity */}
                    <div>
                      <label className="block text-sm font-bold text-amber-400 mb-3">QUANTITY</label>
                      <div className="flex items-center gap-4 bg-stone-700 rounded-xl p-2 w-fit">
                        <button
                          onClick={() => updateCustomization(selectedItem.id, { quantity: Math.max(1, custom.quantity - 1) })}
                          className="w-10 h-10 bg-stone-600 hover:bg-stone-500 rounded-lg font-bold text-xl text-white"
                        >
                          −
                        </button>
                        <span className="text-2xl font-bold text-white w-12 text-center">
                          {custom.quantity}
                        </span>
                        <button
                          onClick={() => updateCustomization(selectedItem.id, { quantity: custom.quantity + 1 })}
                          className="w-10 h-10 bg-stone-600 hover:bg-stone-500 rounded-lg font-bold text-xl text-white"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Special Notes */}
                    <div>
                      <label className="block text-sm font-bold text-amber-400 mb-3">
                        SPECIAL NOTES / MESSAGE
                        <span className="text-stone-400 font-normal ml-2 text-xs">(Optional)</span>
                      </label>
                      <textarea
                        value={custom.notes}
                        onChange={(e) => updateCustomization(selectedItem.id, { notes: e.target.value })}
                        placeholder="Add a personalized message or special instructions... (e.g., 'Happy Birthday!', 'Extra hot please', etc.)"
                        className="w-full bg-stone-700 border-2 border-stone-600 rounded-xl px-4 py-3 text-stone-100 placeholder-stone-400 focus:border-amber-500 focus:outline-none resize-none transition-colors"
                        rows={3}
                        maxLength={200}
                      />
                      <div className="text-xs text-stone-400 mt-1 text-right">
                        {custom.notes.length}/200 characters
                      </div>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={() => handleAddToCart(selectedItem)}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-xl transition-all flex items-center justify-center gap-3"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Add {custom.quantity} to Cart</span>
                      <span className="text-xl">${totalPrice.toFixed(2)}</span>
                    </button>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Floating Cart Button */}
      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-stone-900 via-stone-900 to-transparent p-4">
          <button
            onClick={() => navigate('/cart')}
            className="w-full max-w-7xl mx-auto bg-gradient-to-r from-green-700 to-green-800 hover:from-green-600 hover:to-green-700 text-white py-5 rounded-2xl font-bold text-lg shadow-2xl transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-between px-6"
          >
            <div className="flex items-center gap-3">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>{itemCount} {itemCount === 1 ? 'Item' : 'Items'}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">${getTotalPrice().toFixed(2)}</span>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
