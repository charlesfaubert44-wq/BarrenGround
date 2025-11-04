import pool from '../config/database';

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url?: string;
  available: boolean;
  created_at: Date;
}

export class MenuItemModel {
  static async getAll(): Promise<MenuItem[]> {
    const result = await pool.query(
      'SELECT * FROM menu_items ORDER BY category, name'
    );
    return result.rows;
  }

  static async getAvailable(): Promise<MenuItem[]> {
    const result = await pool.query(
      'SELECT * FROM menu_items WHERE available = true ORDER BY category, name'
    );
    return result.rows;
  }

  static async getById(id: number): Promise<MenuItem | null> {
    const result = await pool.query(
      'SELECT * FROM menu_items WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async updateAvailability(id: number, available: boolean): Promise<MenuItem | null> {
    const result = await pool.query(
      'UPDATE menu_items SET available = $1 WHERE id = $2 RETURNING *',
      [available, id]
    );
    return result.rows[0] || null;
  }

  static async create(item: Omit<MenuItem, 'id' | 'created_at'>): Promise<MenuItem> {
    const result = await pool.query(
      `INSERT INTO menu_items (name, description, price, category, image_url, available)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [item.name, item.description, item.price, item.category, item.image_url, item.available]
    );
    return result.rows[0];
  }

  static async update(id: number, item: Partial<Omit<MenuItem, 'id' | 'created_at'>>): Promise<MenuItem | null> {
    const fields: string[] = [];
    const values: (string | number | boolean)[] = [];
    let paramCount = 1;

    if (item.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(item.name);
    }
    if (item.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(item.description);
    }
    if (item.price !== undefined) {
      fields.push(`price = $${paramCount++}`);
      values.push(item.price);
    }
    if (item.category !== undefined) {
      fields.push(`category = $${paramCount++}`);
      values.push(item.category);
    }
    if (item.image_url !== undefined) {
      fields.push(`image_url = $${paramCount++}`);
      values.push(item.image_url);
    }
    if (item.available !== undefined) {
      fields.push(`available = $${paramCount++}`);
      values.push(item.available);
    }

    if (fields.length === 0) return null;

    values.push(id);
    const result = await pool.query(
      `UPDATE menu_items SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  static async delete(id: number): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM menu_items WHERE id = $1',
      [id]
    );
    return result.rowCount ? result.rowCount > 0 : false;
  }
}
