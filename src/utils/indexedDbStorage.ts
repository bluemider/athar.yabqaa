/**
 * Robust IndexedDB client-side persistent storage for Sheikh Kazim Al-Huraib platform.
 * Provides high-capacity, quota-free offline and reload storage for full site content and images.
 */
import { SiteContent } from '../types';

const DB_NAME = 'sheikh_platform_idb_v1';
const STORE_NAME = 'site_content_store';
const DB_VERSION = 1;
const CONTENT_KEY = 'latest_site_content';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save site content to IndexedDB without any 5MB quota restrictions
 */
export async function saveToIndexedDb(data: SiteContent): Promise<boolean> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(data, CONTENT_KEY);

      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
      transaction.oncomplete = () => db.close();
      transaction.onerror = () => resolve(false);
    });
  } catch (err) {
    console.warn('IndexedDB write notice:', err);
    return false;
  }
}

/**
 * Load site content from IndexedDB
 */
export async function loadFromIndexedDb(): Promise<SiteContent | null> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(CONTENT_KEY);

      request.onsuccess = () => {
        resolve(request.result || null);
      };
      request.onerror = () => resolve(null);
      transaction.oncomplete = () => db.close();
      transaction.onerror = () => resolve(null);
    });
  } catch (err) {
    console.warn('IndexedDB read notice:', err);
    return null;
  }
}
