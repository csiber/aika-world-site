<template>
  <div class="profile-layout">
    <div class="panel profile-panel">
      <div class="panel-header"><span class="panel-icon">👤</span><h3>Profil</h3></div>
      <div class="panel-body" v-if="profile">
        <div class="profile-header">
          <div class="profile-avatar">{{ profile.username.charAt(0).toUpperCase() }}</div>
          <div>
            <div class="profile-name">{{ profile.username }}</div>
            <div v-if="profile.alliance" class="profile-alliance">
              <span class="alliance-tag">[{{ profile.alliance.tag }}]</span> {{ profile.alliance.name }}
              <span v-if="profile.alliance.role" class="role-label">— {{ roleLabel(profile.alliance.role) }}</span>
            </div>
            <div v-else class="profile-no-alliance">Nincs szövetség</div>
            <div class="profile-date">Regisztrált: {{ formatDate(profile.createdAt) }}</div>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-box">
            <div class="stat-val">#{{ profile.rank || '?' }}</div>
            <div class="stat-lbl">Helyezés</div>
          </div>
          <div class="stat-box">
            <div class="stat-val">{{ Number(profile.score).toLocaleString('hu') }}</div>
            <div class="stat-lbl">Pontszám</div>
          </div>
          <div class="stat-box">
            <div class="stat-val">{{ profile.planets }}</div>
            <div class="stat-lbl">Bolygók</div>
          </div>
          <div class="stat-box" v-if="profile.totalShips !== undefined">
            <div class="stat-val">{{ profile.totalShips }}</div>
            <div class="stat-lbl">Hajók</div>
          </div>
          <div class="stat-box" v-if="profile.totalBuildingLevels !== undefined">
            <div class="stat-val">{{ profile.totalBuildingLevels }}</div>
            <div class="stat-lbl">Épület szintek</div>
          </div>
          <div class="stat-box" v-if="profile.totalResearchLevels !== undefined">
            <div class="stat-val">{{ profile.totalResearchLevels }}</div>
            <div class="stat-lbl">Kutatás szintek</div>
          </div>
        </div>
      </div>
      <div class="panel-body" v-else>
        <div class="empty-msg">Betöltés...</div>
      </div>
    </div>

    <!-- Bolygó kezelés -->
    <div class="panel" v-if="planets.length">
      <div class="panel-header"><span class="panel-icon">🌍</span><h3>Bolygóim</h3></div>
      <div class="panel-body">
        <div v-for="(planet, idx) in planets" :key="idx" class="planet-row">
          <div class="planet-emoji-pick">
            <span class="current-emoji" @click="toggleEmojiPicker(idx)">{{ planet.emoji || '🌍' }}</span>
            <div v-if="emojiPickerFor === idx" class="emoji-picker">
              <span v-for="e in planetEmojis" :key="e" class="emoji-opt" @click="pickEmoji(idx, e)">{{ e }}</span>
            </div>
          </div>
          <div class="planet-info">
            <div v-if="editingIdx === idx" class="rename-form">
              <input v-model="editName" class="input" @keydown.enter="saveRename(idx)" @keydown.escape="editingIdx = null" autofocus />
              <button class="btn-primary" @click="saveRename(idx)" :disabled="saving">{{ saving ? '...' : '✓' }}</button>
              <button class="btn-secondary" @click="editingIdx = null">✕</button>
            </div>
            <div v-else class="planet-name-row">
              <span class="planet-name">{{ planet.name }}</span>
              <button class="btn-sm" @click="startEdit(idx, planet.name)">✏️ Átnevez</button>
            </div>
            <div class="planet-coords">{{ planet.coords }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useGameStore } from '@/stores/game.js';
import { useAuthStore } from '@/stores/auth.js';
import { api } from '@/api/client.js';

const game = useGameStore();
const auth = useAuthStore();

const profile = ref(null);
const planets = computed(() => game.planets);

const editingIdx    = ref(null);
const editName      = ref('');
const saving        = ref(false);
const emojiPickerFor = ref(null);

const planetEmojis = ['🌍','🌎','🌏','🪐','🌕','🔵','🟣','🟤','🔴','⚫','🌑','💫'];

function roleLabel(r) { return { leader: 'Vezető', officer: 'Tiszt', member: 'Tag' }[r] || r; }

function formatDate(ts) {
  if (!ts) return '?';
  return new Date(ts * 1000).toLocaleDateString('hu-HU');
}

function startEdit(idx, currentName) {
  editingIdx.value = idx;
  editName.value   = currentName;
  emojiPickerFor.value = null;
}

async function saveRename(idx) {
  if (!editName.value.trim()) return;
  saving.value = true;
  await game.renamePlanet(idx, editName.value.trim(), null);
  editingIdx.value = null;
  saving.value = false;
}

function toggleEmojiPicker(idx) {
  emojiPickerFor.value = emojiPickerFor.value === idx ? null : idx;
}

async function pickEmoji(idx, emoji) {
  emojiPickerFor.value = null;
  await game.renamePlanet(idx, null, emoji);
}

onMounted(async () => {
  try { profile.value = (await api.getMyProfile()).profile; } catch {}
});
</script>

<style scoped>
.profile-layout { display: flex; flex-direction: column; gap: 12px; }
.profile-header { display: flex; gap: 16px; align-items: center; margin-bottom: 16px; }
.profile-avatar { width: 52px; height: 52px; border-radius: 50%; background: linear-gradient(135deg, var(--accent), var(--crystal)); display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 900; color: #000; font-family: 'Orbitron', sans-serif; flex-shrink: 0; }
.profile-name { font-family: 'Orbitron', sans-serif; font-size: 16px; font-weight: 900; color: var(--text-bright); }
.profile-alliance { font-size: 11px; color: var(--accent4); margin-top: 3px; }
.alliance-tag { font-family: 'Orbitron', sans-serif; }
.role-label { color: var(--text-dim); }
.profile-no-alliance { font-size: 11px; color: var(--text-dim); margin-top: 3px; }
.profile-date { font-size: 10px; color: var(--text-dim); margin-top: 4px; }

.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.stat-box { background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: 4px; padding: 10px; text-align: center; }
.stat-val { font-family: 'Orbitron', sans-serif; font-size: 16px; color: var(--text-bright); font-weight: 700; }
.stat-lbl { font-size: 9px; color: var(--text-dim); margin-top: 3px; letter-spacing: 1px; text-transform: uppercase; }

.planet-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid rgba(26,42,74,0.4); }
.planet-emoji-pick { position: relative; }
.current-emoji { font-size: 28px; cursor: pointer; display: block; transition: transform 0.15s; }
.current-emoji:hover { transform: scale(1.2); }
.emoji-picker { position: absolute; top: 36px; left: 0; background: var(--bg-card); border: 1px solid var(--border); border-radius: 6px; padding: 8px; display: flex; flex-wrap: wrap; gap: 4px; z-index: 10; width: 160px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
.emoji-opt { font-size: 18px; cursor: pointer; padding: 2px; border-radius: 3px; transition: background 0.1s; }
.emoji-opt:hover { background: rgba(255,255,255,0.1); }
.planet-info { flex: 1; }
.planet-name-row { display: flex; align-items: center; gap: 8px; }
.planet-name { font-size: 13px; color: var(--text-bright); font-weight: 500; }
.planet-coords { font-family: 'Orbitron', sans-serif; font-size: 9px; color: var(--accent); margin-top: 2px; }
.rename-form { display: flex; gap: 6px; }
.input { background: rgba(0,0,0,0.5); border: 1px solid var(--border); color: var(--text); padding: 5px 10px; font-size: 12px; border-radius: 3px; font-family: 'Exo 2', sans-serif; outline: none; flex: 1; }
.input:focus { border-color: var(--accent); }
.btn-sm { padding: 3px 8px; background: rgba(0,200,255,0.1); border: 1px solid var(--border); color: var(--accent); border-radius: 3px; cursor: pointer; font-size: 10px; }
.btn-sm:hover { border-color: var(--accent); }
.btn-secondary { padding: 4px 10px; background: rgba(255,255,255,0.05); border: 1px solid var(--border); color: var(--text-dim); border-radius: 3px; cursor: pointer; font-size: 12px; }
.empty-msg { color: var(--text-dim); font-size: 11px; }
</style>
