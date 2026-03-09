/**
 * AIKA WORLD — World Events Engine
 */

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
    meta: EVENT_TYPES[r.type_id]
  }));
}
