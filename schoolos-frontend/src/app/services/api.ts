/**
 * SchoolOS API Service
 * Centralized utility for making backend requests
 *
 * Dev: default '' + Vite proxy → cookies bind to localhost:5173 (same site as the SPA).
 * Prod: set VITE_API_BASE_URL to your API origin (e.g. https://api.example.com).
 */
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? '' : 'http://localhost:5000');

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
}

const defaultFetchInit: RequestInit = {
  credentials: 'include',
};

/**
 * Handle API responses and errors
 */
async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  let json: any;
  try {
    json = await response.json();
  } catch {
    if (!response.ok) {
      throw new Error(response.statusText || 'Something went wrong');
    }
    throw new Error('Invalid response from server');
  }
  if (!response.ok) {
    throw new Error(json.error || json.message || 'Something went wrong');
  }
  return json;
}

/**
 * API Methods
 */
export const api = {
  get: async <T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...defaultFetchInit,
      ...options,
      credentials: options.credentials ?? defaultFetchInit.credentials,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    return handleResponse<T>(response);
  },

  post: async <T>(endpoint: string, body: any, options: RequestInit = {}): Promise<ApiResponse<T>> => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...defaultFetchInit,
      ...options,
      method: 'POST',
      credentials: options.credentials ?? defaultFetchInit.credentials,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: JSON.stringify(body),
    });
    return handleResponse<T>(response);
  },
};
