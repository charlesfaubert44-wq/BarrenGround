import { apiRequest } from './client';

export interface CreateOrderRequest {
  items: Array<{
    menu_item_id: number;
    menu_item_name: string;
    quantity: number;
    price_snapshot: number;
    customizations?: Record<string, string>;
  }>;
  guest_email?: string;
  guest_name?: string;
  guest_phone?: string;
  pickup_time?: string;
}

export interface Order {
  id: number;
  user_id?: number;
  guest_email?: string;
  guest_name?: string;
  guest_phone?: string;
  total: number;
  status: string;
  payment_intent_id: string;
  tracking_token?: string;
  pickup_time?: string;
  created_at: string;
  items: Array<{
    id: number;
    menu_item_id: number;
    menu_item_name: string;
    quantity: number;
    price_snapshot: number;
    customizations?: Record<string, string>;
  }>;
  customer_name: string;
}

export interface CreateOrderResponse {
  order: Order;
  clientSecret: string;
}

export async function createOrder(data: CreateOrderRequest): Promise<CreateOrderResponse> {
  return apiRequest<CreateOrderResponse>('/api/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getOrderByToken(token: string): Promise<Order> {
  return apiRequest<Order>(`/api/orders/track/${token}`);
}

export async function getUserOrders(): Promise<Order[]> {
  return apiRequest<Order[]>('/api/orders/my-orders');
}
