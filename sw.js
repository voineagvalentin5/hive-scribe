// Hive Scribe service worker.
// App shell (HTML, fonts, icons) is precached. Bible data (data/...) goes to a separate cache ("hsdata")
// as chapters are visited, or all at once via "Download whole Bible for offline".
const CACHE = 'hive-scribe-084e0b9497';
const DATA = 'hsdata';
const PRECACHE = ["./", "index.html", "manifest.webmanifest", "fonts/fonts.css", "fonts/NotoSerif-italic-latin.woff2", "fonts/NotoSerif-normal-greek-ext.woff2", "fonts/NotoSerif-normal-greek.woff2", "fonts/NotoSerif-normal-latin.woff2", "fonts/NotoSerifHebrew-normal-hebrew.woff2", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-192.png", "icons/icon-maskable-512.png", "icons/apple-touch-icon.png", "icons/favicon-32.png", "icons/favicon-16.png", "brand/logo-dark-64.png", "brand/logo-light-64.png", "brand/brand-full-640.webp", "vendor/three.module.min.js", "studies/index.json", "studies/oneness-of-god.json"];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('hive-scribe-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put('index.html', copy)); return r; })
      .catch(() => caches.match('index.html', {ignoreSearch: true})));
    return;
  }
  if (url.pathname.includes('/data/')) {
    if (url.pathname.endsWith('/data/index.json')) {   // network first: picks up data updates
      e.respondWith(fetch(req).then(r => { if (r.ok) { const copy = r.clone(); caches.open(DATA).then(c => c.put(url.href, copy)); } return r; })
        .catch(() => caches.open(DATA).then(c => c.match(url.href))));
      return;
    }
    e.respondWith(caches.open(DATA).then(c => c.match(url.href).then(hit => hit || fetch(req).then(r => {
      if (r.ok) c.put(url.href, r.clone());
      return r;
    }))));
    return;
  }
  e.respondWith(caches.match(req, {ignoreSearch: true}).then(hit => hit || fetch(req).then(r => {
    if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return r;
  })));
});
