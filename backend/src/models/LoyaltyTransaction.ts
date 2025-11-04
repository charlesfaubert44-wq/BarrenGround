import pool from '../config/database';

export interface LoyaltyTransaction {
  id: number;
  user_id: number;
  order_id?: number;
  points_earned: number;
  points_spent: number;
  balance_after: number;
  transaction_type: 'earn' | 'redeem' | 'bonus' | 'adjustment';
  description: string;
  created_at: Date;
}

export class LoyaltyTransactionModel {
  /**
   * Get user's current loyalty points balance
   */
  static async getUserBalance(userId: number): Promise<number> {
    const result = await pool.query(
      'SELECT loyalty_points FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    return result.rows[0].loyalty_points || 0;
  }

  /**
   * Get user's transaction history
   */
  static async getUserHistory(userId: number, limit: number = 50): Promise<LoyaltyTransaction[]> {
    const result = await pool.query(
      `SELECT * FROM loyalty_transactions
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit]
    );

    return result.rows;
  }

  /**
   * Award points to user (typically after purchase)
   * 1 point per dollar spent
   */
  static async earnPoints(
    userId: number,
    orderId: number,
    amount: number,
    description: string
  ): Promise<LoyaltyTransaction> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Calculate points (1 point per dollar)
      const pointsToEarn = Math.floor(amount);

      // Get current balance
      const balanceResult = await client.query(
        'SELECT loyalty_points FROM users WHERE id = $1',
        [userId]
      );

      if (balanceResult.rows.length === 0) {
        throw new Error('User not found');
      }

      const currentBalance = balanceResult.rows[0].loyalty_points || 0;
      const newBalance = currentBalance + pointsToEarn;

      // Update user balance
      await client.query(
        'UPDATE users SET loyalty_points = $1 WHERE id = $2',
        [newBalance, userId]
      );

      // Create transaction record
      const transactionResult = await client.query(
        `INSERT INTO loyalty_transactions
         (user_id, order_id, points_earned, points_spent, balance_after, transaction_type, description)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [userId, orderId, pointsToEarn, 0, newBalance, 'earn', description]
      );

      await client.query('COMMIT');

      return transactionResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Redeem points for credit
   * 100 points = $5
   * Returns credit amount in dollars
   */
  static async redeemPoints(
    userId: number,
    points: number,
    orderId?: number
  ): Promise<{ success: boolean; creditAmount: number; transaction?: LoyaltyTransaction }> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Validate minimum redemption (100 points)
      if (points < 100) {
        return { success: false, creditAmount: 0 };
      }

      // Ensure points are in multiples of 100
      const validPoints = Math.floor(points / 100) * 100;

      // Get current balance
      const balanceResult = await client.query(
        'SELECT loyalty_points FROM users WHERE id = $1',
        [userId]
      );

      if (balanceResult.rows.length === 0) {
        throw new Error('User not found');
      }

      const currentBalance = balanceResult.rows[0].loyalty_points || 0;

      // Check sufficient balance
      if (currentBalance < validPoints) {
        await client.query('ROLLBACK');
        return { success: false, creditAmount: 0 };
      }

      // Calculate credit amount: 100 points = $5
      const creditAmount = (validPoints / 100) * 5;
      const newBalance = currentBalance - validPoints;

      // Update user balance
      await client.query(
        'UPDATE users SET loyalty_points = $1 WHERE id = $2',
        [newBalance, userId]
      );

      // Create transaction record
      const transactionResult = await client.query(
        `INSERT INTO loyalty_transactions
         (user_id, order_id, points_earned, points_spent, balance_after, transaction_type, description)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          userId,
          orderId || null,
          0,
          validPoints,
          newBalance,
          'redeem',
          `Redeemed ${validPoints} points for $${creditAmount.toFixed(2)} credit`
        ]
      );

      await client.query('COMMIT');

      return {
        success: true,
        creditAmount,
        transaction: transactionResult.rows[0]
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Add bonus points (birthday, referral, promotion)
   */
  static async addBonusPoints(
    userId: number,
    points: number,
    type: 'birthday' | 'referral' | 'promotion',
    description: string
  ): Promise<LoyaltyTransaction> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Get current balance
      const balanceResult = await client.query(
        'SELECT loyalty_points FROM users WHERE id = $1',
        [userId]
      );

      if (balanceResult.rows.length === 0) {
        throw new Error('User not found');
      }

      const currentBalance = balanceResult.rows[0].loyalty_points || 0;
      const newBalance = currentBalance + points;

      // Update user balance
      await client.query(
        'UPDATE users SET loyalty_points = $1 WHERE id = $2',
        [newBalance, userId]
      );

      // Create transaction record
      const transactionResult = await client.query(
        `INSERT INTO loyalty_transactions
         (user_id, points_earned, points_spent, balance_after, transaction_type, description)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [userId, points, 0, newBalance, 'bonus', description]
      );

      await client.query('COMMIT');

      return transactionResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Convert points to dollar value
   * 100 points = $5
   */
  static getPointsValue(points: number): number {
    return (points / 100) * 5;
  }

  /**
   * Get maximum redeemable points for a given order total
   * Points can cover up to 100% of order
   */
  static getMaxRedeemablePoints(orderTotal: number, userBalance: number): number {
    // Maximum credit that can be applied (100% of order)
    const maxCredit = orderTotal;

    // Convert to points (100 points = $5)
    const maxPointsForOrder = Math.floor((maxCredit / 5) * 100);

    // Round down to nearest 100 (minimum redemption)
    const roundedMaxPoints = Math.floor(maxPointsForOrder / 100) * 100;

    // Return minimum of user balance and calculated max
    return Math.min(userBalance, roundedMaxPoints);
  }
}
