import { useState, useEffect } from "react";
import { api } from "../app/services/api";

const isNative = typeof window !== "undefined" &&
  !!(window as any).Capacitor?.isNativePlatform?.();

interface FcmState {
  token: string | null;
  permission: "granted" | "denied" | "prompt" | null;
  isRegistered: boolean;
}

export function useFcmPush() {
  const [state, setState] = useState<FcmState>({
    token: null,
    permission: null,
    isRegistered: false,
  });

  useEffect(() => {
    if (!isNative) return;

    (async () => {
      try {
        const { PushNotifications } = await import("@capacitor/push-notifications");

        const permResult = await PushNotifications.requestPermissions();
        setState((prev) => ({ ...prev, permission: permResult.receive }));

        if (permResult.receive !== "granted") return;

        await PushNotifications.register();

        PushNotifications.addListener(
          "registration",
          async (token: { value: string }) => {
            setState((prev) => ({
              ...prev,
              token: token.value,
              isRegistered: true,
            }));
            try {
              await api.post("/api/school/push/subscribe", {
                fcmToken: token.value,
                platform: "capacitor",
              });
            } catch {
              /* token registration failed silently */
            }
          }
        );

        PushNotifications.addListener(
          "pushNotificationReceived",
          (_notification: any) => {
            /* foreground push — could show in-app toast here */
          }
        );

        PushNotifications.addListener(
          "pushNotificationActionPerformed",
          (action: any) => {
            const data = action.notification?.data || {};
            if (data.page) {
              window.location.hash = data.page;
            }
          }
        );
      } catch {
        /* push not available */
      }
    })();
  }, []);

  return state;
}
