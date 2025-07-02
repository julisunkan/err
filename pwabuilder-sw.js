
// PWABuilder Service Worker for Windows packaging
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

const { offlineFallback, warmStrategyCache } = workbox.recipes;
const { CacheFirst, StaleWhileRevalidate } = workbox.strategies;
const { registerRoute, NavigationRoute } = workbox.routing;
const { CacheableResponsePlugin } = workbox.cacheableResponse;
const { ExpirationPlugin } = workbox.expiration;

// Cache page navigations (html) with a Network First strategy
registerRoute(
  new NavigationRoute(
    new StaleWhileRevalidate({
      cacheName: 'pages',
      plugins: [
        new CacheableResponsePlugin({
          statuses: [0, 200],
        }),
      ],
    }),
  ),
);

// Cache CSS, JS, and Web Worker requests with a Stale While Revalidate strategy
registerRoute(
  ({ request }) =>
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'worker',
  new StaleWhileRevalidate({
    cacheName: 'assets',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  }),
);

// Cache images with a Cache First strategy
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
      }),
    ],
  }),
);

// Use a stale-while-revalidate strategy for all other requests.
workbox.routing.setDefaultHandler(
  new StaleWhileRevalidate()
);

// This "catch" handler is triggered when any of the other routes fail to generate a response.
workbox.routing.setCatchHandler(({ event }) => {
  // Use event, request, and url to figure out how to respond.
  // One approach would be to use request.destination, see https://medium.com/dev-channel/service-worker-caching-strategies-based-on-request-types-57411dd7652c
  switch (event.request.destination) {
    case 'document':
      return caches.match('/offline.html');
    break;

    case 'image':
      return caches.match('/static/icons/icon-192.png');
    break;

    default:
      // If we don't have a fallback, just return an error response.
      return Response.error();
  }
});

// Enable offline fallback
offlineFallback({
  pageFallback: '/offline.html',
});
