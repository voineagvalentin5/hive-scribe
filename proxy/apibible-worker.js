// Hive Scribe -> API.Bible proxy (Cloudflare Worker, free plan).
// Why: API.Bible's terms (section 12, Security) forbid making the API key available to anyone, and Hive Scribe is a
// public static site, so the browser cannot hold the key. This Worker holds it as the secret API_BIBLE_KEY and
// forwards ONLY chapter requests for the allowed Bibles, ONLY for the allowed site origins. It stores nothing.
//
// Settings (wrangler.toml [vars] / dashboard):
//   API_BIBLE_KEY    secret, set with:  npx wrangler secret put API_BIBLE_KEY
//   ALLOWED_ORIGINS  comma list, default https://scribe.codex-hive.com
//   ALLOWED_BIBLES   comma list of Bible IDs, default NLT + NKJV
const UPSTREAM = 'https://rest.api.bible';
const DEFAULT_ORIGINS = 'https://scribe.codex-hive.com';
const DEFAULT_BIBLES = 'd6e14a625393b4da-01,63097d2a0a2f7db3-01';   // NLT, NKJV (api.bible/bibles)
const PATH = /^\/v1\/bibles\/([0-9a-f]{16}-\d{2})\/chapters\/([1-4A-Z]{3}\.\d{1,3})$/;
// fixed query: what the app needs, nothing else is passed through
const QUERY = 'content-type=json&include-notes=false&include-titles=false&include-chapter-numbers=false&include-verse-numbers=false&include-verse-spans=false';
// best-effort burst limit per visitor IP, per Worker instance (protects the 5,000 calls/month Starter allowance)
const WINDOW_MS = 10 * 60 * 1000, MAX_PER_WINDOW = 60;
const hits = new Map();

const list = (s, d) => String(s || d).split(',').map(x => x.trim()).filter(Boolean);
function cors(origin) {
  return { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Max-Age': '86400', 'Vary': 'Origin' };
}
function reply(status, body, origin, extra) {
  return new Response(typeof body === 'string' ? body : JSON.stringify(body), {
    status, headers: Object.assign({ 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }, origin ? cors(origin) : {}, extra || {})
  });
}
function limited(ip, now) {
  const h = hits.get(ip);
  if (!h || now - h.t > WINDOW_MS) { hits.set(ip, { t: now, n: 1 }); if (hits.size > 5000) hits.clear(); return false; }
  h.n++; return h.n > MAX_PER_WINDOW;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const okOrigin = list(env.ALLOWED_ORIGINS, DEFAULT_ORIGINS).includes(origin) ? origin : '';
    if (!okOrigin) return reply(403, { error: 'origin not allowed' });
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(okOrigin) });
    if (request.method !== 'GET') return reply(405, { error: 'GET only' }, okOrigin);
    const url = new URL(request.url);
    const m = PATH.exec(url.pathname);
    if (!m || !list(env.ALLOWED_BIBLES, DEFAULT_BIBLES).includes(m[1])) return reply(404, { error: 'not found' }, okOrigin);
    if (!env.API_BIBLE_KEY) return reply(503, { error: 'proxy not configured' }, okOrigin);
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (limited(ip, Date.now())) return reply(429, { error: 'too many requests' }, okOrigin, { 'Retry-After': '600' });
    let up;
    try {
      up = await fetch(`${UPSTREAM}/v1/bibles/${m[1]}/chapters/${m[2]}?${QUERY}`, { headers: { 'api-key': env.API_BIBLE_KEY, 'Accept': 'application/json' } });
    } catch (e) { return reply(502, { error: 'upstream unreachable' }, okOrigin); }
    // pass API.Bible's answer through unchanged (text, copyright and meta.fumsToken), never cached
    return reply(up.status, await up.text(), okOrigin);
  }
};
