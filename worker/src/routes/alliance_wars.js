/**
 * Alliance Wars v2 routes
 * War goals, contributions, surrender, and history.
 */

import { jsonResponse, jsonError } from '../utils/response.js';

const WAR_GOALS = [
  { type: 'score',   target: 100000, label: 'Reach 100,000 total war score' },
  { type: 'sectors', target: 3,      label: 'Capture 3 sectors from the enemy' },
  { type: 'battles', target: 10,     label: 'Win 10 battles against the enemy' },
];

const WAR_DURATION_SECONDS = 7 * 24 * 60 * 60; // 7 days

/**
 * Ensure alliance_wars v2 columns exist (idempotent migration).
 */
async function ensureWarV2Schema(env) {
  const alters = [
    "ALTER TABLE alliance_wars ADD COLUMN goal_type TEXT DEFAULT 'score'",
    "ALTER TABLE alliance_wars ADD COLUMN goal_target INTEGER DEFAULT 100000",
    "ALTER TABLE alliance_wars ADD COLUMN ends_at INTEGER",
    "ALTER TABLE alliance_wars ADD COLUMN winner_id TEXT",
  ];
  for (const sql of alters) {
    try { await env.DB.prepare(sql).run(); } catch { /* already exists */ }
  }

  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS war_contributions (
      id TEXT PRIMARY KEY,
      war_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      alliance_id TEXT NOT NULL,
      damage_dealt INTEGER DEFAULT 0,
      resources_raided INTEGER DEFAULT 0,
      battles_won INTEGER DEFAULT 0,
      updated_at INTEGER
    )
  `).run();

  try { await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_war_contrib ON war_contributions(war_id, alliance_id)').run(); } catch {}
  try { await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_war_contrib_user ON war_contributions(war_id, user_id)').run(); } catch {}
}

function pickRandomGoal() {
  return WAR_GOALS[Math.floor(Math.random() * WAR_GOALS.length)];
}

export async function handleAllianceWars(request, env, url, user) {
  const userId = user.sub;
  const path = url.pathname;
  const method = request.method;

  await ensureWarV2Schema(env);

  // ── POST /api/alliance/war/declare ──────────────────────
  if (path === '/api/alliance/war/declare' && method === 'POST') {
    const myMember = await env.DB.prepare('SELECT alliance_id, role FROM alliance_members WHERE user_id = ?').bind(userId).first();
    if (!myMember || myMember.role !== 'leader') return jsonError(403, 'Only the alliance leader can declare war', request);

    let body; try { body = await request.json(); } catch { return jsonError(400, 'Invalid JSON', request); }
    const { targetAllianceId } = body;
    if (!targetAllianceId) return jsonError(400, 'Target alliance required', request);
    if (targetAllianceId === myMember.alliance_id) return jsonError(400, 'Cannot declare war on your own alliance', request);

    const target = await env.DB.prepare('SELECT id, name FROM alliances WHERE id = ?').bind(targetAllianceId).first();
    if (!target) return jsonError(404, 'Target alliance not found', request);

    const existing = await env.DB.prepare(
      "SELECT id FROM alliance_wars WHERE status = 'active' AND ((attacker_id = ? AND defender_id = ?) OR (attacker_id = ? AND defender_id = ?))"
    ).bind(myMember.alliance_id, targetAllianceId, targetAllianceId, myMember.alliance_id).first();
    if (existing) return jsonError(400, 'Already at war with this alliance', request);

    const now = Math.floor(Date.now() / 1000);
    const goal = pickRandomGoal();
    const warId = crypto.randomUUID();

    await env.DB.prepare(
      'INSERT INTO alliance_wars (id, attacker_id, defender_id, status, started_at, goal_type, goal_target, ends_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(warId, myMember.alliance_id, targetAllianceId, 'active', now, goal.type, goal.target, now + WAR_DURATION_SECONDS).run();

    // Notify target leader
    const targetAlliance = await env.DB.prepare('SELECT leader_id FROM alliances WHERE id = ?').bind(targetAllianceId).first();
    const myAlliance = await env.DB.prepare('SELECT name FROM alliances WHERE id = ?').bind(myMember.alliance_id).first();
    if (targetAlliance) {
      await env.DB.prepare('INSERT INTO messages (id, user_id, from_name, subject, body, msg_type) VALUES (?, ?, ?, ?, ?, ?)')
        .bind(crypto.randomUUID(), targetAlliance.leader_id, 'War Council', 'WAR DECLARED!',
          `The alliance [${myAlliance.name}] has declared war on you!\n\nWar Goal: ${goal.type} (target: ${goal.target})\nDuration: 7 days`,
          'system').run();
    }

    return jsonResponse({ ok: true, warId, goal: goal.type, goalTarget: goal.target, message: 'War declared!' }, 200, request);
  }

  // ── GET /api/alliance/war/active ────────────────────────
  if (path === '/api/alliance/war/active' && method === 'GET') {
    const myMember = await env.DB.prepare('SELECT alliance_id FROM alliance_members WHERE user_id = ?').bind(userId).first();
    if (!myMember) return jsonResponse({ ok: true, wars: [] }, 200, request);

    const aid = myMember.alliance_id;
    const now = Math.floor(Date.now() / 1000);

    // Auto-end expired wars
    const expired = await env.DB.prepare(
      "SELECT id, attacker_id, defender_id, attacker_score, defender_score FROM alliance_wars WHERE status = 'active' AND ends_at <= ? AND (attacker_id = ? OR defender_id = ?)"
    ).bind(now, aid, aid).all();

    for (const w of expired.results) {
      const winnerId = w.attacker_score >= w.defender_score ? w.attacker_id : w.defender_id;
      await env.DB.prepare("UPDATE alliance_wars SET status = 'ended', ended_at = ?, winner_id = ? WHERE id = ?")
        .bind(now, winnerId, w.id).run();
    }

    const { results: wars } = await env.DB.prepare(`
      SELECT w.*, a1.name as attacker_name, a1.tag as attacker_tag,
             a2.name as defender_name, a2.tag as defender_tag
      FROM alliance_wars w
      JOIN alliances a1 ON w.attacker_id = a1.id
      JOIN alliances a2 ON w.defender_id = a2.id
      WHERE w.status = 'active' AND (w.attacker_id = ? OR w.defender_id = ?)
      ORDER BY w.started_at DESC
    `).bind(aid, aid).all();

    return jsonResponse({ ok: true, wars }, 200, request);
  }

  // ── GET /api/alliance/war/history ───────────────────────
  if (path === '/api/alliance/war/history' && method === 'GET') {
    const myMember = await env.DB.prepare('SELECT alliance_id FROM alliance_members WHERE user_id = ?').bind(userId).first();
    if (!myMember) return jsonResponse({ ok: true, wars: [] }, 200, request);

    const { results: wars } = await env.DB.prepare(`
      SELECT w.*, a1.name as attacker_name, a1.tag as attacker_tag,
             a2.name as defender_name, a2.tag as defender_tag
      FROM alliance_wars w
      JOIN alliances a1 ON w.attacker_id = a1.id
      JOIN alliances a2 ON w.defender_id = a2.id
      WHERE w.status = 'ended' AND (w.attacker_id = ? OR w.defender_id = ?)
      ORDER BY w.ended_at DESC
      LIMIT 20
    `).bind(myMember.alliance_id, myMember.alliance_id).all();

    return jsonResponse({ ok: true, wars }, 200, request);
  }

  // ── GET /api/alliance/war/:warId/stats ──────────────────
  if (path.match(/^\/api\/alliance\/war\/[^/]+\/stats$/) && method === 'GET') {
    const warId = path.split('/')[4];

    const war = await env.DB.prepare('SELECT * FROM alliance_wars WHERE id = ?').bind(warId).first();
    if (!war) return jsonError(404, 'War not found', request);

    // Verify user is in one of the warring alliances
    const myMember = await env.DB.prepare('SELECT alliance_id FROM alliance_members WHERE user_id = ?').bind(userId).first();
    if (!myMember || (myMember.alliance_id !== war.attacker_id && myMember.alliance_id !== war.defender_id)) {
      return jsonError(403, 'Not a participant in this war', request);
    }

    const { results: contributions } = await env.DB.prepare(`
      SELECT wc.*, u.username
      FROM war_contributions wc
      JOIN users u ON wc.user_id = u.id
      WHERE wc.war_id = ?
      ORDER BY (wc.damage_dealt + wc.resources_raided) DESC
    `).bind(warId).all();

    const attackerContribs = contributions.filter(c => c.alliance_id === war.attacker_id);
    const defenderContribs = contributions.filter(c => c.alliance_id === war.defender_id);

    // Check goal progress
    let goalProgress = null;
    if (war.goal_type === 'score') {
      goalProgress = {
        attacker: war.attacker_score,
        defender: war.defender_score,
        target: war.goal_target,
      };
    } else if (war.goal_type === 'battles') {
      const attackerBattles = attackerContribs.reduce((s, c) => s + c.battles_won, 0);
      const defenderBattles = defenderContribs.reduce((s, c) => s + c.battles_won, 0);
      goalProgress = { attacker: attackerBattles, defender: defenderBattles, target: war.goal_target };
    } else if (war.goal_type === 'sectors') {
      // Count sectors claimed by each alliance from the other
      let attackerSectors = 0, defenderSectors = 0;
      try {
        const aRes = await env.DB.prepare(
          'SELECT COUNT(*) as cnt FROM sector_claims WHERE alliance_id = ?'
        ).bind(war.attacker_id).first();
        const dRes = await env.DB.prepare(
          'SELECT COUNT(*) as cnt FROM sector_claims WHERE alliance_id = ?'
        ).bind(war.defender_id).first();
        attackerSectors = aRes?.cnt || 0;
        defenderSectors = dRes?.cnt || 0;
      } catch { /* sector_claims may not exist */ }
      goalProgress = { attacker: attackerSectors, defender: defenderSectors, target: war.goal_target };
    }

    return jsonResponse({
      ok: true,
      war,
      attackerContribs,
      defenderContribs,
      goalProgress,
    }, 200, request);
  }

  // ── POST /api/alliance/war/:warId/surrender ─────────────
  if (path.match(/^\/api\/alliance\/war\/[^/]+\/surrender$/) && method === 'POST') {
    const warId = path.split('/')[4];

    const myMember = await env.DB.prepare('SELECT alliance_id, role FROM alliance_members WHERE user_id = ?').bind(userId).first();
    if (!myMember || myMember.role !== 'leader') return jsonError(403, 'Only the leader can surrender', request);

    const war = await env.DB.prepare("SELECT * FROM alliance_wars WHERE id = ? AND status = 'active'").bind(warId).first();
    if (!war) return jsonError(404, 'Active war not found', request);

    if (myMember.alliance_id !== war.attacker_id && myMember.alliance_id !== war.defender_id) {
      return jsonError(403, 'Your alliance is not part of this war', request);
    }

    const now = Math.floor(Date.now() / 1000);
    // The surrendering alliance loses; the other wins
    const winnerId = myMember.alliance_id === war.attacker_id ? war.defender_id : war.attacker_id;

    await env.DB.prepare("UPDATE alliance_wars SET status = 'ended', ended_at = ?, winner_id = ? WHERE id = ?")
      .bind(now, winnerId, warId).run();

    // Notify the winner's leader
    const winnerAlliance = await env.DB.prepare('SELECT leader_id, name FROM alliances WHERE id = ?').bind(winnerId).first();
    const loserAlliance = await env.DB.prepare('SELECT name FROM alliances WHERE id = ?').bind(myMember.alliance_id).first();
    if (winnerAlliance) {
      await env.DB.prepare('INSERT INTO messages (id, user_id, from_name, subject, body, msg_type) VALUES (?, ?, ?, ?, ?, ?)')
        .bind(crypto.randomUUID(), winnerAlliance.leader_id, 'War Council', 'VICTORY!',
          `The alliance [${loserAlliance.name}] has surrendered! Your alliance wins the war!`, 'system').run();
    }

    return jsonResponse({ ok: true, message: 'Your alliance has surrendered.' }, 200, request);
  }

  return null; // not handled — fall through to alliance.js
}

/**
 * Update war contributions after a battle between warring alliances.
 * Called from mission_resolver.js after an attack resolves.
 */
export async function updateWarContributions(env, attackerUserId, defenderUserId, damageDealt, resourcesRaided, attackerWon) {
  try {
    // Get alliance memberships
    const attackerMember = await env.DB.prepare('SELECT alliance_id FROM alliance_members WHERE user_id = ?').bind(attackerUserId).first();
    const defenderMember = await env.DB.prepare('SELECT alliance_id FROM alliance_members WHERE user_id = ?').bind(defenderUserId).first();
    if (!attackerMember || !defenderMember) return;
    if (attackerMember.alliance_id === defenderMember.alliance_id) return; // same alliance

    // Find active war between these alliances
    const war = await env.DB.prepare(
      "SELECT * FROM alliance_wars WHERE status = 'active' AND ((attacker_id = ? AND defender_id = ?) OR (attacker_id = ? AND defender_id = ?))"
    ).bind(attackerMember.alliance_id, defenderMember.alliance_id, defenderMember.alliance_id, attackerMember.alliance_id).first();
    if (!war) return;

    const now = Math.floor(Date.now() / 1000);

    // Check if ends_at column exists and war expired
    if (war.ends_at && now >= war.ends_at) {
      const winnerId = war.attacker_score >= war.defender_score ? war.attacker_id : war.defender_id;
      await env.DB.prepare("UPDATE alliance_wars SET status = 'ended', ended_at = ?, winner_id = ? WHERE id = ?")
        .bind(now, winnerId, war.id).run();
      return;
    }

    // Upsert war contribution for the attacker
    const contribId = `${war.id}_${attackerUserId}`;
    const existing = await env.DB.prepare('SELECT id FROM war_contributions WHERE id = ?').bind(contribId).first();

    const dmg = Math.floor(damageDealt || 0);
    const raided = Math.floor(resourcesRaided || 0);
    const won = attackerWon ? 1 : 0;

    if (existing) {
      await env.DB.prepare(
        'UPDATE war_contributions SET damage_dealt = damage_dealt + ?, resources_raided = resources_raided + ?, battles_won = battles_won + ?, updated_at = ? WHERE id = ?'
      ).bind(dmg, raided, won, now, contribId).run();
    } else {
      await env.DB.prepare(
        'INSERT INTO war_contributions (id, war_id, user_id, alliance_id, damage_dealt, resources_raided, battles_won, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(contribId, war.id, attackerUserId, attackerMember.alliance_id, dmg, raided, won, now).run();
    }

    // Update war scores
    const scoreGain = dmg + raided;
    const isAttackerSide = attackerMember.alliance_id === war.attacker_id;
    if (isAttackerSide) {
      await env.DB.prepare('UPDATE alliance_wars SET attacker_score = attacker_score + ? WHERE id = ?')
        .bind(scoreGain, war.id).run();
    } else {
      await env.DB.prepare('UPDATE alliance_wars SET defender_score = defender_score + ? WHERE id = ?')
        .bind(scoreGain, war.id).run();
    }

    // Check if war goal is met
    const updatedWar = await env.DB.prepare('SELECT * FROM alliance_wars WHERE id = ?').bind(war.id).first();
    let goalMet = false;
    let goalWinnerId = null;

    if (updatedWar.goal_type === 'score') {
      if (updatedWar.attacker_score >= updatedWar.goal_target) { goalMet = true; goalWinnerId = updatedWar.attacker_id; }
      else if (updatedWar.defender_score >= updatedWar.goal_target) { goalMet = true; goalWinnerId = updatedWar.defender_id; }
    } else if (updatedWar.goal_type === 'battles') {
      // Count total battles won per side
      const aBattles = await env.DB.prepare('SELECT SUM(battles_won) as total FROM war_contributions WHERE war_id = ? AND alliance_id = ?')
        .bind(war.id, updatedWar.attacker_id).first();
      const dBattles = await env.DB.prepare('SELECT SUM(battles_won) as total FROM war_contributions WHERE war_id = ? AND alliance_id = ?')
        .bind(war.id, updatedWar.defender_id).first();
      if ((aBattles?.total || 0) >= updatedWar.goal_target) { goalMet = true; goalWinnerId = updatedWar.attacker_id; }
      else if ((dBattles?.total || 0) >= updatedWar.goal_target) { goalMet = true; goalWinnerId = updatedWar.defender_id; }
    }
    // 'sectors' goal is checked passively via the /stats endpoint

    if (goalMet && goalWinnerId) {
      await env.DB.prepare("UPDATE alliance_wars SET status = 'ended', ended_at = ?, winner_id = ? WHERE id = ?")
        .bind(now, goalWinnerId, war.id).run();

      // Notify both leaders
      const winnerAlliance = await env.DB.prepare('SELECT leader_id, name FROM alliances WHERE id = ?').bind(goalWinnerId).first();
      const loserId = goalWinnerId === updatedWar.attacker_id ? updatedWar.defender_id : updatedWar.attacker_id;
      const loserAlliance = await env.DB.prepare('SELECT leader_id, name FROM alliances WHERE id = ?').bind(loserId).first();

      if (winnerAlliance) {
        await env.DB.prepare('INSERT INTO messages (id, user_id, from_name, subject, body, msg_type) VALUES (?, ?, ?, ?, ?, ?)')
          .bind(crypto.randomUUID(), winnerAlliance.leader_id, 'War Council', 'VICTORY!',
            `Your alliance has achieved the war goal and won the war against [${loserAlliance?.name}]!`, 'system').run();
      }
      if (loserAlliance) {
        await env.DB.prepare('INSERT INTO messages (id, user_id, from_name, subject, body, msg_type) VALUES (?, ?, ?, ?, ?, ?)')
          .bind(crypto.randomUUID(), loserAlliance.leader_id, 'War Council', 'DEFEAT',
            `The enemy alliance [${winnerAlliance?.name}] has achieved the war goal. The war is lost.`, 'system').run();
      }
    }
  } catch (e) {
    console.error('updateWarContributions error:', e);
  }
}
