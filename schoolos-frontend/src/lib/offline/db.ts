import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface SchoolOSDB extends DBSchema {
  student_cache: {
    key: string; // "students_className" or "classes"
    value: any;
  };
  attendance_queue: {
    key: string; // uuid generated for local record
    value: {
      id: string;
      student_id: string;
      date: string;
      status: string;
      class_name: string;
      notes?: string;
      synced: false;
      timestamp: number;
    };
    indexes: { 'by-date': string };
  };
  sync_log: {
    key: number;
    value: {
      id: number;
      action: string;
      records_count: number;
      status: 'success' | 'failed' | 'conflict';
      error?: string;
      timestamp: number;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<SchoolOSDB>>;

if (typeof window !== 'undefined') {
  dbPromise = openDB<SchoolOSDB>('schoolos-offline-db', 1, {
    upgrade(db) {
      db.createObjectStore('student_cache');
      
      const attendanceStore = db.createObjectStore('attendance_queue', { keyPath: 'id' });
      attendanceStore.createIndex('by-date', 'date');
      
      db.createObjectStore('sync_log', { keyPath: 'id', autoIncrement: true });
    },
  });
}

export const db = {
  // --- CACHE (Students & Classes) ---
  async getCache(key: string) {
    return (await dbPromise).get('student_cache', key);
  },
  async setCache(key: string, val: any) {
    return (await dbPromise).put('student_cache', val, key);
  },

  // --- QUEUE (Attendance) ---
  async addAttendance(record: any) {
    const r = {
      ...record,
      id: record.id || crypto.randomUUID(),
      synced: false,
      timestamp: Date.now(),
    };
    await (await dbPromise).put('attendance_queue', r);
    return r.id;
  },
  async getQueue() {
    return (await dbPromise).getAll('attendance_queue');
  },
  async removeFromQueue(id: string) {
    return (await dbPromise).delete('attendance_queue', id);
  },
  async clearQueue() {
    return (await dbPromise).clear('attendance_queue');
  },
  async removeOldQueue(daysOld = 30) {
    const d = await this.getQueue();
    const cutoff = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
    const tx = (await dbPromise).transaction('attendance_queue', 'readwrite');
    for (const record of d) {
      if (record.timestamp < cutoff) {
        tx.store.delete(record.id);
      }
    }
    await tx.done;
  },

  // --- SYNC LOG ---
  async logSync(action: string, records_count: number, status: 'success' | 'failed' | 'conflict', error?: string) {
    return (await dbPromise).add('sync_log', {
      action,
      records_count,
      status,
      error,
      timestamp: Date.now()
    });
  },
  async getSyncLogs(limit = 50) {
    const logs = await (await dbPromise).getAll('sync_log');
    return logs.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
  }
};
