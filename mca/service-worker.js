// MCA PWA Service Worker
// Version format: vYYYYMMDD.n (increment n for same-day releases)
const CACHE_VERSION = 'v20251224.1';
const CACHE_NAME = `mca-cache-${CACHE_VERSION}`;

const ASSETS_TO_CACHE = [
  './mca.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// Install: pre-cache all assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting()) // Activate immediately
  );
});

// Activate: delete old caches and take control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith('mca-cache-') && name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim()) // Take control of all clients
  );
});

// Fetch: cache-first strategy with version injection for HTML
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const isHtmlRequest = url.pathname.endsWith('.html') || url.pathname.endsWith('/');

  if (isHtmlRequest) {
    // For HTML files, inject the cache version
    event.respondWith(
      caches.match(event.request)
        .then((cachedResponse) => cachedResponse || fetch(event.request))
        .then((response) => {
          return response.text().then((html) => {
            const modifiedHtml = html.replace(/\{\{CACHE_VERSION_PLACEHOLDER\}\}/g, CACHE_VERSION);
            return new Response(modifiedHtml, {
              status: response.status,
              statusText: response.statusText,
              headers: response.headers
            });
          });
        })
    );
  } else {
    // For non-HTML files, use standard cache-first strategy
    event.respondWith(
      caches.match(event.request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(event.request);
        })
    );
  }
});
