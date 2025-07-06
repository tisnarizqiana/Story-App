import NewPresenter from "./new-presenter";
import { convertBase64ToBlob, compressImage } from "../../utils";
import * as StoryAPI from "../../data/api";
import { generateLoaderAbsoluteTemplate } from "../../templates";
import Camera from "../../utils/camera";
import Map from "../../utils/map";

export default class NewPage {
  #presenter;
  #form;
  #camera;
  #isCameraOpen = false;
  #takenDocumentations = [];
  #map = null;

  async render() {
    // ... (render method tetap sama, tidak perlu diubah)
    return `
      <section>
        <div class="new-story__header">
          <div class="container">
            <h1 class="new-story__header__title">Bagikan Cerita Kamu</h1>
            <p class="new-story__header__description">
              Silakan lengkapi formulir di bawah untuk membuat cerita baru kamu.<br>
            </p>
          </div>
        </div>
      </section>
      <section class="container">
        <div class="new-form__container">
          <form id="new-form" class="new-form">
            <div class="form-control">
              <label for="description-input" class="new-form__description__title">Alur Cerita</label>
              <div class="new-form__description__container">
                <textarea
                  id="description-input"
                  name="description"
                  placeholder="Masukkan cerita menarik kamu. Kamu dapat menjelaskan apa kejadiannya, dimana, kapan, dll."
                ></textarea>
              </div>
            </div>
            <div class="form-control">
              <label for="documentations-input" class="new-form__documentations__title">Dokumentasi</label>
              <div id="documentations-more-info">kamu dapat menyertakan foto sebagai dokumentasi.</div>
              <div class="new-form__documentations__container">
                <div class="new-form__documentations__buttons">
                  <button id="documentations-input-button" class="btn btn-outline" type="button">Ambil Gambar</button>
                  <input
                    id="documentations-input"
                    class="new-form__documentations__input"
                    name="documentations"
                    type="file"
                    accept="image/*"
                    multiple
                    aria-multiline="true"
                    aria-describedby="documentations-more-info"
                  >
                  <button id="open-documentations-camera-button" class="btn btn-outline" type="button">
                    Buka Kamera
                  </button>
                </div>
                <div id="camera-container" class="new-form__camera__container">
                  <video id="camera-video" class="new-form__camera__video">
                    Video stream not available.
                  </video>
                  <canvas id="camera-canvas" class="new-form__camera__canvas"></canvas>
                  <div class="new-form__camera__tools">
                    <select id="camera-select"></select>
                    <div class="new-form__camera__tools_buttons">
                    <button id="camera-take-button" class="btn" type="button">
                      Ambil Gambar
                    </button>
                  </div>
                  </div>
                </div>
                <ul id="documentations-taken-list" class="new-form__documentations__outputs"></ul>
              </div>
            </div>
            <div class="form-control">
              <div class="new-form__location__title">Lokasi</div>
              <div class="new-form__location__container">
                <div class="new-form__location__map__container">
                  <div id="map" class="new-form__location__map"></div>
                  <div id="map-loading-container"></div>
                </div>
                <div class="new-form__location__lat-lng">
                  <input type="number" name="latitude" value="-6.175389" disabled>
                  <input type="number" name="longitude" value="106.827139" disabled>
                </div>
              </div>
            </div>
            <div class="form-buttons">
              <span id="submit-button-container">
                <button class="btn" type="submit">Bagikan Cerita Kamu</button>
              </span>
              <a class="btn btn-outline" href="#/">Batal</a>
            </div>
          </form>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#form = document.getElementById("new-form");
    this.#takenDocumentations = [];
    this.#presenter = new NewPresenter({ view: this, model: StoryAPI });
    this.#presenter.showNewFormMap();
    this.#setupForm();
  }

  #setupForm() {
    // ... (setupForm method tetap sama, tidak perlu diubah)
    this.#form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = {
        description: this.#form.elements.namedItem("description").value,
        evidenceImages: this.#takenDocumentations.map((p) => p.blob),
        latitude: this.#form.elements.namedItem("latitude").value,
        longitude: this.#form.elements.namedItem("longitude").value,
      };
      await this.#presenter.submitForm(data);
    });
    document
      .getElementById("documentations-input-button")
      .addEventListener("click", () => {
        this.#form.elements.namedItem("documentations").click();
      });
    document
      .getElementById("documentations-input")
      .addEventListener("change", async (event) => {
        const promises = Array.from(event.target.files).map((file) =>
          this.#addTakenPicture(file)
        );
        await Promise.all(promises);
        await this.#populateTakenPictures();
      });
    const cameraContainer = document.getElementById("camera-container");
    document
      .getElementById("open-documentations-camera-button")
      .addEventListener("click", async (event) => {
        cameraContainer.classList.toggle("open");
        this.#isCameraOpen = cameraContainer.classList.contains("open");
        if (this.#isCameraOpen) {
          event.currentTarget.textContent = "Tutup Kamera";
          this.#setupCamera();
          this.#camera.launch();
        } else {
          event.currentTarget.textContent = "Buka Kamera";
          this.#camera.stop();
        }
      });
  }

  async #addTakenPicture(image) {
    // ... (method ini tetap sama)
    let blob = image;
    if (typeof image === "string" || image instanceof String) {
      blob = await convertBase64ToBlob(image, "image/png");
    }
    try {
      const compressedBlob = await compressImage(blob);
      blob = compressedBlob;
    } catch (error) {
      console.error("Gagal kompresi gambar:", error);
    }
    this.#takenDocumentations.push({
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      blob,
    });
  }

  #populateTakenPictures() {
    // ... (method ini tetap sama)
    const list = document.getElementById("documentations-taken-list");
    list.innerHTML = this.#takenDocumentations.reduce(
      (html, pic, i) =>
        html +
        `
      <li class="new-form__documentations__outputs-item">
        <button type="button" data-deletepictureid="${
          pic.id
        }" class="new-form__documentations__outputs-item__delete-btn">
          <i class="fas fa-times"></i>
        </button>
        <img src="${URL.createObjectURL(pic.blob)}" alt="Dokumentasi ke-${
          i + 1
        }">
      </li>`,
      ""
    );
    list.querySelectorAll("button[data-deletepictureid]").forEach((button) => {
      button.addEventListener("click", (event) => {
        this.#removePicture(event.currentTarget.dataset.deletepictureid);
        this.#populateTakenPictures();
      });
    });
  }

  #removePicture(id) {
    // ... (method ini tetap sama)
    this.#takenDocumentations = this.#takenDocumentations.filter(
      (p) => p.id !== id
    );
  }

  // === PERUBAHAN DI SINI ===
  async initialMap() {
    this.#map = await Map.build("#map", { zoom: 15, locate: true });
    const center = this.#map.getCenter();
    this.#updateLatLngInput(center.latitude, center.longitude);

    const marker = this.#map.addMarker([center.latitude, center.longitude], {
      draggable: "true",
    });

    // Tambahkan log untuk melihat isi variabel 'marker'
    console.log("Isi dari variabel marker:", marker);

    // Sekarang kita tambahkan event listener
    marker.on("move", (e) =>
      this.#updateLatLngInput(e.latlng.lat, e.latlng.lng)
    );

    this.#map.addMapEventListener("click", (e) => marker.setLatLng(e.latlng));
  }

  #updateLatLngInput(lat, lng) {
    // ... (method ini tetap sama)
    this.#form.elements.namedItem("latitude").value = lat;
    this.#form.elements.namedItem("longitude").value = lng;
  }

  #setupCamera() {
    // ... (method ini tetap sama)
    if (this.#camera) return;
    this.#camera = new Camera({
      video: document.getElementById("camera-video"),
      cameraSelect: document.getElementById("camera-select"),
      canvas: document.getElementById("camera-canvas"),
    });
    this.#camera.addCheeseButtonListener("#camera-take-button", async () => {
      await this.#addTakenPicture(await this.#camera.takePicture());
      this.#populateTakenPictures();
    });
  }

  async storeSuccessfully(message, description) {
    // ... (method ini tetap sama, dengan perbaikan terakhir)
    console.log(message);

    const notificationOptions = {
      body: `Anda telah membuat story baru dengan deskripsi: ${description}`,
      icon: "images/icons/icon-192x192.png",
      badge: "images/icons/icon-72x72.png",
      vibrate: [200, 100, 200],
    };

    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Story berhasil dibuat", notificationOptions);
    } else {
      console.log("Notifikasi tidak diizinkan atau tidak didukung.");
    }

    alert("Cerita Anda berhasil dibagikan!");

    this.clearForm();
    location.hash = "/";
  }

  storeFailed(message) {
    // ... (method ini tetap sama)
    alert(message);
  }

  clearForm() {
    // ... (method ini tetap sama)
    this.#form.reset();
    this.#takenDocumentations = [];
    this.#populateTakenPictures();
  }

  showMapLoading() {
    // ... (method ini tetap sama)
    document.getElementById("map-loading-container").innerHTML =
      generateLoaderAbsoluteTemplate();
  }

  hideMapLoading() {
    // ... (method ini tetap sama)
    document.getElementById("map-loading-container").innerHTML = "";
  }

  showSubmitLoadingButton() {
    // ... (method ini tetap sama)
    document.getElementById(
      "submit-button-container"
    ).innerHTML = `<button class="btn" type="submit" disabled><i class="fas fa-spinner loader-button"></i> Bagikan Cerita Kamu</button>`;
  }

  hideSubmitLoadingButton() {
    // ... (method ini tetap sama)
    document.getElementById(
      "submit-button-container"
    ).innerHTML = `<button class="btn" type="submit">Bagikan Cerita Kamu</button>`;
  }
}
