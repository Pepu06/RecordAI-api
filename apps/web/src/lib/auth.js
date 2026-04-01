'use client';

export function saveAuth(token) {
  localStorage.setItem('token', token);
}

export function clearAuth() {
  localStorage.removeItem('token');
}

export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function isAuthenticated() {
  return !!getToken();
}
