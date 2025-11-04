import { apiRequest } from './client';

export interface Order {
  id: number;
  user_id?: number;
  guest_email?: string;
  guest_name?: string;
  total: number;
  status: string;
  payment_intent_id: string;
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

export async function getOrdersByStatus(statuses: string[]): Promise<Order[]> {
  return apiRequest<Order[]>(`/api/orders?status=${statuses.join(',')}`);
}

export async function updateOrderStatus(orderId: number, status: string): Promise<Order> {
  return apiRequest<Order>(`/api/orders/${orderId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

export async function getRecentOrders(limit: number = 50): Promise<Order[]> {
  return apiRequest<Order[]>(`/api/orders/recent?limit=${limit}`);
}
