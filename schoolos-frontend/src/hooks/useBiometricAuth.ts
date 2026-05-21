import { useState, useEffect, useCallback } from "react";
import type { BiometryType } from "@capgo/capacitor-native-biometric";

const STORAGE_KEY = "managen_biometric_enabled";
const isNative = typeof window !== "undefined" &&
  !!(window as any).Capacitor?.isNativePlatform?.();

interface BiometricState {
  isAvailable: boolean;
  isEnabled: boolean;
  biometryType: BiometryType | null;
  isLoading: boolean;
}

export function useBiometricAuth() {
  const [state, setState] = useState<BiometricState>({
    isAvailable: false,
    isEnabled: localStorage.getItem(STORAGE_KEY) === "true",
    biometryType: null,
    isLoading: true,
  });

  useEffect(() => {
    if (!isNative) {
      setState((prev) => ({ ...prev, isLoading: false }));
      return;
    }
    (async () => {
      try {
        const { NativeBiometric } = await import("@capgo/capacitor-native-biometric");
        const result = await NativeBiometric.isAvailable();
        setState((prev) => ({
          ...prev,
          isAvailable: result.isAvailable,
          biometryType: result.biometryType,
          isLoading: false,
        }));
      } catch {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    })();
  }, []);

  const authenticate = useCallback(async (): Promise<boolean> => {
    if (!isNative || !state.isAvailable) return false;
    try {
      const { NativeBiometric } = await import("@capgo/capacitor-native-biometric");
      await NativeBiometric.verifyIdentity({
        reason: "Authenticate to access Managen",
        title: "Biometric Login",
        subtitle: "Use your fingerprint or face to log in",
      });
      return true;
    } catch {
      return false;
    }
  }, [state.isAvailable]);

  const setEnabled = useCallback(async (enabled: boolean) => {
    localStorage.setItem(STORAGE_KEY, String(enabled));
    setState((prev) => ({ ...prev, isEnabled: enabled }));
  }, []);

  return {
    ...state,
    authenticate,
    setEnabled,
  };
}
