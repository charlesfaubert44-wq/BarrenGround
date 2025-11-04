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
  created_at: Date;
}

export class MembershipPlanModel {
  static async findAll(): Promise<MembershipPlan[]> {
    const result = await pool.query(
      'SELECT * FROM membership_plans WHERE active = true ORDER BY price ASC'
    );
    return result.rows;
  }

  static async findById(id: number): Promise<MembershipPlan | null> {
    const result = await pool.query(
      'SELECT * FROM membership_plans WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async findByStripePriceId(stripePriceId: string): Promise<MembershipPlan | null> {
    const result = await pool.query(
      'SELECT * FROM membership_plans WHERE stripe_price_id = $1',
      [stripePriceId]
    );
    return result.rows[0] || null;
  }

  static async create(planData: Omit<MembershipPlan, 'id' | 'created_at'>): Promise<MembershipPlan> {
    const result = await pool.query(
      `INSERT INTO membership_plans (name, description, price, interval, coffees_per_interval, stripe_price_id, active)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        planData.name,
        planData.description,
        planData.price,
        planData.interval,
        planData.coffees_per_interval,
        planData.stripe_price_id,
        planData.active
      ]
    );
    return result.rows[0];
  }

  static async updateStripePriceId(id: number, stripePriceId: string): Promise<boolean> {
    const result = await pool.query(
      'UPDATE membership_plans SET stripe_price_id = $1 WHERE id = $2',
      [stripePriceId, id]
    );
    return result.rowCount ? result.rowCount > 0 : false;
  }
}
