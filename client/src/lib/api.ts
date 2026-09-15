import type { Canvas, CanvasInput, User } from '@/types/canvas';
import { clearToken, getToken } from './token';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export interface FieldError {
  path: string;
  message: string;
}

export class ApiError extends Error {
  status: number;
  errors?: FieldError[];

  constructor(status: number, message: string, errors?: FieldError[]) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

interface AuthResponse {
  token: string;
  user: User;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body) headers.set('Content-Type', 'application/json');

  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, { ...init, headers });
  } catch {
    throw new ApiError(0, 'Could not reach the server');
  }

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    if (res.status === 401 && !path.startsWith('/auth/')) {
      clearToken();
      window.dispatchEvent(new Event('auth:expired'));
    }
    throw new ApiError(res.status, data?.message ?? res.statusText, data?.errors);
  }

  return data as T;
}

const json = (body: unknown) => JSON.stringify(body);

export const api = {
  register: (body: { name: string; email: string; password: string }) =>
    request<AuthResponse>('/auth/register', { method: 'POST', body: json(body) }),
  login: (body: { email: string; password: string }) =>
    request<AuthResponse>('/auth/login', { method: 'POST', body: json(body) }),
  me: () => request<{ user: User }>('/auth/me'),

  listCanvases: () => request<Canvas[]>('/canvases'),
  getCanvas: (id: string) => request<Canvas>(`/canvases/${id}`),
  createCanvas: (body: CanvasInput) => request<Canvas>('/canvases', { method: 'POST', body: json(body) }),
  updateCanvas: (id: string, body: CanvasInput) =>
    request<Canvas>(`/canvases/${id}`, { method: 'PUT', body: json(body) }),
  deleteCanvas: (id: string) => request<void>(`/canvases/${id}`, { method: 'DELETE' }),
};
