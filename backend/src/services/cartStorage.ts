// In-memory cart storage for live cart monitoring
// Note: In production with multiple instances, migrate to Redis

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  customizations?: Record<string, string>;
  cartItemId: string;
}

interface StoredCart {
  sessionId: string;
  items: CartItem[];
  total: number;
  itemCount: number;
  lastUpdated: number;
  createdAt: number;
  shopId: string;
}

class CartStorageService {
  private carts: Map<string, StoredCart> = new Map();
  private readonly CART_EXPIRY = 30 * 60 * 1000; // 30 minutes

  /**
   * Update or create a cart
   */
  updateCart(sessionId: string, shopId: string, cartData: {
    items: CartItem[];
    total: number;
    itemCount: number;
  }): void {
    const existingCart = this.carts.get(sessionId);

    this.carts.set(sessionId, {
      sessionId,
      items: cartData.items,
      total: cartData.total,
      itemCount: cartData.itemCount,
      lastUpdated: Date.now(),
      createdAt: existingCart?.createdAt || Date.now(),
      shopId,
    });

    // Clean up expired carts
    this.cleanup();
  }

  /**
   * Get all active carts for a shop
   */
  getActiveCarts(shopId: string): StoredCart[] {
    this.cleanup();

    return Array.from(this.carts.values())
      .filter(cart => cart.shopId === shopId)
      .sort((a, b) => b.lastUpdated - a.lastUpdated); // Most recent first
  }

  /**
   * Remove a cart (on checkout or manual deletion)
   */
  removeCart(sessionId: string): void {
    this.carts.delete(sessionId);
  }

  /**
   * Clean up expired carts
   */
  private cleanup(): void {
    const now = Date.now();

    for (const [sessionId, cart] of this.carts.entries()) {
      if (now - cart.lastUpdated > this.CART_EXPIRY) {
        this.carts.delete(sessionId);
        console.log(`[Cart Storage] Cleaned up expired cart: ${sessionId}`);
      }
    }
  }

  /**
   * Get cart count for a shop
   */
  getCartCount(shopId: string): number {
    this.cleanup();
    return Array.from(this.carts.values())
      .filter(cart => cart.shopId === shopId).length;
  }
}

// Singleton instance
export const cartStorage = new CartStorageService();
