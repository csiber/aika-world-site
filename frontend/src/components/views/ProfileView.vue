<template>
  <div class="profile-layout">
    <div class="profile-grid">
      <!-- User Info & Planet Management -->
      <div class="panel">
        <div class="panel-header"><span class="panel-icon">👤</span><h3>{{ L.t('profile.title') }}</h3></div>
        <div class="panel-body">
          <div v-if="!profile" class="empty-msg">{{ L.t('profile.loading') }}</div>
          <div v-else>
            <div class="profile-header">
              <div class="profile-avatar">👨‍🚀</div>
              <div class="profile-main-info">
                <div class="p-username">{{ profile.username }}</div>
                <div class="p-rank">{{ L.t('profile.rank') }}: #{{ profile.rank || '?' }} ({{ (profile.score || 0).toLocaleString('hu') }} pt)</div>
              </div>
            </div>

            <div class="section-title">{{ L.t('profile.myPlanets') }}</div>
            <div v-for="planet in planets" :key="planet.id" class="planet-row">
              <div class="planet-emoji-pick">
                <span class="current-emoji" @click="toggleEmojiPicker(planet.id)">{{ planet.emoji || '🌍' }}</span>
                <div v-if="emojiPickerFor === planet.id" class="emoji-picker">
                  <span v-for="e in planetEmojis" :key="e" class="emoji-opt" @click="pickEmoji(planet.id, e)">{{ e }}</span>
                </div>
              </div>
              <div class="planet-info">
                <div v-if="editingId === planet.id" class="rename-form">
                  <input v-model="editName" class="input" @keydown.enter="saveRename(planet.id)" @keydown.escape="editingId = null" autofocus />
                  <button class="btn-primary" @click="saveRename(planet.id)" :disabled="saving">{{ saving ? '...' : '✓' }}</button>
                  <button class="btn-secondary" @click="editingId = null">✕</button>
                </div>
                <div v-else class="planet-name-row">
                  <span class="planet-name">{{ planet.name }}</span>
                  <button class="btn-sm" @click="startEdit(planet.id, planet.name)">✏️ {{ L.t('profile.rename') }}</button>
                </div>
                <div class="planet-coords">{{ planet.coords }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Security / Change Password -->
      <div class="panel">
        <div class="panel-header"><span class="panel-icon">🔒</span><h3>Biztonság</h3></div>
        <div class="panel-body">
          <div class="section-title">Jelszó módosítása</div>
          <div class="password-form">
            <div class="field">
              <label>Jelenlegi jelszó</label>
              <input v-model="pwCurrent" type="password" class="input" placeholder="••••••••" />
            </div>
            <div class="field">
              <label>Új jelszó</label>
              <input v-model="pwNew" type="password" class="input" placeholder="••••••••" />
            </div>
            <div class="field">
              <label>Új jelszó újra</label>
              <input v-model="pwNew2" type="password" class="input" placeholder="••••••••" />
            </div>
            <button class="btn-primary" @click="doChangePassword" :disabled="pwBusy" style="width:100%;margin-top:10px;">
              {{ pwBusy ? 'Mentés...' : 'Jelszó frissítése' }}
            </button>
            <div v-if="pwError" class="error-msg" style="margin-top:10px;">❌ {{ pwError }}</div>
            <div v-if="pwSuccess" class="success-msg" style="margin-top:10px;">✅ {{ pwSuccess }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useGameStore } from '@/stores/game.js';
import { useAuthStore } from '@/stores/auth.js';
import { useLangStore } from '@/stores/lang.js';
import { api } from '@/api/client.js';

const game = useGameStore();
const auth = useAuthStore();
const L    = useLangStore();
const { lang } = storeToRefs(L);

const profile = ref(null);
const planets = computed(() => game.planets);

const editingId     = ref(null);
const editName      = ref('');
const saving        = ref(false);
const emojiPickerFor = ref(null);

const pwCurrent = ref('');
const pwNew = ref('');
const pwNew2 = ref('');
const pwBusy = ref(false);
const pwError = ref('');
const pwSuccess = ref('');

const planetEmojis = ['🌍','🌎','🌏','🪐','🌕','🔵','🟣','🟤','🔴','⚫','🌑','💫'];

async function loadProfile() {
  try { profile.value = await api.getMyProfile(); } catch {}
}

function startEdit(id, currentName) {
  editingId.value = id;
  editName.value   = currentName;
  emojiPickerFor.value = null;
}

async function saveRename(id) {
  if (!editName.value.trim()) return;
  saving.value = true;
  await game.renamePlanet(id, editName.value.trim(), null);
  editingId.value = null;
  saving.value = false;
}

function toggleEmojiPicker(id) {
  emojiPickerFor.value = emojiPickerFor.value === id ? null : id;
}

async function pickEmoji(id, emoji) {
  emojiPickerFor.value = null;
  await game.renamePlanet(id, null, emoji);
}

async function doChangePassword() {
  pwError.value = '';
  pwSuccess.value = '';
  if (!pwCurrent.value || !pwNew.value) { pwError.value = 'Minden mező kitöltése kötelező'; return; }
  if (pwNew.value !== pwNew2.value) { pwError.value = 'Az új jelszavak nem egyeznek'; return; }
  
  pwBusy.value = true;
  try {
    await api.changePassword(pwCurrent.value, pwNew.value);
    pwSuccess.value = 'Jelszó sikeresen megváltoztatva!';
    pwCurrent.value = ''; pwNew.value = ''; pwNew2.value = '';
  } catch (e) {
    pwError.value = e.message;
  }
  pwBusy.value = false;
}

onMounted(loadProfile);
</script>

<style scoped>
.profile-layout { }
.profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
@media (max-width: 800px) { .profile-grid { grid-template-columns: 1fr; } }

.profile-header { display: flex; align-items: center; gap: 20px; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid var(--border); }
.profile-avatar { font-size: 50px; background: rgba(255,255,255,0.05); width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 1px solid var(--border); }
.p-username { font-family: 'Orbitron', sans-serif; font-size: 20px; font-weight: 900; color: var(--accent); }
.p-rank { font-size: 12px; color: var(--text-dim); margin-top: 4px; }

.planet-row { display: flex; align-items: center; gap: 12px; padding: 10px; background: rgba(0,0,0,0.2); border: 1px solid var(--border); border-radius: 6px; margin-bottom: 10px; }
.current-emoji { font-size: 24px; cursor: pointer; transition: transform 0.2s; }
.current-emoji:hover { transform: scale(1.2); }
.emoji-picker { position: absolute; background: var(--bg-panel); border: 1px solid var(--accent); border-radius: 6px; padding: 8px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; z-index: 100; margin-top: 5px; box-shadow: 0 5px 20px rgba(0,0,0,0.5); }
.emoji-opt { font-size: 20px; cursor: pointer; }
.emoji-opt:hover { background: rgba(255,255,255,0.1); border-radius: 4px; }

.planet-name { font-size: 14px; font-weight: 600; color: var(--text-bright); }
.planet-coords { font-family: 'Orbitron', sans-serif; font-size: 10px; color: var(--accent); margin-top: 2px; }
.rename-form { display: flex; gap: 6px; }

.password-form { display: flex; flex-direction: column; gap: 12px; }
.field { display: flex; flex-direction: column; gap: 4px; }
.field label { font-size: 10px; color: var(--text-dim); text-transform: uppercase; }

.input { background: rgba(0,0,0,0.5); border: 1px solid var(--border); color: var(--text); padding: 8px 12px; font-size: 13px; border-radius: 4px; outline: none; }
.input:focus { border-color: var(--accent); }
.btn-sm { padding: 3px 8px; background: rgba(255,255,255,0.05); border: 1px solid var(--border); color: var(--text-dim); border-radius: 3px; cursor: pointer; font-size: 10px; margin-left: 10px; }
.error-msg { color: var(--red); font-size: 11px; text-align: center; }
.success-msg { color: var(--green); font-size: 11px; text-align: center; }
</style>
