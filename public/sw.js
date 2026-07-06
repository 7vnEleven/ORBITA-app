// ORBITA service worker — cache "app shell" per apertura offline
const CACHE = "orbita-v1";
self.addEventListener("install", (e) => { self.skipWaiting(); });
self.addEventListener("activate", (e) => { e.waitUntil(self.clients.claim()); });
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // non tocca Supabase/API
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).catch(() => caches.match("/index.html").then((r) => r || caches.match("/"))));
    return;
  }
  e.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(req, copy));
      return res;
    }).catch(() => cached))
  );
});
