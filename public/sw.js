/* Simple service worker: cache shell + network-first for API, stale-while-revalidate for static */
const CACHE_STATIC = 'bg-static-v1';
const CACHE_RUNTIME = 'bg-runtime-v1';

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter(k => ![CACHE_STATIC, CACHE_RUNTIME].includes(k)).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

function isApiRequest(request) {
  try {
    const url = new URL(request.url);
    return url.pathname.startsWith('/api/');
  } catch (_) { return false; }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  if (isApiRequest(request)) {
    // network-first for API
    event.respondWith((async () => {
      try {
        const network = await fetch(request);
        const cache = await caches.open(CACHE_RUNTIME);
        cache.put(request, network.clone());
        return network;
      } catch (e) {
        const cached = await caches.match(request);
        if (cached) return cached;
        throw e;
      }
    })());
    return;
  }

  // static: stale-while-revalidate
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_STATIC);
    const cached = await cache.match(request);
    const networkPromise = fetch(request).then((response) => {
      cache.put(request, response.clone());
      return response;
    }).catch(() => undefined);
    return cached || networkPromise || fetch(request);
  })());
});


