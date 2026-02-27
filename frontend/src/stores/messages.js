import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from '@/api/client.js';

export const useMessagesStore = defineStore('messages', () => {
  const messages = ref([]);
  const loading = ref(false);

  const unreadCount = computed(() => messages.value.filter(m => !m.is_read).length);

  async function loadMessages() {
    loading.value = true;
    try {
      const data = await api.getMessages();
      messages.value = data.messages || [];
    } catch (e) { /* silent */ }
    loading.value = false;
  }

  async function markRead(id) {
    const msg = messages.value.find(m => m.id === id);
    if (msg) msg.is_read = 1;
    try { await api.markRead(id); } catch (e) { /* silent */ }
  }

  async function deleteMessage(id) {
    messages.value = messages.value.filter(m => m.id !== id);
    try { await api.deleteMessage(id); } catch (e) { /* silent */ }
  }

  return { messages, loading, unreadCount, loadMessages, markRead, deleteMessage };
});
