import { useEffect, useRef, useState, useCallback } from "react";
import { createClient, RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "../services/api";

type RealtimeConfig = {
  schoolId: string;
  userId: string;
};

type TableConfig = {
  table: string;
  filter?: string;
  queryKeys: string[][];
  onInsert?: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void;
};

export function useRealtime({ schoolId, userId }: RealtimeConfig) {
  const queryClient = useQueryClient();
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>["channel"]> | null>(null);
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  const [connected, setConnected] = useState(false);

  const tables: TableConfig[] = [
    {
      table: "fee_payments",
      filter: `school_id=eq.${schoolId}`,
      queryKeys: [["dashboard"], ["fee-summary"], ["fee-payments"]],
      onInsert: (payload) => {
        const record = payload.new as Record<string, unknown>;
        const name = (record.student_name as string) || "A student";
        const amount = record.amount as number;
        if (amount) {
          toast.success(`New fee payment: GHS ${(amount / 100).toLocaleString()} from ${name}`, { duration: 5000 });
        }
      },
    },
    {
      table: "attendance_records",
      filter: `school_id=eq.${schoolId}`,
      queryKeys: [["dashboard"], ["attendance"]],
      onInsert: () => {
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      },
    },
    {
      table: "communications",
      filter: `school_id=eq.${schoolId}`,
      queryKeys: [["communications"], ["dashboard"]],
      onInsert: (payload) => {
        const record = payload.new as Record<string, unknown>;
        toast.info(`SMS sent: ${(record.subject as string) || "Bulk message"}`, { duration: 4000 });
      },
    },
  ];

  const invalidateAll = useCallback(() => {
    for (const t of tables) {
      for (const key of t.queryKeys) {
        queryClient.invalidateQueries({ queryKey: key });
      }
    }
  }, [queryClient]);

  useEffect(() => {
    if (!schoolId || !userId) return;

    let cancelled = false;

    const setup = async () => {
      try {
        const tokenRes = await api.get<{ data: { token: string; supabaseUrl: string } }>("/api/school/realtime-token");
        const { token, supabaseUrl } = tokenRes.data?.data || {};
        if (!token || !supabaseUrl || cancelled) return;

        const supabase = createClient(supabaseUrl, token, {
          realtime: { params: { apikey: token } },
          global: { headers: { Authorization: `Bearer ${token}` } },
        });
        supabaseRef.current = supabase;

        const channel = supabase.channel("live-dashboard");

        for (const t of tables) {
          channel.on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: t.table, filter: t.filter },
            (payload) => {
              invalidateAll();
              t.onInsert?.(payload);
            },
          );
        }

        channel.subscribe((status) => {
          if (!cancelled) setConnected(status === "SUBSCRIBED");
        });

        channelRef.current = channel;
      } catch {
        if (!cancelled) setConnected(false);
      }
    };

    setup();

    return () => {
      cancelled = true;
      setConnected(false);
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
      if (supabaseRef.current) {
        supabaseRef.current.removeAllChannels();
        supabaseRef.current = null;
      }
    };
  }, [schoolId, userId, invalidateAll]);

  return { connected };
}
