const CACHE_NAME = 'photo-editor-cache-v3'

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
  '/icons/maskable-icon-512.png',
  '/gloriascript.ttf',
  '/EBGaramond-VariableFont_wght.ttf',
  '/EBGaramond-Italic-VariableFont_wght.ttf',
  '/nature_landscape.webp',
  '/images/gallery.svg',
  '/images/switch.svg',
  '/images/cross.svg',
  /* __VITE_PRECACHE_ASSETS__ */
]

// Install: Cache all core assets and activate immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(async (cache) => {
        // Cache assets resiliently so one missing file never breaks the whole PWA install
        const uniqueAssets = Array.from(new Set(PRECACHE_ASSETS.filter(Boolean)))
        await Promise.allSettled(
          uniqueAssets.map(async (asset) => {
            try {
              await cache.add(asset)
            } catch (err) {
              console.warn(`[PWA] Pre-cache skipped for ${asset}:`, err)
            }
          })
        )
      })
      .then(() => self.skipWaiting())
  )
})

// Activate: Claim clients and purge outdated caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  )
})

// Fetch: Cache-First for static assets, Network-First with Offline fallback for navigation
self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  // 1. Navigation requests (SPA page load / reload)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          }
          return response
        })
        .catch(async () => {
          // Offline fallback: serve cached index.html
          const cached =
            (await caches.match(request)) ||
            (await caches.match('/index.html')) ||
            (await caches.match('/'))
          if (cached) return cached
          return new Response('Офлайн-режим: страница не найдена в кэше', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
          })
        })
    )
    return
  }

  // 2. Static Assets (JS bundles, CSS, Fonts, Images, SVGs)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // Instant response from cache (0ms)
      if (cachedResponse) {
        return cachedResponse
      }

      // Cache miss: fetch from network and store in cache for future offline usage
      return fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && url.origin === self.location.origin) {
            const clone = networkResponse.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          }
          return networkResponse
        })
        .catch(() => {
          return new Response('', { status: 408, statusText: 'Offline Asset Unavailable' })
        })
    })
  )
})
