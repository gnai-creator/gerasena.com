const CACHE_NAME = 'gerasena-cache-v1';
const URLS_TO_CACHE = ['/', '/automatico', '/resultado'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') {
    return;
  }

  // Always go to the network for API requests so that failures don't
  // return the cached home page and break JSON parsing in the app.
  if (event.request.url.includes('/api/')) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) return response;
      return fetch(event.request).catch(() => {
        // Only fall back to the cached index page for navigation requests.
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
        return Response.error();
      });
    })
  );
});
