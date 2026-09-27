// Retires the old shop PWA worker: installed copies fetch this on their next
// online visit, wipe every cache, unregister, and reload from the network so
// the server can send them to the marketing page.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      await self.registration.unregister();
      const clients = await self.clients.matchAll({ type: "window" });
      await Promise.all(
        clients.map((client) => client.navigate(client.url).catch(() => {}))
      );
    })()
  );
});
