# Parent Mobile App — Capacitor Wrapper Design

## Goal
Wrap the existing Managen React PWA in a Capacitor native shell to distribute the parent portal on the Apple App Store and Google Play Store. Reuse 100% of existing web code. Add native push notifications (FCM) and biometric authentication via Capacitor plugins.

## Status
Approved by the user on 2026-05-20.

---

## Architecture

```
schoolos-frontend/            ← existing Vite + React app (unchanged)
├── capacitor.config.ts       ← NEW: Capacitor project config
├── ios/                      ← GENERATED: Xcode workspace (gitignored)
├── android/                  ← GENERATED: Android Studio project (gitignored)
└── src/
    ├── app/
    │   └── pages/parent/     ← EXISTING: used as the app content
    │       ├── ParentLayout.tsx
    │       ├── ParentHome.tsx
    │       ├── ParentChild.tsx
    │       ├── ParentFees.tsx
    │       ├── ParentReports.tsx
    │       └── ParentProfile.tsx
    └── hooks/
        └── useBiometricAuth.ts   ← NEW: biometric auth hook
        └── useFcmPush.ts         ← NEW: FCM push hook
```

### Data Flow
```
[Capacitor Native Shell]
  ├── @capacitor/biometric          → FaceID / TouchID / Fingerprint
  ├── @capacitor/push-notifications → FCM registration + incoming push
  ├── @capacitor/splash-screen      → branded splash on cold start
  └── @capacitor/status-bar         → navy status bar tint
        │
        ▼
[WebView: existing React app]
  ├── /parent/* routes              ← mobile-first, bottom tabs
  ├── Clerk session in SecureStore  ← persisted across app restarts
  └── Push subscription stored in   ← synced to backend
      IndexedDB (existing)
```

---

## Authentication Flow

### First launch
1. App loads → WebView shows React app → not authenticated → `/auth?mode=login`
2. User completes Clerk sign-in (web flow in WebView)
3. Clerk persists session to browser secure storage (same-origin)
4. App checks `@capacitor/biometric` is available → prompts "Enable FaceID?"
5. User preference saved to localStorage

### Subsequent launches
1. App loads → `useBiometricAuth` hook checks if biometric is enabled
2. If enabled → prompt biometric verification
3. On success → allow WebView to load authenticated React app (Clerk cookie still valid)
4. On failure → show native alert, allow fallback to PIN/password
5. If disabled → load WebView normally (existing cookie-based auth)

### Logout
1. User taps Sign Out in `ParentProfile.tsx`
2. Clerk session destroyed (existing flow)
3. `useBiometricAuth` clears biometric preference
4. App returns to login screen

---

## Push Notifications

### Setup
- Install `@capacitor/push-notifications` (wraps FCM on Android, APNs on iOS)
- Add `google-services.json` (Android) and `GoogleService-Info.plist` (iOS) to native projects
- Add FCM server key to backend (existing `/api/school/push/subscribe` endpoint updated)

### Client registration
1. App mounts → `useFcmPush` requests permission (iOS shows native dialog)
2. On grant → `PushNotifications.register()` → receives FCM token
3. Token sent to `/api/school/push/subscribe` (existing endpoint, now accepts FCM tokens)
4. On deny → fall back to Web Push (existing behavior in ParentProfile)

### Receiving a push
1. FCM push received while app is in background → native notification tray
2. User taps notification → app opens → `PushNotifications.addListener('pushNotificationActionPerformed')`
3. Payload contains `{ page: "/parent/fees", childId: "..." }` → deep link via React Router
4. FCM push received while app is in foreground → show in-app toast (same as existing `useRealtimeNotifications`)

### Server-side
- Update push dispatch to send FCM messages alongside (or replacing) VAPID push
- Payload structure: `{ notification: { title, body }, data: { page, childId } }`

---

## Native Configuration

### capacitor.config.ts
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

### Splash Screen
- Navy background (`#0A2472`)
- Centered white app logo
- Auto-hide after WebView fires `deviceready` event (or after 2s fallback)

### Status Bar
- iOS: dark content on light screens, tint matches navy theme
- Android: translucent navy background

---

## Build & Deploy

### Android
```bash
npm run build               # build PWA to dist/
npx cap sync android        # copy web assets to native project
npx cap open android        # open in Android Studio
# In Android Studio: Build → Generate Signed Bundle / APK
# Upload to Google Play Console
```

### iOS
```bash
npm run build               # build PWA to dist/
npx cap sync ios            # copy web assets to native project
npx cap open ios            # open in Xcode
# In Xcode: Product → Archive → Upload to App Store Connect
# Distribute via TestFlight → App Store
```

### CI (future)
- Add `npx cap sync` and native build steps to existing DigitalOcean pipeline
- Or use EAS Build (Expo) / App Center for cloud native builds

---

## Files Changed / Created

| File | Action | Purpose |
|------|--------|---------|
| `capacitor.config.ts` | CREATE | Capacitor project configuration |
| `src/hooks/useBiometricAuth.ts` | CREATE | Biometric prompt + session guard |
| `src/hooks/useFcmPush.ts` | CREATE | FCM registration + push handlers |
| `src/app/pages/parent/ParentProfile.tsx` | MODIFY | Add FCM token display, biometric toggle |
| `src/app/pages/parent/ParentLayout.tsx` | MODIFY | Initialize FCM + biometric on mount |
| `package.json` | MODIFY | Add Capacitor dependencies + build scripts |
| `vite.config.ts` | MODIFY | Set `base: './'` for relative asset paths in native |
| `ios/` | GENERATED | Xcode project (gitignored) |
| `android/` | GENERATED | Android Studio project (gitignored) |

---

## Not in Scope (v2)
- Bus tracking with GPS (needs driver app + WebSocket infra)
- Staff/Teacher native app
- Online exams (CBT) in-app (kept as web-only)
- In-app purchases / subscriptions
- Offline-first data sync (beyond existing IndexedDB queue)
- Push notification deep linking to specific child views (v1 links to parent page, user selects child)

---

## Rollback Plan
- `capacitor.config.ts` + `ios/` + `android/` are additive — removing them has zero impact on web functionality
- `useBiometricAuth.ts` and `useFcmPush.ts` are lazy-initialized hooks that no-op if Capacitor is not available
- The web app continues to work as a standalone PWA without the native shell
