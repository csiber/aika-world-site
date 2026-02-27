<template>
  <div class="msg-layout">
    <div class="panel msg-list-panel">
      <div class="panel-header"><span class="panel-icon">✉️</span><h3>Üzenetek</h3></div>
      <div>
        <div
          v-for="(msg, idx) in messages"
          :key="idx"
          class="msg-item"
          :class="{ active: selected === idx, unread: !msg.read }"
          @click="open(idx)"
        >
          <div class="msg-from">{{ msg.from }}</div>
          <div class="msg-subject">{{ msg.subject }}</div>
          <div class="msg-time">{{ msg.time }}</div>
        </div>
      </div>
    </div>

    <div class="panel msg-reader" v-if="selected !== null">
      <div class="panel-header">
        <span class="panel-icon">📩</span>
        <h3>{{ messages[selected].subject }}</h3>
      </div>
      <div class="panel-body">
        <div class="msg-meta">Feladó: {{ messages[selected].from }}</div>
        <div class="msg-body">{{ messages[selected].body }}</div>
        <div class="msg-actions">
          <button class="btn-primary" @click="game.notify('Válasz elküldve!', 'green')">↩️ Válasz</button>
          <button class="btn-primary" style="border-color:var(--accent2);color:var(--accent2);" @click="deleteMsg">🗑️ Törlés</button>
        </div>
      </div>
    </div>
    <div v-else class="panel msg-reader empty-panel">
      <div class="empty-msg">Válassz ki egy üzenetet a listából.</div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useGameStore } from '@/stores/game.js';

const game = useGameStore();
const selected = ref(null);

const messages = reactive([
  { from: '⚔️ StarVoid', subject: 'Harci jelentés — támadás visszaverve', time: '2ó', read: false,
    body: 'Az ellenség 47 kis vadásszal támadta Nexus Prime-t. Légvédelmi rakétáink és 12 nagy vadászod visszaverte a támadást. Veszteség: 3 kis vadász. Zsákmány: 0.' },
  { from: '🤝 AstroLeague', subject: 'Szövetség meghívó', time: '5ó', read: false,
    body: 'Üdvözöljük!\n\nAz AstroLeague szövetség örömmel invitálja Önt tagjaink közé. 24 aktív tagunk van, szektorvédelmet biztosítunk, és hetente közös támadási koordináció van.' },
  { from: '⚙️ Rendszer', subject: 'Kutatás befejezve: Ionhajtómű III', time: '8ó', read: true,
    body: 'Az Ionhajtómű III. szintű kutatása sikeresen befejeződött.\n\nEredmény: Flottád sebessége +15%-kal nőtt.\n\nPontszám: +100' },
  { from: '🌐 Rendszer', subject: 'Üdvözöllek az AIKA Colony-ban!', time: '1n', read: true,
    body: 'Szia!\n\nSikeresen regisztráltál az AIKA Colony galaktikus terjeszkedési játékba. Kezdj épületeket fejleszteni, kutass technológiákat, és terjeszd ki birodalmad!\n\nJó játékot!' },
]);

function open(idx) {
  selected.value = idx;
  messages[idx].read = true;
}

function deleteMsg() {
  messages.splice(selected.value, 1);
  selected.value = null;
}
</script>

<style scoped>
.msg-layout { display: grid; grid-template-columns: 280px 1fr; gap: 10px; min-height: 500px; }
.msg-list-panel { overflow: hidden; }

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
