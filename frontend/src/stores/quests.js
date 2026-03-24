import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from '../api/client.js';

export const useQuestsStore = defineStore('quests', () => {
  const quests = ref([]);
  const loading = ref(false);

  const dailyQuests = computed(() => quests.value.filter(q => q.quest_period === 'daily'));
  const weeklyQuests = computed(() => quests.value.filter(q => q.quest_period === 'weekly'));
  const completedCount = computed(() => quests.value.filter(q => q.current >= q.required && !q.is_claimed).length);

  async function loadQuests() {
    loading.value = true;
    try {
      const res = await api.getQuests();
      quests.value = res.quests || [];
    } catch (e) {
      console.error('Failed to load quests:', e);
    } finally {
      loading.value = false;
    }
  }

  async function claimQuest(questId) {
    try {
      const res = await api.claimQuest(questId);
      if (res.ok) {
        const q = quests.value.find(q => q.target_id === questId);
        if (q) q.is_claimed = 1;
      }
      return res;
    } catch (e) {
      console.error('Failed to claim quest:', e);
    }
  }

  return { quests, loading, dailyQuests, weeklyQuests, completedCount, loadQuests, claimQuest };
});
