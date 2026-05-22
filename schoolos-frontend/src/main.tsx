import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/react";
import * as Sentry from "@sentry/react";
import { registerSW } from "virtual:pwa-register";
import App from "./app/App.tsx";
import "./styles/index.css";

// Register Service Worker
if ('serviceWorker' in navigator) {
  registerSW({ immediate: true });
}

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: import.meta.env.MODE || "development",
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({ maskAllText: false, blockAllMedia: false }),
      Sentry.httpClientIntegration(),
    ],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <Sentry.ErrorBoundary fallback={<SentryErrorFallback />}>
        <App />
      </Sentry.ErrorBoundary>
    </ClerkProvider>
  </StrictMode>
);

function SentryErrorFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ background: "#F8F9FA" }}>
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold mb-2" style={{ color: "#0A2472", fontFamily: "'Playfair Display', serif" }}>Something went wrong</h1>
        <p className="text-sm mb-4" style={{ color: "#6B7280" }}>An unexpected error occurred. Our team has been notified.</p>
        <button onClick={() => window.location.reload()}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: "#0A2472" }}>
          Reload Page
        </button>
      </div>
    </div>
  );
}
