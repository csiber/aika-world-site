import { getToken, setToken, setUserData, clearAll } from './storage.js';

/**
 * Decode JWT payload without verification (server validates).
 * @param {string} token
 * @returns {object|null}
 */
export function decodeToken(token) {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = parts[0]; // AikaHub uses dataB64.signature format
    const json = atob(payload);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Extract AikaUser from a decoded token payload.
 * @param {object} payload
 * @returns {import('./types.js').AikaUser|null}
 */
function payloadToUser(payload) {
  if (!payload || !payload.userId) return null;
  return {
    userId: payload.userId,
    email: payload.email || '',
    nickname: payload.nickname || payload.email?.split('@')[0] || '',
    role: payload.role || 'user',
    tier: (payload.role === 'admin' || payload.role === 'superadmin') ? 'pro' : (payload.role || 'user'),
    exp: payload.exp || 0,
  };
}

/**
 * Check if token is expired.
 * @param {object} payload
 * @returns {boolean}
 */
function isExpired(payload) {
  if (!payload?.exp) return true;
  return payload.exp < Math.floor(Date.now() / 1000);
}

/**
 * Try to get the current user from stored token.
 * @returns {import('./types.js').AikaUser|null}
 */
export function getUser() {
  const token = getToken();
  if (!token) return null;
  const payload = decodeToken(token);
  if (!payload || isExpired(payload)) {
    clearAll();
    return null;
  }
  return payloadToUser(payload);
}

/**
 * Check URL for ?aika_token= param (returning from Hub login).
 * If found, store it and clean the URL.
 * @returns {boolean} true if token was found in URL
 */
export function checkUrlToken() {
  const url = new URL(window.location.href);
  const token = url.searchParams.get('aika_token');
  if (!token) return false;

  const payload = decodeToken(token);
  if (!payload || isExpired(payload)) return false;

  setToken(token);
  const user = payloadToUser(payload);
  if (user) {
    setUserData({
      role: user.role,
      email: user.email,
      nickname: user.nickname,
    });
  }

  // Clean URL
  url.searchParams.delete('aika_token');
  window.history.replaceState({}, '', url.pathname + url.search + url.hash);
  return true;
}

/**
 * Redirect to AikaHub login page.
 * @param {string} hubUrl
 */
export function redirectToLogin(hubUrl) {
  const returnUrl = window.location.href;
  window.location.href = `${hubUrl}/?redirect=${encodeURIComponent(returnUrl)}`;
}

/**
 * Full auth flow: check stored → check URL → redirect if needed.
 * @param {string} hubUrl
 * @returns {Promise<import('./types.js').AikaUser>}
 */
export async function requireAuth(hubUrl) {
  // 1. Check URL for returning token
  checkUrlToken();

  // 2. Check stored token
  const user = getUser();
  if (user) return user;

  // 3. No valid token — redirect to Hub
  redirectToLogin(hubUrl);
  // This will navigate away; return never resolves in practice
  return new Promise(() => {});
}

/**
 * Logout: clear storage, redirect to Hub.
 * @param {string} hubUrl
 */
export function logout(hubUrl) {
  clearAll();
  window.location.href = hubUrl;
}
