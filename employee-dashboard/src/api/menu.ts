import { apiRequest } from './client';

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url?: string;
  available: boolean;
  created_at: string;
}

export interface MenuItemInput {
  name: string;
  description: string;
  price: number;
  category: string;
  image_url?: string;
  available: boolean;
}

export async function getAllMenuItems(): Promise<MenuItem[]> {
  return apiRequest<MenuItem[]>('/api/menu');
}

export async function createMenuItem(data: MenuItemInput): Promise<MenuItem> {
  return apiRequest<MenuItem>('/api/menu', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateMenuItem(itemId: number, data: MenuItemInput): Promise<MenuItem> {
  return apiRequest<MenuItem>(`/api/menu/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteMenuItem(itemId: number): Promise<void> {
  return apiRequest<void>(`/api/menu/${itemId}`, {
    method: 'DELETE',
  });
}

export async function updateMenuItemAvailability(
  itemId: number,
  available: boolean
): Promise<MenuItem> {
  return apiRequest<MenuItem>(`/api/menu/${itemId}/availability`, {
    method: 'PUT',
    body: JSON.stringify({ available }),
  });
}
