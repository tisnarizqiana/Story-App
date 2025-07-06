import { openDB } from "idb"; // Akan diinstal di langkah berikutnya

const DATABASE_NAME = "story-app-db";
const DATABASE_VERSION = 1;
const OBJECT_STORE_NAME = "stories";

const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade(database) {
    database.createObjectStore(OBJECT_STORE_NAME, { keyPath: "id" });
  },
});

export const getStoriesFromIndexedDB = async () => {
  const db = await dbPromise;
  return db.getAll(OBJECT_STORE_NAME);
};

export const addStoryToIndexedDB = async (story) => {
  const db = await dbPromise;
  return db.add(OBJECT_STORE_NAME, story);
};

export const putStoryToIndexedDB = async (story) => {
  const db = await dbPromise;
  return db.put(OBJECT_STORE_NAME, story);
};

export const deleteStoryFromIndexedDB = async (id) => {
  const db = await dbPromise;
  return db.delete(OBJECT_STORE_NAME, id);
};
