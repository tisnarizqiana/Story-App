export default class NewPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async showNewFormMap() {
    console.log;
    if (this.#view) {
      this.#view.showMapLoading();
    }
    try {
      if (this.#view) {
        await this.#view.initialMap();
      }
    } catch (error) {
      console.error("showNewFormMap: error:", error);
    } finally {
      if (this.#view) {
        this.#view.hideMapLoading();
      }
    }
  }

  async submitForm({ description, evidenceImages, latitude, longitude }) {
    this.#view.showSubmitLoadingButton();

    try {
      const formData = new FormData();
      formData.append("description", description);

      if (latitude) formData.append("lat", latitude);
      if (longitude) formData.append("lon", longitude);

      evidenceImages.forEach((image) => {
        formData.append("photo", image);
      });

      const response = await this.#model.storeNewStory(formData);

      if (!response || response.error) {
        this.#view.storeFailed(response?.message || "Gagal menyimpan laporan.");
        return;
      }

      // Teruskan 'description' ke view agar bisa ditampilkan di notifikasi
      this.#view.storeSuccessfully(response.message, description);
    } catch (error) {
      console.error("submitForm error:", error);
      this.#view.storeFailed(error.message);
    } finally {
      this.#view.hideSubmitLoadingButton();
    }
  }
}
