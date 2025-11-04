import { apiRequest } from './client';

export interface MembershipPlan {
  id: number;
  name: string;
  description?: string;
  price: number;
  interval: 'week' | 'month' | 'year';
  coffees_per_interval: number;
  stripe_price_id?: string;
  active: boolean;
  created_at: string;
}

export interface MembershipUsage {
  id: number;
  user_membership_id: number;
  order_id?: number;
  redeemed_at: string;
  coffee_name?: string;
}

export interface UserMembership {
  id: number;
  user_id: number;
  plan_id: number;
  status: 'active' | 'canceled' | 'past_due' | 'expired';
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  current_period_start: string;
  current_period_end: string;
  coffees_remaining: number;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
  plan?: MembershipPlan;
  usageHistory?: MembershipUsage[];
  todayUsageCount?: number;
  canRedeemToday?: boolean;
}

export interface MembershipStatusResponse {
  membership: UserMembership | null;
}

export interface MembershipPlansResponse {
  plans: MembershipPlan[];
}

export interface SubscribeRequest {
  planId: number;
  paymentMethodId: string;
}

export interface SubscribeResponse {
  membership: UserMembership;
  clientSecret: string | null;
}

export interface RedeemRequest {
  coffeeName: string;
}

export interface RedeemResponse {
  message: string;
  coffeesRemaining: number;
}

export async function getPlans(): Promise<MembershipPlansResponse> {
  return apiRequest<MembershipPlansResponse>('/api/membership/plans');
}

export async function getMembershipStatus(): Promise<MembershipStatusResponse> {
  return apiRequest<MembershipStatusResponse>('/api/membership/status');
}

export async function subscribe(data: SubscribeRequest): Promise<SubscribeResponse> {
  return apiRequest<SubscribeResponse>('/api/membership/subscribe', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function cancelSubscription(): Promise<{ message: string; membership: UserMembership }> {
  return apiRequest('/api/membership/cancel', {
    method: 'POST',
  });
}

export async function redeemCoffee(data: RedeemRequest): Promise<RedeemResponse> {
  return apiRequest<RedeemResponse>('/api/membership/redeem', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
