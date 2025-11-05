import pool from '../config/database';

export interface News {
  id: number;
  title: string;
  content: string;
  image_url?: string;
  active: boolean;
  priority: number;
  shop_id: string;
  created_at: Date;
  updated_at: Date;
}

export class NewsModel {
  static async findAll(shopId: string): Promise<News[]> {
    const result = await pool.query(
      'SELECT * FROM news WHERE shop_id = $1 ORDER BY priority DESC, created_at DESC',
      [shopId]
    );
    return result.rows;
  }

  static async findById(id: number, shopId: string): Promise<News | null> {
    const result = await pool.query(
      'SELECT * FROM news WHERE id = $1 AND shop_id = $2',
      [id, shopId]
    );
    return result.rows[0] || null;
  }

  static async findActive(shopId: string): Promise<News[]> {
    const result = await pool.query(
      'SELECT * FROM news WHERE shop_id = $1 AND active = true ORDER BY priority DESC, created_at DESC',
      [shopId]
    );
    return result.rows;
  }

  static async create(data: Omit<News, 'id' | 'created_at' | 'updated_at'>): Promise<News> {
    const result = await pool.query(
      `INSERT INTO news (title, content, image_url, active, priority, shop_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        data.title,
        data.content,
        data.image_url || null,
        data.active,
        data.priority || 0,
        data.shop_id
      ]
    );
    return result.rows[0];
  }

  static async update(id: number, data: Partial<Omit<News, 'id' | 'created_at' | 'updated_at'>>, shopId: string): Promise<News | null> {
    const fields: string[] = [];
    const values: (string | boolean | number | null)[] = [];
    let paramCount = 1;

    if (data.title !== undefined) {
      fields.push(`title = $${paramCount++}`);
      values.push(data.title);
    }
    if (data.content !== undefined) {
      fields.push(`content = $${paramCount++}`);
      values.push(data.content);
    }
    if (data.image_url !== undefined) {
      fields.push(`image_url = $${paramCount++}`);
      values.push(data.image_url || null);
    }
    if (data.active !== undefined) {
      fields.push(`active = $${paramCount++}`);
      values.push(data.active);
    }
    if (data.priority !== undefined) {
      fields.push(`priority = $${paramCount++}`);
      values.push(data.priority);
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = NOW()`);
    values.push(id);
    values.push(shopId);

    const result = await pool.query(
      `UPDATE news SET ${fields.join(', ')} WHERE id = $${paramCount} AND shop_id = $${paramCount + 1} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  static async updateActive(id: number, active: boolean, shopId: string): Promise<News | null> {
    const result = await pool.query(
      'UPDATE news SET active = $1, updated_at = NOW() WHERE id = $2 AND shop_id = $3 RETURNING *',
      [active, id, shopId]
    );
    return result.rows[0] || null;
  }

  static async delete(id: number, shopId: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM news WHERE id = $1 AND shop_id = $2',
      [id, shopId]
    );
    return result.rowCount ? result.rowCount > 0 : false;
  }
}
