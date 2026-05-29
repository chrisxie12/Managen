import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { toast } from "sonner";
import { api } from "../services/api";

type InAppNotification = {
  id: string;
  user_id: string;
  school_id: string;
  title: string;
  message: string | null;
  type: string;
  reference_id: string | null;
  reference_type: string | null;
  is_read: boolean;
  created_at: string;
};

export function useRealtimeNotifications(userId: string | undefined, schoolId: string | undefined) {
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>["channel"]> | null>(null);

  // Fetch initial notifications
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await api.get<{ data: { notifications: InAppNotification[]; total: number } }>(
        "/api/school/in-app-notifications"
      );
      setNotifications(res.data?.data?.notifications || []);
      setUnreadCount(res.data?.data?.notifications?.filter((n) => !n.is_read).length || 0);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await api.get<{ data: { count: number } }>(
        "/api/school/in-app-notifications/unread-count"
      );
      setUnreadCount(res.data?.data?.count || 0);
    } catch {
      // silent fail
    }
  }, [userId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Subscribe to Realtime
  useEffect(() => {
    if (!userId || !schoolId) return;

    let supabase: ReturnType<typeof createClient> | null = null;

    const setupRealtime = async () => {
      try {
        // Get a Supabase Realtime token from our backend
        const tokenRes = await api.get<{ data: { token: string; supabaseUrl: string } }>(
          "/api/school/realtime-token"
        );
        const { token, supabaseUrl } = tokenRes.data?.data || {};

        if (!token || !supabaseUrl) return;

        // Create Supabase client with the user-specific JWT
        supabase = createClient(supabaseUrl, token, {
          realtime: {
            params: {
              apikey: token,
            },
          },
          global: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        });

        const channel = supabase
          .channel("in-app-notifications")
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "notifications",
              filter: `user_id=eq.${userId}`,
            },
            (payload) => {
              const newNotif = payload.new as InAppNotification;
              setNotifications((prev) => [newNotif, ...prev]);
              setUnreadCount((prev) => prev + 1);

              // Show toast for new notifications
              toast(newNotif.title, {
                description: newNotif.message || undefined,
                duration: 5000,
              });
            }
          )
          .subscribe();

        channelRef.current = channel;
      } catch {
        // Realtime setup failed — fall back to polling
      }
    };

    setupRealtime();

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
      if (supabase) {
        supabase.removeAllChannels();
      }
    };
  }, [userId, schoolId]);

  // Poll unread count every 30s as fallback
  useEffect(() => {
    if (!userId) return;
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await api.put(`/api/school/in-app-notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // silent fail
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await api.put("/api/school/in-app-notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {
      // silent fail
    }
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
  };
}
