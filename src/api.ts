/**
 * API Client untuk Cloudflare Worker
 * 
 * Konfigurasi:
 * - Set API_URL di environment variable atau hardcode di sini
 * - Jika API tidak tersedia, akan fallback ke localStorage
 */

import { Book, User, BorrowRecord } from './types';

// Ganti dengan URL Worker Anda setelah deploy
// Contoh: https://opac-api.your-subdomain.workers.dev
export const API_URL = import.meta.env.VITE_API_URL || '';

const SESSION_KEY = 'opac_session';

function getAuthHeaders(): Record<string, string> {
  const session = localStorage.getItem(SESSION_KEY);
  if (session) {
    try {
      const user = JSON.parse(session);
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.id}`,
      };
    } catch {}
  }
  return { 'Content-Type': 'application/json' };
}

export function isApiAvailable(): boolean {
  return !!API_URL;
}

async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  if (!API_URL) throw new Error('API URL not configured');
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// ===== BOOKS =====
export async function apiGetBooks(): Promise<Book[]> {
  return apiFetch<Book[]>('/api/books');
}

export async function apiSearchBooks(query: string): Promise<Book[]> {
  return apiFetch<Book[]>(`/api/books/search?q=${encodeURIComponent(query)}`);
}

export async function apiGetBook(id: string): Promise<Book> {
  return apiFetch<Book>(`/api/books/${id}`);
}

export async function apiAddBook(book: Partial<Book>): Promise<{ id: string }> {
  return apiFetch<{ id: string }>('/api/books', {
    method: 'POST',
    body: JSON.stringify(book),
  });
}

export async function apiUpdateBook(id: string, book: Partial<Book>): Promise<void> {
  return apiFetch<void>(`/api/books/${id}`, {
    method: 'PUT',
    body: JSON.stringify(book),
  });
}

export async function apiDeleteBook(id: string): Promise<void> {
  return apiFetch<void>(`/api/books/${id}`, { method: 'DELETE' });
}

// ===== AUTH =====
export async function apiLogin(email: string, password: string): Promise<User> {
  return apiFetch<User>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function apiRegister(data: { name: string; email: string; password: string; phone?: string; address?: string }): Promise<{ id: string }> {
  return apiFetch<{ id: string }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiGetUser(id: string): Promise<User> {
  return apiFetch<User>(`/api/users/${id}`);
}

export async function apiGetUsers(): Promise<User[]> {
  return apiFetch<User[]>('/api/users');
}

// ===== BORROWS =====
export async function apiGetBorrows(): Promise<BorrowRecord[]> {
  return apiFetch<BorrowRecord[]>('/api/borrows');
}

export async function apiGetBorrowsByUser(userId: string): Promise<BorrowRecord[]> {
  return apiFetch<BorrowRecord[]>(`/api/borrows/user/${userId}`);
}

export async function apiGetBorrowsByBook(bookId: string): Promise<BorrowRecord[]> {
  return apiFetch<BorrowRecord[]>(`/api/borrows/book/${bookId}`);
}

export async function apiBorrowBook(bookId: string): Promise<BorrowRecord> {
  return apiFetch<BorrowRecord>('/api/borrows', {
    method: 'POST',
    body: JSON.stringify({ bookId }),
  });
}

export async function apiReturnBook(borrowId: string): Promise<void> {
  return apiFetch<void>(`/api/borrows/${borrowId}/return`, {
    method: 'PUT',
  });
}

// ===== STATS =====
export async function apiGetStats(): Promise<{ totalBooks: number; totalCopies: number; availableCopies: number }> {
  return apiFetch('/api/stats');
}
