// berbagi-cerita/src/scripts/index.js (Lengkap dan Benar)
// CSS imports
import "../styles/styles.css";
import "tiny-slider/dist/tiny-slider.css";
import "leaflet/dist/leaflet.css";

import App from "./pages/app";
import Camera from "./utils/camera";

// Penambahan registrasi service worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    // Menggunakan URL relatif yang lebih robust
    navigator.serviceWorker
      .register("./service-worker.js") // <-- PERUBAHAN DI SINI
      .then((registration) => {
        console.log("ServiceWorker registered: ", registration);
      })
      .catch((registrationError) => {
        console.log("ServiceWorker registration failed: ", registrationError);
      });
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const app = new App({
    content: document.querySelector("#main-content"),
    drawerButton: document.querySelector("#drawer-button"),
    navigationDrawer: document.querySelector("#navigation-drawer"),
    skipLinkButton: document.querySelector("#skip-link"),
  });
  await app.renderPage();

  window.addEventListener("hashchange", async () => {
    await app.renderPage();

    // Stop all active media streams from camera when hash changes
    Camera.stopAllStreams();
  });
});
