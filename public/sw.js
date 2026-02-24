const CACHE_NAME = 'uoc-planner-v1';
const PRECACHE = [
    '/',
    '/manifest.json',
    '/icon-192.png',
    '/icon-512.png',
];

// Install — precache shell
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE))
    );
    self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// Fetch — network-first for API/Firebase, cache-first for static assets
self.addEventListener('fetch', (e) => {
    const url = new URL(e.request.url);

    // Skip non-GET and cross-origin (Firebase, Google APIs)
    if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;

    e.respondWith(
        fetch(e.request)
            .then((res) => {
                const clone = res.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
                return res;
            })
            .catch(() => caches.match(e.request))
    );
});
