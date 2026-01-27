// Auto-detect API URL based on current hostname
// This allows the app to work both locally and on network
const getApiUrl = () => {
  // If VITE_API_URL is explicitly set, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Otherwise, use the current hostname with backend port
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  return `${protocol}//${hostname}:5000`;
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
  const token = localStorage.getItem('auth-storage');
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

  // Add shop ID header for multi-tenant support
  // In production, this should come from subdomain/domain detection
  // For now, use environment variable or default to 'barrenground'
  const shopId = import.meta.env.VITE_SHOP_ID || 'barrenground';
  headers['X-Shop-ID'] = shopId;

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Check if response is JSON
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    console.error(`Expected JSON but got: ${contentType}`, text.substring(0, 200));
    throw {
      error: 'Invalid response format',
      message: `Expected JSON but received ${contentType}`,
    } as ApiError;
  }

  const data = await response.json();

  if (!response.ok) {
    throw data as ApiError;
  }

  return data as T;
}
