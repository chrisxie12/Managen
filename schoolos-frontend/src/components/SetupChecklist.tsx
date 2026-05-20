import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Check, X } from "lucide-react";
import { api } from "../app/services/api";

const NAVY = "#0A2472";
const MUTED = "#6B7280";
const INDIGO = "#6366F1";

type ChecklistItems = {
  profile_complete: boolean;
  first_class_added: boolean;
  first_teacher_added: boolean;
  first_student_added: boolean;
  fee_structure_setup: boolean;
  first_announcement_sent: boolean;
};

const ITEMS: { key: keyof ChecklistItems; label: string; path: string }[] = [
  { key: "profile_complete", label: "School profile complete", path: "/dashboard/settings" },
  { key: "first_class_added", label: "Add your first class", path: "/dashboard/academics" },
  { key: "first_teacher_added", label: "Add your first teacher", path: "/dashboard/staff" },
  { key: "first_student_added", label: "Add your first student", path: "/dashboard/students" },
  { key: "fee_structure_setup", label: "Set up fee structure", path: "/dashboard/finance" },
  { key: "first_announcement_sent", label: "Send first announcement", path: "/dashboard/communication" },
];

export function SetupChecklist() {
  const navigate = useNavigate();
  const [items, setItems] = useState<ChecklistItems | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const hidden = localStorage.getItem("schoolos_checklist_hidden_until");
    if (hidden && new Date(hidden) > new Date()) {
      setDismissed(true);
      return;
    }
    (async () => {
      try {
        const res = await api.get<any>("/api/school/onboarding/status");
        const meta = res.data?.metadata;
        if (meta?.checklist) {
          setItems(meta.checklist);
        }
      } catch {}
    })();
  }, []);

  if (!items || dismissed) return null;

  const completed = Object.values(items).filter(Boolean).length;
  const total = ITEMS.length;
  const allDone = completed >= total;

  if (allDone) {
    return (
      <div className="mb-4 p-4 rounded-2xl" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#10B981" }}>
              <Check size={16} color="white" />
            </div>
            <p className="text-sm font-medium" style={{ color: "#065F46" }}>🎉 Setup complete! You're all set.</p>
          </div>
          <button onClick={() => {
            const d = new Date(); d.setDate(d.getDate() + 3);
            localStorage.setItem("schoolos_checklist_hidden_until", d.toISOString());
            setDismissed(true);
          }} className="text-xs" style={{ color: MUTED }}><X size={14} /></button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4 p-4 rounded-2xl" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)", boxShadow: "0 2px 12px rgba(56,25,50,0.04)" }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold" style={{ color: NAVY }}>Setup Checklist</p>
        <button onClick={() => setDismissed(true)} className="text-xs" style={{ color: MUTED }}><X size={14} /></button>
      </div>
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${(completed / total) * 100}%`, background: INDIGO }} />
        </div>
        <span className="text-xs font-medium" style={{ color: MUTED }}>{completed} of {total}</span>
      </div>
      <div className="space-y-1.5">
        {ITEMS.map(item => {
          const done = items[item.key];
          return (
            <button key={item.key} onClick={() => navigate(item.path)}
              className="w-full flex items-center gap-2 py-1.5 text-left active:scale-[0.99] transition-transform">
              <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: done ? "#10B981" : "transparent", border: done ? "none" : "2px solid #d1d5db" }}>
                {done && <Check size={10} color="white" />}
              </div>
              <span className="text-xs" style={{ color: done ? "#10B981" : NAVY, textDecoration: done ? "line-through" : "none" }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
