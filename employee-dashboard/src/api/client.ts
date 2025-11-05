// Auto-detect API URL based on current hostname
// This allows the app to work both locally and on network
const getApiUrl = () => {
  // If VITE_API_URL is explicitly set and not localhost, use it
  if (import.meta.env.VITE_API_URL && !import.meta.env.VITE_API_URL.includes('localhost')) {
    return import.meta.env.VITE_API_URL;
  }

  // Otherwise, use the current hostname with backend port
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  return `${protocol}//${hostname}:8888`;
};

const API_URL = getApiUrl();

export interface ApiError {
  error: string;
  errors?: Array<{ msg: string; param: string }>;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('employee-auth-storage');
  let authToken: string | null = null;

  if (token) {
    try {
      const parsed = JSON.parse(token);
      authToken = parsed.state?.token;
    } catch (e) {
      // Ignore parse error
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  // Add shop ID header for multi-tenant support in development mode
  if (import.meta.env.DEV) {
    const shopId = import.meta.env.VITE_SHOP_ID || 'barrenground';
    headers['X-Shop-ID'] = shopId;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw data as ApiError;
  }

  return data as T;
}
