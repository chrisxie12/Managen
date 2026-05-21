/**
 * Offline IndexedDB wrapper (no external dependencies)
 * Used by useSyncManager and sync.ts
 */

const DB_NAME = "schoolos-offline-db";
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("IndexedDB not available"));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      if (!database.objectStoreNames.contains("student_cache")) {
        database.createObjectStore("student_cache");
      }
      if (!database.objectStoreNames.contains("attendance_queue")) {
        const store = database.createObjectStore("attendance_queue", {
          keyPath: "id",
        });
        store.createIndex("by-date", "date", { unique: false });
      }
      if (!database.objectStoreNames.contains("sync_log")) {
        database.createObjectStore("sync_log", {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export const db = {
  // ─── Cache (Students & Classes, auth tokens) ────────────────────────────────
  async getCache(key: string): Promise<any> {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const tx = database.transaction("student_cache", "readonly");
      const req = tx.objectStore("student_cache").get(key);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => reject(req.error);
    });
  },

  async setCache(key: string, val: any): Promise<void> {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const tx = database.transaction("student_cache", "readwrite");
      tx.objectStore("student_cache").put(val, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  async deleteCache(key: string): Promise<void> {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const tx = database.transaction("student_cache", "readwrite");
      tx.objectStore("student_cache").delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  // ─── Attendance Queue ────────────────────────────────────────────────────────
  async addAttendance(record: any): Promise<string> {
    const database = await openDB();
    const r = {
      ...record,
      id: record.id || crypto.randomUUID(),
      synced: false,
      timestamp: Date.now(),
    };
    return new Promise((resolve, reject) => {
      const tx = database.transaction("attendance_queue", "readwrite");
      tx.objectStore("attendance_queue").put(r);
      tx.oncomplete = () => resolve(r.id);
      tx.onerror = () => reject(tx.error);
    });
  },

  async getQueue(): Promise<any[]> {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const tx = database.transaction("attendance_queue", "readonly");
      const req = tx.objectStore("attendance_queue").getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },

  async removeFromQueue(id: string): Promise<void> {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const tx = database.transaction("attendance_queue", "readwrite");
      tx.objectStore("attendance_queue").delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  async clearQueue(): Promise<void> {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const tx = database.transaction("attendance_queue", "readwrite");
      tx.objectStore("attendance_queue").clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  async removeOldQueue(daysOld = 30): Promise<void> {
    const queue = await db.getQueue();
    const cutoff = Date.now() - daysOld * 24 * 60 * 60 * 1000;
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const tx = database.transaction("attendance_queue", "readwrite");
      const store = tx.objectStore("attendance_queue");
      for (const record of queue) {
        if (record.timestamp < cutoff) store.delete(record.id);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  // ─── Sync Log ────────────────────────────────────────────────────────────────
  async logSync(
    action: string,
    records_count: number,
    status: "success" | "failed" | "conflict",
    error?: string
  ): Promise<void> {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const tx = database.transaction("sync_log", "readwrite");
      tx.objectStore("sync_log").add({
        action,
        records_count,
        status,
        error,
        timestamp: Date.now(),
      });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  async getSyncLogs(limit = 50): Promise<any[]> {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const tx = database.transaction("sync_log", "readonly");
      const req = tx.objectStore("sync_log").getAll();
      req.onsuccess = () => {
        const logs = req.result;
        resolve(
          logs.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit)
        );
      };
      req.onerror = () => reject(req.error);
    });
  },
};
