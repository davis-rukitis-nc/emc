const COOKIE = 'emc_session';
const SESSION_MS = 12 * 60 * 60 * 1000;

function bytes(text) { return new TextEncoder().encode(text); }
function toBase64Url(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}
async function sign(payload, secret) {
  const key = await crypto.subtle.importKey('raw', bytes(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return toBase64Url(await crypto.subtle.sign('HMAC', key, bytes(payload)));
}
function constantTimeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
function parseCookie(request) {
  const found = (request.headers.get('Cookie') || '').split(';').map(v => v.trim()).find(v => v.startsWith(`${COOKIE}=`));
  return found ? found.slice(COOKIE.length + 1) : null;
}
async function isAuthorised(request, env) {
  const token = parseCookie(request);
  if (!token) return false;
  const [expires, signature] = token.split('.');
  if (!expires || !signature || Number(expires) < Date.now()) return false;
  return constantTimeEqual(signature, await sign(expires, env.SESSION_SECRET));
}
function headers(extra = {}) {
  return {
    'X-Robots-Tag': 'noindex, nofollow, noarchive',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Content-Security-Policy': "default-src 'self'; img-src 'self' data: https://*.basemaps.cartocdn.com https://rimirigamarathon.com; manifest-src 'self' https://rimirigamarathon.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; script-src 'self' https://cdn.jsdelivr.net; connect-src 'self' https://api.mapbox.com https://events.mapbox.com; font-src 'self' https://fonts.gstatic.com; frame-src https://www.youtube-nocookie.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
    ...extra
  };
}
function gate(message = '') {
  return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive"><title>Completing the Circle · Riga</title><style>
  :root{color-scheme:dark;--g:#40B07A}*{box-sizing:border-box}body{margin:0;background:#050505;color:#f5f1e8;font-family:Arial,Helvetica,sans-serif;min-height:100vh;display:grid;place-items:center;overflow:hidden}.gate{width:min(92vw,560px);padding:48px 28px;text-align:center}.rings{width:220px;height:220px;margin:0 auto 32px;animation:float 5s ease-in-out infinite}.rings circle{fill:none;stroke-width:1.4;transform-origin:50% 50%;animation:draw 1.2s cubic-bezier(.2,.8,.2,1) both}.rings circle:nth-child(3n){animation-delay:.12s}.rings circle:nth-child(4n){animation-delay:.24s}.eyebrow{font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:#b7b2a7}.title{font-size:clamp(42px,8vw,72px);line-height:.92;margin:18px 0 14px;letter-spacing:-.055em}.sub{color:#aaa59b;line-height:1.6;margin:0 auto 28px;max-width:390px}form{display:flex;gap:10px;background:#111;padding:8px;border:1px solid #292929;border-radius:999px}input{min-width:0;flex:1;border:0;background:transparent;color:#fff;padding:14px 18px;font-size:15px;outline:none}button{border:0;border-radius:999px;background:var(--g);color:#05120c;font-weight:800;padding:14px 22px;cursor:pointer}.error{min-height:20px;color:#ff8b8b;font-size:13px;margin-top:14px}.meta{margin-top:24px;font-size:11px;letter-spacing:.16em;color:#777;text-transform:uppercase}@keyframes draw{from{stroke-dasharray:0 500;opacity:0}to{stroke-dasharray:500 0;opacity:1}}@keyframes float{50%{transform:translateY(-8px) rotate(1.5deg)}}@media(prefers-reduced-motion:reduce){*{animation:none!important}}
  </style><main class="gate"><svg class="rings" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46" stroke="#E2181A"/><circle cx="50" cy="50" r="42" stroke="#3F4997"/><circle cx="50" cy="50" r="38" stroke="#3DADE3"/><circle cx="50" cy="50" r="34" stroke="#C14692"/><circle cx="50" cy="50" r="30" stroke="#40B07A"/><circle cx="50" cy="50" r="26" stroke="#F7B601"/><circle cx="50" cy="50" r="22" stroke="#9F5198"/><circle cx="50" cy="50" r="18" stroke="#ED752D"/><circle cx="50" cy="50" r="14" stroke="#D0CFD0"/><circle cx="50" cy="50" r="10" stroke="#00609C"/></svg><div class="eyebrow">European Marathon Classics × Rimi Riga Marathon</div><h1 class="title">Complete<br>the circle</h1><p class="sub">Enter the access code to continue.</p><form method="post" action="/__unlock"><input name="password" type="password" autocomplete="current-password" placeholder="Access phrase" aria-label="Access phrase" autofocus><button>Enter</button></form><div class="error">${message}</div><div class="meta">Riga · 2027</div></main></html>`;
}

async function cartoTile(url, env) {
  if (!env.CARTO_BASEMAP_KEY) return new Response('Basemap is not configured.', { status: 503 });
  const match = url.pathname.match(/^\/__carto\/dark_nolabels\/(\d+)\/(\d+)\/(\d+)\.png$/);
  if (!match) return new Response('Not found.', { status: 404 });
  const [, zoom, x, y] = match;
  const tileUrl = new URL(`https://basemaps.cartocdn.com/rastertiles/dark_nolabels/${zoom}/${x}/${y}.png`);
  tileUrl.searchParams.set('key', env.CARTO_BASEMAP_KEY);
  const response = await fetch(tileUrl, { cf: { cacheEverything: true, cacheTtl: 86400 } });
  const out = new Response(response.body, response);
  out.headers.set('Cache-Control', 'public, max-age=86400');
  return out;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/__unlock' && request.method === 'POST') {
      if (!env.SITE_PASSWORD || !env.SESSION_SECRET) {
        return new Response(gate('Proposal access is temporarily unavailable.'), { status: 503, headers: headers({ 'Content-Type': 'text/html; charset=utf-8' }) });
      }
      const form = await request.formData();
      const supplied = String(form.get('password') || '');
      if (!constantTimeEqual(supplied, env.SITE_PASSWORD)) {
        return new Response(gate('That phrase did not open the proposal.'), { status: 401, headers: headers({ 'Content-Type': 'text/html; charset=utf-8' }) });
      }
      const expires = String(Date.now() + SESSION_MS);
      const token = `${expires}.${await sign(expires, env.SESSION_SECRET)}`;
      return new Response(null, { status: 303, headers: headers({
        'Location': '/',
        'Set-Cookie': `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=43200`
      }) });
    }
    if (url.pathname === '/__lock') {
      return new Response(null, { status: 303, headers: headers({
        'Location': '/',
        'Set-Cookie': `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`
      }) });
    }
    if (!(await isAuthorised(request, env))) {
      return new Response(gate(), { status: 401, headers: headers({ 'Content-Type': 'text/html; charset=utf-8' }) });
    }
    if (url.pathname.startsWith('/__carto/')) return cartoTile(url, env);
    if (url.pathname === '/full') {
      return new Response(null, { status: 308, headers: headers({ 'Location': '/full/' }) });
    }
    const response = await env.ASSETS.fetch(request);
    const out = new Response(response.body, response);
    for (const [key, value] of Object.entries(headers())) out.headers.set(key, value);
    if ((out.headers.get('Content-Type') || '').includes('text/html')) out.headers.set('Cache-Control', 'no-store');
    return out;
  }
};
