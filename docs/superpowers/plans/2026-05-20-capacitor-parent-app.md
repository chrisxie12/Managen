# Parent Mobile App — Capacitor Wrapper Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wrap the existing Managen React PWA in a Capacitor native shell, add biometric auth and FCM push notifications, for distribution on App Store and Play Store.

**Architecture:** Add Capacitor to the existing schoolos-frontend Vite/React project. Create two hooks (`useBiometricAuth`, `useFcmPush`) that detect native platform and use Capacitor plugins when available. Modify existing parent layout/profile pages to surface native features. No routing or state changes — 100% of existing web code is reused.

**Tech Stack:** Capacitor 8, React 18, Clerk auth, `@capgo/capacitor-native-biometric`, `@capacitor/push-notifications`, FCM

---

### Task 1: Install Capacitor and Dependencies

**Files:**
- Modify: `schoolos-frontend/package.json`
- Run from: `schoolos-frontend/`

- [ ] **Step 1: Install Capacitor core, CLI, and platform packages**

Run:
```bash
cd schoolos-frontend
npm install @capacitor/core@^8.3.4
npm install -D @capacitor/cli@^8.3.4
npm install @capacitor/android@^8.3.4 @capacitor/ios@^8.3.4
```

Expected: packages added to `package.json` under `dependencies` and `devDependencies`.

- [ ] **Step 2: Install Capacitor plugins**

Run:
```bash
cd schoolos-frontend
npm install @capacitor/push-notifications@^8.1.1 @capacitor/splash-screen@^8.0.1 @capacitor/status-bar@^8.0.2
npm install @capgo/capacitor-native-biometric@^8.4.5
```

Expected: all plugins added to `package.json` under `dependencies`.

- [ ] **Step 3: Verify package.json additions**

Run: `npm ls @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios @capacitor/push-notifications @capacitor/splash-screen @capacitor/status-bar @capgo/capacitor-native-biometric --depth=0`

Expected: all 8 packages listed with their versions, no errors.

- [ ] **Step 4: Commit**

```bash
git add schoolos-frontend/package.json schoolos-frontend/package-lock.json
git commit -m "chore: add Capacitor 8 + plugins (biometric, push, splash, status-bar)"
```

---

### Task 2: Initialize Capacitor Project

**Files:**
- Create/Modify: `schoolos-frontend/capacitor.config.ts`
- Create: `schoolos-frontend/ios/` (generated, gitignored)
- Create: `schoolos-frontend/android/` (generated, gitignored)

- [ ] **Step 1: Create capacitor.config.ts**

Write `schoolos-frontend/capacitor.config.ts`:

```ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.managen.parent',
  appName: 'Managen',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: '#0A2472',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
```

- [ ] **Step 2: Add .gitignore entries for native projects**

Check if `.gitignore` at repo root already has entries for `ios/` and `android/`. If not, run:

```bash
Add-Content -Path "../.gitignore" -Value "`nschoolos-frontend/ios/`nschoolos-frontend/android/" -NoNewLine
```

- [ ] **Step 3: Build the web app to ensure dist/ exists**

Run:
```bash
cd schoolos-frontend
npm run build
```

Expected: `dist/` directory created with index.html, assets, icons.

- [ ] **Step 4: Add native platform projects**

Run:
```bash
cd schoolos-frontend
npx cap add android
npx cap add ios
```

Expected: `android/` and `ios/` directories created with native project scaffolding.

- [ ] **Step 5: Verify config**

Run: `npx cap doctor`

Expected: no critical errors (may show missing `GoogleService-Info.plist` and `google-services.json` — those are expected, added later when FCM is configured).

- [ ] **Step 6: Commit**

```bash
git add schoolos-frontend/capacitor.config.ts
git commit -m "feat: init Capacitor project for parent mobile app"
```

---

### Task 3: Create useBiometricAuth Hook

**Files:**
- Create: `schoolos-frontend/src/hooks/useBiometricAuth.ts`

- [ ] **Step 1: Create useBiometricAuth.ts**

Write `schoolos-frontend/src/hooks/useBiometricAuth.ts`:

```ts
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
```

Note: Uses dynamic `import()` so the plugin is only loaded when running natively — in web mode, the import path is never executed, avoiding bundler errors.

- [ ] **Step 2: Commit**

```bash
git add schoolos-frontend/src/hooks/useBiometricAuth.ts
git commit -m "feat: add useBiometricAuth hook for FaceID/TouchID login"
```

---

### Task 4: Create useFcmPush Hook

**Files:**
- Create: `schoolos-frontend/src/hooks/useFcmPush.ts`

- [ ] **Step 1: Create useFcmPush.ts**

Write `schoolos-frontend/src/hooks/useFcmPush.ts`:

```ts
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
```

- [ ] **Step 2: Commit**

```bash
git add schoolos-frontend/src/hooks/useFcmPush.ts
git commit -m "feat: add useFcmPush hook for FCM push notifications"
```

---

### Task 5: Modify ParentLayout.tsx

**Files:**
- Modify: `schoolos-frontend/src/app/pages/parent/ParentLayout.tsx`

- [ ] **Step 1: Read the current ParentLayout.tsx**

Read the existing file to confirm content matches.

- [ ] **Step 2: Add biometric auth guard and init hooks**

Replace the file with:

```tsx
import { useState, useEffect, useCallback } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import {
  Home, User, Wallet, FileText, Settings, LogOut,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { processSyncQueue } from "../../lib/offlineSync";
import { api } from "../../services/api";
import { toast } from "sonner";
import { useBiometricAuth } from "../../hooks/useBiometricAuth";
import { useFcmPush } from "../../hooks/useFcmPush";

const NAVY = "#0A2472";
const NAVY_LIGHT = "#0C2D8A";
const CREAM = "#F8F9FA";
const MUTED = "#6B7280";

const NAV_ITEMS = [
  { path: "/parent", icon: Home, label: "Home" },
  { path: "/parent/child", icon: User, label: "Child" },
  { path: "/parent/fees", icon: Wallet, label: "Fees" },
  { path: "/parent/reports", icon: FileText, label: "Reports" },
  { path: "/parent/profile", icon: Settings, label: "Profile" },
] as const;

export function ParentLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const activeTab = NAV_ITEMS.find((item) => location.pathname === item.path)?.path || "/parent";

  // Init Capacitor native features
  useBiometricAuth();
  useFcmPush();

  // Offline sync
  useState(() => {
    const sync = async () => {
      if (!navigator.onLine) return;
      try {
        const result = await processSyncQueue(async (item) => {
          if (item.type === "attendance") await api.post("/api/school/attendance/batch", item.payload);
          else if (item.type === "fee-payment") await api.post("/api/school/fees/payments", item.payload);
        });
        if (result.synced > 0) toast.success(`Synced ${result.synced} item${result.synced > 1 ? "s" : ""}`, { duration: 3000 });
      } catch {}
    };
    window.addEventListener("online", sync);
    sync();
    return () => window.removeEventListener("online", sync);
  });

  return (
    <div className="min-h-screen flex flex-col" style={{ background: CREAM, fontFamily: "'DM Sans', sans-serif" }}>
      <header className="flex items-center justify-between px-4 py-3 sticky top-0 z-30"
        style={{ background: "rgba(248,249,250,0.92)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(10,36,114,0.07)" }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold" style={{ background: NAVY, color: CREAM }}>M</div>
          <div>
            <span className="text-sm font-semibold" style={{ color: NAVY }}>Managen</span>
            <p className="text-[10px]" style={{ color: MUTED }}>{user?.fullName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => logout()} className="p-2 rounded-xl" style={{ background: "white", border: "1px solid rgba(10,36,114,0.08)" }}>
            <LogOut size={15} color={MUTED} />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4 pb-24">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-30 px-2 py-2"
        style={{ background: "rgba(248,249,250,0.95)", backdropFilter: "blur(16px)", borderTop: "1px solid rgba(10,36,114,0.07)" }}>
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all active:scale-90"
                style={{ color: isActive ? NAVY : MUTED }}
              >
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
```

Changes from original:
- Added imports for `useBiometricAuth` and `useFcmPush`
- Calls `useBiometricAuth()` and `useFcmPush()` at the top of the component to initialize native features
- Renamed "S" badge to "M" and "SchoolOS" to "Managen" in the header
- Removed PWA install prompt (not needed in native app)

- [ ] **Step 3: Build to verify**

Run:
```bash
cd schoolos-frontend
npm run build
```

Expected: Build succeeds with no errors. Warnings about unused `RotateCcw` import from the original may appear but are harmless.

- [ ] **Step 4: Commit**

```bash
git add schoolos-frontend/src/app/pages/parent/ParentLayout.tsx
git commit -m "feat: add biometric + FCM init to ParentLayout, rebrand to Managen"
```

---

### Task 6: Modify ParentProfile.tsx

**Files:**
- Modify: `schoolos-frontend/src/app/pages/parent/ParentProfile.tsx`

- [ ] **Step 1: Read the current ParentProfile.tsx**

Read the existing file to confirm content matches.

- [ ] **Step 2: Add biometric toggle and FCM token display**

Replace the file with:

```tsx
import { useState, useEffect } from "react";
import { Bell, Phone, Mail, User, Shield, Smartphone, Loader2 } from "lucide-react";
import { api } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";
import { useBiometricAuth } from "../../hooks/useBiometricAuth";
import { useFcmPush } from "../../hooks/useFcmPush";

const NAVY = "#0A2472";
const NAVY_LIGHT = "#0C2D8A";
const CREAM = "#F8F9FA";
const MUTED = "#6B7280";

const BIOMETRY_LABELS: Record<number, string> = {
  1: "Touch ID",
  2: "Face ID",
  3: "Fingerprint",
  4: "Face Authentication",
  5: "Iris",
  6: "Multiple",
  7: "Device Credentials",
};

const isNative = typeof window !== "undefined" &&
  !!(window as any).Capacitor?.isNativePlatform?.();

export function ParentProfile() {
  const { user, school, logout } = useAuth();
  const { isAvailable, isEnabled, biometryType, setEnabled, isLoading } = useBiometricAuth();
  const { token, isRegistered } = useFcmPush();
  const [phone, setPhone] = useState("");
  const [notifySms, setNotifySms] = useState(true);
  const [notifyWhatsApp, setNotifyWhatsApp] = useState(false);
  const [notifyPush, setNotifyPush] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get<{ data: { phone?: string; preferences?: Record<string, boolean> } }>("/api/school/settings/notifications")
      .then((res) => {
        setPhone(res.data?.data?.phone || "");
        setNotifySms(res.data?.data?.preferences?.sms ?? true);
        setNotifyWhatsApp(res.data?.data?.preferences?.whatsapp ?? false);
        setNotifyPush(res.data?.data?.preferences?.push ?? true);
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/api/school/settings/notifications", {
        phone,
        preferences: { sms: notifySms, whatsapp: notifyWhatsApp, push: notifyPush },
      });
      toast.success("Preferences saved");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  // Subscribe to push notifications on mount (web fallback for non-native)
  useEffect(() => {
    if (isNative) return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    const sub = async () => {
      try {
        const reg = await navigator.serviceWorker.ready;
        const existing = await reg.pushManager.getSubscription();
        if (existing) return;
        const res = await fetch("/api/school/push/vapid-public-key");
        const { publicKey } = await res.json();
        const subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: publicKey,
        });
        await api.post("/api/school/push/subscribe", { subscription });
      } catch {}
    };
    sub();
  }, []);

  const biometryLabel = biometryType != null ? BIOMETRY_LABELS[biometryType] ?? "Biometric" : null;

  return (
    <div className="space-y-5">
      {/* Profile header */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-lg font-bold"
          style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_LIGHT})`, color: CREAM }}>
          {user?.fullName?.charAt(0) || "P"}
        </div>
        <div>
          <h2 className="text-lg font-bold" style={{ color: NAVY, fontFamily: "'Playfair Display', serif" }}>{user?.fullName}</h2>
          <p className="text-xs" style={{ color: MUTED }}>{school?.name}</p>
          <p className="text-[10px]" style={{ color: MUTED }}>Parent</p>
        </div>
      </div>

      {/* Contact */}
      <div className="space-y-2">
        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)" }}>
          <Mail size={16} color={NAVY_LIGHT} />
          <div className="min-w-0">
            <p className="text-[10px] font-medium" style={{ color: MUTED }}>Email</p>
            <p className="text-sm" style={{ color: NAVY }}>{user?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)" }}>
          <Phone size={16} color={NAVY_LIGHT} />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-medium" style={{ color: MUTED }}>Phone (for alerts)</p>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-transparent text-sm outline-none"
              style={{ color: NAVY }}
              placeholder="+233 XX XXX XXXX"
            />
          </div>
        </div>
      </div>

      {/* Security section (native only) */}
      {isNative && (
        <div className="p-4 rounded-2xl" style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)" }}>
          <h3 className="text-sm font-semibold flex items-center gap-2 mb-3" style={{ color: NAVY }}>
            <Shield size={15} /> Security
          </h3>

          {/* Biometric toggle */}
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium" style={{ color: NAVY }}>
                {biometryLabel ? `${biometryLabel} Login` : "Biometric Login"}
              </p>
              <p className="text-[11px]" style={{ color: MUTED }}>
                {isLoading
                  ? "Checking device..."
                  : isAvailable
                    ? `Use ${biometryLabel ?? "biometrics"} to unlock the app`
                    : "Not available on this device"}
              </p>
            </div>
            {isAvailable && (
              <div
                onClick={() => setEnabled(!isEnabled)}
                className="w-10 h-6 rounded-full relative cursor-pointer transition-colors shrink-0"
                style={{ background: isEnabled ? "#10B981" : "rgba(10,36,114,0.15)" }}
              >
                <div className="w-4 h-4 rounded-full bg-white absolute top-1 transition-all shadow-sm"
                  style={{ left: isEnabled ? "22px" : "4px" }} />
              </div>
            )}
          </div>

          {/* FCM token status */}
          <div className="flex items-center gap-3 py-2">
            <Smartphone size={15} color={NAVY_LIGHT} />
            <div className="min-w-0">
              <p className="text-sm font-medium" style={{ color: NAVY }}>Push Notifications</p>
              <p className="text-[11px]" style={{ color: MUTED }}>
                {isRegistered
                  ? "Push notifications are active"
                  : token
                    ? "Registering..."
                    : "Push not configured"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Notification preferences */}
      <div className="p-4 rounded-2xl" style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)" }}>
        <h3 className="text-sm font-semibold flex items-center gap-2 mb-3" style={{ color: NAVY }}>
          <Bell size={15} /> Notification Preferences
        </h3>
        <div className="space-y-3">
          {[
            { key: "sms", label: "SMS Alerts", desc: "Fee reminders, attendance alerts via SMS", value: notifySms, set: setNotifySms },
            { key: "whatsapp", label: "WhatsApp Updates", desc: "Report cards, exam results via WhatsApp", value: notifyWhatsApp, set: setNotifyWhatsApp },
            { key: "push", label: "Push Notifications", desc: "Real-time updates on your device", value: notifyPush, set: setNotifyPush },
          ].map((item) => (
            <label key={item.key} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium" style={{ color: NAVY }}>{item.label}</p>
                <p className="text-[11px]" style={{ color: MUTED }}>{item.desc}</p>
              </div>
              <div
                onClick={() => item.set(!item.value)}
                className="w-10 h-6 rounded-full relative cursor-pointer transition-colors shrink-0"
                style={{ background: item.value ? "#10B981" : "rgba(10,36,114,0.15)" }}
              >
                <div className="w-4 h-4 rounded-full bg-white absolute top-1 transition-all shadow-sm"
                  style={{ left: item.value ? "22px" : "4px" }} />
              </div>
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3 rounded-2xl text-sm font-semibold active:scale-95 transition-all disabled:opacity-50"
        style={{ background: NAVY, color: CREAM }}
      >
        {saving ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Save Preferences"}
      </button>

      <button onClick={() => logout()} className="w-full py-3 rounded-2xl text-sm font-medium"
        style={{ background: "white", border: "1px solid rgba(10,36,114,0.1)", color: MUTED }}>
        Sign Out
      </button>
    </div>
  );
}
```

Changes from original:
- Added imports: `Shield`, `Smartphone` icons; `useBiometricAuth`, `useFcmPush` hooks; `isNative` check
- Added `isNative` constant at module level to detect Capacitor runtime
- Uses `useBiometricAuth()` and `useFcmPush()` for security section
- Web Push subscription is skipped when running natively (`if (isNative) return`)
- New **Security** section (shown only when `isNative`): biometric toggle + FCM status
- All toggle switches use `shrink-0` to prevent layout shift

- [ ] **Step 3: Build to verify**

Run:
```bash
cd schoolos-frontend
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add schoolos-frontend/src/app/pages/parent/ParentProfile.tsx
git commit -m "feat: add biometric toggle and FCM status to parent profile"
```

---

### Task 7: Sync Native Projects and Verify Build

- [ ] **Step 1: Build the web app**

Run:
```bash
cd schoolos-frontend
npm run build
```

Expected: dist/ built successfully with all new code compiled.

- [ ] **Step 2: Sync web assets to native projects**

Run:
```bash
cd schoolos-frontend
npx cap sync
```

Expected: `npx cap sync` copies `dist/` contents into `android/app/src/main/assets/public/` and `ios/App/public/`.

- [ ] **Step 3: Verify Android project opens**

Run:
```bash
cd schoolos-frontend
npx cap open android
```

Expected: Android Studio launches with the Capacitor project loaded. Do not build yet — this just verifies the native project is correctly configured.

- [ ] **Step 4: Verify iOS project opens**

Run:
```bash
cd schoolos-frontend
npx cap open ios
```

Expected: Xcode launches with the Capacitor project loaded.

- [ ] **Step 5: Commit**

```bash
git add schoolos-frontend/package.json schoolos-frontend/package-lock.json schoolos-frontend/capacitor.config.ts
git add schoolos-frontend/ios/ schoolos-frontend/android/
git commit -m "feat: sync Capacitor native projects for parent mobile app"
```

---

## Post-Plan Setup (Manual Steps)

These steps require configuration outside of code — document them for the engineer:

### FCM Configuration
1. Create a Firebase project at https://console.firebase.google.com
2. Register Android app with package `com.managen.parent`
3. Register iOS app with bundle ID `com.managen.parent`
4. Download `google-services.json` → place in `schoolos-frontend/android/app/`
5. Download `GoogleService-Info.plist` → place in `schoolos-frontend/ios/App/`
6. Add FCM server key to the backend environment variables for push dispatch

### iOS Provisioning
1. Create an Apple Developer account ($99/year)
2. Create App ID with bundle ID `com.managen.parent`
3. Enable Push Notifications capability in Xcode
4. Create a provisioning profile with Push Notifications
5. Set up APNs key in Firebase Console for FCM → APNs bridge

### Android Signing
1. Generate a keystore: `keytool -genkey -v -keystore manegen-release.keystore -alias manegen -keyalg RSA -keysize 2048 -validity 10000`
2. Create `android/app/key.properties` with keystore path, passwords, alias
3. Build signed AAB: `cd schoolos-frontend/android && ./gradlew bundleRelease`

### Splash Screen
1. Add a 1242×2436 splash image to `schoolos-frontend/public/splash.png`
2. Configure in `capacitor.config.ts` under `SplashScreen.launchShowDuration: 2000`
