import { Request, Response, NextFunction } from 'express';
import { ShopModel } from '../models/Shop';

export async function extractTenantContext(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Method 1: Extract from subdomain (e.g., barrenground.platform.com)
    const host = req.hostname;
    const parts = host.split('.');

    let shop = null;

    // Check if it's a subdomain pattern (subdomain.platform.com)
    if (parts.length >= 3) {
      const subdomain = parts[0];
      shop = await ShopModel.findBySubdomain(subdomain);
    }

    // Method 2: Extract from custom domain (e.g., barrengroundcoffee.com)
    if (!shop) {
      shop = await ShopModel.findByDomain(host);
    }

    // Method 3: Extract from X-Shop-ID header (for testing/admin)
    if (!shop && req.headers['x-shop-id']) {
      const shopId = req.headers['x-shop-id'] as string;
      shop = await ShopModel.findById(shopId);
    }

    // Method 4: Fall back to default shop (development only)
    if (!shop && process.env.NODE_ENV === 'development') {
      shop = await ShopModel.findById('barrenground');
    }

    if (!shop) {
      res.status(404).json({
        error: 'Shop not found',
        message: 'No shop configured for this domain/subdomain',
        hostname: host
      });
      return;
    }

    if (shop.status !== 'active') {
      res.status(403).json({
        error: 'Shop suspended',
        message: 'This shop is currently unavailable'
      });
      return;
    }

    // Attach shop to request
    req.shop = shop;
    next();
  } catch (error) {
    console.error('Tenant context error:', error);
    res.status(500).json({ error: 'Failed to determine shop context' });
  }
}
