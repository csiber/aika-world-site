/**
 * Quest API routes — daily & weekly quest generation, listing, and claiming
 */

import { jsonResponse, jsonError } from '../utils/response.js';

// ── Quest Templates ──────────────────────────────────────────────────────────

const DAILY_TEMPLATES = [
  { type: 'spy',           required: 3,  reward: { metal: 500,  crystal: 300,  deus: 0,   dm: 0  }, desc: 'Kémkedj 3 alkalommal' },
  { type: 'attack',        required: 2,  reward: { metal: 1000, crystal: 500,  deus: 50,  dm: 0  }, desc: 'Támadj meg 2 játékost' },
  { type: 'build_ship',    required: 10, reward: { metal: 800,  crystal: 400,  deus: 0,   dm: 0  }, desc: 'Építs 10 hajót' },
  { type: 'upgrade',       required: 2,  reward: { metal: 600,  crystal: 300,  deus: 0,   dm: 0  }, desc: 'Fejlessz 2 épületet' },
  { type: 'trade',         required: 1,  reward: { metal: 400,  crystal: 400,  deus: 0,   dm: 0  }, desc: 'Kereskedj 1 alkalommal' },
  { type: 'research',      required: 1,  reward: { metal: 500,  crystal: 500,  deus: 50,  dm: 0  }, desc: 'Indíts el 1 kutatást' },
  { type: 'harvest',       required: 2,  reward: { metal: 700,  crystal: 350,  deus: 0,   dm: 0  }, desc: 'Gyűjts törmeléket 2×' },
  { type: 'colonize',      required: 1,  reward: { metal: 2000, crystal: 1000, deus: 100, dm: 5  }, desc: 'Gyarmatosíts 1 bolygót' },
  { type: 'expedition',    required: 1,  reward: { metal: 600,  crystal: 300,  deus: 30,  dm: 2  }, desc: 'Küldj 1 expedíciót' },
  { type: 'donate',        required: 1,  reward: { metal: 400,  crystal: 200,  deus: 0,   dm: 0  }, desc: 'Adományozz a szövetségednek' },
  { type: 'build_defense', required: 5,  reward: { metal: 500,  crystal: 250,  deus: 0,   dm: 0  }, desc: 'Építs 5 védelmi egységet' },
  { type: 'mine_metal',    required: 1,  reward: { metal: 300,  crystal: 300,  deus: 0,   dm: 0  }, desc: 'Fejleszd a fémbányát' },
  { type: 'mine_crystal',  required: 1,  reward: { metal: 300,  crystal: 300,  deus: 0,   dm: 0  }, desc: 'Fejleszd a kristálybányát' },
  { type: 'spy',           required: 5,  reward: { metal: 800,  crystal: 500,  deus: 20,  dm: 1  }, desc: 'Kémkedj 5 alkalommal' },
  { type: 'attack',        required: 5,  reward: { metal: 2000, crystal: 1000, deus: 100, dm: 3  }, desc: 'Támadj meg 5 játékost' },
  { type: 'build_ship',    required: 25, reward: { metal: 1500, crystal: 750,  deus: 50,  dm: 2  }, desc: 'Építs 25 hajót' },
  { type: 'upgrade',       required: 4,  reward: { metal: 1200, crystal: 600,  deus: 30,  dm: 1  }, desc: 'Fejlessz 4 épületet' },
  { type: 'trade',         required: 3,  reward: { metal: 900,  crystal: 900,  deus: 0,   dm: 1  }, desc: 'Kereskedj 3 alkalommal' },
  { type: 'harvest',       required: 4,  reward: { metal: 1200, crystal: 600,  deus: 0,   dm: 1  }, desc: 'Gyűjts törmeléket 4×' },
  { type: 'build_defense', required: 15, reward: { metal: 1000, crystal: 500,  deus: 20,  dm: 1  }, desc: 'Építs 15 védelmi egységet' },
];

const WEEKLY_TEMPLATES = [
  { type: 'attack',        required: 20, reward: { metal: 10000, crystal: 5000,  deus: 500,  dm: 20 }, desc: 'Heti: Támadj 20 alkalommal' },
  { type: 'build_ship',    required: 100,reward: { metal: 8000,  crystal: 4000,  deus: 300,  dm: 15 }, desc: 'Heti: Építs 100 hajót' },
  { type: 'trade',         required: 10, reward: { metal: 5000,  crystal: 5000,  deus: 200,  dm: 10 }, desc: 'Heti: Kereskedj 10 alkalommal' },
  { type: 'upgrade',       required: 15, reward: { metal: 6000,  crystal: 3000,  deus: 300,  dm: 12 }, desc: 'Heti: Fejlessz 15 épületet' },
  { type: 'spy',           required: 20, reward: { metal: 4000,  crystal: 2000,  deus: 200,  dm: 10 }, desc: 'Heti: Kémkedj 20 alkalommal' },
  { type: 'expedition',    required: 7,  reward: { metal: 5000,  crystal: 3000,  deus: 300,  dm: 15 }, desc: 'Heti: Küldj 7 expedíciót' },
  { type: 'build_defense', required: 50, reward: { metal: 5000,  crystal: 2500,  deus: 200,  dm: 10 }, desc: 'Heti: Építs 50 védelmi egységet' },
  { type: 'donate',        required: 5,  reward: { metal: 3000,  crystal: 1500,  deus: 150,  dm: 8  }, desc: 'Heti: Adományozz 5 alkalommal' },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function endOfUTCDay() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)).getTime();
}

function nextMondayUTC() {
  const now = new Date();
  const day = now.getUTCDay(); // 0=Sun, 1=Mon...
  const daysUntilMonday = day === 0 ? 1 : (8 - day);
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + daysUntilMonday)).getTime();
}

function pickRandom(arr, count) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// ── Quest Generation ─────────────────────────────────────────────────────────

async function generateDailyQuests(env, userId) {
  const now = Date.now();
  const existing = await env.DB.prepare(
    `SELECT id FROM user_quests WHERE user_id = ? AND quest_period = 'daily' AND expires_at > ?`
  ).bind(userId, now).first();
  if (existing) return; // already have daily quests

  const templates = pickRandom(DAILY_TEMPLATES, 3);
  const expiresAt = endOfUTCDay();

  const stmts = templates.map(t =>
    env.DB.prepare(
      `INSERT INTO user_quests (user_id, quest_type, target_id, required, current, reward_metal, reward_deus, reward_dm, reward_json, is_claimed, expires_at, description_key, quest_period)
       VALUES (?, ?, ?, ?, 0, ?, ?, ?, ?, 0, ?, ?, 'daily')`
    ).bind(
      userId,
      t.type,
      crypto.randomUUID(),
      t.required,
      t.reward.metal,
      t.reward.deus,
      t.reward.dm || 0,
      JSON.stringify(t.reward),
      expiresAt,
      t.desc
    )
  );

  await env.DB.batch(stmts);
}

async function generateWeeklyQuest(env, userId) {
  const now = Date.now();
  const existing = await env.DB.prepare(
    `SELECT id FROM user_quests WHERE user_id = ? AND quest_period = 'weekly' AND expires_at > ?`
  ).bind(userId, now).first();
  if (existing) return; // already have weekly quest

  const [t] = pickRandom(WEEKLY_TEMPLATES, 1);
  const expiresAt = nextMondayUTC();

  await env.DB.prepare(
    `INSERT INTO user_quests (user_id, quest_type, target_id, required, current, reward_metal, reward_deus, reward_dm, reward_json, is_claimed, expires_at, description_key, quest_period)
     VALUES (?, ?, ?, ?, 0, ?, ?, ?, ?, 0, ?, ?, 'weekly')`
  ).bind(
    userId,
    t.type,
    crypto.randomUUID(),
    t.required,
    t.reward.metal,
    t.reward.deus,
    t.reward.dm || 0,
    JSON.stringify(t.reward),
    expiresAt,
    t.desc
  ).run();
}

// ── Route Handler ────────────────────────────────────────────────────────────

export async function handleQuests(request, env, userId) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  // ── GET /api/quests — list active quests (generate if needed) ──
  if (path === '/api/quests' && method === 'GET') {
    await generateDailyQuests(env, userId);
    await generateWeeklyQuest(env, userId);

    const now = Date.now();
    const { results } = await env.DB.prepare(
      `SELECT * FROM user_quests WHERE user_id = ? AND expires_at > ? ORDER BY quest_period ASC, expires_at ASC`
    ).bind(userId, now).all();

    return jsonResponse({ ok: true, quests: results }, 200, request);
  }

  // ── POST /api/quests/claim/:questId — claim a completed quest ──
  if (path.startsWith('/api/quests/claim/') && method === 'POST') {
    const targetId = path.split('/').pop();

    const quest = await env.DB.prepare(
      `SELECT * FROM user_quests WHERE user_id = ? AND target_id = ? AND is_claimed = 0`
    ).bind(userId, targetId).first();
    if (!quest) return jsonError(404, 'Küldetés nem található vagy már átvéve', request);
    if (quest.current < quest.required) return jsonError(400, 'Küldetés még nincs teljesítve', request);

    // Parse reward
    let reward;
    try {
      reward = JSON.parse(quest.reward_json);
    } catch {
      reward = { metal: quest.reward_metal || 0, crystal: 0, deus: quest.reward_deus || 0, dm: quest.reward_dm || 0 };
    }

    // Get active planet to add resources
    const gs = await env.DB.prepare('SELECT active_planet_id FROM game_state WHERE user_id = ?').bind(userId).first();
    if (!gs) return jsonError(404, 'Játék állapot nem található', request);

    const planetRow = await env.DB.prepare('SELECT * FROM planets WHERE id = ?').bind(gs.active_planet_id).first();
    if (!planetRow) return jsonError(404, 'Aktív bolygó nem található', request);

    const resources = JSON.parse(planetRow.resources);
    resources.metal   += (reward.metal   || 0);
    resources.crystal += (reward.crystal || 0);
    resources.deus    += (reward.deus    || 0);

    const stmts = [
      // Update planet resources
      env.DB.prepare('UPDATE planets SET resources = ? WHERE id = ?')
        .bind(JSON.stringify(resources), gs.active_planet_id),
      // Mark quest as claimed
      env.DB.prepare('UPDATE user_quests SET is_claimed = 1, claimed_at = ? WHERE target_id = ? AND user_id = ?')
        .bind(Date.now(), targetId, userId),
    ];

    // Add score bonus (reward.metal / 10)
    const scoreBonus = Math.floor((reward.metal || 0) / 10);
    if (scoreBonus > 0) {
      stmts.push(
        env.DB.prepare('UPDATE game_state SET score = score + ? WHERE user_id = ?')
          .bind(scoreBonus, userId)
      );
      stmts.push(
        env.DB.prepare('UPDATE rankings SET score = score + ?, updated_at = unixepoch() WHERE user_id = ?')
          .bind(scoreBonus, userId)
      );
    }

    await env.DB.batch(stmts);

    // Add dark matter to game_state (column may not exist yet)
    if (reward.dm && reward.dm > 0) {
      try {
        await env.DB.prepare('UPDATE game_state SET dark_matter = dark_matter + ? WHERE user_id = ?')
          .bind(reward.dm, userId).run();
      } catch {
        try {
          await env.DB.prepare('ALTER TABLE game_state ADD COLUMN dark_matter INTEGER NOT NULL DEFAULT 0').run();
          await env.DB.prepare('UPDATE game_state SET dark_matter = dark_matter + ? WHERE user_id = ?')
            .bind(reward.dm, userId).run();
        } catch {
          // Column might already exist from another concurrent request — retry the update
          try {
            await env.DB.prepare('UPDATE game_state SET dark_matter = dark_matter + ? WHERE user_id = ?')
              .bind(reward.dm, userId).run();
          } catch (e) {
            console.error('Failed to add dark_matter:', e.message);
          }
        }
      }
    }

    return jsonResponse({ ok: true, reward, scoreBonus, resources }, 200, request);
  }

  return jsonError(404, 'Quest endpoint not found', request);
}
