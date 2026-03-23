const CACHE_NAME = 'rdc-v1'
const STATIC_CACHE = 'rdc-static-v1'

// Assets to cache on install
const PRECACHE_URLS = [
  '/',
  '/forum',
  '/events',
  '/airspace',
  '/logbook',
  '/offline',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_URLS.map(url => new Request(url, { credentials: 'same-origin' })))
        .catch(() => {}) // Don't fail install if pre-cache fails
    })
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME && name !== STATIC_CACHE)
          .map(name => caches.delete(name))
      )
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip external URLs
  if (url.origin !== self.location.origin) return

  // Cache public form API responses for offline access
  if (request.method === 'GET' && url.pathname.match(/^\/api\/forms\/public\/.+/)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone()
            caches.open('rdc-forms-v1').then(cache => cache.put(request, clone))
          }
          return response
        })
        .catch(() => caches.match(request))
    )
    return
  }

  // Queue offline form submissions
  if (request.method === 'POST' && url.pathname.match(/^\/api\/forms\/public\/.+\/submit/)) {
    event.respondWith(
      fetch(request.clone()).catch(async () => {
        // Store submission in IndexedDB for later sync
        const body = await request.clone().json()
        const formId = url.pathname.split('/')[4]
        await storeOfflineSubmission(formId, body)
        return new Response(JSON.stringify({
          success: true,
          offline: true,
          message: 'Submission saved offline. It will be sent when you reconnect.'
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      })
    )
    return
  }

  // Skip non-GET and other API routes
  if (request.method !== 'GET') return
  if (url.pathname.startsWith('/api/')) return

  // Network-first for HTML pages (always fresh content)
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone))
          }
          return response
        })
        .catch(() =>
          caches.match(request).then(cached => cached || caches.match('/offline'))
        )
    )
    return
  }

  // Cache-first for static assets (_next/static, images)
  if (url.pathname.startsWith('/_next/static') || url.pathname.startsWith('/icons')) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached
        return fetch(request).then(response => {
          if (response.ok) {
            caches.open(STATIC_CACHE).then(cache => cache.put(request, response.clone()))
          }
          return response
        })
      })
    )
  }
})

// Handle push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return
  const data = event.data.json()
  event.waitUntil(
    self.registration.showNotification(data.title || 'Rwanda Drone Community', {
      body: data.body || '',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      data: { url: data.url || '/' },
      tag: data.tag || 'rdc-notification',
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/'
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) return client.focus()
      }
      return clients.openWindow(url)
    })
  )
})

// ── Offline Form Submissions (IndexedDB) ─────────────────
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('rdc-offline-forms', 1)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains('submissions')) {
        db.createObjectStore('submissions', { keyPath: 'id', autoIncrement: true })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function storeOfflineSubmission(formId, body) {
  const db = await openDB()
  const tx = db.transaction('submissions', 'readwrite')
  tx.objectStore('submissions').add({
    formId,
    body,
    createdAt: new Date().toISOString(),
  })
}

async function syncOfflineSubmissions() {
  try {
    const db = await openDB()
    const tx = db.transaction('submissions', 'readonly')
    const store = tx.objectStore('submissions')
    const all = await new Promise((resolve) => {
      const req = store.getAll()
      req.onsuccess = () => resolve(req.result)
    })

    for (const sub of all) {
      try {
        const res = await fetch(`/api/forms/public/${sub.formId}/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sub.body),
        })

        if (res.ok) {
          const delTx = db.transaction('submissions', 'readwrite')
          delTx.objectStore('submissions').delete(sub.id)
        }
      } catch {
        // Still offline, will retry next sync
      }
    }
  } catch {}
}

// Sync when back online
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-form-submissions') {
    event.waitUntil(syncOfflineSubmissions())
  }
})

// Also try syncing periodically
self.addEventListener('message', (event) => {
  if (event.data === 'sync-offline') {
    syncOfflineSubmissions()
  }
})
