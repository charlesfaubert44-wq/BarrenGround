import pool from '../config/database';

export interface UserMembership {
  id: number;
  user_id: number;
  plan_id: number;
  status: 'active' | 'canceled' | 'past_due' | 'expired';
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  current_period_start: Date;
  current_period_end: Date;
  coffees_remaining: number;
  cancel_at_period_end: boolean;
  shop_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserMembershipData {
  user_id: number;
  plan_id: number;
  status: 'active' | 'canceled' | 'past_due' | 'expired';
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  current_period_start: Date;
  current_period_end: Date;
  coffees_remaining: number;
  shop_id: string;
}

export class UserMembershipModel {
  static async create(membershipData: CreateUserMembershipData): Promise<UserMembership> {
    const result = await pool.query(
      `INSERT INTO user_memberships
       (user_id, plan_id, status, stripe_subscription_id, stripe_customer_id,
        current_period_start, current_period_end, coffees_remaining, shop_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        membershipData.user_id,
        membershipData.plan_id,
        membershipData.status,
        membershipData.stripe_subscription_id,
        membershipData.stripe_customer_id,
        membershipData.current_period_start,
        membershipData.current_period_end,
        membershipData.coffees_remaining,
        membershipData.shop_id
      ]
    );
    return result.rows[0];
  }

  static async findActiveByUserId(userId: number, shopId: string): Promise<UserMembership | null> {
    const result = await pool.query(
      `SELECT * FROM user_memberships
       WHERE user_id = $1 AND shop_id = $2 AND status = 'active'
       ORDER BY created_at DESC LIMIT 1`,
      [userId, shopId]
    );
    return result.rows[0] || null;
  }

  static async findByStripeSubscriptionId(subscriptionId: string, shopId: string): Promise<UserMembership | null> {
    const result = await pool.query(
      'SELECT * FROM user_memberships WHERE stripe_subscription_id = $1 AND shop_id = $2',
      [subscriptionId, shopId]
    );
    return result.rows[0] || null;
  }

  static async findById(id: number, shopId: string): Promise<UserMembership | null> {
    const result = await pool.query(
      'SELECT * FROM user_memberships WHERE id = $1 AND shop_id = $2',
      [id, shopId]
    );
    return result.rows[0] || null;
  }

  static async updateStatus(id: number, status: UserMembership['status'], shopId: string): Promise<boolean> {
    const result = await pool.query(
      'UPDATE user_memberships SET status = $1, updated_at = NOW() WHERE id = $2 AND shop_id = $3',
      [status, id, shopId]
    );
    return result.rowCount ? result.rowCount > 0 : false;
  }

  static async decrementCoffees(id: number, shopId: string): Promise<boolean> {
    const result = await pool.query(
      `UPDATE user_memberships
       SET coffees_remaining = coffees_remaining - 1, updated_at = NOW()
       WHERE id = $1 AND shop_id = $2 AND coffees_remaining > 0`,
      [id, shopId]
    );
    return result.rowCount ? result.rowCount > 0 : false;
  }

  static async resetCoffees(id: number, count: number, newPeriodStart: Date, newPeriodEnd: Date, shopId: string): Promise<boolean> {
    const result = await pool.query(
      `UPDATE user_memberships
       SET coffees_remaining = $1,
           current_period_start = $2,
           current_period_end = $3,
           updated_at = NOW()
       WHERE id = $4 AND shop_id = $5`,
      [count, newPeriodStart, newPeriodEnd, id, shopId]
    );
    return result.rowCount ? result.rowCount > 0 : false;
  }

  static async cancelAtPeriodEnd(id: number, shopId: string): Promise<boolean> {
    const result = await pool.query(
      'UPDATE user_memberships SET cancel_at_period_end = true, updated_at = NOW() WHERE id = $1 AND shop_id = $2',
      [id, shopId]
    );
    return result.rowCount ? result.rowCount > 0 : false;
  }

  static async updateSubscriptionPeriod(
    subscriptionId: string,
    periodStart: Date,
    periodEnd: Date,
    coffeesRemaining: number,
    shopId: string
  ): Promise<boolean> {
    const result = await pool.query(
      `UPDATE user_memberships
       SET current_period_start = $1,
           current_period_end = $2,
           coffees_remaining = $3,
           updated_at = NOW()
       WHERE stripe_subscription_id = $4 AND shop_id = $5`,
      [periodStart, periodEnd, coffeesRemaining, subscriptionId, shopId]
    );
    return result.rowCount ? result.rowCount > 0 : false;
  }
}
