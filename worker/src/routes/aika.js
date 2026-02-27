/**
 * AIKA AI Chat route
 * POST /api/aika-chat
 * Calls Google Gemini API (free tier) with game context
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

  // Build user message with context
  let userMsg = message;
  if (context) {
    userMsg = `[Játékos állapot: fém=${Math.floor(context.resources?.metal||0)}, kristály=${Math.floor(context.resources?.crystal||0)}, pontszám=${context.score||0}, flotta=${context.fleetTotal||0} hajó]\n\n${message}`;
  }

  try {
    const apiKey = env.GEMINI_API_KEY;
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: 'user', parts: [{ text: userMsg }] }],
          generationConfig: { maxOutputTokens: 256, temperature: 0.7 },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('Gemini API error:', err);
      return jsonError(502, 'AI service unavailable', request);
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Nem tudok válaszolni most.';
    return jsonResponse({ ok: true, reply }, 200, request);
  } catch (e) {
    console.error('Aika chat error:', e);
    return jsonError(502, 'AI service error', request);
  }
}
