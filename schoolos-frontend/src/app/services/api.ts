/**
 * SchoolOS API Service
 * Centralized utility for making backend requests
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
}

/**
 * Handle API responses and errors
 */
async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.error || 'Something went wrong');
  }
  return json;
}

/**
 * API Methods
 */
export const api = {
  get: async <T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    return handleResponse<T>(response);
  },

  post: async <T>(endpoint: string, body: any, options: RequestInit = {}): Promise<ApiResponse<T>> => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: JSON.stringify(body),
    });
    return handleResponse<T>(response);
  },
};
