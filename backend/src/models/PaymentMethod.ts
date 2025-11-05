import pool from '../config/database';

export interface PaymentMethod {
  id: number;
  user_id: number;
  stripe_payment_method_id: string;
  type: string;
  last4?: string;
  brand?: string;
  exp_month?: number;
  exp_year?: number;
  is_default: boolean;
  shop_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreatePaymentMethodData {
  user_id: number;
  stripe_payment_method_id: string;
  type: string;
  last4?: string;
  brand?: string;
  exp_month?: number;
  exp_year?: number;
  is_default?: boolean;
  shop_id: string;
}

export class PaymentMethodModel {
  static async create(data: CreatePaymentMethodData): Promise<PaymentMethod> {
    // If this is set as default, unset all other default payment methods for this user
    if (data.is_default) {
      await this.unsetAllDefaults(data.user_id, data.shop_id);
    }

    const result = await pool.query(
      `INSERT INTO payment_methods (user_id, stripe_payment_method_id, type, last4, brand, exp_month, exp_year, is_default, shop_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        data.user_id,
        data.stripe_payment_method_id,
        data.type,
        data.last4,
        data.brand,
        data.exp_month,
        data.exp_year,
        data.is_default || false,
        data.shop_id
      ]
    );
    return result.rows[0];
  }

  static async findByUserId(userId: number, shopId: string): Promise<PaymentMethod[]> {
    const result = await pool.query(
      'SELECT * FROM payment_methods WHERE user_id = $1 AND shop_id = $2 ORDER BY is_default DESC, created_at DESC',
      [userId, shopId]
    );
    return result.rows;
  }

  static async findById(id: number, shopId: string): Promise<PaymentMethod | null> {
    const result = await pool.query(
      'SELECT * FROM payment_methods WHERE id = $1 AND shop_id = $2',
      [id, shopId]
    );
    return result.rows[0] || null;
  }

  static async findDefault(userId: number, shopId: string): Promise<PaymentMethod | null> {
    const result = await pool.query(
      'SELECT * FROM payment_methods WHERE user_id = $1 AND shop_id = $2 AND is_default = true LIMIT 1',
      [userId, shopId]
    );
    return result.rows[0] || null;
  }

  static async setAsDefault(id: number, userId: number, shopId: string): Promise<PaymentMethod | null> {
    // First, unset all defaults for this user
    await this.unsetAllDefaults(userId, shopId);

    // Then set this one as default
    const result = await pool.query(
      `UPDATE payment_methods SET is_default = true, updated_at = NOW()
       WHERE id = $1 AND user_id = $2 AND shop_id = $3
       RETURNING *`,
      [id, userId, shopId]
    );
    return result.rows[0] || null;
  }

  static async delete(id: number, userId: number, shopId: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM payment_methods WHERE id = $1 AND user_id = $2 AND shop_id = $3',
      [id, userId, shopId]
    );
    return result.rowCount ? result.rowCount > 0 : false;
  }

  private static async unsetAllDefaults(userId: number, shopId: string): Promise<void> {
    await pool.query(
      'UPDATE payment_methods SET is_default = false, updated_at = NOW() WHERE user_id = $1 AND shop_id = $2',
      [userId, shopId]
    );
  }

  static async deleteByStripeId(stripePaymentMethodId: string, shopId: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM payment_methods WHERE stripe_payment_method_id = $1 AND shop_id = $2',
      [stripePaymentMethodId, shopId]
    );
    return result.rowCount ? result.rowCount > 0 : false;
  }
}
