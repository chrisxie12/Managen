import { db } from './db';
import { api } from '../../app/services/api';

export async function pingServer(): Promise<boolean> {
  try {
    const res = await fetch('/api/health'); // Assuming we have a health check
    return res.ok;
  } catch (err) {
    return false;
  }
}

export type SyncResult = {
  success: boolean;
  synced: number;
  conflicts: number;
  error?: string;
};

export async function processSyncQueue(): Promise<SyncResult> {
  if (!navigator.onLine) {
    return { success: false, synced: 0, conflicts: 0, error: 'Offline' };
  }

  const isOnline = await pingServer();
  if (!isOnline) {
    return { success: false, synced: 0, conflicts: 0, error: 'Server unreachable' };
  }

  const queue = await db.getQueue();
  if (queue.length === 0) {
    return { success: true, synced: 0, conflicts: 0 };
  }

  try {
    // Format for bulk endpoint
    const records = queue.map(r => ({
      student_id: r.student_id,
      date: r.date,
      status: r.status,
      class_name: r.class_name,
      notes: r.notes
    }));

    // Post to server
    const response = await api.post('/api/school/attendance/bulk', { records, from_offline_sync: true });
    
    // Check conflicts
    const data = response.data;
    const syncedCount = data?.inserted || 0;
    const conflictCount = data?.conflicts?.length || 0;

    // Delete synced records from queue (server handles conflict resolution by accepting latest server timestamp)
    for (const record of queue) {
      await db.removeFromQueue(record.id);
    }

    await db.logSync('attendance_bulk', queue.length, conflictCount > 0 ? 'conflict' : 'success');
    
    return { success: true, synced: syncedCount, conflicts: conflictCount };
  } catch (err: any) {
    const errMsg = err.response?.data?.error || err.message || 'Sync failed';
    await db.logSync('attendance_bulk', queue.length, 'failed', errMsg);
    return { success: false, synced: 0, conflicts: 0, error: errMsg };
  }
}
