import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";

type ShortcutMap = Record<string, () => void>;

const SEQUENCE_TIMEOUT = 500;

export function useKeyboardShortcuts() {
  const navigate = useNavigate();
  const bufferRef = useRef<string[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const shortcuts: ShortcutMap = {
    "g,d": () => navigate("/dashboard"),
    "g,s": () => navigate("/dashboard/students"),
    "g,a": () => navigate("/dashboard/attendance"),
    "g,t": () => navigate("/dashboard/staff"),
    "g,f": () => navigate("/dashboard/fees"),
    "g,g": () => navigate("/dashboard/gradebook"),
    "g,r": () => navigate("/dashboard/reports"),
    "g,c": () => navigate("/dashboard/communication"),
    "g,o": () => navigate("/dashboard/settings"),
    "g,n": () => navigate("/dashboard/notifications"),
    "g,i": () => navigate("/dashboard/inbox"),
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) {
        return;
      }

      bufferRef.current.push(e.key.toLowerCase());
      if (timerRef.current) clearTimeout(timerRef.current);

      const combo = bufferRef.current.join(",");
      const handlerFn = shortcuts[combo];
      if (handlerFn) {
        handlerFn();
        bufferRef.current = [];
        if (timerRef.current) clearTimeout(timerRef.current);
        return;
      }

      timerRef.current = setTimeout(() => {
        bufferRef.current = [];
      }, SEQUENCE_TIMEOUT);
    };

    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [navigate]);
}
