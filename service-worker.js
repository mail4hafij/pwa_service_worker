/** --------------------------------------------------------------------------------------*
 * Version: 4.0                                                                           *
 * Source: https://github.com/mail4hafij/pwa_service_worker                               *
 * License: Free to use                                                                   *
 * ---------------------------------------------------------------------------------------*
 * DEVELOPED BY                                                                           *
 * Mohammad Hafijur Rahman                                                                *
  * ------------------------------------------------------------------------------------ **/

const cacheName = "version-3";

self.addEventListener("install", async (e) => {
  // Not adding any cache when installing.
  // In that case - updates for those caches (added when installed)
  // will not be possible until clients uninstall or deregister
  // service worker.
  return self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  // Removing all old cache when
  // activating new service worker.
  caches.delete("version-1");
  caches.delete("version-2");
  self.clients.claim();
});

self.addEventListener("fetch", async (e) => {
  const req = e.request;
  e.respondWith(networkAndCache(req));
});

async function networkAndCache(req) {
  const cache = await caches.open(cacheName);
  try {
    const url = new URL(req.url);

    // Only for those requests of same origin.
    // So any third party cross origin requests
    // (i.e., google analytics and maps) should be avoided.
    if (url.origin === self.location.origin) {
     
      // No caching for POST requests.
      if (req.method !== "POST") {
        // Keep cache up to date.
        const fresh = await fetch(req);
        await cache.put(req, fresh.clone());
        return fresh;
      }
     
    }
   
    // No cache for these requests (cross-origin or post).
    return await fetch(req);
   
  } catch (e) {
    // Network request did not go through
    // Try to pull from the cache
    const cached = await cache.match(req);
    if (cached) {
      return cached;
    } else {
      throw new Error("not found in the cache");
    }
  }
}
