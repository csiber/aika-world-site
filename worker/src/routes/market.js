/**
 * AIKA WORLD — Marketplace & Trade routes
 */

import { jsonResponse, jsonError } from '../utils/response.js';
import { trackQuestProgress } from '../utils/quest_tracker.js';

export async function handleMarket(request, env, url, user) {
  const userId = user.sub;
  const path = url.pathname;
  const method = request.method;

  // ── GET /api/market/list ────────────────────────────────
  if (path === '/api/market/list' && method === 'GET') {
    const rows = await env.DB.prepare(`
      SELECT m.*, u.username 
      FROM market_offers m 
      JOIN users u ON m.user_id = u.id 
      WHERE m.status = 'open' 
      ORDER BY m.created_at DESC 
      LIMIT 100
    `).all();
    return jsonResponse({ ok: true, offers: rows.results }, 200, request);
  }

  // ── POST /api/market/create ─────────────────────────────
  if (path === '/api/market/create' && method === 'POST') {
    let body; try { body = await request.json(); } catch { return jsonError(400, 'Invalid JSON', request); }
    const { offerRes, offerAmt, seekRes, seekAmt, planetId } = body;

    if (offerAmt <= 0 || seekAmt <= 0) return jsonError(400, 'Érvénytelen mennyiség', request);
    if (offerRes === seekRes) return jsonError(400, 'Azonos nyersanyagok', request);

    const planet = await env.DB.prepare('SELECT * FROM planets WHERE id = ? AND user_id = ?').bind(planetId, userId).first();
    if (!planet) return jsonError(404, 'Planet not found', request);

    const resources = JSON.parse(planet.resources);
    if ((resources[offerRes] || 0) < offerAmt) return jsonError(400, 'Nincs elég nyersanyag a kínálathoz', request);

    // Deduct resources immediately
    resources[offerRes] -= offerAmt;
    await env.DB.prepare('UPDATE planets SET resources = ? WHERE id = ?').bind(JSON.stringify(resources), planetId).run();

    await env.DB.prepare(`
      INSERT INTO market_offers (user_id, planet_id, offer_res, offer_amt, seek_res, seek_amt)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(userId, planetId, offerRes, offerAmt, seekRes, seekAmt).run();

    await trackQuestProgress(env, userId, 'trade', 1);
    return jsonResponse({ ok: true, message: 'Ajánlat közzétéve' }, 200, request);
  }

  // ── POST /api/market/accept ─────────────────────────────
  if (path.startsWith('/api/market/accept/') && method === 'POST') {
    const offerId = path.split('/').pop();
    const body = await request.json();
    const { planetId } = body;

    const offer = await env.DB.prepare('SELECT * FROM market_offers WHERE id = ? AND status = "open"').bind(offerId).first();
    if (!offer) return jsonError(404, 'Offer not found or already closed', request);
    if (offer.user_id === userId) return jsonError(400, 'Saját ajánlatodat nem fogadhatod el', request);

    const planet = await env.DB.prepare('SELECT * FROM planets WHERE id = ? AND user_id = ?').bind(planetId, userId).first();
    if (!planet) return jsonError(404, 'Planet not found', request);

    const resources = JSON.parse(planet.resources);
    if ((resources[offer.seek_res] || 0) < offer.seek_amt) return jsonError(400, 'Nincs elég nyersanyagod a cseréhez', request);

    // 1. Deduct seeker's payment
    resources[offer.seek_res] -= offer.seek_amt;
    // 2. Add seeker's gain
    resources[offer.offer_res] += offer.offer_amt;
    
    await env.DB.prepare('UPDATE planets SET resources = ? WHERE id = ?').bind(JSON.stringify(resources), planetId).run();

    // 3. Mark offer as done
    await env.DB.prepare('UPDATE market_offers SET status = "done" WHERE id = ?').bind(offerId).run();

    // 4. Send resources to the original offer creator's planet
    const creatorPlanet = await env.DB.prepare('SELECT * FROM planets WHERE id = ?').bind(offer.planet_id).first();
    if (creatorPlanet) {
        const creatorRes = JSON.parse(creatorPlanet.resources);
        creatorRes[offer.seek_res] += offer.seek_amt;
        await env.DB.prepare('UPDATE planets SET resources = ? WHERE id = ?').bind(JSON.stringify(creatorRes), offer.planet_id).run();
    }

    // Notify creator
    await env.DB.prepare('INSERT INTO messages (user_id, from_name, subject, body, msg_type) VALUES (?, ?, ?, ?, ?)')
      .bind(offer.user_id, 'Kereskedő', 'Sikeres üzlet!', `Valaki elfogadta az ajánlatodat! Kaptál ${Math.floor(offer.seek_amt)} ${offer.seek_res} egységet.`, 'system').run();

    await trackQuestProgress(env, userId, 'trade', 1);
    return jsonResponse({ ok: true, message: 'Üzlet megkötve!' }, 200, request);
  }

  // ── POST /api/market/cancel ─────────────────────────────
  if (path.startsWith('/api/market/cancel/') && method === 'POST') {
    const offerId = path.split('/').pop();
    const offer = await env.DB.prepare('SELECT * FROM market_offers WHERE id = ? AND user_id = ? AND status = "open"').bind(offerId, userId).first();
    if (!offer) return jsonError(404, 'Offer not found', request);

    // Refund resources
    const planet = await env.DB.prepare('SELECT * FROM planets WHERE id = ?').bind(offer.planet_id).first();
    if (planet) {
        const res = JSON.parse(planet.resources);
        res[offer.offer_res] += offer.offer_amt;
        await env.DB.prepare('UPDATE planets SET resources = ? WHERE id = ?').bind(JSON.stringify(res), planet.id).run();
    }

    await env.DB.prepare('UPDATE market_offers SET status = "cancelled" WHERE id = ?').bind(offerId).run();
    return jsonResponse({ ok: true, message: 'Ajánlat visszavonva' }, 200, request);
  }

  // ── NPC Trader ──────────────────────────────────────────
  if (path === '/api/market/npc-trade' && method === 'POST') {
      let body; try { body = await request.json(); } catch { return jsonError(400, 'Invalid JSON', request); }
      const { giveRes, giveAmt, getRes, planetId } = body;
      
      const ratios = {
          metal:   { crystal: 0.5,  deus: 0.25 },
          crystal: { metal: 2.0,    deus: 0.5 },
          deus:    { metal: 4.0,    crystal: 2.0 }
      };

      const ratio = ratios[giveRes]?.[getRes];
      if (!ratio) return jsonError(400, 'Érvénytelen váltás', request);
      
      const getAmt = giveAmt * ratio;
      const planet = await env.DB.prepare('SELECT * FROM planets WHERE id = ? AND user_id = ?').bind(planetId, userId).first();
      if (!planet) return jsonError(404, 'Planet not found', request);

      const resources = JSON.parse(planet.resources);
      if (resources[giveRes] < giveAmt) return jsonError(400, 'Nincs elég nyersanyagod', request);

      resources[giveRes] -= giveAmt;
      resources[getRes] += getAmt;

      await env.DB.prepare('UPDATE planets SET resources = ? WHERE id = ?').bind(JSON.stringify(resources), planetId).run();
      return jsonResponse({ ok: true, getAmt, state: { activePlanet: { ...planet, resources } } }, 200, request);
  }

  return jsonError(404, 'Market endpoint not found', request);
}
