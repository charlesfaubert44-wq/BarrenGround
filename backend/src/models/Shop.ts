import pool from '../config/database';

export interface Shop {
  id: string;
  name: string;
  display_name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  country?: string;
  domain?: string;
  subdomain?: string;
  stripe_account_id?: string;
  stripe_publishable_key?: string;
  sendgrid_api_key?: string;
  email_from?: string;
  email_from_name?: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  config: Record<string, any>;
  features: {
    membership: boolean;
    loyalty: boolean;
    scheduling: boolean;
    delivery: boolean;
    catering: boolean;
  };
  status: 'active' | 'suspended' | 'inactive';
  created_at: Date;
  updated_at: Date;
}

// Whitelist of allowed update fields to prevent SQL injection
const ALLOWED_UPDATE_FIELDS = new Set([
  'name', 'display_name', 'email', 'phone', 'address', 'city',
  'province', 'postal_code', 'country', 'domain', 'subdomain',
  'stripe_account_id', 'stripe_publishable_key', 'sendgrid_api_key',
  'email_from', 'email_from_name', 'logo_url', 'primary_color',
  'secondary_color', 'config', 'features', 'status'
]);

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class ShopModel {
  static async findById(id: string): Promise<Shop | null> {
    const result = await pool.query(
      'SELECT * FROM shops WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async findByDomain(domain: string): Promise<Shop | null> {
    const result = await pool.query(
      'SELECT * FROM shops WHERE domain = $1 AND status = $2',
      [domain, 'active']
    );
    return result.rows[0] || null;
  }

  static async findBySubdomain(subdomain: string): Promise<Shop | null> {
    const result = await pool.query(
      'SELECT * FROM shops WHERE subdomain = $1 AND status = $2',
      [subdomain, 'active']
    );
    return result.rows[0] || null;
  }

  static async findAll(): Promise<Shop[]> {
    const result = await pool.query(
      'SELECT * FROM shops ORDER BY display_name ASC'
    );
    return result.rows;
  }

  static async create(shopData: Partial<Shop>): Promise<Shop> {
    // Validate required fields
    if (!shopData.id) {
      throw new Error('Shop id is required');
    }
    if (!shopData.name) {
      throw new Error('Shop name is required');
    }
    if (!shopData.display_name) {
      throw new Error('Shop display_name is required');
    }
    if (!shopData.email) {
      throw new Error('Shop email is required');
    }

    // Validate email format
    if (!EMAIL_REGEX.test(shopData.email)) {
      throw new Error('Invalid email format');
    }

    // Set default values for features and config if not provided
    const features = shopData.features || {
      membership: false,
      loyalty: false,
      scheduling: false,
      delivery: false,
      catering: false,
    };

    const config = shopData.config || {};
    const status = shopData.status || 'active';

    const result = await pool.query(
      `INSERT INTO shops (
        id, name, display_name, email, phone, address, city,
        province, postal_code, country, subdomain, domain,
        stripe_account_id, stripe_publishable_key, sendgrid_api_key,
        email_from, email_from_name, logo_url, primary_color,
        secondary_color, config, features, status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,
        $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23
      )
      RETURNING *`,
      [
        shopData.id,
        shopData.name,
        shopData.display_name,
        shopData.email,
        shopData.phone || null,
        shopData.address || null,
        shopData.city || null,
        shopData.province || null,
        shopData.postal_code || null,
        shopData.country || null,
        shopData.subdomain || null,
        shopData.domain || null,
        shopData.stripe_account_id || null,
        shopData.stripe_publishable_key || null,
        shopData.sendgrid_api_key || null,
        shopData.email_from || null,
        shopData.email_from_name || null,
        shopData.logo_url || null,
        shopData.primary_color || null,
        shopData.secondary_color || null,
        JSON.stringify(config),
        JSON.stringify(features),
        status,
      ]
    );
    return result.rows[0];
  }

  static async update(id: string, updates: Partial<Shop>): Promise<Shop | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    // Build dynamic update query with whitelist validation
    Object.entries(updates).forEach(([key, value]) => {
      // Validate field name against whitelist to prevent SQL injection
      if (key !== 'id' && value !== undefined && ALLOWED_UPDATE_FIELDS.has(key)) {
        fields.push(`${key} = $${paramCount++}`);
        values.push(typeof value === 'object' ? JSON.stringify(value) : value);
      } else if (key !== 'id' && !ALLOWED_UPDATE_FIELDS.has(key)) {
        // Log or throw error for invalid field names
        throw new Error(`Invalid update field: ${key}`);
      }
    });

    if (fields.length === 0) return null;

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await pool.query(
      `UPDATE shops SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }
}
