<template>
  <div class="msg-layout">
    <div class="panel msg-list-panel">
      <div class="panel-header"><span class="panel-icon">✉️</span><h3>Üzenetek</h3>
        <span v-if="store.unreadCount > 0" class="unread-badge">{{ store.unreadCount }}</span>
      </div>
      <div>
        <div v-if="store.loading" class="empty-msg" style="padding:12px;">Betöltés...</div>
        <div v-else-if="!store.messages.length" class="empty-msg" style="padding:12px;">Nincs üzeneted.</div>
        <div
          v-for="msg in store.messages"
          :key="msg.id"
          class="msg-item"
          :class="{ active: selected?.id === msg.id, unread: !msg.is_read }"
          @click="open(msg)"
        >
          <div class="msg-from">{{ msg.from_name }}</div>
          <div class="msg-subject">{{ msg.subject }}</div>
          <div class="msg-time">{{ timeAgo(msg.created_at) }}</div>
        </div>
      </div>
    </div>

    <div class="panel msg-reader" v-if="selected">
      <div class="panel-header">
        <span class="panel-icon">📩</span>
        <h3>{{ selected.subject }}</h3>
      </div>
      <div class="panel-body">
        <div class="msg-meta">Feladó: {{ selected.from_name }}</div>
        <div class="msg-body">{{ selected.body }}</div>
        <div class="msg-actions">
          <button class="btn-primary" style="border-color:var(--accent2);color:var(--accent2);" @click="doDelete">🗑️ Törlés</button>
        </div>
      </div>
    </div>
    <div v-else class="panel msg-reader empty-panel">
      <div class="empty-msg">Válassz ki egy üzenetet a listából.</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useMessagesStore } from '@/stores/messages.js';

const store = useMessagesStore();
const selected = ref(null);

async function open(msg) {
  selected.value = msg;
  if (!msg.is_read) {
    await store.markRead(msg.id);
  }
}

async function doDelete() {
  if (!selected.value) return;
  const id = selected.value.id;
  selected.value = null;
  await store.deleteMessage(id);
}

function timeAgo(ts) {
  const diff = Math.floor(Date.now() / 1000) - ts;
  if (diff < 60)    return 'most';
  if (diff < 3600)  return `${Math.floor(diff / 60)}p`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}ó`;
  return `${Math.floor(diff / 86400)}n`;
}

onMounted(() => store.loadMessages());
</script>

<style scoped>
.msg-layout { display: grid; grid-template-columns: 280px 1fr; gap: 10px; min-height: 500px; }
.msg-list-panel { overflow: hidden; }
.unread-badge { margin-left: auto; background: var(--accent2); color: white; border-radius: 10px; padding: 1px 7px; font-size: 10px; font-family: 'Orbitron', sans-serif; }

.msg-item { padding: 10px 12px; border-bottom: 1px solid rgba(26,42,74,0.4); cursor: pointer; transition: background 0.15s; position: relative; }
.msg-item:hover { background: rgba(255,255,255,0.02); }
.msg-item.active { background: rgba(0,200,255,0.07); border-left: 2px solid var(--accent); }
.msg-item.unread .msg-from::before { content: '●'; color: var(--accent); margin-right: 6px; font-size: 8px; }
.msg-from { font-size: 11px; color: var(--text-bright); font-weight: 500; }
.msg-subject { font-size: 10px; color: var(--text-dim); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.msg-time { font-size: 9px; color: var(--text-dim); font-family: 'Orbitron', sans-serif; position: absolute; top: 10px; right: 10px; }

.msg-meta { font-size: 10px; color: var(--text-dim); margin-bottom: 14px; }
.msg-body { font-size: 12px; line-height: 1.8; color: var(--text); white-space: pre-line; margin-bottom: 16px; }
.msg-actions { display: flex; gap: 8px; }

.empty-panel { display: flex; align-items: center; justify-content: center; }
.empty-msg { color: var(--text-dim); font-size: 12px; }
</style>
