importScripts("./version.js");

const CACHE_PREFIX = "threadline-studio-cache";
const CACHE_VERSION = globalThis.APP_VERSION_INFO?.cacheVersion || "v0";
const CACHE_NAME = `${CACHE_PREFIX}-${CACHE_VERSION}`;
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./campaign-metadata-loader.js",
  "./packages/threadline-filters/campaign-metadata.json",
  "./packages/threadline-filters/corrections-metadata.json",
  "./packages/threadline-filters/styles-metadata.json",
  "./packages/threadline-filters/fx-metadata.json",
  "./packages/threadline-filters/morphology-metadata.json",
  "./packages/threadline-filters/patterns-metadata.json",
  "./packages/threadline-filters/materials-metadata.json",
  "./packages/threadline-filters/atmosphere-metadata.json",
  "./packages/threadline-filters/art-metadata.json",
  "./packages/threadline-filters/artists-metadata.json",
  "./packages/threadline-filters/graphics-metadata.json",
  "./packages/threadline-filters/word-art-metadata.json",
  "./packages/threadline-filters/fragment-metadata.json",
  "./packages/threadline-filters/cut-metadata.json",
  "./packages/threadline-filters/morph-metadata.json",
  "./packages/threadline-filters/locales/de.json",
  "./packages/threadline-filters/locales/en.json",
  "./packages/threadline-filters/locales/fr.json",
  "./packages/threadline-filters/package.json",
  "./packages/threadline-filters/index.js",
  "./packages/threadline-filters/metadata-runtime.js",
  "./packages/threadline-filters/canvas-runtime.js",
  "./packages/threadline-filters/morphology-effects.js",
  "./packages/threadline-filters/canvas-effects.js",
  "./packages/threadline-filters/campaign-effects.js",
  "./packages/threadline-filters/atmosphere-effects.js",
  "./packages/threadline-filters/canvas-primitives.js",
  "./packages/threadline-filters/pattern-effects.js",
  "./packages/threadline-filters/material-effects.js",
  "./packages/threadline-filters/graphic-effects.js",
  "./packages/threadline-filters/composition-effects.js",
  "./packages/threadline-filters/morph-effects.js",
  "./packages/threadline-filters/text-effects.js",
  "./packages/threadline-filters/artist-effects.js",
  "./packages/threadline-filters/art-effects.js",
  "./packages/threadline-filters/canvas-sampling.js",
  "./packages/threadline-filters/canvas-geometry.js",
  "./packages/threadline-filters/effects.js",
  "./packages/threadline-filters/factory.js",
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
  "./assets/threadline-studio-share-qr.svg",
  "./assets/threadline-studio-og.svg",
  "./assets/threadline-studio-og.png",
  "./assets/threadline-studio-og.jpg"
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
