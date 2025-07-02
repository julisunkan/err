
const CACHE_NAME = 'business-docs-v2';
const OFFLINE_CACHE = 'business-docs-offline-v1';

// Critical resources for offline functionality
const urlsToCache = [
  '/',
  '/code-generator',
  '/static/css/style.css',
  '/static/js/app.js',
  '/static/js/pdf-generator.js',
  '/static/js/pwa-utils.js',
  '/static/js/NotoSans.js',
  '/static/js/Roboto-Regular-normal.js',
  '/static/manifest.json',
  '/static/icons/icon-192.png',
  '/static/icons/icon-512.png',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
];

// Offline fallback page
const OFFLINE_PAGE = '/offline.html';

self.addEventListener('install', function(event) {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME)
        .then(function(cache) {
          console.log('Opened cache');
          return cache.addAll(urlsToCache);
        }),
      caches.open(OFFLINE_CACHE)
        .then(function(cache) {
          return cache.add(OFFLINE_PAGE);
        })
    ])
  );
  self.skipWaiting();
});

self.addEventListener('fetch', function(event) {
  // Handle API requests separately
  if (event.request.url.includes('/api/')) {
    event.respondWith(handleApiRequest(event.request));
    return;
  }

  // Handle navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(OFFLINE_PAGE);
        })
    );
    return;
  }

  // Handle other requests with cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Return cached version if available
        if (response) {
          return response;
        }

        return fetch(event.request).then(
          function(response) {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response for caching
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        ).catch(() => {
          // Return offline fallback for images
          if (event.request.destination === 'image') {
            return new Response('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f0f0f0"/><text x="100" y="100" text-anchor="middle" fill="#999">Offline</text></svg>', {
              headers: { 'Content-Type': 'image/svg+xml' }
            });
          }
        });
      })
  );
});

// Handle API requests with offline storage
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  try {
    const response = await fetch(request);
    
    // Cache GET requests for offline access
    if (request.method === 'GET' && response.ok) {
      const cache = await caches.open('api-cache');
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // Return cached API response if available
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline data for specific endpoints
    if (url.pathname === '/api/get-settings') {
      return new Response(JSON.stringify({
        businessName: 'Your Business (Offline)',
        businessEmail: '',
        businessPhone: '',
        businessAddress: '',
        currency: 'USD',
        taxRate: 0,
        businessLogoUrl: '',
        signatureUrl: ''
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Return error response for other API calls
    return new Response(JSON.stringify({
      error: 'Offline - This feature requires internet connection'
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

self.addEventListener('activate', function(event) {
  const cacheWhitelist = [CACHE_NAME, OFFLINE_CACHE, 'api-cache'];
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Background sync for when connection is restored
self.addEventListener('sync', function(event) {
  if (event.tag === 'background-sync') {
    event.waitUntil(syncOfflineData());
  }
});

async function syncOfflineData() {
  // Handle any pending offline actions
  console.log('Syncing offline data...');
}

// Push notifications support
self.addEventListener('push', function(event) {
  const options = {
    body: event.data ? event.data.text() : 'New update available',
    icon: '/static/icons/icon-192.png',
    badge: '/static/icons/icon-192.png'
  };

  event.waitUntil(
    self.registration.showNotification('Business Documents Generator', options)
  );
});
