function oneLine(value, fallback = "") {
  const text = String(value || "")
    .replace(/[\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text || fallback;
}

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {};
  }

  const title = oneLine(data.title, "MoneyKit");
  const options = {
    body: oneLine(data.body),
    badge: "/icon-splash-192.png",
    data: { url: data.url || "/" },
    tag: data.tag || "moneykit",
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = event.notification.data?.url || "/";
  const origin = self.location.origin;
  const url = new URL(target, origin).href;

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(async (clients) => {
        for (const client of clients) {
          if (!client.url.startsWith(origin) || !("focus" in client)) continue;
          await client.focus();
          client.postMessage({ type: "moneykit-notification-click", url });
          return;
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(url);
        }
      })
  );
});
