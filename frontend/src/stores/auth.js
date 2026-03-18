/**
 * AIKA World — Auth store (powered by AikaHub SDK)
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import sdk from '@/sdk.js';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(sdk.getUser());
  const token = ref(sdk.getToken());

  const isLoggedIn = computed(() => !!user.value);
  const username = computed(() => user.value?.nickname || null);
  const userId = computed(() => user.value?.userId || null);
  const isAdmin = computed(() => user.value?.role === 'admin' || user.value?.role === 'superadmin');

  // Listen for SDK auth changes
  sdk.onAuthChange((u) => {
    user.value = u;
    token.value = sdk.getToken();
  });

  /**
   * Ensure user is authenticated via AikaHub.
   * Redirects to Hub login if not.
   * Returns the AikaUser object.
   */
  async function requireAuth() {
    const u = await sdk.requireAuth();
    user.value = u;
    token.value = sdk.getToken();
    return u;
  }

  /**
   * Refresh user state from SDK (e.g. after URL token pickup).
   */
  function refresh() {
    user.value = sdk.getUser();
    token.value = sdk.getToken();
  }

  function logout() {
    sdk.logout(); // clears storage & redirects to Hub
  }

  return { token, user, username, userId, isAdmin, isLoggedIn, requireAuth, refresh, logout };
});
