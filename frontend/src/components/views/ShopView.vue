<template>
  <div class="shop-view">
    <div class="shop-header">
      <h2 class="shop-title">{{ L.t('shop.title') }}</h2>
      <div class="dm-balance">
        <span class="dm-icon">🟣</span>
        <span class="dm-amount">{{ darkMatter.toLocaleString() }}</span>
        <span class="dm-label">{{ L.t('shop.darkMatter') }}</span>
      </div>
    </div>

    <div v-if="loading" class="shop-loading">{{ L.t('common.loading') }}</div>

    <div v-else>
      <!-- Category sections -->
      <div v-for="cat in categories" :key="cat.key" class="shop-category">
        <h3 class="category-title">{{ cat.label }}</h3>
        <div class="shop-grid">
          <div
            v-for="item in itemsByCategory[cat.key]"
            :key="item.item_key"
            class="shop-card"
            :class="{ owned: isOwned(item), maxed: isMaxed(item) }"
          >
            <div class="card-icon">{{ itemIcon(item) }}</div>
            <div class="card-body">
              <div class="card-name">{{ L.t(item.name_key) || item.item_key }}</div>
              <div class="card-desc">{{ L.t(item.description_key) || '' }}</div>
              <div class="card-meta">
                <span v-if="item.max_purchases > 0" class="purchase-count">
                  {{ item.userPurchases }}/{{ item.max_purchases }}
                </span>
              </div>
            </div>
            <div class="card-footer">
              <div class="card-cost">
                <span class="dm-icon-sm">🟣</span> {{ item.cost_dm }}
              </div>
              <button
                v-if="isMaxed(item)"
                class="buy-btn owned-btn"
                disabled
              >{{ L.t('shop.owned') }}</button>
              <button
                v-else
                class="buy-btn"
                :disabled="darkMatter < item.cost_dm || buying === item.item_key"
                @click="buyItem(item)"
              >
                {{ buying === item.item_key ? '...' : L.t('shop.buy') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="error" class="shop-error">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { api } from '@/api/client.js';
import { useLangStore } from '@/stores/lang.js';
import { useGameStore } from '@/stores/game.js';

const L = useLangStore();
const gameStore = useGameStore();

const items = ref([]);
const darkMatter = ref(0);
const loading = ref(true);
const buying = ref(null);
const error = ref('');

const categories = [
  { key: 'cosmetic', label: computed(() => L.t('shop.catCosmetic') || 'Cosmetic') },
  { key: 'utility',  label: computed(() => L.t('shop.catUtility') || 'Utility') },
  { key: 'upgrade',  label: computed(() => L.t('shop.catUpgrade') || 'Upgrade') },
  { key: 'consumable', label: computed(() => L.t('shop.catConsumable') || 'Consumable') },
];

const itemsByCategory = computed(() => {
  const map = {};
  for (const cat of categories) {
    map[cat.key] = items.value.filter(i => i.item_type === cat.key);
  }
  return map;
});

function itemIcon(item) {
  const effect = item.effect || {};
  if (effect.type === 'skin') return '🎨';
  if (effect.type === 'badge') return '🏅';
  if (effect.type === 'rename') return '✏️';
  if (effect.type === 'emoji') return '😀';
  if (effect.type === 'queue_slot') return '📋';
  if (effect.type === 'speed') return '⚡';
  return '🛒';
}

function isOwned(item) {
  return item.max_purchases === 1 && item.userPurchases >= 1;
}

function isMaxed(item) {
  return item.max_purchases > 0 && item.userPurchases >= item.max_purchases;
}

async function loadShop() {
  loading.value = true;
  error.value = '';
  try {
    const data = await api.getShopItems();
    items.value = data.items || [];
    darkMatter.value = data.darkMatter || 0;
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

async function buyItem(item) {
  buying.value = item.item_key;
  error.value = '';
  try {
    const data = await api.buyShopItem(item.item_key);
    darkMatter.value = data.remainingDm;
    // Update local purchase count
    const found = items.value.find(i => i.item_key === item.item_key);
    if (found) found.userPurchases = (found.userPurchases || 0) + 1;
    // Refresh game store DM
    if (gameStore.state) {
      gameStore.state.dark_matter = data.remainingDm;
    }
  } catch (err) {
    error.value = err.message;
  } finally {
    buying.value = null;
  }
}

onMounted(() => loadShop());
</script>

<style scoped>
.shop-view {
  max-width: 900px;
  margin: 0 auto;
}

.shop-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border, rgba(255,255,255,0.1));
}

.shop-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 18px;
  color: #9b59b6;
  letter-spacing: 2px;
  text-shadow: 0 0 12px rgba(155, 89, 182, 0.5);
  margin: 0;
}

.dm-balance {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(155, 89, 182, 0.12);
  border: 1px solid rgba(155, 89, 182, 0.3);
  border-radius: 6px;
  padding: 6px 14px;
}

.dm-icon { font-size: 18px; }
.dm-amount {
  font-family: 'Orbitron', sans-serif;
  font-size: 16px;
  color: #9b59b6;
  font-weight: 700;
}
.dm-label {
  font-size: 10px;
  color: var(--text-dim, #888);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.shop-loading, .shop-error {
  text-align: center;
  padding: 40px;
  color: var(--text-dim, #888);
  font-size: 13px;
}
.shop-error { color: #ff3a7a; }

.shop-category {
  margin-bottom: 24px;
}

.category-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 12px;
  color: var(--accent, #00c8ff);
  letter-spacing: 2px;
  text-transform: uppercase;
  margin: 0 0 10px 0;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--border, rgba(255,255,255,0.06));
}

.shop-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
}

.shop-card {
  background: var(--bg-panel, #0a1628);
  border: 1px solid var(--border, rgba(255,255,255,0.08));
  border-radius: 6px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: all 0.2s;
}
.shop-card:hover {
  border-color: rgba(155, 89, 182, 0.4);
  box-shadow: 0 0 16px rgba(155, 89, 182, 0.12);
}
.shop-card.owned {
  border-color: rgba(155, 89, 182, 0.3);
  background: rgba(155, 89, 182, 0.06);
}
.shop-card.maxed {
  opacity: 0.7;
}

.card-icon {
  font-size: 28px;
  text-align: center;
}

.card-body { flex: 1; }

.card-name {
  font-family: 'Orbitron', sans-serif;
  font-size: 12px;
  color: var(--text, #eee);
  margin-bottom: 4px;
}

.card-desc {
  font-size: 11px;
  color: var(--text-dim, #888);
  line-height: 1.4;
}

.card-meta {
  margin-top: 4px;
}

.purchase-count {
  font-family: 'Orbitron', sans-serif;
  font-size: 10px;
  color: #9b59b6;
  background: rgba(155, 89, 182, 0.15);
  padding: 2px 6px;
  border-radius: 3px;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 6px;
  padding-top: 8px;
  border-top: 1px solid var(--border, rgba(255,255,255,0.06));
}

.card-cost {
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: 'Orbitron', sans-serif;
  font-size: 13px;
  color: #9b59b6;
  font-weight: 700;
}
.dm-icon-sm { font-size: 14px; }

.buy-btn {
  font-family: 'Orbitron', sans-serif;
  font-size: 10px;
  padding: 5px 14px;
  border-radius: 4px;
  border: 1px solid rgba(155, 89, 182, 0.4);
  background: rgba(155, 89, 182, 0.15);
  color: #9b59b6;
  cursor: pointer;
  transition: all 0.2s;
  letter-spacing: 1px;
}
.buy-btn:hover:not(:disabled) {
  background: rgba(155, 89, 182, 0.3);
  border-color: #9b59b6;
  box-shadow: 0 0 10px rgba(155, 89, 182, 0.3);
}
.buy-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.owned-btn {
  background: rgba(155, 89, 182, 0.08);
  color: var(--text-dim, #888);
  border-color: var(--border, rgba(255,255,255,0.1));
}
</style>
