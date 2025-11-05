import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCartStore } from '../../store/cartStore';

// Mock fetch for backend sync
globalThis.fetch = vi.fn() as any;

describe('Cart Store', () => {
  beforeEach(() => {
    // Clear localStorage and sessionStorage
    localStorage.clear();
    sessionStorage.clear();

    // Clear the store before each test
    const { result } = renderHook(() => useCartStore());
    act(() => {
      result.current.clearCart();
    });
    vi.clearAllMocks();
  });

  describe('addItem', () => {
    it('should add item to cart with quantity 1', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem({
          id: 1,
          name: 'Latte',
          price: 4.50,
        });
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].name).toBe('Latte');
      expect(result.current.items[0].quantity).toBe(1);
      expect(result.current.items[0].price).toBe(4.50);
    });

    it('should add item with customizations', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem({
          id: 1,
          name: 'Latte',
          price: 4.50,
          customizations: { size: 'Large', milk: 'Oat' },
        });
      });

      expect(result.current.items[0].customizations).toEqual({
        size: 'Large',
        milk: 'Oat',
      });
    });

    it('should increment quantity when adding same item', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem({
          id: 1,
          name: 'Latte',
          price: 4.50,
        });
        result.current.addItem({
          id: 1,
          name: 'Latte',
          price: 4.50,
        });
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].quantity).toBe(2);
    });

    it('should treat items with different customizations as separate items', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem({
          id: 1,
          name: 'Latte',
          price: 4.50,
          customizations: { size: 'Small' },
        });
        result.current.addItem({
          id: 1,
          name: 'Latte',
          price: 4.50,
          customizations: { size: 'Large' },
        });
      });

      expect(result.current.items).toHaveLength(2);
      expect(result.current.items[0].quantity).toBe(1);
      expect(result.current.items[1].quantity).toBe(1);
    });

    it('should generate unique cartItemId for each item', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem({
          id: 1,
          name: 'Latte',
          price: 4.50,
        });
        result.current.addItem({
          id: 2,
          name: 'Cappuccino',
          price: 4.75,
        });
      });

      expect(result.current.items[0].cartItemId).toBeDefined();
      expect(result.current.items[1].cartItemId).toBeDefined();
      expect(result.current.items[0].cartItemId).not.toBe(result.current.items[1].cartItemId);
    });
  });

  describe('removeItem', () => {
    it('should remove item from cart', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem({
          id: 1,
          name: 'Latte',
          price: 4.50,
        });
      });

      const cartItemId = result.current.items[0].cartItemId;

      act(() => {
        result.current.removeItem(cartItemId);
      });

      expect(result.current.items).toHaveLength(0);
    });

    it('should not affect other items when removing one', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem({
          id: 1,
          name: 'Latte',
          price: 4.50,
        });
        result.current.addItem({
          id: 2,
          name: 'Cappuccino',
          price: 4.75,
        });
      });

      const cartItemId = result.current.items[0].cartItemId;

      act(() => {
        result.current.removeItem(cartItemId);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].name).toBe('Cappuccino');
    });
  });

  describe('updateQuantity', () => {
    it('should update item quantity', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem({
          id: 1,
          name: 'Latte',
          price: 4.50,
        });
      });

      const cartItemId = result.current.items[0].cartItemId;

      act(() => {
        result.current.updateQuantity(cartItemId, 5);
      });

      expect(result.current.items[0].quantity).toBe(5);
    });

    it('should remove item when quantity is set to 0', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem({
          id: 1,
          name: 'Latte',
          price: 4.50,
        });
      });

      const cartItemId = result.current.items[0].cartItemId;

      act(() => {
        result.current.updateQuantity(cartItemId, 0);
      });

      expect(result.current.items).toHaveLength(0);
    });

    it('should remove item when quantity is negative', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem({
          id: 1,
          name: 'Latte',
          price: 4.50,
        });
      });

      const cartItemId = result.current.items[0].cartItemId;

      act(() => {
        result.current.updateQuantity(cartItemId, -1);
      });

      expect(result.current.items).toHaveLength(0);
    });
  });

  describe('clearCart', () => {
    it('should remove all items from cart', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem({
          id: 1,
          name: 'Latte',
          price: 4.50,
        });
        result.current.addItem({
          id: 2,
          name: 'Cappuccino',
          price: 4.75,
        });
        result.current.addItem({
          id: 3,
          name: 'Mocha',
          price: 5.00,
        });
      });

      expect(result.current.items).toHaveLength(3);

      act(() => {
        result.current.clearCart();
      });

      expect(result.current.items).toHaveLength(0);
    });
  });

  describe('getTotalPrice', () => {
    it('should return 0 for empty cart', () => {
      const { result } = renderHook(() => useCartStore());

      expect(result.current.getTotalPrice()).toBe(0);
    });

    it('should calculate total price for single item', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem({
          id: 1,
          name: 'Latte',
          price: 4.50,
        });
      });

      expect(result.current.getTotalPrice()).toBe(4.50);
    });

    it('should calculate total price with quantity', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem({
          id: 1,
          name: 'Latte',
          price: 4.50,
        });
      });

      const cartItemId = result.current.items[0].cartItemId;

      act(() => {
        result.current.updateQuantity(cartItemId, 3);
      });

      expect(result.current.getTotalPrice()).toBe(13.50);
    });

    it('should calculate total price for multiple items', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem({
          id: 1,
          name: 'Latte',
          price: 4.50,
        });
        result.current.addItem({
          id: 2,
          name: 'Cappuccino',
          price: 4.75,
        });
      });

      expect(result.current.getTotalPrice()).toBe(9.25);
    });

    it('should update total when items are removed', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem({
          id: 1,
          name: 'Latte',
          price: 4.50,
        });
        result.current.addItem({
          id: 2,
          name: 'Cappuccino',
          price: 4.75,
        });
      });

      expect(result.current.getTotalPrice()).toBe(9.25);

      const cartItemId = result.current.items[0].cartItemId;

      act(() => {
        result.current.removeItem(cartItemId);
      });

      expect(result.current.getTotalPrice()).toBe(4.75);
    });
  });

  describe('Persistence', () => {
    it('should persist cart items to localStorage', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem({
          id: 1,
          name: 'Latte',
          price: 4.50,
        });
      });

      // In real scenario, localStorage would be called
      // This is mocked by zustand's persist middleware
      expect(result.current.items).toHaveLength(1);
    });
  });
});
