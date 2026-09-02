import http from 'node:http';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { URL } from 'node:url';

const root = resolve(import.meta.dirname, '..');
const useDist = process.argv.includes('--dist');
const base = resolve(root, useDist ? 'dist' : 'src');
const varsPath = resolve(root, '.dev.vars');
let vars = {};
try {
  const text = await readFile(varsPath, 'utf8');
  vars = Object.fromEntries(text.split(/\r?\n/).filter(Boolean).map(line => {
    const i = line.indexOf('='); return [line.slice(0,i), line.slice(i+1)];
  }));
} catch {}
const PASSWORD = process.env.SITE_PASSWORD || vars.SITE_PASSWORD || '9THCLASSIC';
const SECRET = process.env.SESSION_SECRET || vars.SESSION_SECRET || 'local-only-secret';
const CARTO_BASEMAP_KEY = process.env.CARTO_BASEMAP_KEY || vars.CARTO_BASEMAP_KEY || '';
const PORT = Number(process.env.PORT || 4173);

const mime = {
  '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8',
  '.json':'application/json; charset=utf-8', '.svg':'image/svg+xml', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.png':'image/png',
  '.webp':'image/webp', '.ttf':'font/ttf', '.woff2':'font/woff2', '.gpx':'application/gpx+xml', '.csv':'text/csv; charset=utf-8'
};
function sign(payload){ return createHmac('sha256', SECRET).update(payload).digest('base64url'); }
function validCookie(req){
  const cookie=(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('emc_session='));
  if(!cookie) return false;
  const value=cookie.slice('emc_session='.length); const [exp,sig]=value.split('.');
  if(!exp||!sig||Number(exp)<Date.now()) return false;
  const expected=Buffer.from(sign(exp)); const actual=Buffer.from(sig);
  return expected.length===actual.length && timingSafeEqual(expected,actual);
}
function gate(error=''){
  return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive"><title>Completing the Circle · Riga</title><style>
  :root{color-scheme:dark;--g:#40B07A;--gold:#caa85c}*{box-sizing:border-box}body{margin:0;background:#050505;color:#f5f1e8;font-family:Arial,Helvetica,sans-serif;min-height:100vh;display:grid;place-items:center;overflow:hidden}.gate{width:min(92vw,560px);padding:48px 28px;text-align:center;position:relative}.rings{width:220px;height:220px;margin:0 auto 32px;animation:float 5s ease-in-out infinite}.rings circle{fill:none;stroke-width:1.4;transform-origin:50% 50%;animation:draw 1.2s cubic-bezier(.2,.8,.2,1) both}.rings circle:nth-child(3n){animation-delay:.12s}.rings circle:nth-child(4n){animation-delay:.24s}.eyebrow{font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:#b7b2a7}.title{font-size:clamp(42px,8vw,72px);line-height:.92;margin:18px 0 14px;letter-spacing:-.055em}.sub{color:#aaa59b;line-height:1.6;margin:0 auto 28px;max-width:390px}form{display:flex;gap:10px;background:#111;padding:8px;border:1px solid #292929;border-radius:999px}input{min-width:0;flex:1;border:0;background:transparent;color:#fff;padding:14px 18px;font-size:15px;outline:none}button{border:0;border-radius:999px;background:var(--g);color:#05120c;font-weight:800;padding:14px 22px;cursor:pointer}button:hover{filter:brightness(1.08)}.error{min-height:20px;color:#ff8b8b;font-size:13px;margin-top:14px}.meta{margin-top:24px;font-size:11px;letter-spacing:.16em;color:#777;text-transform:uppercase}@keyframes draw{from{stroke-dasharray:0 500;opacity:0}to{stroke-dasharray:500 0;opacity:1}}@keyframes float{50%{transform:translateY(-8px) rotate(1.5deg)}}@media(prefers-reduced-motion:reduce){*{animation:none!important}}
  </style><main class="gate"><svg class="rings" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46" stroke="#E2181A"/><circle cx="50" cy="50" r="42" stroke="#3F4997"/><circle cx="50" cy="50" r="38" stroke="#3DADE3"/><circle cx="50" cy="50" r="34" stroke="#C14692"/><circle cx="50" cy="50" r="30" stroke="#40B07A"/><circle cx="50" cy="50" r="26" stroke="#F7B601"/><circle cx="50" cy="50" r="22" stroke="#9F5198"/><circle cx="50" cy="50" r="18" stroke="#ED752D"/><circle cx="50" cy="50" r="14" stroke="#D0CFD0"/><circle cx="50" cy="50" r="10" stroke="#00609C"/></svg><div class="eyebrow">European Marathon Classics × Rimi Riga Marathon</div><h1 class="title">Complete<br>the circle</h1><p class="sub">Enter the access code to continue.</p><form method="post" action="/__unlock"><input name="password" type="password" autocomplete="current-password" placeholder="Access phrase" aria-label="Access phrase" autofocus><button>Enter</button></form><div class="error">${error}</div><div class="meta">Riga · 2027</div></main></html>`;
}
function security(res){
  res.setHeader('X-Robots-Tag','noindex, nofollow, noarchive');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy','camera=(), microphone=(), geolocation=()');
  res.setHeader('Content-Security-Policy',"default-src 'self'; img-src 'self' data: https://*.basemaps.cartocdn.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; script-src 'self' https://cdn.jsdelivr.net; connect-src 'self' https://api.mapbox.com https://events.mapbox.com; font-src 'self' https://fonts.gstatic.com; frame-src https://www.youtube-nocookie.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
}
const server=http.createServer(async(req,res)=>{
  security(res);
  const url=new URL(req.url,`http://${req.headers.host}`);
  if(url.pathname==='/__unlock' && req.method==='POST'){
    let body=''; for await(const chunk of req) body+=chunk; const supplied=new URLSearchParams(body).get('password')||'';
    const a=Buffer.from(supplied); const b=Buffer.from(PASSWORD);
    const ok=a.length===b.length && timingSafeEqual(a,b);
    if(!ok){res.writeHead(401,{'content-type':'text/html; charset=utf-8'}); return res.end(gate('That phrase did not open the proposal.'))}
    const exp=String(Date.now()+12*60*60*1000); const token=`${exp}.${sign(exp)}`;
    res.writeHead(303,{'set-cookie':`emc_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=43200`,'location':'/'}); return res.end();
  }
  if(url.pathname==='/__lock'){res.writeHead(303,{'set-cookie':'emc_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0','location':'/'});return res.end()}
  if(!validCookie(req)){res.writeHead(401,{'content-type':'text/html; charset=utf-8'});return res.end(gate())}
  const tile=url.pathname.match(/^\/__carto\/dark_nolabels\/(\d+)\/(\d+)\/(\d+)\.png$/);
  if(tile){
    if(!CARTO_BASEMAP_KEY){res.writeHead(503,{'content-type':'text/plain; charset=utf-8'});return res.end('Basemap is not configured.')}
    const [,zoom,x,y]=tile;
    const tileUrl=new URL(`https://basemaps.cartocdn.com/rastertiles/dark_nolabels/${zoom}/${x}/${y}.png`);
    tileUrl.searchParams.set('key',CARTO_BASEMAP_KEY);
    try{
      const upstream=await fetch(tileUrl);
      res.writeHead(upstream.status,{'content-type':upstream.headers.get('content-type')||'image/png','cache-control':'public, max-age=86400'});
      return res.end(Buffer.from(await upstream.arrayBuffer()));
    }catch{res.writeHead(502,{'content-type':'text/plain; charset=utf-8'});return res.end('Basemap is unavailable.')}
  }
  let pathname=decodeURIComponent(url.pathname); if(pathname==='/') pathname='/index.html';
  if(pathname==='/full' || pathname==='/full/') pathname='/full/index.html';
  const safe=normalize(pathname).replace(/^([.][.][/\\])+/, '');
  const file=join(base,safe);
  if(!file.startsWith(base)){res.writeHead(403);return res.end('Forbidden')}
  try{const st=await stat(file); if(!st.isFile()) throw new Error(); const data=await readFile(file); res.writeHead(200,{'content-type':mime[extname(file)]||'application/octet-stream','cache-control':extname(file)==='.html'?'no-store':'public, max-age=3600'});res.end(data)}catch{res.writeHead(404,{'content-type':'text/plain; charset=utf-8'});res.end('Not found')}
});
server.listen(PORT,()=>console.log(`Local preview: http://localhost:${PORT}  password: ${PASSWORD}`));
