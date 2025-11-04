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
}

export class UserMembershipModel {
  static async create(membershipData: CreateUserMembershipData): Promise<UserMembership> {
    const result = await pool.query(
      `INSERT INTO user_memberships
       (user_id, plan_id, status, stripe_subscription_id, stripe_customer_id,
        current_period_start, current_period_end, coffees_remaining)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        membershipData.user_id,
        membershipData.plan_id,
        membershipData.status,
        membershipData.stripe_subscription_id,
        membershipData.stripe_customer_id,
        membershipData.current_period_start,
        membershipData.current_period_end,
        membershipData.coffees_remaining
      ]
    );
    return result.rows[0];
  }

  static async findActiveByUserId(userId: number): Promise<UserMembership | null> {
    const result = await pool.query(
      `SELECT * FROM user_memberships
       WHERE user_id = $1 AND status = 'active'
       ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );
    return result.rows[0] || null;
  }

  static async findByStripeSubscriptionId(subscriptionId: string): Promise<UserMembership | null> {
    const result = await pool.query(
      'SELECT * FROM user_memberships WHERE stripe_subscription_id = $1',
      [subscriptionId]
    );
    return result.rows[0] || null;
  }

  static async findById(id: number): Promise<UserMembership | null> {
    const result = await pool.query(
      'SELECT * FROM user_memberships WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async updateStatus(id: number, status: UserMembership['status']): Promise<boolean> {
    const result = await pool.query(
      'UPDATE user_memberships SET status = $1, updated_at = NOW() WHERE id = $2',
      [status, id]
    );
    return result.rowCount ? result.rowCount > 0 : false;
  }

  static async decrementCoffees(id: number): Promise<boolean> {
    const result = await pool.query(
      `UPDATE user_memberships
       SET coffees_remaining = coffees_remaining - 1, updated_at = NOW()
       WHERE id = $1 AND coffees_remaining > 0`,
      [id]
    );
    return result.rowCount ? result.rowCount > 0 : false;
  }

  static async resetCoffees(id: number, count: number, newPeriodStart: Date, newPeriodEnd: Date): Promise<boolean> {
    const result = await pool.query(
      `UPDATE user_memberships
       SET coffees_remaining = $1,
           current_period_start = $2,
           current_period_end = $3,
           updated_at = NOW()
       WHERE id = $4`,
      [count, newPeriodStart, newPeriodEnd, id]
    );
    return result.rowCount ? result.rowCount > 0 : false;
  }

  static async cancelAtPeriodEnd(id: number): Promise<boolean> {
    const result = await pool.query(
      'UPDATE user_memberships SET cancel_at_period_end = true, updated_at = NOW() WHERE id = $1',
      [id]
    );
    return result.rowCount ? result.rowCount > 0 : false;
  }

  static async updateSubscriptionPeriod(
    subscriptionId: string,
    periodStart: Date,
    periodEnd: Date,
    coffeesRemaining: number
  ): Promise<boolean> {
    const result = await pool.query(
      `UPDATE user_memberships
       SET current_period_start = $1,
           current_period_end = $2,
           coffees_remaining = $3,
           updated_at = NOW()
       WHERE stripe_subscription_id = $4`,
      [periodStart, periodEnd, coffeesRemaining, subscriptionId]
    );
    return result.rowCount ? result.rowCount > 0 : false;
  }
}
