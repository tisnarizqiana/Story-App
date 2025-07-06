// src/scripts/pages/app.js

import { getActiveRoute } from "../routes/url-parser";
import {
  generateAuthenticatedNavigationListTemplate,
  generateUnauthenticatedNavigationListTemplate,
  generatePushNotificationToolsTemplate,
} from "../templates.js";
import { setupSkipToContent } from "../utils";
import { getToken, getLogout } from "../utils/auth";
import routes from "../routes/routes";
import {
  initPushNotification,
  unsubscribePushNotification,
} from "../utils/notification-helper";
import Camera from "../utils/camera";

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;
  #skipLinkButton = null;

  constructor({ navigationDrawer, drawerButton, content, skipLinkButton }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;
    this.#skipLinkButton = skipLinkButton;
    this.#init();
  }

  #init() {
    setupSkipToContent(this.#skipLinkButton, this.#content);
    this.#setupDrawer();
  }

  #setupDrawer() {
    this.#drawerButton.addEventListener("click", (event) => {
      event.stopPropagation();
      this.#navigationDrawer.classList.toggle("open");
    });

    document.body.addEventListener("click", (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove("open");
      }
    });
  }

  async #setupNavigationList() {
    const isLogin = !!getToken();
    const navList = this.#navigationDrawer.querySelector("#navlist"); // Hanya menargetkan #navlist

    if (!navList) return;

    if (isLogin) {
      navList.innerHTML = generateAuthenticatedNavigationListTemplate(); // Gunakan template gabungan

      document
        .getElementById("logout-button")
        .addEventListener("click", (e) => {
          e.preventDefault();
          if (confirm("Yakin ingin keluar?")) getLogout();
        });

      const pushToolsContainer = document.querySelector(
        "#push-notification-tools"
      );
      if (pushToolsContainer) {
        await this.#renderPushNotificationButton(pushToolsContainer);
      }
    } else {
      navList.innerHTML = generateUnauthenticatedNavigationListTemplate();
    }
  }

  // --- LOGIKA UTAMA DIPERBARUI DI SINI ---
  async #handlePushButtonClick(event) {
    const pushButton = event.currentTarget;
    pushButton.disabled = true;

    try {
      const swRegistration = await navigator.serviceWorker.ready;
      const subscription = await swRegistration.pushManager.getSubscription();

      if (subscription) {
        await unsubscribePushNotification();
      } else {
        await initPushNotification();
      }
    } catch (error) {
      console.error("Failed to handle push notification action:", error);
    }

    // Render ulang seluruh navigasi untuk memastikan state UI sinkron
    await this.#setupNavigationList();
  }

  async #renderPushNotificationButton(container) {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.warn("Push messaging is not supported");
      container.style.display = "none";
      return;
    }

    const swRegistration = await navigator.serviceWorker.ready;
    const subscription = await swRegistration.pushManager.getSubscription();

    container.innerHTML = generatePushNotificationToolsTemplate(!!subscription);

    const pushButton = document.getElementById("push-notification-button");
    if (pushButton) {
      // Menambahkan event listener ke tombol yang baru dibuat
      pushButton.addEventListener(
        "click",
        this.#handlePushButtonClick.bind(this)
      );
    }
  }

  #updateActiveNavLink() {
    const currentPath = `#${getActiveRoute()}`;
    const navLinks = document.querySelectorAll(".nav-list li a");
    navLinks.forEach((link) => {
      link.classList.remove("active");
      const linkPath = link.getAttribute("href");
      if (
        linkPath === currentPath ||
        (currentPath === "#/" && linkPath === "#/home")
      ) {
        link.classList.add("active");
      }
    });
  }

  async renderPage() {
    await this.#setupNavigationList(); // Selalu setup navigasi saat halaman dirender
    const url = getActiveRoute();
    const page = routes[url] ? routes[url]() : routes["/"]();

    if (page) {
      this.#content.innerHTML = await page.render();
      await page.afterRender();
      this.#updateActiveNavLink();
    }

    Camera.stopAllStreams();
    this.#navigationDrawer.classList.remove("open");
  }
}

export default App;
