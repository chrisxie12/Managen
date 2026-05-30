import { useState } from "react";
import {
  AlertTriangle, CheckCircle, MessageSquare, CreditCard,
  Filter, Users, Clock, TrendingDown,
} from "lucide-react";

const NAVY = "#031B4E";
const MUTED = "#6B7280";
const SUCCESS = "#16A34A";
const WARNING = "#F59E0B";
const DANGER = "#EF4444";

// ─── Mock data ───────────────────────────────────────────────────
const OUTSTANDING_STUDENTS = [
  { id: "GHA-001", name: "Kwame Asante",       admNo: "GHA-001", class: "JHS 3A",    total: 4500, paid: 3200, daysSince: 12 },
  { id: "GHA-003", name: "Kofi Boateng",       admNo: "GHA-003", class: "JHS 1A",    total: 3800, paid: 1900, daysSince: 45 },
  { id: "GHA-004", name: "Ama Owusu",          admNo: "GHA-004", class: "Primary 6", total: 3200, paid: 2100, daysSince: 8  },
  { id: "GHA-006", name: "Akosua Poku",        admNo: "GHA-006", class: "JHS 3B",    total: 4500, paid: 2700, daysSince: 72 },
  { id: "GHA-007", name: "Fiifi Asante",       admNo: "GHA-007", class: "JHS 2B",    total: 4200, paid: 1400, daysSince: 95 },
  { id: "GHA-008", name: "Adwoa Boateng",      admNo: "GHA-008", class: "Primary 4", total: 2800, paid: 1800, daysSince: 31 },
  { id: "GHA-009", name: "Nii Kotei",          admNo: "GHA-009", class: "JHS 1A",    total: 3800, paid: 2500, daysSince: 20 },
  { id: "GHA-010", name: "Efua Adjei",         admNo: "GHA-010", class: "JHS 2A",    total: 4000, paid: 800,  daysSince: 110 },
  { id: "GHA-011", name: "Kwabena Frimpong",   admNo: "GHA-011", class: "JHS 1B",    total: 3800, paid: 3000, daysSince: 5  },
  { id: "GHA-012", name: "Maame Akua",         admNo: "GHA-012", class: "Primary 5", total: 3000, paid: 1200, daysSince: 62 },
  { id: "GHA-013", name: "Adjoa Asare",        admNo: "GHA-013", class: "Primary 6", total: 3200, paid: 2800, daysSince: 3  },
  { id: "GHA-014", name: "Kojo Mensah",        admNo: "GHA-014", class: "JHS 3A",    total: 4500, paid: 1500, daysSince: 88 },
  { id: "GHA-015", name: "Nana Ama Appiah",    admNo: "GHA-015", class: "Primary 4", total: 2800, paid: 900,  daysSince: 77 },
  { id: "GHA-016", name: "Esi Quaye",          admNo: "GHA-016", class: "JHS 2B",    total: 4200, paid: 3500, daysSince: 15 },
  { id: "GHA-017", name: "Yaw Antwi",          admNo: "GHA-017", class: "JHS 1B",    total: 3800, paid: 2200, daysSince: 40 },
  { id: "GHA-018", name: "Abena Darkwa",       admNo: "GHA-018", class: "Primary 5", total: 3000, paid: 1600, daysSince: 55 },
  { id: "GHA-019", name: "Kofi Acheampong",    admNo: "GHA-019", class: "JHS 3B",    total: 4500, paid: 600,  daysSince: 102 },
  { id: "GHA-020", name: "Akua Tawiah",        admNo: "GHA-020", class: "Primary 6", total: 3200, paid: 2000, daysSince: 28 },
  { id: "GHA-021", name: "Kwesi Baah",         admNo: "GHA-021", class: "JHS 2A",    total: 4000, paid: 3200, daysSince: 9  },
  { id: "GHA-022", name: "Araba Mensah",       admNo: "GHA-022", class: "Primary 4", total: 2800, paid: 400,  daysSince: 120 },
];

const CLASSES = ["All Classes", "JHS 3A", "JHS 3B", "JHS 2A", "JHS 2B", "JHS 1A", "JHS 1B", "Primary 6", "Primary 5", "Primary 4"];

function urgencyColor(days: number) {
  if (days < 30) return SUCCESS;
  if (days < 60) return WARNING;
  return DANGER;
}

function urgencyBg(days: number) {
  if (days < 30) return "#F0FDF4";
  if (days < 60) return "#FFFBEB";
  return "#FEF2F2";
}

function urgencyLabel(days: number) {
  if (days < 30) return "Recent";
  if (days < 60) return "Overdue";
  return "Critical";
}

export function BursarOutstanding() {
  const [selectedClass, setSelectedClass] = useState("All Classes");
  const [amountFilter, setAmountFilter] = useState("All");
  const [dayFilter, setDayFilter] = useState("All");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [reminderSent, setReminderSent] = useState<Set<string>>(new Set());

  const students = OUTSTANDING_STUDENTS.map((s) => ({
    ...s,
    outstanding: s.total - s.paid,
  }));

  const filtered = students.filter((s) => {
    if (selectedClass !== "All Classes" && s.class !== selectedClass) return false;
    if (amountFilter === ">500"  && s.outstanding <= 500)  return false;
    if (amountFilter === ">1000" && s.outstanding <= 1000) return false;
    if (amountFilter === ">2000" && s.outstanding <= 2000) return false;
    if (dayFilter === ">30"  && s.daysSince <= 30)  return false;
    if (dayFilter === ">60"  && s.daysSince <= 60)  return false;
    if (dayFilter === ">90"  && s.daysSince <= 90)  return false;
    return true;
  });

  const totalOutstanding = students.reduce((s, r) => s + r.outstanding, 0);
  const studentsWithBalance = students.length;
  const overdue = students.filter((s) => s.daysSince > 30).length;
  const critical = students.filter((s) => s.daysSince > 90).length;

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((s) => s.id)));
    }
  }

  function sendReminder(id: string) {
    setReminderSent((prev) => new Set([...prev, id]));
  }

  function sendBulkReminders() {
    setReminderSent((prev) => new Set([...prev, ...selected]));
    setSelected(new Set());
  }

  const summaryCards = [
    { label: "Total Outstanding", value: `GHS ${totalOutstanding.toLocaleString()}`, icon: <TrendingDown className="w-5 h-5" />, color: DANGER,   bg: "#FEF2F2" },
    { label: "Students w/ Balance", value: studentsWithBalance.toString(),             icon: <Users className="w-5 h-5" />,       color: NAVY,    bg: "#EFF6FF" },
    { label: "Overdue (>30 days)",  value: overdue.toString(),                         icon: <Clock className="w-5 h-5" />,        color: WARNING, bg: "#FFFBEB" },
    { label: "Critical (>90 days)", value: critical.toString(),                        icon: <AlertTriangle className="w-5 h-5" />, color: DANGER,  bg: "#FEF2F2" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: NAVY }}>Outstanding Balances</h1>
        <p className="text-sm mt-1" style={{ color: MUTED }}>
          Track and manage unpaid student fees across all classes
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <div key={card.label} className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium" style={{ color: MUTED }}>{card.label}</p>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: card.bg, color: card.color }}>
                {card.icon}
              </div>
            </div>
            <p className="text-xl font-bold" style={{ color: card.color }}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4" style={{ color: MUTED }} />
          <span className="text-sm font-semibold" style={{ color: NAVY }}>Filters</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            className="border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            {CLASSES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select
            className="border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
            value={amountFilter}
            onChange={(e) => setAmountFilter(e.target.value)}
          >
            <option value="All">All Amounts</option>
            <option value=">500">Outstanding &gt; GHS 500</option>
            <option value=">1000">Outstanding &gt; GHS 1,000</option>
            <option value=">2000">Outstanding &gt; GHS 2,000</option>
          </select>
          <select
            className="border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
            value={dayFilter}
            onChange={(e) => setDayFilter(e.target.value)}
          >
            <option value="All">All Dates</option>
            <option value=">30">Overdue &gt; 30 days</option>
            <option value=">60">Overdue &gt; 60 days</option>
            <option value=">90">Critical &gt; 90 days</option>
          </select>
          {selected.size > 0 && (
            <button
              onClick={sendBulkReminders}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white ml-auto"
              style={{ background: WARNING }}
            >
              <MessageSquare className="w-4 h-4" />
              Send Reminders to {selected.size} Selected
            </button>
          )}
        </div>
      </div>

      {/* Outstanding table */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold" style={{ color: NAVY }}>
            {filtered.length} student{filtered.length !== 1 ? "s" : ""} with outstanding balances
          </h3>
          <button
            onClick={toggleAll}
            className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-slate-50"
            style={{ color: NAVY }}
          >
            {selected.size === filtered.length ? "Deselect All" : "Select All"}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 px-3 text-left w-8">
                  <input
                    type="checkbox"
                    checked={selected.size === filtered.length && filtered.length > 0}
                    onChange={toggleAll}
                    className="rounded"
                  />
                </th>
                {["Student Name", "Adm No", "Class", "Total Fees", "Paid", "Outstanding", "Days Since Pmt", "Status", "Actions"].map((h) => (
                  <th key={h} className="py-2 px-3 text-left text-xs font-semibold" style={{ color: MUTED }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-b border-border last:border-0 hover:bg-slate-50">
                  <td className="py-3 px-3">
                    <input
                      type="checkbox"
                      checked={selected.has(s.id)}
                      onChange={() => toggleSelect(s.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="py-3 px-3 font-medium" style={{ color: NAVY }}>{s.name}</td>
                  <td className="py-3 px-3 text-xs font-mono" style={{ color: MUTED }}>{s.admNo}</td>
                  <td className="py-3 px-3 text-xs" style={{ color: MUTED }}>{s.class}</td>
                  <td className="py-3 px-3 text-xs" style={{ color: NAVY }}>GHS {s.total.toLocaleString()}</td>
                  <td className="py-3 px-3 text-xs" style={{ color: SUCCESS }}>GHS {s.paid.toLocaleString()}</td>
                  <td className="py-3 px-3 font-bold text-xs" style={{ color: DANGER }}>GHS {s.outstanding.toLocaleString()}</td>
                  <td className="py-3 px-3 text-xs" style={{ color: MUTED }}>{s.daysSince}d</td>
                  <td className="py-3 px-3">
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ background: urgencyBg(s.daysSince), color: urgencyColor(s.daysSince) }}
                    >
                      {urgencyLabel(s.daysSince)}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <button
                        className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg text-white font-medium"
                        style={{ background: SUCCESS }}
                        onClick={() => {}}
                      >
                        <CreditCard className="w-3 h-3" />
                        Collect
                      </button>
                      {reminderSent.has(s.id) ? (
                        <span className="flex items-center gap-1 text-xs" style={{ color: SUCCESS }}>
                          <CheckCircle className="w-3 h-3" /> Sent
                        </span>
                      ) : (
                        <button
                          className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-border hover:bg-slate-50"
                          style={{ color: NAVY }}
                          onClick={() => sendReminder(s.id)}
                        >
                          <MessageSquare className="w-3 h-3" />
                          Remind
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border flex-wrap">
          <span className="text-xs font-medium" style={{ color: MUTED }}>Urgency:</span>
          {[
            { label: "Recent (<30 days)", color: SUCCESS, bg: "#F0FDF4" },
            { label: "Overdue (30-60 days)", color: WARNING, bg: "#FFFBEB" },
            { label: "Critical (>60 days)", color: DANGER, bg: "#FEF2F2" },
          ].map((item) => (
            <span key={item.label} className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: item.bg, color: item.color }}>
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
