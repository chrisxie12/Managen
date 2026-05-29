import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import { Search, Users, GraduationCap, Building2, FileText, X, Clock } from "lucide-react";
import { api } from "../../services/api";

const NAVY = "#0A2472";
const NAVY_LIGHT = "#0C2D8A";
const CREAM = "#F8F9FA";
const MUTED = "#6B7280";

interface SearchResult {
  id: string;
  type: "student" | "staff" | "class" | "invoice";
  label: string;
  subtitle: string;
  path: string;
}

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
}

export function GlobalSearch({ open, onClose }: GlobalSearchProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const focusTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      focusTimeoutRef.current = setTimeout(() => inputRef.current?.focus(), 100);
      const stored = localStorage.getItem("schoolos-recent-searches");
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as SearchResult[];
          setRecent(parsed.slice(0, 5));
        } catch { /* ignore */ }
      }
    }
    return () => {
      if (focusTimeoutRef.current) clearTimeout(focusTimeoutRef.current);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  const safeSearchFetch = async <T,>(url: string): Promise<T | null> => {
    try {
      const res = await api.get<T>(url);
      return res.data ?? null;
    } catch {
      return null;
    }
  };

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const [studentsRes, staffRes, classesRes] = await Promise.all([
        safeSearchFetch<{ data: { students: { id: string; name: string; admission_no?: string; class_name?: string }[] } }>(
          `/api/school/students?search=${encodeURIComponent(q)}&limit=5`,
        ),
        safeSearchFetch<{ data: { teachers: { id: string; name: string; email?: string }[] } }>(
          `/api/school/teachers?search=${encodeURIComponent(q)}&limit=5`,
        ),
        safeSearchFetch<{ data: { classes: { id?: string; name: string }[] } }>(
          `/api/school/classes?search=${encodeURIComponent(q)}&limit=5`,
        ),
      ]);

      const items: SearchResult[] = [];

      const students = studentsRes?.data?.students || [];
      students.forEach((s) => {
        items.push({
          id: `student-${s.id}`,
          type: "student",
          label: s.name,
          subtitle: s.admission_no ? `Roll #${s.admission_no}` : s.class_name || "Student",
          path: `/dashboard/student/details/${s.id}`,
        });
      });

      const staff = staffRes?.data?.teachers || [];
      staff.forEach((t) => {
        items.push({
          id: `staff-${t.id}`,
          type: "staff",
          label: t.name,
          subtitle: t.email || "Staff",
          path: "/dashboard/staff",
        });
      });

      const classes = classesRes?.data?.classes || [];
      classes.forEach((c) => {
        items.push({
          id: `class-${c.id || c.name}`,
          type: "class",
          label: c.name,
          subtitle: "Class",
          path: `/dashboard/students?class=${encodeURIComponent(c.name)}`,
        });
      });

      setResults(items);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (query.trim()) {
      searchTimeoutRef.current = setTimeout(() => doSearch(query), 300);
    } else {
      setResults([]);
    }
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [query, doSearch]);

  const handleSelect = (item: SearchResult) => {
    const stored = localStorage.getItem("schoolos-recent-searches");
    let recentList: SearchResult[] = [];
    try {
      recentList = stored ? JSON.parse(stored) : [];
    } catch { /* ignore */ }
    recentList = [item, ...recentList.filter((r) => r.id !== item.id)].slice(0, 10);
    localStorage.setItem("schoolos-recent-searches", JSON.stringify(recentList));
    onClose();
    navigate(item.path);
  };

  const typeIcon = (type: string) => {
    switch (type) {
      case "student": return <Users size={14} color={NAVY} />;
      case "staff": return <GraduationCap size={14} color={NAVY} />;
      case "class": return <Building2 size={14} color={NAVY} />;
      default: return <FileText size={14} color={NAVY} />;
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className="relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: "white", border: "1px solid rgba(10,36,114,0.1)" }}
      >
        <div
          className="flex items-center gap-3 px-4 py-3"
          style={{ borderBottom: "1px solid rgba(10,36,114,0.07)" }}
        >
          <Search size={16} color={MUTED} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search students, staff, classes..."
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: NAVY }}
          />
          {query && (
            <button onClick={() => setQuery("")}>
              <X size={16} color={MUTED} />
            </button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto">
          {loading && (
            <div className="text-center py-8 text-sm" style={{ color: MUTED }}>
              Searching...
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="text-center py-8 text-sm" style={{ color: MUTED }}>
              No results found
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="py-2">
              {results.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:opacity-80 transition-colors"
                  style={{ color: NAVY }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${NAVY}10` }}
                  >
                    {typeIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{item.label}</div>
                    <div className="text-xs truncate" style={{ color: MUTED }}>{item.subtitle}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {!query && recent.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-2 flex items-center gap-2 text-xs font-medium" style={{ color: MUTED }}>
                <Clock size={12} /> Recent Searches
              </div>
              {recent.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:opacity-80 transition-colors"
                  style={{ color: NAVY }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${NAVY}08` }}
                  >
                    {typeIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{item.label}</div>
                    <div className="text-xs truncate" style={{ color: MUTED }}>{item.subtitle}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div
          className="px-4 py-2 text-xs flex items-center gap-3"
          style={{ color: MUTED, borderTop: "1px solid rgba(10,36,114,0.07)" }}
        >
          <span><kbd className="px-1 py-0.5 rounded text-[10px]" style={{ background: `${NAVY}08` }}>↑↓</kbd> Navigate</span>
          <span><kbd className="px-1 py-0.5 rounded text-[10px]" style={{ background: `${NAVY}08` }}>ESC</kbd> Close</span>
        </div>
      </div>
    </div>
  );
}
