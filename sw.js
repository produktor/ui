const CACHE_NAME = 'produktor-v2';
const SHELL_URLS = [
  './',
  './index.html',
  './app.js',
  './manifest.webmanifest',
  './styles/main.css',
  './styles/maplibre-gl.css',
  './assets/vuetify/vuetify.css',
  './assets/vue/vue.min.js',
  './assets/vuetify/vuetify.min.js',
  './js/maplibre-gl.js',
  './js/wicket.js',
  './images/gis-icon.png',
  './images/gis-icon-192.png',
  './images/gis-icon-512.png',
  './favicon.ico'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (url.origin !== location.origin) return;
  if (!url.pathname.endsWith('.html') && !url.pathname.endsWith('.js') && !url.pathname.endsWith('.css') && !url.pathname.includes('/images/') && !url.pathname.includes('/assets/') && !url.pathname.includes('/styles/') && !url.pathname.includes('/js/')) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request).then((res) => {
        if (res.ok && request.method === 'GET') {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return res;
      });
      return cached || fetchPromise;
    })
  );
});
