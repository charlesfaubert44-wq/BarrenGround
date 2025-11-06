import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  customizations?: Record<string, string>;
  cartItemId: string; // Unique identifier for cart item (id + customizations)
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity' | 'cartItemId'>) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
}

// Generate a unique session ID for this browser session
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('cart-session-id');
  if (!sessionId) {
    sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('cart-session-id', sessionId);
  }
  return sessionId;
};

// Function to sync cart with backend
const syncCartWithBackend = async (items: CartItem[], total: number) => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8888';
    const sessionId = getSessionId();
    const shopId = import.meta.env.VITE_SHOP_ID || 'barrenground';

    if (items.length === 0) {
      // Cart is empty, remove from backend
      await fetch(`${apiUrl}/api/carts/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'X-Shop-ID': shopId,
        },
      });
    } else {
      // Update cart on backend
      await fetch(`${apiUrl}/api/carts/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shop-ID': shopId,
        },
        body: JSON.stringify({
          sessionId,
          cart: {
            items,
            total,
            itemCount: items.reduce((count, item) => count + item.quantity, 0),
          },
        }),
      });
    }
  } catch (error) {
    console.error('Failed to sync cart with backend:', error);
  }
};

// Helper function to generate unique cart item ID
const generateCartItemId = (id: number, customizations?: Record<string, string>) => {
  return `${id}-${JSON.stringify(customizations || {})}`;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        set((state) => {
          const cartItemId = generateCartItemId(item.id, item.customizations);
          const existingItem = state.items.find((i) => i.cartItemId === cartItemId);

          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.cartItemId === cartItemId
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            };
          }

          return {
            items: [...state.items, { ...item, cartItemId, quantity: 1 }],
          };
        });

        // Sync with backend
        setTimeout(() => {
          const state = get();
          syncCartWithBackend(state.items, state.getTotalPrice());
        }, 0);
      },

      removeItem: (cartItemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.cartItemId !== cartItemId),
        }));

        // Sync with backend
        setTimeout(() => {
          const state = get();
          syncCartWithBackend(state.items, state.getTotalPrice());
        }, 0);
      },

      updateQuantity: (cartItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(cartItemId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.cartItemId === cartItemId ? { ...item, quantity } : item
          ),
        }));

        // Sync with backend
        setTimeout(() => {
          const state = get();
          syncCartWithBackend(state.items, state.getTotalPrice());
        }, 0);
      },

      clearCart: () => {
        set({ items: [] });

        // Sync with backend
        setTimeout(() => {
          const state = get();
          syncCartWithBackend(state.items, state.getTotalPrice());
        }, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
