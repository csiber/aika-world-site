/**
 * JWT utilities using the Web Crypto API (Workers native, no external deps)
 * HS256 — HMAC-SHA256
 */

function base64url(data) {
  return btoa(String.fromCharCode(...new Uint8Array(data)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64urlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  const bin = atob(str);
  return new Uint8Array([...bin].map(c => c.charCodeAt(0)));
}

async function getKey(secret) {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function signJWT(payload, secret, expiresInSeconds = 86400 * 7) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const claims = { ...payload, iat: now, exp: now + expiresInSeconds };

  const enc = new TextEncoder();
  const headerB64 = btoa(JSON.stringify(header)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  const payloadB64 = btoa(unescape(encodeURIComponent(JSON.stringify(claims)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  const signingInput = `${headerB64}.${payloadB64}`;

  const key = await getKey(secret);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(signingInput));
  return `${signingInput}.${base64url(sig)}`;
}

export async function verifyJWT(request, env) {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) return { ok: false, error: 'Missing token' };

  try {
    const parts = token.split('.');
    if (parts.length !== 3) return { ok: false, error: 'Invalid token format' };

    const [headerB64, payloadB64, sigB64] = parts;
    const enc = new TextEncoder();
    const key = await getKey(env.JWT_SECRET);
    const valid = await crypto.subtle.verify(
      'HMAC', key,
      base64urlDecode(sigB64),
      enc.encode(`${headerB64}.${payloadB64}`)
    );

    if (!valid) return { ok: false, error: 'Invalid signature' };

    const payload = JSON.parse(decodeURIComponent(escape(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')))));
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return { ok: false, error: 'Token expired' };
    }

    return { ok: true, user: payload };
  } catch (e) {
    return { ok: false, error: 'Token parse error' };
  }
}

/**
 * Password hashing using PBKDF2 (Web Crypto, no bcrypt needed)
 */
export async function hashPassword(password) {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const derived = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial, 256
  );
  const saltHex = [...salt].map(b => b.toString(16).padStart(2, '0')).join('');
  const hashHex = [...new Uint8Array(derived)].map(b => b.toString(16).padStart(2, '0')).join('');
  return `pbkdf2:${saltHex}:${hashHex}`;
}

export async function verifyPassword(password, stored) {
  if (!stored.startsWith('pbkdf2:')) return false;
  const [, saltHex, hashHex] = stored.split(':');
  const salt = new Uint8Array(saltHex.match(/.{2}/g).map(h => parseInt(h, 16)));
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const derived = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial, 256
  );
  const computedHex = [...new Uint8Array(derived)].map(b => b.toString(16).padStart(2, '0')).join('');
  return computedHex === hashHex;
}
