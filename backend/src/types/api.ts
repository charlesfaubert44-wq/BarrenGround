// Order item types
export interface OrderItem {
  menu_item_id: number;
  menu_item_name: string;
  quantity: number;
  price_snapshot: number;
  customizations?: Record<string, unknown>;
}

// Request types
export interface CreateOrderRequest {
  items: OrderItem[];
  guest_email?: string;
  guest_name?: string;
  guest_phone?: string;
  pickup_time?: string;
  useMembership?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface UpdateOrderStatusRequest {
  status: 'pending' | 'received' | 'preparing' | 'ready' | 'completed' | 'cancelled';
}

export interface UpdateCustomerStatusRequest {
  customerStatus: 'on-my-way' | 'delayed' | 'wont-make-it';
}

// Response types
export interface ApiResponse<T = unknown> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface OrderResponse {
  id: number;
  user_id?: number;
  guest_email?: string;
  guest_name?: string;
  guest_phone?: string;
  total: number;
  status: string;
  payment_intent_id: string;
  tracking_token: string;
  pickup_time?: Date;
  customer_status?: string;
  items: OrderItem[];
  created_at: Date;
  updated_at: Date;
}

export interface CreateOrderResponse {
  order: OrderResponse;
  clientSecret: string | null;
  membershipUsed: boolean;
}

// Type guards for order status
export type OrderStatus = 'pending' | 'received' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export const isValidOrderStatus = (status: string): status is OrderStatus => {
  return ['pending', 'received', 'preparing', 'ready', 'completed', 'cancelled'].includes(status);
};

// Type guards for customer status
export type CustomerStatus = 'on-my-way' | 'delayed' | 'wont-make-it';

export const isValidCustomerStatus = (status: string): status is CustomerStatus => {
  return ['on-my-way', 'delayed', 'wont-make-it'].includes(status);
};
