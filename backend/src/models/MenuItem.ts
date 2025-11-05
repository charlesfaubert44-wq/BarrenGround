import pool from '../config/database';

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url?: string;
  is_available: boolean;
  customization_options?: any;
  shop_id: string;
  created_at: Date;
}

export interface CreateMenuItemData {
  name: string;
  description: string;
  price: number;
  category: string;
  image_url?: string;
  is_available?: boolean;
  customization_options?: any;
}

export class MenuItemModel {
  static async getAll(shopId: string): Promise<MenuItem[]> {
    const result = await pool.query(
      'SELECT * FROM menu_items WHERE shop_id = $1 ORDER BY category, name',
      [shopId]
    );
    return result.rows;
  }

  static async getAvailable(shopId: string): Promise<MenuItem[]> {
    const result = await pool.query(
      'SELECT * FROM menu_items WHERE is_available = true AND shop_id = $1 ORDER BY category, name',
      [shopId]
    );
    return result.rows;
  }

  static async getById(id: number, shopId: string): Promise<MenuItem | null> {
    const result = await pool.query(
      'SELECT * FROM menu_items WHERE id = $1 AND shop_id = $2',
      [id, shopId]
    );
    return result.rows[0] || null;
  }

  static async create(data: CreateMenuItemData, shopId: string): Promise<MenuItem> {
    const result = await pool.query(
      `INSERT INTO menu_items (name, description, price, category, image_url, is_available, customization_options, shop_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [data.name, data.description, data.price, data.category, data.image_url, data.is_available ?? true, JSON.stringify(data.customization_options || []), shopId]
    );
    return result.rows[0];
  }

  static async update(id: number, updates: Partial<MenuItem>, shopId: string): Promise<MenuItem | null> {
    // Build dynamic update query with shop_id verification
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'shop_id' && value !== undefined) {
        fields.push(`${key} = $${paramCount++}`);
        values.push(key === 'customization_options' ? JSON.stringify(value) : value);
      }
    });

    if (fields.length === 0) return null;

    values.push(id, shopId);

    const result = await pool.query(
      `UPDATE menu_items SET ${fields.join(', ')} WHERE id = $${paramCount++} AND shop_id = $${paramCount++} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  static async delete(id: number, shopId: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM menu_items WHERE id = $1 AND shop_id = $2',
      [id, shopId]
    );
    return result.rowCount ? result.rowCount > 0 : false;
  }

  static async updateAvailability(id: number, isAvailable: boolean, shopId: string): Promise<MenuItem | null> {
    const result = await pool.query(
      'UPDATE menu_items SET is_available = $1 WHERE id = $2 AND shop_id = $3 RETURNING *',
      [isAvailable, id, shopId]
    );
    return result.rows[0] || null;
  }
}
