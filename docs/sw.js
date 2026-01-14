const CACHE_NAME = 'hydrocalculo-v1.1';
const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './css/variables.css',
    './css/styles.css',
    // App Modules
    './js/app/app.js',
    './js/app/ui.js',
    './js/app/storage.js',
    // Engine Modules
    './js/engine/index.js',
    './js/engine/diagnostics.js',
    './js/engine/fluids.js',
    './js/engine/friction.js',
    './js/engine/losses.js',
    './js/engine/units.js',
    // Assets
    './assets/icon-192.png',
    './assets/icon-512.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(ASSETS))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => response || fetch(event.request))
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    return caches.delete(key);
                }
            }));
        })
    );
});
