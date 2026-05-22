import { useQuery } from "@tanstack/react-query";

export interface ServiceHealth {
  status: "active" | "error" | "unknown";
  latency_ms: number;
}

export interface HealthStatus {
  momo: ServiceHealth;
  whatsapp: ServiceHealth;
  db: boolean;
  redis: string;
  timestamp: string;
}

async function fetchHealth(): Promise<HealthStatus> {
  const res = await fetch("/health", { cache: "no-store" });

  if (!res.ok) {
    return {
      momo: { status: "error", latency_ms: 0 },
      whatsapp: { status: "error", latency_ms: 0 },
      db: false,
      redis: "error",
      timestamp: new Date().toISOString(),
    };
  }

  const data = await res.json();

  // New shape: { momo: {status, latency_ms}, whatsapp: {status, latency_ms}, data: {...} }
  // Legacy shape: { status, data: { db, redis, ... } }
  return {
    momo: data.momo ?? { status: data.status === "ok" ? "active" : "error", latency_ms: 0 },
    whatsapp: data.whatsapp ?? { status: data.status === "ok" ? "active" : "error", latency_ms: 0 },
    db: data.data?.db === true,
    redis: data.data?.redis || "unknown",
    timestamp: data.data?.timestamp
      ? new Date(data.data.timestamp).toISOString()
      : new Date().toISOString(),
  };
}

export function useHealthStatus() {
  return useQuery<HealthStatus>({
    queryKey: ["health-status"],
    queryFn: fetchHealth,
    refetchInterval: 30_000,  // poll every 30s
    staleTime: 25_000,
    retry: 1,
    // Keep last known value visible during revalidation (no flash)
    placeholderData: (prev) => prev,
  });
}
