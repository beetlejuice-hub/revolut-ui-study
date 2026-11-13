/* Offline cache for the Revolut UI study. Bump CACHE when assets change. */
const CACHE = 'revolut-study-v9';

const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/fonts.css',
  './css/base.css',
  './css/home.css',
  './css/detail.css',
  './css/sheets.css',
  './js/data.js',
  './js/icons.js',
  './js/render.js',
  './js/app.js',
  './img/loans.jpg',
  './img/logos/lidl-google.png',
  './img/logos/kaufland-google.png',
  './img/logos/claude-symbol.svg',
  './img/logos/anthropic-google.png',
  './img/logos/netflix-google.png',
  './img/logos/bolt-google.png',
  './img/logos/petrom-google.png',
  './img/logos/profi-512.png',
  './img/logos/eventum.webp',
  './img/logos/hamm-512.png',
  './img/logos/aircash-google.png',
  './fonts/inter-latin.woff2',
  './fonts/inter-latin-ext.woff2',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      /* cache:"reload" bypasses the HTTP cache so a new SW version never
         re-caches stale files after an update. */
      .then((cache) => cache.addAll(ASSETS.map((url) => new Request(url, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  /* Pages: network first so updates land, cached shell when offline. */
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put('./index.html', copy));
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  /* Assets: cache first, then network and cache the result. */
  event.respondWith(
    caches.match(request).then((hit) => {
      if (hit) return hit;
      return fetch(request).then((response) => {
        if (response.ok && response.type === 'basic') {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
