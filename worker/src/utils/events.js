/**
 * AIKA WORLD — World Events Engine
 */

// ── Seasonal Event Types (7-day duration, admin-triggered) ──
export const SEASONAL_EVENT_TYPES = {
  ALIEN_INVASION: {
    id: 'ALIEN_INVASION',
    name: { en: 'Alien Invasion', hu: 'Idegen Invázió' },
    desc: {
      en: 'Defend against alien attacks! Score points by destroying alien fleets.',
      hu: 'Védekezz az idegen támadások ellen! Szerezz pontot az idegen flották elpusztításával.',
    },
    icon: '👾',
    modifier: { combatBonus: 1.2, alienSpawnRate: 2.0 },
    duration: 7 * 24 * 3600, // 7 days in seconds
  },
  SOLAR_STORM: {
    id: 'SOLAR_STORM',
    name: { en: 'Solar Storm', hu: 'Napvihar' },
    desc: {
      en: 'Energy production +50%, but shields -30%',
      hu: 'Energiatermelés +50%, de pajzsok -30%',
    },
    icon: '🌞',
    modifier: { energy: 1.5, shield: 0.7 },
    duration: 7 * 24 * 3600,
  },
  MARKET_FAIR: {
    id: 'MARKET_FAIR',
    name: { en: 'Galactic Market Fair', hu: 'Galaktikus Piaci Vásár' },
    desc: {
      en: 'Market prices reduced by 40%!',
      hu: 'A piaci árak 40%-kal csökkentek!',
    },
    icon: '🏪',
    modifier: { marketFee: 0.6 },
    duration: 7 * 24 * 3600,
  },
  DM_STORM: {
    id: 'DM_STORM',
    name: { en: 'Dark Matter Storm', hu: 'Sötét Anyag Vihar' },
    desc: {
      en: 'Expedition DM rewards x3, but ship loss chance increased.',
      hu: 'Expedíciós Sötét Anyag jutalom x3, de a hajóvesztés esélye megnőtt.',
    },
    icon: '🌀',
    modifier: { dmReward: 3.0, shipLoss: 1.2 },
    duration: 7 * 24 * 3600,
  },
};

// ── Short-lived World Event Types (original, auto-spawned) ──
export const EVENT_TYPES = {
  CRYSTAL_BOOM: {
    id: 'CRYSTAL_BOOM',
    name: { en: 'Crystal Resonance', hu: 'Kristály Rezonancia' },
    desc: { en: 'Crystal production increased by 50% across the galaxy!', hu: 'A kristálytermelés 50%-kal nőtt a galaxisban!' },
    icon: '💎',
    modifier: { crystal: 1.5 },
    duration: 4 * 3600 // 4 hours
  },
  SOLAR_FLARE: {
    id: 'SOLAR_FLARE',
    name: { en: 'Solar Flare', hu: 'Napkitörés' },
    desc: { en: 'Energy production reduced by 30% due to solar activity.', hu: 'Az energiatermelés 30%-kal csökkent a naptevékenység miatt.' },
    icon: '☀️',
    modifier: { energy: 0.7 },
    duration: 2 * 3600
  },
  TRADE_CONVOY: {
    id: 'TRADE_CONVOY',
    name: { en: 'Trade Convoy', hu: 'Kereskedelmi Konvoj' },
    desc: { en: 'Market fees reduced. Trading is more profitable now!', hu: 'Piaci jutalékok csökkentve. A kereskedés most kifizetődőbb!' },
    icon: '⚖️',
    modifier: { marketFee: 0.5 },
    duration: 6 * 3600
  },
  TECH_BREAKTHROUGH: {
    id: 'TECH_BREAKTHROUGH',
    name: { en: 'Tech Breakthrough', hu: 'Technológiai Áttörés' },
    desc: { en: 'Research costs reduced by 20%!', hu: 'A kutatási költségek 20%-kal csökkentek!' },
    icon: '🔬',
    modifier: { researchCost: 0.8 },
    duration: 3 * 3600
  }
};

export async function processWorldEvents(env) {
  // Ensure table exists
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS world_events (
      id TEXT PRIMARY KEY,
      type_id TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      data TEXT
    )
  `).run();

  // 1. Cleanup expired events
  const now = Math.floor(Date.now() / 1000);
  await env.DB.prepare('DELETE FROM world_events WHERE expires_at < ?').bind(now).run();

  // 2. Check if we should spawn a new event (20% chance every hour)
  const { results: activeEvents } = await env.DB.prepare('SELECT * FROM world_events').all();
  
  if (activeEvents.length === 0 && Math.random() < 0.20) {
    const keys = Object.keys(EVENT_TYPES);
    const type = EVENT_TYPES[keys[Math.floor(Math.random() * keys.length)]];
    
    await env.DB.prepare(`
      INSERT INTO world_events (id, type_id, expires_at, data)
      VALUES (?, ?, ?, ?)
    `).bind(
      crypto.randomUUID(),
      type.id,
      now + type.duration,
      JSON.stringify(type.modifier)
    ).run();
    
    console.log(`World Event Started: ${type.id}`);
  }
}

export async function getActiveEvents(env) {
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS world_events (
      id TEXT PRIMARY KEY,
      type_id TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      data TEXT
    )
  `).run();
  const { results } = await env.DB.prepare('SELECT * FROM world_events').all();
  return results.map(r => ({
    ...r,
    meta: EVENT_TYPES[r.type_id] || SEASONAL_EVENT_TYPES[r.type_id] || null,
  }));
}

// ── Seasonal Event Helpers ──

/**
 * Start a seasonal event (admin-triggered, 7-day duration).
 * @param {object} env
 * @param {string} eventType — key from SEASONAL_EVENT_TYPES
 * @returns {object|null} the created event row, or null if invalid type
 */
export async function startSeasonalEvent(env, eventType) {
  const type = SEASONAL_EVENT_TYPES[eventType];
  if (!type) return null;

  // Ensure event_scores table exists
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS event_scores (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      event_id TEXT NOT NULL,
      score INTEGER DEFAULT 0,
      updated_at INTEGER
    )
  `).run();

  const now = Math.floor(Date.now() / 1000);
  const id = crypto.randomUUID();

  await env.DB.prepare(`
    INSERT INTO world_events (id, type_id, expires_at, data)
    VALUES (?, ?, ?, ?)
  `).bind(id, type.id, now + type.duration, JSON.stringify(type.modifier)).run();

  console.log(`Seasonal Event Started: ${type.id}`);
  return { id, type_id: type.id, expires_at: now + type.duration, meta: type };
}

/**
 * Get the current active seasonal event (first match from SEASONAL_EVENT_TYPES).
 * Falls back to any active world event if no seasonal is active.
 */
export async function getActiveEvent(env) {
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS world_events (
      id TEXT PRIMARY KEY,
      type_id TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      data TEXT
    )
  `).run();

  const now = Math.floor(Date.now() / 1000);
  const { results } = await env.DB.prepare(
    'SELECT * FROM world_events WHERE expires_at > ? ORDER BY expires_at DESC'
  ).bind(now).all();

  if (!results.length) return null;

  // Prefer seasonal events
  for (const r of results) {
    if (SEASONAL_EVENT_TYPES[r.type_id]) {
      return { ...r, meta: SEASONAL_EVENT_TYPES[r.type_id] };
    }
  }

  // Fallback to first active event
  const r = results[0];
  return { ...r, meta: EVENT_TYPES[r.type_id] || null };
}

/**
 * Get the modifier object for an active event (for game calculations).
 */
export function getEventModifiers(event) {
  if (!event || !event.meta) return {};
  return event.meta.modifier || {};
}

/**
 * Get the top 20 scores for a given event.
 */
export async function getEventLeaderboard(env, eventId) {
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS event_scores (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      event_id TEXT NOT NULL,
      score INTEGER DEFAULT 0,
      updated_at INTEGER
    )
  `).run();

  const { results } = await env.DB.prepare(`
    SELECT es.user_id, es.score, u.username
    FROM event_scores es
    LEFT JOIN users u ON u.id = es.user_id
    WHERE es.event_id = ?
    ORDER BY es.score DESC
    LIMIT 20
  `).bind(eventId).all();

  return results;
}
