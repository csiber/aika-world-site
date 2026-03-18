import { getToken, clearAll } from './storage.js';

/**
 * Create a fetch wrapper that auto-attaches Bearer token and handles 401.
 * @param {string} hubUrl - For redirect on 401
 * @returns {(path: string, options?: RequestInit) => Promise<Response>}
 */
export function createFetch(hubUrl) {
  return async function aikaFetch(path, options = {}) {
    const token = getToken();
    const headers = new Headers(options.headers || {});

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(path, { ...options, headers });

    if (response.status === 401) {
      clearAll();
      const returnUrl = window.location.href;
      window.location.href = `${hubUrl}/?redirect=${encodeURIComponent(returnUrl)}`;
      return new Promise(() => {}); // never resolves, page navigates away
    }

    return response;
  };
}
