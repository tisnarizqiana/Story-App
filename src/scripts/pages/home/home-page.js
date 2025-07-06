// berbagi-cerita/src/scripts/pages/home/home-page.js

import {
  generateLoaderAbsoluteTemplate,
  generateStoryItemTemplate,
  generateStoryListEmptyTemplate,
  generateStoryListErrorTemplate,
} from "../../templates";

import * as StoryAPI from "../../data/api";
import Map from "../../utils/map";
import HomePresenter from "./home-presenter";
// Hapus impor yang tidak perlu dari indexed-db-helper di sini
// karena presenter yang akan menanganinya

export default class HomePage {
  #presenter = null;
  #map = null;

  async render() {
    return `
      <section>
        <div class="stories-list__map__container">
          <div id="map" class="stories-list__map"></div>
          <div id="map-loading-container"></div>
        </div>
      </section>

      <section class="container">
        <h1 class="section-title">Daftar Cerita Menarik</h1>
        <div class="stories-list__container">
          <div id="stories-list"></div>
          <div id="stories-list-loading-container"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new HomePresenter({
      view: this,
      model: StoryAPI,
    });
    await this.#presenter.initialGalleryAndMap();
  }

  populateStoryList(message, stories) {
    if (stories.length <= 0) {
      this.populateStoryListEmpty();
      return;
    }

    const html = stories.reduce((accumulator, story) => {
      if (this.#map) {
        const lat = parseFloat(story.lat);
        const lon = parseFloat(story.lon);

        if (!isNaN(lat) && !isNaN(lon)) {
          const coordinate = [lat, lon];
          const markerOptions = { alt: story.name };
          const popupOptions = { content: story.description };
          this.#map.addMarker(coordinate, markerOptions, popupOptions);
        } else {
          console.warn("[WARNING] Story tanpa koordinat valid:", story);
        }
      }

      return accumulator + generateStoryItemTemplate({ ...story });
    }, "");

    document.getElementById("stories-list").innerHTML = `
      <div class="stories-list">${html}</div>
    `;

    // Tambahkan event listener untuk semua tombol simpan
    document.querySelectorAll(".btn-save-story").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        const storyId = event.target.dataset.storyId;
        const storyToSave = stories.find((story) => story.id === storyId);
        if (storyToSave) {
          this.#presenter.saveStory(storyToSave);
        }
      });
    });
  }

  // sisa method (populateStoryListEmpty, populateStoryListError, initialMap, dll.) biarkan seperti semula
  // ...
  populateStoryListEmpty() {
    document.getElementById("stories-list").innerHTML =
      generateStoryListEmptyTemplate();
  }

  populateStoryListError(message) {
    document.getElementById("stories-list").innerHTML =
      generateStoryListErrorTemplate(message);
  }

  async initialMap() {
    this.#map = await Map.build("#map", {
      zoom: 10,
      locate: true,
    });
  }

  showMapLoading() {
    document.getElementById("map-loading-container").innerHTML =
      generateLoaderAbsoluteTemplate();
  }

  hideMapLoading() {
    document.getElementById("map-loading-container").innerHTML = "";
  }

  showLoading() {
    document.getElementById("stories-list-loading-container").innerHTML =
      generateLoaderAbsoluteTemplate();
  }

  hideLoading() {
    document.getElementById("stories-list-loading-container").innerHTML = "";
  }
}
