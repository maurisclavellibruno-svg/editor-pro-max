// Minimal service worker: network-first for everything, with a cached
// offline fallback page for navigations only. Booking availability and admin
// data are always live — we deliberately do NOT cache API responses or HTML
// pages, since serving stale slots/bookings offline would be actively wrong
// for a real-time booking app. This exists purely to make the app
// installable and to avoid a browser dino page when there's no connection.
const CACHE_NAME = "maurisbarber-shell-v1";
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll([OFFLINE_URL])),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return;

  event.respondWith(
    fetch(event.request).catch(() => caches.match(OFFLINE_URL)),
  );
});
