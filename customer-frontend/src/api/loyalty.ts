import { apiRequest } from './client';

export interface LoyaltyBalance {
  points: number;
  value: number;
  nextReward: number;
}

export interface LoyaltyTransaction {
  id: number;
  user_id: number;
  order_id?: number;
  points_earned: number;
  points_spent: number;
  balance_after: number;
  transaction_type: 'earn' | 'redeem' | 'bonus' | 'adjustment';
  description: string;
  created_at: string;
}

export interface LoyaltyHistory {
  history: LoyaltyTransaction[];
}

export interface RedeemResponse {
  success: boolean;
  creditAmount: number;
  pointsRedeemed: number;
  transaction: LoyaltyTransaction;
}

export interface BirthdayBonusResponse {
  eligible: boolean;
  message: string;
  pointsAwarded?: number;
  transaction?: LoyaltyTransaction;
}

export interface MaxRedeemableResponse {
  maxPoints: number;
  maxCredit: number;
  userBalance: number;
}

/**
 * Get user's current loyalty points balance
 */
export async function getBalance(): Promise<LoyaltyBalance> {
  return apiRequest<LoyaltyBalance>('/api/loyalty/balance');
}

/**
 * Get user's loyalty transaction history
 */
export async function getHistory(limit?: number): Promise<LoyaltyHistory> {
  const params = limit ? `?limit=${limit}` : '';
  return apiRequest<LoyaltyHistory>(`/api/loyalty/history${params}`);
}

/**
 * Redeem loyalty points for credit
 */
export async function redeemPoints(points: number): Promise<RedeemResponse> {
  return apiRequest<RedeemResponse>('/api/loyalty/redeem', {
    method: 'POST',
    body: JSON.stringify({ points }),
  });
}

/**
 * Check and claim birthday bonus
 */
export async function checkBirthdayBonus(): Promise<BirthdayBonusResponse> {
  return apiRequest<BirthdayBonusResponse>('/api/loyalty/check-birthday', {
    method: 'POST',
  });
}

/**
 * Get maximum redeemable points for an order total
 */
export async function getMaxRedeemable(orderTotal: number): Promise<MaxRedeemableResponse> {
  return apiRequest<MaxRedeemableResponse>(
    `/api/loyalty/max-redeemable?orderTotal=${orderTotal}`
  );
}
