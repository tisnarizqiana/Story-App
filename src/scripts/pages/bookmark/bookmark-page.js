// src/scripts/pages/bookmark/bookmark-page.js

import BookmarkPresenter from "./bookmark-presenter";
import {
  getStoriesFromIndexedDB,
  deleteStoryFromIndexedDB,
} from "../../data/indexed-db-helper";
import {
  generateStoryItemTemplate,
  generateStoryListEmptyTemplate,
  generateLoaderAbsoluteTemplate,
} from "../../templates";

class BookmarkPage {
  #presenter;

  constructor() {
    this.#presenter = new BookmarkPresenter({
      view: this,
      model: { getStoriesFromIndexedDB, deleteStoryFromIndexedDB },
    });
  }

  async render() {
    return `
      <section class="container">
        <h1 class="section-title">Cerita Tersimpan</h1>
        <div id="stories-list-container" class="stories-list__container">
            <div id="stories-list"></div>
            <div id="loading"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    await this.#presenter.showSavedStories();

    const storiesContainer = document.querySelector("#stories-list");
    storiesContainer.addEventListener("click", async (event) => {
      if (event.target.classList.contains("btn-delete-story")) {
        const storyId = event.target.dataset.storyId;
        await this.#presenter.deleteStory(storyId);
      }
    });
  }

  showLoading() {
    document.querySelector("#loading").innerHTML =
      generateLoaderAbsoluteTemplate();
  }

  hideLoading() {
    document.querySelector("#loading").innerHTML = "";
  }

  displayStories(stories) {
    const storiesContainer = document.querySelector("#stories-list");
    if (stories.length === 0) {
      storiesContainer.innerHTML = generateStoryListEmptyTemplate();
      return;
    }

    const storiesHtml = stories
      .map((story) => {
        const storyHtml = generateStoryItemTemplate(story);
        const storyElement = document.createElement("div");
        storyElement.innerHTML = storyHtml;

        const actions = storyElement.querySelector(".story-item__actions");
        if (actions) {
          // Ganti tombol Simpan dengan tombol Hapus
          actions.innerHTML = `<button class="btn btn-outline btn-delete-story" data-story-id="${story.id}">Hapus dari Tersimpan</button>`;
        }
        return storyElement.innerHTML;
      })
      .join("");

    storiesContainer.innerHTML = `<div class="stories-list">${storiesHtml}</div>`;
  }
}

export default BookmarkPage;
