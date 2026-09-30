// Bump-able cache namespace. The version below is rewritten at build time by
// the serviceWorkerPlugin in vite.config.ts, so each release gets a fresh
// cache name and installed clients pick up the new bundle on their next visit.
const CACHE_VERSION = '__SW_VERSION__';
const CACHE_NAME = `aurora-sudoku-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  './',
  './index.html',
  './favicon.svg',
  './manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Page loads go network-first, so users always get the newest index.html and
// therefore the newest hashed asset names. Cache-first here would pin
// already-installed clients to the first version they ever loaded.
async function handleNavigation(request) {
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const copy = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put('./index.html', copy));
    }
    return response;
  } catch {
    const cached = await caches.match('./index.html');
    if (cached) return cached;
    return Response.error();
  }
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith('http')) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(handleNavigation(event.request));
    return;
  }

  // Static assets are content-hashed by Vite, so cache-first is safe here.
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('./index.html');
          }
          return Response.error();
        });
    })
  );
});
