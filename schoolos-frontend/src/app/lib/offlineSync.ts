const DB_NAME = "schoolos-offline";
const DB_VERSION = 1;
const STORE_NAME = "sync-queue";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
        store.createIndex("type", "type", { unique: false });
        store.createIndex("status", "status", { unique: false });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export interface SyncItem {
  id?: number;
  type: "attendance" | "fee-payment";
  payload: unknown;
  status: "pending" | "syncing" | "failed";
  createdAt: string;
  retryCount: number;
  error?: string;
}

export async function addToSyncQueue(type: SyncItem["type"], payload: unknown): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).add({
      type,
      payload,
      status: "pending",
      createdAt: new Date().toISOString(),
      retryCount: 0,
    } satisfies Omit<SyncItem, "id">);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(new Error("Transaction aborted"));
  });
}

export async function getPendingSyncItems(): Promise<SyncItem[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const index = tx.objectStore(STORE_NAME).index("status");
    const request = index.getAll("pending");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function updateSyncItem(id: number, updates: Partial<SyncItem>): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const getRequest = store.get(id);
    getRequest.onsuccess = () => {
      const item = getRequest.result;
      if (!item) { resolve(); return; }
      store.put({ ...item, ...updates });
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function removeSyncItem(id: number): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function processSyncQueue(
  onSyncItem?: (item: SyncItem) => Promise<void>,
  onProgress?: (completed: number, total: number) => void,
): Promise<{ synced: number; failed: number }> {
  const items = await getPendingSyncItems();
  if (items.length === 0) return { synced: 0, failed: 0 };

  let synced = 0;
  let failed = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    await updateSyncItem(item.id!, { status: "syncing" });

    try {
      if (onSyncItem) {
        await onSyncItem(item);
      }
      await removeSyncItem(item.id!);
      synced++;
    } catch (err: any) {
      failed++;
      const retryCount = item.retryCount + 1;
      if (retryCount >= 3) {
        await updateSyncItem(item.id!, { status: "failed", retryCount, error: err.message });
      } else {
        await updateSyncItem(item.id!, { status: "pending", retryCount, error: err.message });
      }
    }

    if (onProgress) onProgress(synced + failed, items.length);
  }

  return { synced, failed };
}
