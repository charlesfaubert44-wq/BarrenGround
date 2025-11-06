import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  customizations?: Record<string, string>;
  cartItemId: string;
}

interface ActiveCart {
  sessionId: string;
  items: CartItem[];
  total: number;
  itemCount: number;
  lastUpdated: number;
  createdAt: number;
}

export default function LiveCartsPage() {
  const [carts, setCarts] = useState<ActiveCart[]>([]);
  const [, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Fetch initial carts
    const fetchCarts = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8888';
        const response = await fetch(`${apiUrl}/api/carts/active`, {
          headers: {
            'X-Shop-ID': import.meta.env.VITE_SHOP_ID || 'barrenground',
          }
        });
        if (!response.ok) {
          console.warn('Active carts endpoint not available (404). This feature is not yet implemented.');
          setCarts([]);
          return;
        }
        const data = await response.json();
        // Ensure data is an array
        setCarts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch active carts:', error);
        setCarts([]);
      }
    };

    fetchCarts();

    // Connect to WebSocket for real-time updates
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8888';
    const newSocket = io(wsUrl);

    newSocket.on('connect', () => {
      console.log('Connected to cart updates');
    });

    newSocket.on('cart_updated', (cart: ActiveCart) => {
      setCarts((prevCarts) => {
        const existingIndex = prevCarts.findIndex((c) => c.sessionId === cart.sessionId);
        if (existingIndex >= 0) {
          const newCarts = [...prevCarts];
          newCarts[existingIndex] = cart;
          return newCarts;
        } else {
          return [...prevCarts, cart];
        }
      });
    });

    newSocket.on('cart_removed', ({ sessionId }: { sessionId: string }) => {
      setCarts((prevCarts) => prevCarts.filter((c) => c.sessionId !== sessionId));
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const getTimeSinceUpdate = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold text-stone-100 distressed-text drop-shadow-lg">LIVE CARTS</h1>
          <span className="bg-amber-500/20 text-amber-300 px-4 py-1 rounded-full text-xs font-bold uppercase border-2 border-amber-500/40 animate-pulse">
            👁️ Preview Only
          </span>
        </div>
        <div className="bg-amber-900/30 border-l-4 border-amber-500 p-4 rounded-lg mb-4">
          <p className="text-amber-200 font-semibold text-sm flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            <span>These items are in customers' carts but <strong className="text-amber-100 underline">NOT ORDERED YET</strong>. They may still add, remove, or abandon items.</span>
          </p>
        </div>
        <div className="inline-flex items-center gap-2 bg-stone-700/50 text-stone-200 px-4 py-2 rounded-full text-sm font-semibold border-2 border-stone-600">
          <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
          {carts.length} Active {carts.length === 1 ? 'Cart' : 'Carts'} Being Built
        </div>
      </div>

      {carts.length === 0 ? (
        <div className="bg-stone-800/50 rounded-xl shadow-2xl p-12 text-center border-4 border-stone-700/50">
          <div className="text-6xl mb-4">🛒</div>
          <h3 className="text-xl font-semibold text-stone-200 mb-2">No Active Carts</h3>
          <p className="text-stone-400">
            Carts will appear here in real-time as customers add items
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {carts
            .sort((a, b) => b.lastUpdated - a.lastUpdated)
            .map((cart) => (
              <div
                key={cart.sessionId}
                className="bg-stone-800/70 rounded-lg shadow-md overflow-hidden border-2 border-amber-500/30 hover:border-amber-500/60 transition-all relative opacity-90"
              >
                {/* "NOT ORDERED" Badge */}
                <div className="absolute top-2 right-2 z-10 bg-stone-900/90 text-amber-400 px-3 py-1 rounded-full text-xs font-bold uppercase border border-amber-500/50 flex items-center gap-1">
                  <span>👁️</span>
                  <span>Browsing</span>
                </div>

                {/* Cart Header */}
                <div className="bg-gradient-to-r from-amber-600/30 to-amber-700/30 text-amber-100 p-4 border-b-2 border-amber-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      <span className="font-bold text-lg">{cart.itemCount} Items</span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-amber-300">${cart.total.toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="text-xs text-amber-300/80">
                    Updated {getTimeSinceUpdate(cart.lastUpdated)}
                  </div>
                </div>

                {/* Cart Items */}
                <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                  {cart.items.map((item) => (
                    <div
                      key={item.cartItemId}
                      className="bg-stone-700/50 rounded-lg p-3 border border-stone-600/50"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-stone-200">{item.name}</h4>
                          {item.customizations && Object.keys(item.customizations).length > 0 && (
                            <div className="mt-1 space-y-0.5">
                              {Object.entries(item.customizations).map(([key, value]) => {
                                if (!value) return null;

                                // Special styling for notes
                                if (key === 'notes') {
                                  return (
                                    <div key={key} className="text-xs bg-amber-900/20 border-l-2 border-amber-500 pl-2 py-1 mt-1 text-amber-300">
                                      <span className="font-semibold">💬 Note:</span> <em>{value}</em>
                                    </div>
                                  );
                                }

                                // Regular customizations
                                return (
                                  <div key={key} className="text-xs text-amber-400">
                                    <span className="font-semibold capitalize">{key}:</span> {value}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                        <div className="text-right ml-3">
                          <div className="text-sm font-semibold text-stone-400">
                            x{item.quantity}
                          </div>
                          <div className="text-sm font-bold text-amber-300">
                            ${(item.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cart Footer */}
                <div className="bg-stone-900/50 p-4 border-t border-stone-600/50">
                  <div className="flex items-center justify-between text-sm text-stone-400">
                    <span className="text-xs">Session ID:</span>
                    <span className="font-mono text-xs text-stone-500">
                      {cart.sessionId.substring(0, 20)}...
                    </span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
