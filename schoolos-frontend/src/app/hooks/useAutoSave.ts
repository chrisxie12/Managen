import { useEffect, useRef, useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";

interface UseAutoSaveOptions<T> {
  key: string;
  data: T;
  interval?: number;
  enabled?: boolean;
}

export function useAutoSave<T>({ key, data, interval = 30000, enabled = true }: UseAutoSaveOptions<T>) {
  const [savedDraft, setSavedDraft, clearDraft] = useLocalStorage<T | null>(key, null);
  const prevRef = useRef(data);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  useEffect(() => {
    if (!enabledRef.current) return;
    const id = setInterval(() => {
      if (JSON.stringify(prevRef.current) !== JSON.stringify(data)) {
        setSavedDraft(data);
        prevRef.current = data;
      }
    }, interval);
    return () => clearInterval(id);
  }, [key, data, interval, setSavedDraft]);

  const restoreDraft = useCallback((): T | null => {
    return savedDraft;
  }, [savedDraft]);

  const discardDraft = useCallback(() => {
    clearDraft();
  }, [clearDraft]);

  return { hasDraft: savedDraft !== null, restoreDraft, discardDraft };
}
