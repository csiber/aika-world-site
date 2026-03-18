/**
 * Tactical Battle Routes
 * v1.0.0: Grid-based tactical combat system
 */

import { jsonResponse, jsonError } from '../utils/response.js';
import { applyFormation, simulateRound, autoResolveBattle } from '../utils/tactical_engine.js';

// ── GET /api/tactical/:battleId ──────────────────────────────────────────────

export async function handleGetTacticalBattle(req, env, userId, battleId) {
  const battle = await env.DB.prepare('SELECT * FROM tactical_battles WHERE id = ?').bind(battleId).first();
  if (!battle) return jsonError(404, 'Csata nem található', req);
  if (battle.attacker_id !== userId && battle.defender_id !== userId) {
    return jsonError(403, 'Nincs jogosultság', req);
  }

  return jsonResponse({
    ok: true,
    battle: {
      id: battle.id,
      missionId: battle.mission_id,
      attackerId: battle.attacker_id,
      defenderId: battle.defender_id,
      attackerFleet: JSON.parse(battle.attacker_fleet),
      defenderFleet: JSON.parse(battle.defender_fleet),
      attackerFormation: battle.attacker_formation ? JSON.parse(battle.attacker_formation) : null,
      defenderFormation: battle.defender_formation ? JSON.parse(battle.defender_formation) : null,
      attackerOrders: JSON.parse(battle.attacker_orders || '{}'),
      defenderOrders: JSON.parse(battle.defender_orders || '{}'),
      status: battle.status,
      currentRound: battle.current_round,
      maxRounds: battle.max_rounds,
      roundLog: JSON.parse(battle.round_log || '[]'),
      result: battle.result ? JSON.parse(battle.result) : null,
      autoResolveAt: battle.auto_resolve_at,
      planetCoords: battle.planet_coords,
      createdAt: battle.created_at,
    },
  }, 200, req);
}

// ── POST /api/tactical/:battleId/formation ───────────────────────────────────

export async function handleSubmitFormation(req, env, userId, battleId) {
  let body;
  try { body = await req.json(); } catch { return jsonError(400, 'Invalid JSON', req); }

  const { formation } = body;
  if (!formation || !Array.isArray(formation)) {
    return jsonError(400, 'Formáció szükséges', req);
  }

  try {
    const updated = await applyFormation(env, battleId, userId, formation);
    return jsonResponse({
      ok: true,
      battle: {
        id: updated.id,
        status: updated.status,
        attackerFormation: updated.attacker_formation ? JSON.parse(updated.attacker_formation) : null,
        defenderFormation: updated.defender_formation ? JSON.parse(updated.defender_formation) : null,
      },
    }, 200, req);
  } catch (e) {
    return jsonError(400, e.message, req);
  }
}

// ── POST /api/tactical/:battleId/orders ──────────────────────────────────────

export async function handleSubmitOrders(req, env, userId, battleId) {
  let body;
  try { body = await req.json(); } catch { return jsonError(400, 'Invalid JSON', req); }

  const { orders } = body;
  if (!orders) return jsonError(400, 'Parancsok szükségesek', req);

  const battle = await env.DB.prepare('SELECT * FROM tactical_battles WHERE id = ?').bind(battleId).first();
  if (!battle) return jsonError(404, 'Csata nem található', req);
  if (battle.attacker_id !== userId && battle.defender_id !== userId) {
    return jsonError(403, 'Nincs jogosultság', req);
  }

  // Validate orders structure
  const validPriorities = ['weakest_first', 'strongest_first', 'closest'];
  if (orders.target_priority && !validPriorities.includes(orders.target_priority)) {
    return jsonError(400, 'Érvénytelen célpont prioritás', req);
  }

  const column = battle.attacker_id === userId ? 'attacker_orders' : 'defender_orders';
  await env.DB.prepare(`UPDATE tactical_battles SET ${column} = ?, updated_at = unixepoch() WHERE id = ?`)
    .bind(JSON.stringify(orders), battleId).run();

  return jsonResponse({ ok: true }, 200, req);
}

// ── POST /api/tactical/:battleId/advance ─────────────────────────────────────

export async function handleAdvanceRound(req, env, userId, battleId) {
  const battle = await env.DB.prepare('SELECT * FROM tactical_battles WHERE id = ?').bind(battleId).first();
  if (!battle) return jsonError(404, 'Csata nem található', req);
  if (battle.attacker_id !== userId && battle.defender_id !== userId) {
    return jsonError(403, 'Nincs jogosultság', req);
  }
  if (battle.status === 'resolved') {
    return jsonError(400, 'Csata már lezárult', req);
  }

  try {
    const result = await simulateRound(env, battleId);

    // If result is from resolveTacticalBattle, it's a plain object
    if (result.attackerWins !== undefined) {
      return jsonResponse({ ok: true, resolved: true, result }, 200, req);
    }

    // Otherwise it's a DB row
    return jsonResponse({
      ok: true,
      resolved: false,
      battle: {
        id: result.id,
        status: result.status,
        currentRound: result.current_round,
        attackerFleet: JSON.parse(result.attacker_fleet),
        defenderFleet: JSON.parse(result.defender_fleet),
        roundLog: JSON.parse(result.round_log || '[]'),
      },
    }, 200, req);
  } catch (e) {
    return jsonError(400, e.message, req);
  }
}

// ── POST /api/tactical/:battleId/auto ────────────────────────────────────────

export async function handleAutoResolve(req, env, userId, battleId) {
  const battle = await env.DB.prepare('SELECT * FROM tactical_battles WHERE id = ?').bind(battleId).first();
  if (!battle) return jsonError(404, 'Csata nem található', req);
  if (battle.attacker_id !== userId && battle.defender_id !== userId) {
    return jsonError(403, 'Nincs jogosultság', req);
  }

  try {
    const result = await autoResolveBattle(env, battleId);
    return jsonResponse({ ok: true, result }, 200, req);
  } catch (e) {
    return jsonError(400, e.message, req);
  }
}
