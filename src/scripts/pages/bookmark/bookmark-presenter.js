// src/scripts/pages/bookmark/bookmark-presenter.js

class BookmarkPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async showSavedStories() {
    this.#view.showLoading();
    try {
      const stories = await this.#model.getStoriesFromIndexedDB();
      this.#view.displayStories(stories);
    } catch (error) {
      console.error(error);
      this.#view.displayStories([]); // Tampilkan halaman kosong jika ada error
    } finally {
      this.#view.hideLoading();
    }
  }

  async deleteStory(id) {
    if (
      confirm("Anda yakin ingin menghapus cerita ini dari daftar tersimpan?")
    ) {
      try {
        await this.#model.deleteStoryFromIndexedDB(id);
        alert("Cerita berhasil dihapus.");
        await this.showSavedStories(); // Muat ulang daftar cerita
      } catch (error) {
        console.error("Gagal menghapus cerita:", error);
        alert("Gagal menghapus cerita.");
      }
    }
  }
}

export default BookmarkPresenter;
