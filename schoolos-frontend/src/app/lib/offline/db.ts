/**
 * Offline IndexedDB wrapper for SchoolOS
 * Stores: student_cache, attendance_queue, sync_log, kv_cache (auth tokens, misc)
 */

const DB_NAME = "schoolos-idb";
const DB_VERSION = 2;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      if (!database.objectStoreNames.contains("student_cache")) {
        database.createObjectStore("student_cache", { keyPath: "id" });
      }
      if (!database.objectStoreNames.contains("attendance_queue")) {
        const store = database.createObjectStore("attendance_queue", {
          keyPath: "id",
          autoIncrement: true,
        });
        store.createIndex("status", "status", { unique: false });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
      if (!database.objectStoreNames.contains("sync_log")) {
        const store = database.createObjectStore("sync_log", {
          keyPath: "id",
          autoIncrement: true,
        });
        store.createIndex("timestamp", "timestamp", { unique: false });
      }
      if (!database.objectStoreNames.contains("kv_cache")) {
        database.createObjectStore("kv_cache", { keyPath: "key" });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// ─── KV Cache (auth tokens, misc) ─────────────────────────────────────────────

export async function setCache(key: string, value: string): Promise<void> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction("kv_cache", "readwrite");
    tx.objectStore("kv_cache").put({ key, value, updatedAt: Date.now() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getCache(key: string): Promise<string | null> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction("kv_cache", "readonly");
    const req = tx.objectStore("kv_cache").get(key);
    req.onsuccess = () => resolve(req.result?.value ?? null);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteCache(key: string): Promise<void> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction("kv_cache", "readwrite");
    tx.objectStore("kv_cache").delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ─── Student Cache ─────────────────────────────────────────────────────────────

export async function cacheStudents(students: any[]): Promise<void> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction("student_cache", "readwrite");
    const store = tx.objectStore("student_cache");
    students.forEach((s) => store.put(s));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getCachedStudents(): Promise<any[]> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction("student_cache", "readonly");
    const req = tx.objectStore("student_cache").getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// ─── Attendance Queue ──────────────────────────────────────────────────────────

export interface AttendanceQueueItem {
  id?: number;
  classId: string;
  date: string;
  records: any[];
  status: "pending" | "syncing" | "synced" | "failed";
  createdAt: string;
  retryCount: number;
  error?: string;
}

export async function enqueueAttendance(
  classId: string,
  date: string,
  records: any[]
): Promise<void> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction("attendance_queue", "readwrite");
    tx.objectStore("attendance_queue").add({
      classId,
      date,
      records,
      status: "pending",
      createdAt: new Date().toISOString(),
      retryCount: 0,
    } satisfies Omit<AttendanceQueueItem, "id">);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getPendingAttendance(): Promise<AttendanceQueueItem[]> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction("attendance_queue", "readonly");
    const req = tx.objectStore("attendance_queue").index("status").getAll("pending");
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function updateAttendanceQueueItem(
  id: number,
  updates: Partial<AttendanceQueueItem>
): Promise<void> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction("attendance_queue", "readwrite");
    const store = tx.objectStore("attendance_queue");
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      const item = getReq.result;
      if (item) store.put({ ...item, ...updates });
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function removeAttendanceQueueItem(id: number): Promise<void> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction("attendance_queue", "readwrite");
    tx.objectStore("attendance_queue").delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ─── Sync Log ──────────────────────────────────────────────────────────────────

export async function logSync(entry: {
  type: string;
  status: "success" | "failed";
  count: number;
  message?: string;
}): Promise<void> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction("sync_log", "readwrite");
    tx.objectStore("sync_log").add({
      ...entry,
      timestamp: new Date().toISOString(),
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ─── Namespace export (used by api.ts as db.setCache / db.getCache) ───────────

export const db = {
  setCache,
  getCache,
  deleteCache,
  cacheStudents,
  getCachedStudents,
  enqueueAttendance,
  getPendingAttendance,
  updateAttendanceQueueItem,
  removeAttendanceQueueItem,
  logSync,
};

export default db;
