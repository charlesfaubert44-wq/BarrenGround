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
    const result = await pool.query(
      `INSERT INTO shops (
        id, name, display_name, email, phone,
        subdomain, domain, email_from, email_from_name,
        config, features
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        shopData.id,
        shopData.name,
        shopData.display_name,
        shopData.email,
        shopData.phone,
        shopData.subdomain,
        shopData.domain,
        shopData.email_from,
        shopData.email_from_name,
        JSON.stringify(shopData.config || {}),
        JSON.stringify(shopData.features || {}),
      ]
    );
    return result.rows[0];
  }

  static async update(id: string, updates: Partial<Shop>): Promise<Shop | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    // Build dynamic update query
    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && value !== undefined) {
        fields.push(`${key} = $${paramCount++}`);
        values.push(typeof value === 'object' ? JSON.stringify(value) : value);
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
