import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";

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
  try {
    const res = await api.get<HealthStatus>("/health");
    const data = res.data;

    if (!data) {
      return {
        momo: { status: "error", latency_ms: 0 },
        whatsapp: { status: "error", latency_ms: 0 },
        db: false,
        redis: "error",
        timestamp: new Date().toISOString(),
      };
    }

    return {
      momo: data.momo ?? { status: "unknown", latency_ms: 0 },
      whatsapp: data.whatsapp ?? { status: "unknown", latency_ms: 0 },
      db: (data as any)?.db === true || (data as any)?.data?.db === true,
      redis: (data as any)?.redis || (data as any)?.data?.redis || "unknown",
      timestamp: (data as any)?.timestamp || new Date().toISOString(),
    };
  } catch {
    return {
      momo: { status: "error", latency_ms: 0 },
      whatsapp: { status: "error", latency_ms: 0 },
      db: false,
      redis: "error",
      timestamp: new Date().toISOString(),
    };
  }
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
