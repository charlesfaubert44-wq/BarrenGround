import pool from '../config/database';

export interface Promo {
  id: number;
  title: string;
  description: string;
  image_url: string;
  link_url?: string;
  active: boolean;
  start_date?: Date;
  end_date?: Date;
  shop_id: string;
  created_at: Date;
  updated_at: Date;
}

export class PromoModel {
  static async findAll(shopId: string): Promise<Promo[]> {
    const result = await pool.query(
      'SELECT * FROM promos WHERE shop_id = $1 ORDER BY created_at DESC',
      [shopId]
    );
    return result.rows;
  }

  static async findById(id: number, shopId: string): Promise<Promo | null> {
    const result = await pool.query(
      'SELECT * FROM promos WHERE id = $1 AND shop_id = $2',
      [id, shopId]
    );
    return result.rows[0] || null;
  }

  static async findActive(shopId: string): Promise<Promo[]> {
    const result = await pool.query(
      `SELECT * FROM promos
       WHERE shop_id = $1
       AND active = true
       AND (start_date IS NULL OR start_date <= NOW())
       AND (end_date IS NULL OR end_date >= NOW())
       ORDER BY created_at DESC`,
      [shopId]
    );
    return result.rows;
  }

  static async create(data: Omit<Promo, 'id' | 'created_at' | 'updated_at'>): Promise<Promo> {
    const result = await pool.query(
      `INSERT INTO promos (title, description, image_url, link_url, active, start_date, end_date, shop_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        data.title,
        data.description,
        data.image_url,
        data.link_url || null,
        data.active,
        data.start_date || null,
        data.end_date || null,
        data.shop_id
      ]
    );
    return result.rows[0];
  }

  static async update(id: number, data: Partial<Omit<Promo, 'id' | 'created_at' | 'updated_at'>>, shopId: string): Promise<Promo | null> {
    const fields: string[] = [];
    const values: (string | boolean | number | Date | null)[] = [];
    let paramCount = 1;

    if (data.title !== undefined) {
      fields.push(`title = $${paramCount++}`);
      values.push(data.title);
    }
    if (data.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(data.description);
    }
    if (data.image_url !== undefined) {
      fields.push(`image_url = $${paramCount++}`);
      values.push(data.image_url);
    }
    if (data.link_url !== undefined) {
      fields.push(`link_url = $${paramCount++}`);
      values.push(data.link_url || null);
    }
    if (data.active !== undefined) {
      fields.push(`active = $${paramCount++}`);
      values.push(data.active);
    }
    if (data.start_date !== undefined) {
      fields.push(`start_date = $${paramCount++}`);
      values.push(data.start_date || null);
    }
    if (data.end_date !== undefined) {
      fields.push(`end_date = $${paramCount++}`);
      values.push(data.end_date || null);
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = NOW()`);
    values.push(id);
    values.push(shopId);

    const result = await pool.query(
      `UPDATE promos SET ${fields.join(', ')} WHERE id = $${paramCount} AND shop_id = $${paramCount + 1} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  static async updateActive(id: number, active: boolean, shopId: string): Promise<Promo | null> {
    const result = await pool.query(
      'UPDATE promos SET active = $1, updated_at = NOW() WHERE id = $2 AND shop_id = $3 RETURNING *',
      [active, id, shopId]
    );
    return result.rows[0] || null;
  }

  static async delete(id: number, shopId: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM promos WHERE id = $1 AND shop_id = $2',
      [id, shopId]
    );
    return result.rowCount ? result.rowCount > 0 : false;
  }
}
