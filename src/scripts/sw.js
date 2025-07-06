self.addEventListener("push", (event) => {
  const notificationData = event.data.json();
  const { title, options } = notificationData;

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  // Contoh: membuka halaman tertentu saat notifikasi diklik
  if (event.action === "explore") {
    clients.openWindow("/#/home");
  } else {
    clients.openWindow("/#/home");
  }
});
