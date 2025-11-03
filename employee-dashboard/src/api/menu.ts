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

export async function getAllMenuItems(): Promise<MenuItem[]> {
  return apiRequest<MenuItem[]>('/api/menu');
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
