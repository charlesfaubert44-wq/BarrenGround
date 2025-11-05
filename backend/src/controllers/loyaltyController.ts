import { Request, Response } from 'express';
import { LoyaltyTransactionModel } from '../models/LoyaltyTransaction';
import pool from '../config/database';

/**
 * Get user's loyalty points balance
 */
export const getBalance = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const balance = await LoyaltyTransactionModel.getUserBalance(userId, req.shop!.id);
    const value = LoyaltyTransactionModel.getPointsValue(balance);

    res.json({
      points: balance,
      value: parseFloat(value.toFixed(2)),
      nextReward: 100 - (balance % 100), // Points until next $5 reward
    });
  } catch (error) {
    console.error('Error fetching loyalty balance:', error);
    res.status(500).json({ error: 'Failed to fetch loyalty balance' });
  }
};

/**
 * Get user's loyalty transaction history
 */
export const getHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 50;

    const history = await LoyaltyTransactionModel.getUserHistory(userId, req.shop!.id, limit);

    res.json({ history });
  } catch (error) {
    console.error('Error fetching loyalty history:', error);
    res.status(500).json({ error: 'Failed to fetch loyalty history' });
  }
};

/**
 * Redeem loyalty points for credit
 * Minimum 100 points, must be in increments of 100
 */
export const redeemPoints = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { points } = req.body;

    // Validate points
    if (!points || typeof points !== 'number') {
      res.status(400).json({ error: 'Points must be a valid number' });
      return;
    }

    // Validate minimum redemption
    if (points < 100) {
      res.status(400).json({
        error: 'Minimum redemption is 100 points',
      });
      return;
    }

    // Validate increment of 100
    if (points % 100 !== 0) {
      res.status(400).json({
        error: 'Points must be redeemed in increments of 100',
      });
      return;
    }

    const result = await LoyaltyTransactionModel.redeemPoints(userId, points, req.shop!.id);

    if (!result.success) {
      res.status(400).json({
        error: 'Insufficient points balance',
      });
      return;
    }

    res.json({
      success: true,
      creditAmount: result.creditAmount,
      pointsRedeemed: points,
      transaction: result.transaction,
    });
  } catch (error) {
    console.error('Error redeeming points:', error);
    res.status(500).json({ error: 'Failed to redeem points' });
  }
};

/**
 * Check and award birthday bonus if applicable
 * Awards 50 points on user's birthday (once per year)
 */
export const checkBirthdayBonus = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const currentYear = new Date().getFullYear();

    // Get user's date of birth and last birthday bonus year
    const userResult = await pool.query(
      'SELECT date_of_birth, last_birthday_bonus_year FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const user = userResult.rows[0];

    // Check if user has a birthday set
    if (!user.date_of_birth) {
      res.json({
        eligible: false,
        message: 'No birthday set. Please update your profile.',
      });
      return;
    }

    const birthDate = new Date(user.date_of_birth);
    const today = new Date();

    // Check if today is the user's birthday
    const isBirthday =
      birthDate.getMonth() === today.getMonth() &&
      birthDate.getDate() === today.getDate();

    if (!isBirthday) {
      res.json({
        eligible: false,
        message: 'Today is not your birthday.',
      });
      return;
    }

    // Check if bonus was already awarded this year
    if (user.last_birthday_bonus_year === currentYear) {
      res.json({
        eligible: false,
        message: 'Birthday bonus already claimed this year.',
      });
      return;
    }

    // Award birthday bonus
    const transaction = await LoyaltyTransactionModel.addBonusPoints(
      userId,
      50,
      'birthday',
      `Birthday bonus ${currentYear}`,
      req.shop!.id
    );

    // Update last birthday bonus year
    await pool.query(
      'UPDATE users SET last_birthday_bonus_year = $1 WHERE id = $2',
      [currentYear, userId]
    );

    res.json({
      eligible: true,
      message: 'Happy Birthday! 50 bonus points awarded!',
      pointsAwarded: 50,
      transaction,
    });
  } catch (error) {
    console.error('Error checking birthday bonus:', error);
    res.status(500).json({ error: 'Failed to check birthday bonus' });
  }
};

/**
 * Calculate maximum points that can be redeemed for an order
 */
export const getMaxRedeemable = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { orderTotal } = req.query;

    if (!orderTotal) {
      res.status(400).json({ error: 'orderTotal is required' });
      return;
    }

    const orderTotalNum = parseFloat(orderTotal as string);

    if (isNaN(orderTotalNum) || orderTotalNum <= 0) {
      res.status(400).json({ error: 'orderTotal must be a positive number' });
      return;
    }

    const balance = await LoyaltyTransactionModel.getUserBalance(userId, req.shop!.id);
    const maxPoints = LoyaltyTransactionModel.getMaxRedeemablePoints(orderTotalNum, balance);

    res.json({
      maxPoints,
      maxCredit: LoyaltyTransactionModel.getPointsValue(maxPoints),
      userBalance: balance,
    });
  } catch (error) {
    console.error('Error calculating max redeemable:', error);
    res.status(500).json({ error: 'Failed to calculate max redeemable points' });
  }
};
