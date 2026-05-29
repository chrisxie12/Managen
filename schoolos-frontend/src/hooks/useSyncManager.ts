import { useEffect, useState, useCallback } from 'react';
import { processSyncQueue, SyncResult } from '../lib/offline/sync';
import { db } from '../lib/offline/db';

export function useSyncManager() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastResult, setLastResult] = useState<SyncResult | null>(null);

  const updatePendingCount = useCallback(async () => {
    const queue = await db.getQueue();
    setPendingCount(queue.length);
  }, []);

  const [wifiOnly, setWifiOnly] = useState(false);

  useEffect(() => {
    db.getCache('wifi_only_sync').then(val => {
      if (val !== undefined) setWifiOnly(val);
    });
  }, []);

  const toggleWifiOnly = useCallback(async (val: boolean) => {
    setWifiOnly(val);
    await db.setCache('wifi_only_sync', val);
  }, []);

  const triggerSync = useCallback(async (manual = false) => {
    if (syncing) return;
    
    // Check Wifi only setting
    if (!manual && wifiOnly) {
      // @ts-ignore
      const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (conn && conn.type !== 'wifi') {
        return; // Skip auto-sync if not on wifi
      }
    }

    const queue = await db.getQueue();
    if (queue.length === 0) return;

    setSyncing(true);
    try {
      const result = await processSyncQueue();
      setLastResult(result);
      if (result.success) {
        await updatePendingCount();
      }
    } finally {
      setSyncing(false);
    }
  }, [syncing, updatePendingCount]);

  useEffect(() => {
    updatePendingCount();

    const handleOnline = () => {
      setIsOnline(true);
      triggerSync(); // 2. window.online event (hint only)
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 3. App mount trigger
    if (navigator.onLine) {
      triggerSync();
    }

    // 1. Background Sync API registration (if supported)
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready.then(reg => {
        // @ts-ignore
        reg.sync.register('sync-attendance').catch(console.error);
      });
    }

    // Retry failed sync every 5 minutes
    const retryInterval = setInterval(() => {
      if (navigator.onLine) {
        triggerSync();
      }
    }, 5 * 60 * 1000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(retryInterval);
    };
  }, [triggerSync, updatePendingCount]);

  // Expose a method to manually refresh the count (used when records are added offline)
  return {
    isOnline,
    syncing,
    pendingCount,
    lastResult,
    wifiOnly,
    toggleWifiOnly,
    triggerSync, // 4. Manual "Sync Now" trigger
    refreshQueue: updatePendingCount,
    clearResult: () => setLastResult(null)
  };
}
