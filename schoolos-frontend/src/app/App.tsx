import * as Sentry from "@sentry/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "./contexts/AuthContext";
import { queryClient } from "./services/queryClient";

function SentryTestButton() {
  if (import.meta.env.PROD) return null;
  return (
    <button
      onClick={() => {
        console.log("Sentry DSN:", import.meta.env.VITE_SENTRY_DSN);
        console.log("Sentry initialized:", !!Sentry.getClient?.());
        const error = new Error("This is your first error!");
        Sentry.captureException(error);
      }}
      style={{
        position: "fixed", bottom: 16, right: 16, zIndex: 9999,
        padding: "10px 18px", borderRadius: 10, border: "1px solid #e2e8f0",
        background: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)",
        fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#ef4444",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      Break the world
    </button>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
        <SentryTestButton />
      </AuthProvider>
    </QueryClientProvider>
  );
}
