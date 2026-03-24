/**
 * Migrate JSON blob data to normalized tables.
 * Safe to run multiple times (uses INSERT OR REPLACE).
 * Called from admin endpoint or cron.
 */
export async function migrateToNormalized(env) {
  const stats = { planets: 0, buildings: 0, fleet: 0, resources: 0, research: 0 };

  // Migrate planets
  const planets = await env.DB.prepare('SELECT id, user_id, buildings, fleet, resources FROM planets').all();
  for (const planet of (planets.results || [])) {
    stats.planets++;
    const now = Date.now();

    // Buildings
    const buildings = JSON.parse(planet.buildings || '[]');
    for (const b of buildings) {
      if (b.level > 0) {
        await env.DB.prepare(
          'INSERT OR REPLACE INTO planet_buildings (planet_id, building_id, level, updated_at) VALUES (?1, ?2, ?3, ?4)'
        ).bind(planet.id, b.id, b.level, now).run();
        stats.buildings++;
      }
    }

    // Fleet
    const fleet = JSON.parse(planet.fleet || '[]');
    for (const f of fleet) {
      if (f.count > 0) {
        await env.DB.prepare(
          'INSERT OR REPLACE INTO planet_fleet (planet_id, ship_type, count, updated_at) VALUES (?1, ?2, ?3, ?4)'
        ).bind(planet.id, f.id || f.type, f.count, now).run();
        stats.fleet++;
      }
    }

    // Resources
    const resources = JSON.parse(planet.resources || '{}');
    for (const [type, amount] of Object.entries(resources)) {
      await env.DB.prepare(
        'INSERT OR REPLACE INTO planet_resources (planet_id, resource_type, amount, rate, updated_at) VALUES (?1, ?2, ?3, 0, ?4)'
      ).bind(planet.id, type, amount || 0, now).run();
      stats.resources++;
    }
  }

  // Migrate research
  const gameStates = await env.DB.prepare('SELECT user_id, research FROM game_state').all();
  for (const gs of (gameStates.results || [])) {
    const research = JSON.parse(gs.research || '[]');
    for (const r of research) {
      if (r.level > 0) {
        await env.DB.prepare(
          'INSERT OR REPLACE INTO player_research (user_id, tech_id, level, updated_at) VALUES (?1, ?2, ?3, ?4)'
        ).bind(gs.user_id, r.id, r.level, Date.now()).run();
        stats.research++;
      }
    }
  }

  return stats;
}
