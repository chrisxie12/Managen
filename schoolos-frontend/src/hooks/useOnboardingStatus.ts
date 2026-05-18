import { useState, useEffect, useCallback } from "react";
import { api } from "../app/services/api";

const STORAGE_KEY_PREFIX = "schoolos_onboarding_";

export function useOnboardingStatus(schoolId?: string) {
  const [onboardingCompleted, setOnboardingCompleted] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [metadata, setMetadata] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const checkStatus = useCallback(async () => {
    if (!schoolId) { setLoading(false); return; }
    const cacheKey = `${STORAGE_KEY_PREFIX}${schoolId}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.onboarding_completed) {
          setOnboardingCompleted(true);
          setLoading(false);
          return;
        }
      } catch {}
    }
    try {
      const res = await api.get<any>("/api/school/onboarding/status");
      const data = res.data || {};
      setOnboardingCompleted(data.onboarding_completed === true);
      setCurrentStep(data.current_step ?? 0);
      setMetadata(data.metadata || null);
      localStorage.setItem(cacheKey, JSON.stringify({ onboarding_completed: data.onboarding_completed, current_step: data.current_step, metadata: data.metadata }));
    } catch {
      setOnboardingCompleted(true);
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  const clearCache = useCallback(() => {
    if (schoolId) localStorage.removeItem(`${STORAGE_KEY_PREFIX}${schoolId}`);
  }, [schoolId]);

  useEffect(() => { checkStatus(); }, [checkStatus]);

  return { onboardingCompleted, currentStep, metadata, loading, refetch: checkStatus, clearCache };
}
