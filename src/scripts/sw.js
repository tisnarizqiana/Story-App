import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { StaleWhileRevalidate, NetworkFirst } from "workbox-strategies";
import { CacheableResponsePlugin } from "workbox-cacheable-response";

// Melakukan precache dari manifest yang dihasilkan oleh Webpack
// self.__WB_MANIFEST akan diisi otomatis oleh Workbox
precacheAndRoute(self.__WB_MANIFEST);

// Runtime caching untuk Story API (Network First)
registerRoute(
  ({ url }) => url.href.startsWith("https://story-api.dicoding.dev/v1/"),
  new NetworkFirst({
    cacheName: "story-api-cache",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
    networkTimeoutSeconds: 3, // Timeout 3 detik
  })
);

// Runtime caching untuk OpenStreetMap Tiles (Stale While Revalidate)
registerRoute(
  ({ url }) => url.href.startsWith("https://tile.openstreetmap.org/"),
  new StaleWhileRevalidate({
    cacheName: "openstreetmap-tiles",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// Runtime caching untuk MapTiler API (Stale While Revalidate)
registerRoute(
  ({ url }) => url.href.startsWith("https://api.maptiler.com/"),
  new StaleWhileRevalidate({
    cacheName: "maptiler-api-cache",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// Event listener untuk push notification
self.addEventListener("push", (event) => {
  const notificationData = event.data.json();
  const { title, options } = notificationData;

  event.waitUntil(self.registration.showNotification(title, options));
});

// Event listener untuk klik pada notifikasi
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  // Membuka halaman tertentu saat notifikasi diklik
  if (event.action === "explore") {
    clients.openWindow("/#/home");
  } else {
    clients.openWindow("/#/home");
  }
});
