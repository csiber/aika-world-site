/**
 * AIKA AI Chat route — OpenRouter (ingyenes tier)
 * POST /api/aika-chat
 */

import { jsonResponse, jsonError } from '../utils/response.js';

const SYSTEM_PROMPT = `Te vagy AIKA, az AIKA World galaktikus stratégiai játék intelligens asszisztense.
A játékos galaktikus birodalmat épít: termel nyersanyagokat (fém, kristály, energia, déusium), fejleszt épületeket, kutat technológiákat, és flottát épít.
Segíts rövid, tömör, magyarul megfogalmazott stratégiai tanácsokkal. Max 2-3 mondat.`;

export async function handleAikaChat(request, env, url, user) {
  if (request.method !== 'POST') return jsonError(405, 'Method not allowed', request);

  let body;
  try { body = await request.json(); } catch { return jsonError(400, 'Invalid JSON', request); }

  const { message, context } = body;
  if (!message || typeof message !== 'string' || message.length > 500)
    return jsonError(400, 'Invalid message', request);

  const apiKey = env.OPENROUTER_API_KEY;
  if (!apiKey) return jsonError(503, 'AI nincs konfigurálva (hiányzó OPENROUTER_API_KEY)', request);

  let userMsg = message;
  if (context) {
    userMsg = `[Állapot: fém=${Math.floor(context.resources?.metal||0)}, kristály=${Math.floor(context.resources?.crystal||0)}, pont=${context.score||0}, flotta=${context.fleetTotal||0}]\n\n${message}`;
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://aika-world.promnet.workers.dev',
        'X-Title': 'AIKA World',
      },
      body: JSON.stringify({
        model: 'google/gemma-3-4b-it:free',
        max_tokens: 256,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMsg },
        ],
      }),
    });

    const text = await response.text();
    if (!response.ok) {
      console.error('OpenRouter error', response.status, text);
      return jsonError(502, `AI hiba (${response.status}): ${text.slice(0, 200)}`, request);
    }

    const data = JSON.parse(text);
    const reply = data.choices?.[0]?.message?.content || 'Nem tudok válaszolni most.';
    return jsonResponse({ ok: true, reply }, 200, request);
  } catch (e) {
    console.error('Aika fetch error:', e.message);
    return jsonError(502, `Hálózati hiba: ${e.message}`, request);
  }
}
