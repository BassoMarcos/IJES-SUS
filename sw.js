// Service worker de la Caja IJES SUBS — cachea la app para uso sin internet.
const CACHE = "caja-ijes-v3";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Estrategia: primero la red; si no hay, lo cacheado. Así siempre ves la última versión
// cuando hay internet, y funciona igual cuando no lo hay.
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  // Nunca cachear las llamadas a la API de datos (JSONBin): siempre a la red.
  if (e.request.url.indexOf("jsonbin.io") !== -1) return;
  e.respondWith(
    fetch(e.request)
      .then((resp) => {
        const copy = resp.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
        return resp;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match("./index.html")))
  );
});
