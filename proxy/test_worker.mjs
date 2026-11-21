// node proxy/test_worker.mjs  -> checks the Worker's filtering with a fake upstream (no network, no key)
import worker from './apibible-worker.js';
const ORIGIN = 'https://scribe.codex-hive.com', KEY = 'test-key-not-real';
let seen = [];
globalThis.fetch = async (url, init) => { seen.push({ url, key: init && init.headers && init.headers['api-key'] });
  return new Response(JSON.stringify({ data: { content: [], copyright: 'c' }, meta: { fumsToken: 'tok' } }), { status: 200, headers: { 'Content-Type': 'application/json' } }); };
const env = { API_BIBLE_KEY: KEY };
const req = (path, o = {}) => new Request('https://proxy.example' + path, { method: o.method || 'GET', headers: Object.assign(o.origin === null ? {} : { Origin: o.origin || ORIGIN }, o.headers || {}) });
const res = []; const ok = (n, c) => { res.push([n, !!c]); console.log((c ? 'PASS ' : 'FAIL ') + n); };
let r = await worker.fetch(req('/v1/bibles/d6e14a625393b4da-01/chapters/JHN.3?api-key=x&content-type=html'), env);
const body = await r.text();
ok('allowed origin + NLT chapter -> 200, body passed through', r.status === 200 && body.includes('fumsToken'));
ok('upstream gets the key in the header and a fixed query (client query ignored)', seen.length === 1 && seen[0].key === KEY && seen[0].url === 'https://rest.api.bible/v1/bibles/d6e14a625393b4da-01/chapters/JHN.3?content-type=json&include-notes=false&include-titles=false&include-chapter-numbers=false&include-verse-numbers=false&include-verse-spans=false');
ok('response: CORS for the site only, no-store, key never echoed', r.headers.get('Access-Control-Allow-Origin') === ORIGIN && r.headers.get('Cache-Control') === 'no-store' && !body.includes(KEY) && ![...r.headers.values()].some(v => v.includes(KEY)));
seen = [];
r = await worker.fetch(req('/v1/bibles/d6e14a625393b4da-01/chapters/JHN.3', { origin: 'https://evil.example' }), env);
ok('other origin -> 403, upstream not called', r.status === 403 && !seen.length && !r.headers.get('Access-Control-Allow-Origin'));
r = await worker.fetch(req('/v1/bibles/d6e14a625393b4da-01/chapters/JHN.3', { origin: null }), env);
ok('no Origin header (scripts, curl) -> 403', r.status === 403 && !seen.length);
r = await worker.fetch(req('/v1/bibles/de4e12af7f28f599-01/chapters/JHN.3'), env);
ok('Bible not on the allow list -> 404', r.status === 404 && !seen.length);
for (const p of ['/v1/bibles', '/v1/bibles/d6e14a625393b4da-01/books', '/v1/bibles/d6e14a625393b4da-01/search?query=love', '/v1/bibles/d6e14a625393b4da-01/passages/GEN.1.1-EXO.40.38', '/v1/bibles/d6e14a625393b4da-01/chapters/JHN.3/../../books']) {
  r = await worker.fetch(req(p), env); if (r.status !== 404) { ok('only /chapters/<id> is proxied: ' + p, false); }
}
ok('only /chapters/<id> is proxied (books, search, passages, lists refused)', !seen.length);
r = await worker.fetch(req('/v1/bibles/d6e14a625393b4da-01/chapters/JHN.3', { method: 'POST' }), env);
ok('POST -> 405', r.status === 405 && !seen.length);
r = await worker.fetch(req('/v1/bibles/d6e14a625393b4da-01/chapters/JHN.3', { method: 'OPTIONS' }), env);
ok('preflight -> 204 with CORS', r.status === 204 && r.headers.get('Access-Control-Allow-Origin') === ORIGIN);
r = await worker.fetch(req('/v1/bibles/d6e14a625393b4da-01/chapters/JHN.3'), {});
ok('no key configured -> 503, upstream not called', r.status === 503 && !seen.length);
let last; for (let i = 0; i < 61; i++) last = await worker.fetch(req('/v1/bibles/63097d2a0a2f7db3-01/chapters/GEN.1', { headers: { 'CF-Connecting-IP': '203.0.113.9' } }), env);
ok('burst limit: 61st request in 10 min from one IP -> 429', last.status === 429 && seen.length === 60);
const f = res.filter(x => !x[1]); console.log(`\n${res.length - f.length}/${res.length} worker checks passed`); process.exit(f.length ? 1 : 0);
