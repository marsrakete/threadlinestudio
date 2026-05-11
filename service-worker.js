importScripts("./version.js");

const CACHE_PREFIX = "threadline-studio-cache";
const CACHE_VERSION = globalThis.APP_VERSION_INFO?.cacheVersion || "v0";
const CACHE_NAME = `${CACHE_PREFIX}-${CACHE_VERSION}`;
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./version.js",
  "./config/i18n.config.js",
  "./manifest.webmanifest",
  "./service-worker.js",
  "./README.md",
  "./LICENSE",
  "./icon.svg",
  "./icon-192.png",
  "./icon-512.png",
  "./assets/kofi-button.svg",
  "./assets/threadline-studio-share-qr.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith(`${CACHE_PREFIX}-`) && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  const isReloadRequest = url.searchParams.has("reload");
  const isFreshAsset = url.pathname.endsWith("/version.js") || url.pathname.endsWith("/README.md");

  if (isFreshAsset) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => {
          const fallback = url.pathname.endsWith("/version.js") ? "./version.js" : "./README.md";
          return caches.match(event.request).then((cached) => cached || caches.match(fallback));
        })
    );
    return;
  }

  if (isReloadRequest) {
    event.respondWith(
      fetch(event.request, { cache: "no-store" }).catch(() => caches.match("./index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match("./index.html"));
    })
  );
});
