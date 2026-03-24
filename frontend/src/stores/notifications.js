import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from '../api/client.js';

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref([]);
  const loading = ref(false);
  const unreadCount = computed(() => notifications.value.filter(n => !n.is_read).length);

  async function load() {
    loading.value = true;
    try {
      const res = await api.getNotifications();
      notifications.value = res.notifications || [];
    } catch (e) {
      console.error('Failed to load notifications:', e);
    } finally {
      loading.value = false;
    }
  }

  async function markAllRead() {
    try {
      await api.markNotificationsRead();
      notifications.value.forEach(n => n.is_read = 1);
    } catch (e) {
      console.error('Failed to mark notifications read:', e);
    }
  }

  async function markRead(id) {
    try {
      await api.markNotificationRead(id);
      const n = notifications.value.find(n => n.id === id);
      if (n) n.is_read = 1;
    } catch (e) {
      console.error('Failed to mark notification read:', e);
    }
  }

  return { notifications, loading, unreadCount, load, markAllRead, markRead };
});
