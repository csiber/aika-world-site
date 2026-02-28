import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from '@/api/client.js';

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('aika_token') || null);
  const username = ref(localStorage.getItem('aika_username') || null);
  const userId = ref(localStorage.getItem('aika_userid') || null);

  const isLoggedIn = computed(() => !!token.value);

  function setAuth(data) {
    token.value = data.token;
    username.value = data.username;
    userId.value = data.userId;
    localStorage.setItem('aika_token', data.token);
    localStorage.setItem('aika_username', data.username);
    localStorage.setItem('aika_userid', data.userId);
  }

  function logout() {
    token.value = null;
    username.value = null;
    userId.value = null;
    localStorage.removeItem('aika_token');
    localStorage.removeItem('aika_username');
    localStorage.removeItem('aika_userid');
  }

  async function register(uname, email, password, tsToken) {
    const data = await api.register(uname, email, password, tsToken);
    setAuth(data);
    return data;
  }

  async function login(email, password, tsToken) {
    const data = await api.login(email, password, tsToken);
    setAuth(data);
    return data;
  }

  return { token, username, userId, isLoggedIn, register, login, logout };
});
