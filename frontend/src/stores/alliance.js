import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from '@/api/client.js';

export const useAllianceStore = defineStore('alliance', () => {
  const alliance  = ref(null);
  const members   = ref([]);
  const myRole    = ref(null);
  const chatMsgs  = ref([]);
  const loading   = ref(false);

  const isLeader  = computed(() => myRole.value === 'leader');
  const isOfficer = computed(() => ['leader','officer'].includes(myRole.value));
  const inAlliance = computed(() => !!alliance.value);

  async function load() {
    loading.value = true;
    try {
      const data = await api.getMyAlliance();
      alliance.value = data.alliance;
      members.value  = data.members || [];
      myRole.value   = data.myRole || null;
    } catch (e) { /* silent */ }
    loading.value = false;
  }

  async function loadChat() {
    try {
      const data = await api.getAllianceChat();
      chatMsgs.value = data.messages || [];
    } catch (e) { /* silent */ }
  }

  async function sendChat(message) {
    await api.sendAllianceChat(message);
    await loadChat();
  }

  async function create(name, tag, description) {
    const data = await api.createAlliance(name, tag, description);
    await load();
    return data;
  }

  async function join(id) {
    const data = await api.joinAlliance(id);
    await load();
    return data;
  }

  async function leave() {
    await api.leaveAlliance();
    alliance.value = null;
    members.value  = [];
    myRole.value   = null;
  }

  async function kick(targetUserId) {
    await api.kickFromAlliance(targetUserId);
    members.value = members.value.filter(m => m.user_id !== targetUserId);
  }

  async function promote(targetUserId, role) {
    await api.promoteAllianceMember(targetUserId, role);
    const m = members.value.find(m => m.user_id === targetUserId);
    if (m) m.role = role;
  }

  return {
    alliance, members, myRole, chatMsgs, loading,
    isLeader, isOfficer, inAlliance,
    load, loadChat, sendChat, create, join, leave, kick, promote,
  };
});
