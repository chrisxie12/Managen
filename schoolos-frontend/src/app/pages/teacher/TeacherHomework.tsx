import { useState } from "react";
import { Plus, X, BookOpen, Clock, CheckCircle, AlertTriangle } from "lucide-react";

const NAVY = "#031B4E";
const MUTED = "#6B7280";

interface Assignment {
  id: string; title: string; subject: string; class: string;
  dueDate: string; maxMarks: number; submitted: number; total: number;
  status: "active" | "overdue" | "graded";
}

const mockAssignments: Assignment[] = [];

const statusColors: Record<string, { bg: string; text: string }> = {
  active: { bg: "#DBEAFE", text: "#0080FF" },
  overdue: { bg: "#FEE2E2", text: "#DC2626" },
  graded: { bg: "#DCFCE7", text: "#16A34A" },
};

const statusIcons = { active: Clock, overdue: AlertTriangle, graded: CheckCircle };

export function TeacherHomework() {
  const [tab, setTab] = useState<"active" | "overdue" | "graded">("active");
  const [showForm, setShowForm] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: "", subject: "", class: "", dueDate: "", instructions: "", maxMarks: "20",
  });

  const filtered = mockAssignments.filter(a => a.status === tab);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setShowForm(false);
    setNewAssignment({ title: "", subject: "", class: "", dueDate: "", instructions: "", maxMarks: "20" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: NAVY }}>Homework & Assignments</h1>
          <p className="text-sm mt-1" style={{ color: MUTED }}>Create and track student assignments</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all active:scale-95"
          style={{ background: NAVY }}>
          <Plus size={15} /> Create Assignment
        </button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ color: NAVY }}>New Assignment</h3>
            <button onClick={() => setShowForm(false)}><X size={16} style={{ color: MUTED }} /></button>
          </div>
          <form onSubmit={handleCreate}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              {[
                { key: "title", label: "Title", placeholder: "Assignment title" },
                { key: "subject", label: "Subject", placeholder: "e.g. Mathematics" },
                { key: "class", label: "Class", placeholder: "e.g. Form 1A" },
                { key: "dueDate", label: "Due Date", placeholder: "", type: "date" },
                { key: "maxMarks", label: "Max Marks", placeholder: "20" },
              ].map(({ key, label, placeholder, type }) => (
                <div key={key}>
                  <label className="text-xs font-medium mb-1 block" style={{ color: NAVY }}>{label}</label>
                  <input type={type || "text"} value={(newAssignment as any)[key]}
                    onChange={e => setNewAssignment(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full h-9 px-3 rounded-xl text-sm border border-border bg-background focus:outline-none"
                    placeholder={placeholder} />
                </div>
              ))}
              <div className="sm:col-span-2">
                <label className="text-xs font-medium mb-1 block" style={{ color: NAVY }}>Instructions</label>
                <textarea value={newAssignment.instructions}
                  onChange={e => setNewAssignment(f => ({ ...f, instructions: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl text-sm border border-border bg-background focus:outline-none resize-none"
                  rows={3} placeholder="Assignment instructions…" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-xl text-sm border border-border hover:bg-muted/50" style={{ color: MUTED }}>
                Cancel
              </button>
              <button type="submit"
                className="px-5 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: NAVY }}>
                Create
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        {(["active", "overdue", "graded"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-2 text-sm font-medium capitalize transition-all"
            style={{
              color: tab === t ? NAVY : MUTED,
              borderBottom: tab === t ? `2px solid ${NAVY}` : "2px solid transparent",
              marginBottom: -1,
            }}>
            {t} ({mockAssignments.filter(a => a.status === t).length})
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(a => {
          const StatusIcon = statusIcons[a.status];
          const colors = statusColors[a.status];
          const pct = Math.round((a.submitted / a.total) * 100);
          return (
            <div key={a.id} className="bg-card border border-border rounded-2xl p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: colors.bg }}>
                    <BookOpen size={17} color={colors.text} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: NAVY }}>{a.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: MUTED }}>{a.subject} · {a.class} · Due {a.dueDate}</p>
                  </div>
                </div>
                <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: colors.bg, color: colors.text }}>
                  <StatusIcon size={11} /> {a.status}
                </span>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1" style={{ color: MUTED }}>
                  <span>Submissions</span>
                  <span>{a.submitted}/{a.total}</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted/30">
                  <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, background: colors.text }} />
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-10 text-sm" style={{ color: MUTED }}>No {tab} assignments</div>
        )}
      </div>
    </div>
  );
}
