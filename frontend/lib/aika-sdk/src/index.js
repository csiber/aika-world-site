import { requireAuth, getUser, logout, checkUrlToken } from './auth.js';
import { getToken, clearAll } from './storage.js';
import { createFetch } from './api.js';
import { autoRegister } from './register.js';

const DEFAULT_HUB_URL = 'https://aikahub.com';

class AikaSDK {
  /** @type {import('./types.js').AikaAppConfig} */
  #config;
  /** @type {string} */
  #hubUrl;
  /** @type {(path: string, options?: RequestInit) => Promise<Response>} */
  #fetch;
  /** @type {Array<(user: import('./types.js').AikaUser|null) => void>} */
  #listeners = [];

  /**
   * @param {import('./types.js').AikaAppConfig} config
   */
  constructor(config) {
    this.#config = config;
    this.#hubUrl = (config.hubUrl || DEFAULT_HUB_URL).replace(/\/$/, '');
    this.#fetch = createFetch(this.#hubUrl);

    // Check URL for returning token on construction
    checkUrlToken();

    // Auto-register (fire-and-forget, admin only)
    autoRegister(config, this.#hubUrl);
  }

  /**
   * Initialize the SDK. Entry point for all apps.
   * @param {import('./types.js').AikaAppConfig} config
   * @returns {AikaSDK}
   */
  static init(config) {
    if (!config?.key || !config?.title) {
      throw new Error('AikaSDK.init requires at least { key, title }');
    }
    return new AikaSDK(config);
  }

  /**
   * Ensure user is authenticated. Redirects to Hub if not.
   * @returns {Promise<import('./types.js').AikaUser>}
   */
  async requireAuth() {
    const user = await requireAuth(this.#hubUrl);
    this.#notifyListeners(user);
    return user;
  }

  /**
   * Get current user without redirecting. Returns null if not authenticated.
   * @returns {import('./types.js').AikaUser|null}
   */
  getUser() {
    return getUser();
  }

  /**
   * Get raw JWT token.
   * @returns {string|null}
   */
  getToken() {
    return getToken();
  }

  /**
   * Check if user is currently authenticated with a valid token.
   * @returns {boolean}
   */
  isAuthenticated() {
    return getUser() !== null;
  }

  /**
   * Logout: clear all stored data and redirect to Hub.
   */
  logout() {
    this.#notifyListeners(null);
    logout(this.#hubUrl);
  }

  /**
   * Fetch wrapper with automatic Bearer token and 401 handling.
   * @param {string} path
   * @param {RequestInit} [options]
   * @returns {Promise<Response>}
   */
  async fetch(path, options) {
    return this.#fetch(path, options);
  }

  /**
   * Subscribe to auth state changes.
   * @param {(user: import('./types.js').AikaUser|null) => void} callback
   * @returns {() => void} unsubscribe function
   */
  onAuthChange(callback) {
    this.#listeners.push(callback);
    return () => {
      this.#listeners = this.#listeners.filter(l => l !== callback);
    };
  }

  /**
   * Get the Hub URL this SDK is configured with.
   * @returns {string}
   */
  getHubUrl() {
    return this.#hubUrl;
  }

  /**
   * Get the app config.
   * @returns {import('./types.js').AikaAppConfig}
   */
  getConfig() {
    return { ...this.#config };
  }

  /** @param {import('./types.js').AikaUser|null} user */
  #notifyListeners(user) {
    this.#listeners.forEach(cb => {
      try { cb(user); } catch {}
    });
  }
}

export { AikaSDK };
export { getUser } from './auth.js';
export { getToken, clearAll as clearAuth } from './storage.js';
