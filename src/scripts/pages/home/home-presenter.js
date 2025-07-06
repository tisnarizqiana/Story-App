// berbagi-cerita/src/scripts/pages/home/home-presenter.js

import { putStoryToIndexedDB } from "../../data/indexed-db-helper";

export default class HomePresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async showStoriesListMap() {
    this.#view.showMapLoading();
    try {
      await this.#view.initialMap();
    } catch (error) {
      console.error("showStoriesListMap: error:", error);
    } finally {
      this.#view.hideMapLoading();
    }
  }

  async initialGalleryAndMap() {
    console.log("[DEBUG] initialGalleryAndMap called");
    this.#view.showLoading();
    try {
      // Langsung ambil data dari API, bukan dari IndexedDB
      console.log("[DEBUG] Memuat cerita dari API...");
      const response = await this.#model.getAllStories();

      if (!response.ok) {
        console.error("[ERROR] Response not OK:", response.message);
        this.#view.populateStoryListError(response.message);
        return;
      }

      const stories = response.listStory;
      this.#view.populateStoryList(response.message, stories);

      // Peta diinisialisasi setelah cerita dimuat
      await this.showStoriesListMap();
    } catch (error) {
      console.error("[ERROR] initialGalleryAndMap:", error);
      this.#view.populateStoryListError(error.message);
    } finally {
      this.#view.hideLoading();
    }
  }

  // Method baru untuk menyimpan cerita berdasarkan interaksi user
  async saveStory(story) {
    try {
      if (!story || !story.id) {
        throw new Error("Data cerita tidak valid untuk disimpan.");
      }
      await putStoryToIndexedDB(story);
      alert(`Cerita "${story.name}" berhasil disimpan ke daftar tersimpan!`);
      console.log(`Cerita ${story.id} disimpan ke IndexedDB`);
    } catch (error) {
      console.error("Gagal menyimpan cerita:", error);
      alert(`Gagal menyimpan cerita: ${error.message}`);
    }
  }
}
