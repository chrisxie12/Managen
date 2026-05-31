/**
 * SchoolOS API Service
 * Centralized utility for making backend requests
 *
 * Dev: Vite proxy (vite.config.ts) forwards /api/* → backend.
 * Prod: VITE_API_BASE_URL must be set at build time (DigitalOcean env var).
 */
import * as Sentry from "@sentry/react";

import { db } from '../lib/offline/db';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
}

const defaultFetchInit: RequestInit = {
  credentials: 'include',
};

function getTenantHeader(): Record<string, string> {
  try {
    const host = window.location.hostname;
    if (host.endsWith('.getschoolos.me')) {
      return { 'x-tenant-subdomain': host.split('.')[0] };
    }
    if (host.endsWith('.localhost') && host.split('.').length === 2) {
      return { 'x-tenant-subdomain': host.split('.')[0] };
    }
    const subdomain = localStorage.getItem('schoolos_subdomain');
    if (subdomain) return { 'x-tenant-subdomain': subdomain };
  } catch {}
  return {};
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  let token = null;
  if (typeof window !== 'undefined' && (window as any).Clerk?.session) {
    try {
      token = await (window as any).Clerk.session.getToken();
      if (token) await db.setCache('auth_token', token);
    } catch { /* ignore */ }
  }
  if (!token) {
    try { token = await db.getCache('auth_token'); } catch { /* ignore */ }
  }
  if (!token) {
    try { token = localStorage.getItem('schoolos_jwt'); } catch { /* ignore */ }
  }
  return token ? { Authorization: `Bearer ${token}` } : {};
}

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
    const errMsg = json.error || json.message || 'Something went wrong';
    Sentry.addBreadcrumb({ category: 'api', message: `${response.status} ${response.url}`, level: 'error' });
    throw new Error(errMsg);
  }
  Sentry.addBreadcrumb({ category: 'api', message: `${response.status} ${response.url}`, level: 'info' });
  return json;
}

/**
 * API Methods
 */
export const api = {
  get: async <T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> => {
    const authHeaders = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...defaultFetchInit,
      ...options,
      credentials: options.credentials ?? defaultFetchInit.credentials,
      headers: {
        'Content-Type': 'application/json',
        ...getTenantHeader(),
        ...authHeaders,
        ...(options.headers as Record<string, string>),
      } as Record<string, string>,
    });
    return handleResponse<T>(response);
  },

  post: async <T>(endpoint: string, body: any, options: RequestInit = {}): Promise<ApiResponse<T>> => {
    const authHeaders = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...defaultFetchInit,
      ...options,
      method: 'POST',
      credentials: options.credentials ?? defaultFetchInit.credentials,
      headers: {
        'Content-Type': 'application/json',
        ...getTenantHeader(),
        ...authHeaders,
        ...(options.headers as Record<string, string>),
      } as Record<string, string>,
      body: JSON.stringify(body),
    });
    return handleResponse<T>(response);
  },

  put: async <T>(endpoint: string, body?: any, options: RequestInit = {}): Promise<ApiResponse<T>> => {
    const authHeaders = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...defaultFetchInit,
      ...options,
      method: 'PUT',
      credentials: options.credentials ?? defaultFetchInit.credentials,
      headers: {
        'Content-Type': 'application/json',
        ...getTenantHeader(),
        ...authHeaders,
        ...(options.headers as Record<string, string>),
      } as Record<string, string>,
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(response);
  },

  patch: async <T>(endpoint: string, body?: any, options: RequestInit = {}): Promise<ApiResponse<T>> => {
    const authHeaders = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...defaultFetchInit,
      ...options,
      method: 'PATCH',
      credentials: options.credentials ?? defaultFetchInit.credentials,
      headers: {
        'Content-Type': 'application/json',
        ...getTenantHeader(),
        ...authHeaders,
        ...(options.headers as Record<string, string>),
      } as Record<string, string>,
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(response);
  },

  delete: async <T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> => {
    const authHeaders = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...defaultFetchInit,
      ...options,
      method: 'DELETE',
      credentials: options.credentials ?? defaultFetchInit.credentials,
      headers: {
        'Content-Type': 'application/json',
        ...getTenantHeader(),
        ...authHeaders,
        ...(options.headers as Record<string, string>),
      } as Record<string, string>,
    });
    return handleResponse<T>(response);
  },

  upload: async <T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> => {
    const authHeaders = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...defaultFetchInit,
      method: 'POST',
      headers: {
        ...getTenantHeader(),
        ...authHeaders,
      },
      body: formData,
    });
    return handleResponse<T>(response);
  },
};
