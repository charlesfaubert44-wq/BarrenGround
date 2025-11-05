import pool from '../config/database';

export interface MembershipPlan {
  id: number;
  name: string;
  description?: string;
  price: number;
  interval: 'week' | 'month' | 'year';
  coffees_per_interval: number;
  stripe_price_id?: string;
  active: boolean;
  shop_id: string;
  created_at: Date;
}

export class MembershipPlanModel {
  static async findAll(shopId: string): Promise<MembershipPlan[]> {
    const result = await pool.query(
      'SELECT * FROM membership_plans WHERE shop_id = $1 AND active = true ORDER BY price ASC',
      [shopId]
    );
    return result.rows;
  }

  static async findById(id: number, shopId: string): Promise<MembershipPlan | null> {
    const result = await pool.query(
      'SELECT * FROM membership_plans WHERE id = $1 AND shop_id = $2',
      [id, shopId]
    );
    return result.rows[0] || null;
  }

  static async findByStripePriceId(stripePriceId: string, shopId: string): Promise<MembershipPlan | null> {
    const result = await pool.query(
      'SELECT * FROM membership_plans WHERE stripe_price_id = $1 AND shop_id = $2',
      [stripePriceId, shopId]
    );
    return result.rows[0] || null;
  }

  static async create(planData: Omit<MembershipPlan, 'id' | 'created_at'>): Promise<MembershipPlan> {
    const result = await pool.query(
      `INSERT INTO membership_plans (name, description, price, interval, coffees_per_interval, stripe_price_id, active, shop_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        planData.name,
        planData.description,
        planData.price,
        planData.interval,
        planData.coffees_per_interval,
        planData.stripe_price_id,
        planData.active,
        planData.shop_id
      ]
    );
    return result.rows[0];
  }

  static async updateStripePriceId(id: number, stripePriceId: string, shopId: string): Promise<boolean> {
    const result = await pool.query(
      'UPDATE membership_plans SET stripe_price_id = $1 WHERE id = $2 AND shop_id = $3',
      [stripePriceId, id, shopId]
    );
    return result.rowCount ? result.rowCount > 0 : false;
  }
}
