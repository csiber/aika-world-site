/**
 * AIKA WORLD — Dark Matter Shop Routes
 */
import { jsonResponse, jsonError } from '../utils/response.js';

async function ensureShopTables(env) {
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS dm_shop (
      id TEXT PRIMARY KEY,
      item_key TEXT UNIQUE NOT NULL,
      name_key TEXT NOT NULL,
      description_key TEXT NOT NULL,
      cost_dm INTEGER NOT NULL,
      item_type TEXT NOT NULL,
      effect_json TEXT DEFAULT '{}',
      max_purchases INTEGER DEFAULT 0
    )
  `).run();

  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS dm_purchases (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      item_key TEXT NOT NULL,
      purchased_at INTEGER NOT NULL
    )
  `).run();

  // Seed shop items if empty
  const { results } = await env.DB.prepare('SELECT COUNT(*) as cnt FROM dm_shop').all();
  if (results[0].cnt === 0) {
    const items = [
      ['1', 'skin_fighter_gold', 'shop.skin_fighter_gold', 'shop.skin_fighter_gold_desc', 50, 'cosmetic', '{"type":"skin","target":"fighter_s","value":"gold"}', 0],
      ['2', 'skin_battleship_red', 'shop.skin_battleship_red', 'shop.skin_battleship_red_desc', 100, 'cosmetic', '{"type":"skin","target":"battleship","value":"crimson"}', 0],
      ['3', 'skin_cruiser_neon', 'shop.skin_cruiser_neon', 'shop.skin_cruiser_neon_desc', 75, 'cosmetic', '{"type":"skin","target":"cruiser","value":"neon"}', 0],
      ['4', 'planet_rename', 'shop.planet_rename', 'shop.planet_rename_desc', 10, 'utility', '{"type":"rename"}', 0],
      ['5', 'planet_emoji', 'shop.planet_emoji', 'shop.planet_emoji_desc', 5, 'utility', '{"type":"emoji"}', 0],
      ['6', 'extra_queue_slot', 'shop.extra_queue', 'shop.extra_queue_desc', 500, 'upgrade', '{"type":"queue_slot","value":1}', 2],
      ['7', 'speed_boost', 'shop.speed_boost', 'shop.speed_boost_desc', 100, 'consumable', '{"type":"speed","value":0.25,"duration":3600000}', 0],
      ['8', 'badge_pioneer', 'shop.badge_pioneer', 'shop.badge_pioneer_desc', 20, 'cosmetic', '{"type":"badge","value":"pioneer"}', 1],
      ['9', 'badge_warlord', 'shop.badge_warlord', 'shop.badge_warlord_desc', 50, 'cosmetic', '{"type":"badge","value":"warlord"}', 1],
      ['10', 'badge_explorer', 'shop.badge_explorer', 'shop.badge_explorer_desc', 30, 'cosmetic', '{"type":"badge","value":"explorer"}', 1],
    ];
    for (const [id, ik, nk, dk, cost, type, eff, max] of items) {
      await env.DB.prepare(
        'INSERT OR IGNORE INTO dm_shop (id, item_key, name_key, description_key, cost_dm, item_type, effect_json, max_purchases) VALUES (?,?,?,?,?,?,?,?)'
      ).bind(id, ik, nk, dk, cost, type, eff, max).run();
    }
  }
}

export async function handleShop(request, env, url, user) {
  await ensureShopTables(env);

  const path = url.pathname;
  const method = request.method;
  const userId = user.sub;

  // GET /api/shop — list all items + user purchase counts
  if (path === '/api/shop' && method === 'GET') {
    try {
      const { results: items } = await env.DB.prepare('SELECT * FROM dm_shop ORDER BY item_type, cost_dm').all();

      // Get user purchase counts
      const { results: purchases } = await env.DB.prepare(
        'SELECT item_key, COUNT(*) as cnt FROM dm_purchases WHERE user_id = ? GROUP BY item_key'
      ).bind(userId).all();

      const purchaseMap = {};
      for (const p of purchases) purchaseMap[p.item_key] = p.cnt;

      // Get user DM balance
      const { results: gs } = await env.DB.prepare(
        'SELECT dark_matter FROM game_state WHERE user_id = ?'
      ).bind(userId).all();
      const darkMatter = gs.length ? (gs[0].dark_matter || 0) : 0;

      const enriched = items.map(item => ({
        ...item,
        effect: JSON.parse(item.effect_json || '{}'),
        userPurchases: purchaseMap[item.item_key] || 0,
      }));

      return jsonResponse({ ok: true, items: enriched, darkMatter }, 200, request);
    } catch (err) {
      console.error('Shop list error:', err);
      return jsonError(500, 'Failed to load shop', request);
    }
  }

  // POST /api/shop/buy — purchase an item
  if (path === '/api/shop/buy' && method === 'POST') {
    try {
      const { itemKey } = await request.json();
      if (!itemKey) return jsonError(400, 'itemKey is required', request);

      // Fetch item
      const { results: itemRows } = await env.DB.prepare(
        'SELECT * FROM dm_shop WHERE item_key = ?'
      ).bind(itemKey).all();
      if (!itemRows.length) return jsonError(404, 'Item not found', request);
      const item = itemRows[0];

      // Check max purchases
      if (item.max_purchases > 0) {
        const { results: countRows } = await env.DB.prepare(
          'SELECT COUNT(*) as cnt FROM dm_purchases WHERE user_id = ? AND item_key = ?'
        ).bind(userId, itemKey).all();
        if (countRows[0].cnt >= item.max_purchases) {
          return jsonError(400, 'Maximum purchases reached for this item', request);
        }
      }

      // Check DM balance
      const { results: gs } = await env.DB.prepare(
        'SELECT dark_matter FROM game_state WHERE user_id = ?'
      ).bind(userId).all();
      if (!gs.length) return jsonError(404, 'Game state not found', request);
      const currentDm = gs[0].dark_matter || 0;

      if (currentDm < item.cost_dm) {
        return jsonError(400, 'Not enough Dark Matter', request);
      }

      // Deduct DM
      const newDm = currentDm - item.cost_dm;
      await env.DB.prepare(
        'UPDATE game_state SET dark_matter = ? WHERE user_id = ?'
      ).bind(newDm, userId).run();

      // Record purchase
      await env.DB.prepare(
        'INSERT INTO dm_purchases (id, user_id, item_key, purchased_at) VALUES (?, ?, ?, ?)'
      ).bind(crypto.randomUUID(), userId, itemKey, Date.now()).run();

      return jsonResponse({
        ok: true,
        item: { ...item, effect: JSON.parse(item.effect_json || '{}') },
        remainingDm: newDm,
      }, 200, request);
    } catch (err) {
      console.error('Shop buy error:', err);
      return jsonError(500, 'Purchase failed', request);
    }
  }

  return jsonError(404, 'Shop endpoint not found', request);
}
