/* Service worker - caches the full app on first load for offline use */

const CACHE = "ai-waste-booth-v2";

const PRECACHE = [
  "./index.html",
  "./style.css",
  "./app.js",
  "./quiz.js",
  "./diagnosis.js",
  "./receipt.js",
  "./share-card.js",
  "./booth-mode.js",
  "./data.js",
  "./config.js",
  "./vendor/qrcode.min.js",
  "../assets/archetypes/regeneration_goblin.jpg",
  "../assets/archetypes/context_hoarder.jpg",
  "../assets/archetypes/confident_hallucination_enjoyer.jpg",
  "../assets/archetypes/prompt_archaeologist.jpg",
  "../assets/archetypes/copy_paste_pilot.jpg",
  "../assets/archetypes/improviser.jpg",
  "../assets/logo.png",
];

self.addEventListener("install", evt => {
  evt.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", evt => {
  evt.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  return self.clients.claim();
});

// cache-first for precached assets, network-first for everything else
self.addEventListener("fetch", evt => {
  evt.respondWith(
    caches.match(evt.request).then(cached => {
      if (cached) return cached;
      return fetch(evt.request).then(response => {
        // don't cache non-OK or opaque responses
        if (!response || response.status !== 200 || response.type === "opaque") {
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE).then(cache => cache.put(evt.request, clone));
        return response;
      });
    })
  );
});
