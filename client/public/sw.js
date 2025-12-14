// Service Worker pour PWA - Mode Offline
const CACHE_NAME = 'municipal-bf-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/src/main.jsx',
    '/src/App.jsx',
    '/src/index.css'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Cache ouvert');
                return cache.addAll(urlsToCache);
            })
    );
});

// Activation et nettoyage des anciens caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Suppression ancien cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Stratégie Network First, fallback to Cache
self.addEventListener('fetch', (event) => {
    // Ignorer les requêtes non-GET (POST, PUT, DELETE, etc.)
    if (event.request.method !== 'GET') {
        return;
    }

    // Ignorer les requêtes API et chrome-extension
    const url = new URL(event.request.url);
    if (url.pathname.startsWith('/api/') || url.protocol === 'chrome-extension:') {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Vérifier si la réponse est valide
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }

                // Clone la réponse
                const responseToCache = response.clone();

                caches.open(CACHE_NAME)
                    .then((cache) => {
                        cache.put(event.request, responseToCache);
                    });

                return response;
            })
            .catch(() => {
                // Si le réseau échoue, utiliser le cache
                return caches.match(event.request);
            })
    );
});
