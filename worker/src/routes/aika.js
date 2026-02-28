/**
 * AIKA AI Chat route
 * POST /api/aika-chat
 * Calls OpenRouter API with game context
 */

import { jsonResponse, jsonError } from '../utils/response.js';

const SYSTEM_PROMPT = `Te vagy AIKA, az AIKA World galaktikus stratégiai játék intelligens asszisztense.
A játékos galaktikus birodalmat épít: termel nyersanyagokat (fém, kristály, energia, déusium), fejleszt épületeket, kutat technológiákat, és flottát épít.

Segíts a játékosnak rövid, tömör, magyarul megfogalmazott stratégiai tanácsokkal.
Csak játékhoz kapcsolódó kérdésekre válaszolj. Max 2-3 mondat válaszonként.
Ha a játékos kontextust adsz meg, arra támaszkodj.`;

export async function handleAikaChat(request, env, url, user) {
  if (request.method !== 'POST') return jsonError(405, 'Method not allowed', request);

  let body;
  try { body = await request.json(); } catch { return jsonError(400, 'Invalid JSON', request); }

  const { message, context } = body;
  if (!message || typeof message !== 'string' || message.length > 500) {
    return jsonError(400, 'Invalid message', request);
  }

  // Check API key exists
  const apiKey = env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error('OPENROUTER_API_KEY is not set!');
    return jsonError(503, 'AI nincs konfigurálva (hiányzó API kulcs)', request);
  }

  // Build user message with context
  let userMsg = message;
  if (context) {
    userMsg = `[Játékos állapot: fém=${Math.floor(context.resources?.metal||0)}, kristály=${Math.floor(context.resources?.crystal||0)}, pontszám=${context.score||0}, flotta=${context.fleetTotal||0} hajó]\n\n${message}`;
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://aikaworld.com',
        'X-Title': 'AIKA World',
      },
      body: JSON.stringify({
        model: 'arcee-ai/trinity-large-preview:free',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMsg },
        ],
        max_tokens: 256,
        temperature: 0.7,
      }),
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error('OpenRouter API error', response.status, responseText);
      return jsonError(502, `OpenRouter hiba (${response.status}): ${responseText.slice(0, 200)}`, request);
    }

    let data;
    try { data = JSON.parse(responseText); } catch {
      console.error('OpenRouter invalid JSON:', responseText);
      return jsonError(502, 'OpenRouter invalid response', request);
    }

    const reply = data.choices?.[0]?.message?.content || 'Nem tudok válaszolni most.';
    return jsonResponse({ ok: true, reply }, 200, request);
  } catch (e) {
    console.error('Aika fetch error:', e.message);
    return jsonError(502, `Hálózati hiba: ${e.message}`, request);
  }
}
