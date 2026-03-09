import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from '@/api/client.js';

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('aika_token') || null);
  const username = ref(localStorage.getItem('aika_username') || null);
  const userId = ref(localStorage.getItem('aika_userid') || null);
  const isAdmin = ref(localStorage.getItem('aika_is_admin') === 'true');

  const isLoggedIn = computed(() => !!token.value);

  function setAuth(data) {
    token.value = data.token;
    username.value = data.username;
    userId.value = data.userId;
    isAdmin.value = !!data.isAdmin;
    localStorage.setItem('aika_token', data.token);
    localStorage.setItem('aika_username', data.username);
    localStorage.setItem('aika_userid', data.userId);
    localStorage.setItem('aika_is_admin', data.isAdmin ? 'true' : 'false');
  }

  function logout() {
    token.value = null;
    username.value = null;
    userId.value = null;
    isAdmin.value = false;
    localStorage.removeItem('aika_token');
    localStorage.removeItem('aika_username');
    localStorage.removeItem('aika_userid');
    localStorage.removeItem('aika_is_admin');
  }

  /**
   * Refreshes user data from server to ensure sync (esp. isAdmin)
   */
  async function checkMe() {
    if (!token.value) return;
    try {
      const data = await api.getMe();
      if (data.user) {
        isAdmin.value = !!data.user.isAdmin;
        username.value = data.user.username;
        localStorage.setItem('aika_is_admin', isAdmin.value ? 'true' : 'false');
        localStorage.setItem('aika_username', username.value);
      }
    } catch (e) {
      if (e.message.includes('401')) logout();
    }
  }

  const HUB_API_URL = 'https://aikahub.com';

  async function hubSync(hubToken, email, nickname) {
    try {
      const res = await fetch('/api/auth/hub-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hub_token: hubToken, email, nickname }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Hub sync failed');
      setAuth(data);
      return data;
    } catch (e) {
      console.error('Hub sync error:', e);
      throw e;
    }
  }

  async function register(uname, email, password, tsToken) {
    const data = await api.register(uname, email, password, tsToken);
    setAuth(data);
    return data;
  }

  async function login(email, password, tsToken) {
    try {
      // 1. Try AikaHub Login first
      try {
        const hubRes = await fetch(`${HUB_API_URL}/api/os/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, platform: 'aikaworld' }),
        });
        
        if (hubRes.ok) {
          const hubData = await hubRes.json();
          return await hubSync(hubData.access_token, email, hubData.user?.nickname);
        }
      } catch (hubErr) {
        // Silent fallback
      }

      // 2. Fallback to local login
      const data = await api.login(email, password, tsToken);
      setAuth(data);
      return data;
    } catch (e) {
      console.error('Login error:', e);
      throw e;
    }
  }

  return { token, username, userId, isAdmin, isLoggedIn, register, login, logout, checkMe };
});
