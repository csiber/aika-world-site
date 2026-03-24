/**
 * Expedition 2.0 API routes — choice submission and history
 */

import { jsonResponse, jsonError } from '../utils/response.js';
import { EXPEDITION_EVENTS, CHAIN_EXPEDITIONS } from '../utils/expedition_templates.js';

/**
 * Find event definition by type, searching both normal events and chain steps.
 */
function findEventDef(eventType) {
  const normal = EXPEDITION_EVENTS.find(e => e.type === eventType);
  if (normal) return normal;
  for (const chain of CHAIN_EXPEDITIONS) {
    const step = chain.steps.find(s => s.type === eventType);
    if (step) return step;
  }
  return null;
}

/**
 * Ensure dark_matter column exists on game_state (ALTER TABLE try/catch pattern).
 */
async function ensureDarkMatterColumn(env) {
  try {
    await env.DB.prepare("ALTER TABLE game_state ADD COLUMN dark_matter INTEGER DEFAULT 0").run();
  } catch { /* column already exists */ }
}

export async function handleExpeditions(request, env, userId) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  // ── POST /api/expeditions/:missionId/choose ──
  const chooseMatch = path.match(/^\/api\/expeditions\/([^/]+)\/choose$/);
  if (chooseMatch && method === 'POST') {
    const missionId = chooseMatch[1];

    const mission = await env.DB.prepare(
      "SELECT * FROM fleet_missions WHERE id = ? AND user_id = ? AND status = 'awaiting_choice'"
    ).bind(missionId, userId).first();

    if (!mission) {
      return jsonError(404, 'No pending expedition choice found', request);
    }

    const body = await request.json();
    const choice = body.choice;
    if (!choice) {
      return jsonError(400, 'Missing choice', request);
    }

    const missionResult = JSON.parse(mission.result || '{}');
    const eventType = missionResult.expeditionEvent?.type;
    if (!eventType) {
      return jsonError(400, 'No expedition event data on mission', request);
    }

    const eventDef = findEventDef(eventType);
    if (!eventDef) {
      return jsonError(400, 'Unknown event type', request);
    }

    if (!eventDef.choices || !eventDef.choices.includes(choice)) {
      return jsonError(400, 'Invalid choice for this event', request);
    }

    const ships = JSON.parse(mission.ships || '[]');
    const outcome = eventDef.resolve(ships, choice);

    // Apply ship losses
    let updatedShips = JSON.parse(JSON.stringify(ships));
    if (outcome.shipLoss && Object.keys(outcome.shipLoss).length > 0) {
      for (const s of updatedShips) {
        const key = s.type || s.id;
        if (outcome.shipLoss[key]) {
          s.count = Math.max(0, s.count - outcome.shipLoss[key]);
        }
      }
      updatedShips = updatedShips.filter(s => s.count > 0);
    }

    // Apply dark matter reward
    if (outcome.darkMatter > 0) {
      await ensureDarkMatterColumn(env);
      await env.DB.prepare(
        "UPDATE game_state SET dark_matter = COALESCE(dark_matter, 0) + ? WHERE user_id = ?"
      ).bind(outcome.darkMatter, userId).run();
    }

    const travelTime = Math.max(60, mission.arrive_at - mission.created_at);
    const now = Math.floor(Date.now() / 1000);
    const returnAt = now + travelTime;

    const fullResult = {
      ...missionResult,
      expeditionOutcome: outcome,
      choiceMade: choice,
      loot: outcome.loot || {},
    };

    await env.DB.prepare(
      "UPDATE fleet_missions SET status = 'returning', result = ?, ships = ?, return_at = ? WHERE id = ?"
    ).bind(JSON.stringify(fullResult), JSON.stringify(updatedShips), returnAt, missionId).run();

    // Log to expedition_log
    try {
      await env.DB.prepare(
        `INSERT INTO expedition_log (id, user_id, mission_id, event_type, choice_made, outcome_json, chain_id, chain_step, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        crypto.randomUUID(), userId, missionId, eventType, choice,
        JSON.stringify(outcome),
        missionResult.expeditionEvent?.chainId || null,
        missionResult.expeditionEvent?.chainStep || 0,
        now
      ).run();
    } catch (e) {
      console.error('Failed to log expedition event:', e);
    }

    return jsonResponse({ ok: true, outcome, ships: updatedShips }, 200, request);
  }

  // ── GET /api/expeditions/history ──
  if (path === '/api/expeditions/history' && method === 'GET') {
    try {
      const { results } = await env.DB.prepare(
        "SELECT * FROM expedition_log WHERE user_id = ? ORDER BY created_at DESC LIMIT 20"
      ).bind(userId).all();
      return jsonResponse({ ok: true, history: results }, 200, request);
    } catch (e) {
      // Table might not exist yet
      return jsonResponse({ ok: true, history: [] }, 200, request);
    }
  }

  return jsonError(404, 'Expedition endpoint not found', request);
}
