import pool from '../config/database';

export interface MembershipUsage {
  id: number;
  user_membership_id: number;
  order_id?: number;
  redeemed_at: Date;
  coffee_name?: string;
}

export interface CreateMembershipUsageData {
  user_membership_id: number;
  order_id?: number;
  coffee_name?: string;
}

export class MembershipUsageModel {
  static async create(usageData: CreateMembershipUsageData): Promise<MembershipUsage> {
    const result = await pool.query(
      `INSERT INTO membership_usage (user_membership_id, order_id, coffee_name)
       VALUES ($1, $2, $3) RETURNING *`,
      [usageData.user_membership_id, usageData.order_id, usageData.coffee_name]
    );
    return result.rows[0];
  }

  static async findByMembershipId(membershipId: number, limit?: number): Promise<MembershipUsage[]> {
    const query = limit
      ? 'SELECT * FROM membership_usage WHERE user_membership_id = $1 ORDER BY redeemed_at DESC LIMIT $2'
      : 'SELECT * FROM membership_usage WHERE user_membership_id = $1 ORDER BY redeemed_at DESC';

    const params = limit ? [membershipId, limit] : [membershipId];
    const result = await pool.query(query, params);
    return result.rows;
  }

  static async countByMembershipIdInPeriod(
    membershipId: number,
    periodStart: Date,
    periodEnd: Date
  ): Promise<number> {
    const result = await pool.query(
      `SELECT COUNT(*) as count FROM membership_usage
       WHERE user_membership_id = $1
       AND redeemed_at >= $2
       AND redeemed_at <= $3`,
      [membershipId, periodStart, periodEnd]
    );
    return parseInt(result.rows[0].count);
  }

  static async getTodayUsageByMembershipId(membershipId: number): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const result = await pool.query(
      `SELECT COUNT(*) as count FROM membership_usage
       WHERE user_membership_id = $1
       AND redeemed_at >= $2
       AND redeemed_at < $3`,
      [membershipId, today, tomorrow]
    );
    return parseInt(result.rows[0].count);
  }
}
