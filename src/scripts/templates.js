// src/scripts/templates.js

import { showFormattedDate } from "./utils";

export function generateLoaderTemplate() {
  return `<div class="loader"></div>`;
}

export function generateLoaderAbsoluteTemplate() {
  return `<div class="loader loader-absolute"></div>`;
}

export function generateUnauthenticatedNavigationListTemplate() {
  return `
    <li><a id="login-button" href="#/login">Login</a></li>
    <li><a id="register-button" href="#/register">Register</a></li>
  `;
}

export function generateAuthenticatedNavigationListTemplate() {
  // Semua link digabung di sini
  return `
    <li><a href="#/home">Beranda</a></li>
    <li><a href="#/new">Buat Cerita</a></li>
    <li><a href="#/bookmarks">Cerita Tersimpan</a></li>

    <li class="nav-item-group-end">
        <div id="push-notification-tools" class="push-notification-tools"></div>
        <a id="logout-button" class="logout-button" href="#/logout"><i class="fas fa-sign-out-alt"></i> Logout</a>
    </li>
  `;
}

export function generatePushNotificationToolsTemplate(isSubscribed) {
  const buttonText = isSubscribed
    ? "Nonaktifkan Notifikasi"
    : "Aktifkan Notifikasi";
  const iconClass = isSubscribed ? "fas fa-bell-slash" : "fas fa-bell";

  return `
    <button id="push-notification-button" class="btn btn-outline" type="button">
        <i class="${iconClass}"></i> ${buttonText}
    </button>
  `;
}

export function generateStoryListEmptyTemplate() {
  return `
    <div id="stories-list-empty" class="stories-list__empty">
      <h2>Tidak ada cerita yang tersedia</h2>
      <p>Saat ini, tidak ada cerita yang dapat ditampilkan.</p>
    </div>
  `;
}

export function generateStoryListErrorTemplate(message) {
  return `
    <div id="stories-list-error" class="stories-list__error">
      <h2>Terjadi kesalahan pengambilan daftar cerita</h2>
      <p>${message || "Gunakan jaringan lain atau laporkan error ini."}</p>
    </div>
  `;
}

export function generateStoryItemTemplate({
  id,
  name,
  description,
  photoUrl,
  createdAt,
  lat,
  lon,
}) {
  return `
      <div tabindex="0" class="story-item" data-storyid="${id}">
        <img class="story-item__image" src="${photoUrl}" alt="${name}">
        <div class="story-item__body">
          <div class="story-item__main">
            <h2 id="story-title" class="story-item__title">${name}</h2>
            <div class="story-item__more-info">
              <div class="story-item__createdat">
                <i class="fas fa-calendar-alt"></i> ${showFormattedDate(
                  createdAt,
                  "id-ID"
                )}
              </div>
              <div class="story-item__location">
                <i class="fas fa-map"></i> Latitude: ${lat}, Longitude: ${lon}
              </div>
            </div>
          </div>
          <div id="story-description" class="story-item__description">${description}</div>
          <div class="story-item__actions">
            <button class="btn btn-outline btn-save-story" data-story-id="${id}">Simpan Cerita</button>
          </div>
        </div>
      </div>
    `;
}
