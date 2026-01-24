/**
 * db.js
 * Vanilla IndexedDB wrapper for ORBIT.
 * Handles persistence for heavy data (metrics, logs, timeLogs).
 */

const DB_NAME = 'orbit_db_v1';
const DB_VERSION = 1;

export const OrbitDB = {
  db: null,

  async init() {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = (event) => {
        console.error("IndexedDB error:", event.target.error);
        reject(event.target.error);
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Metrics Store
        if (!db.objectStoreNames.contains('metrics')) {
          db.createObjectStore('metrics', { keyPath: 'id' });
        }

        // Logs Store
        if (!db.objectStoreNames.contains('logs')) {
          const store = db.createObjectStore('logs', { keyPath: 'id' });
          store.createIndex('metricId', 'metricId', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // TimeLogs Store
        if (!db.objectStoreNames.contains('timeLogs')) {
            const store = db.createObjectStore('timeLogs', { keyPath: 'id' });
            store.createIndex('activityId', 'activityId', { unique: false });
            store.createIndex('startTime', 'startTime', { unique: false });
        }
      };
    });
  },

  async getAll(storeName) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async add(storeName, item) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(item);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async put(storeName, item) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put(item);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
  },

  async delete(storeName, id) {
      if (!this.db) await this.init();
      return new Promise((resolve, reject) => {
          const transaction = this.db.transaction([storeName], 'readwrite');
          const store = transaction.objectStore(storeName);
          const request = store.delete(id);

          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
      });
  },

  async clear(storeName) {
      if (!this.db) await this.init();
      return new Promise((resolve, reject) => {
          const transaction = this.db.transaction([storeName], 'readwrite');
          const store = transaction.objectStore(storeName);
          const request = store.clear();

          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
      });
  },

  async count(storeName) {
      if (!this.db) await this.init();
      return new Promise((resolve, reject) => {
          const transaction = this.db.transaction([storeName], 'readonly');
          const store = transaction.objectStore(storeName);
          const request = store.count();

          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
      });
  }
};
