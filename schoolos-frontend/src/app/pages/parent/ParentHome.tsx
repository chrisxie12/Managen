import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { ChevronDown, CalendarCheck, CalendarDays, AlertCircle, Loader2, MapPin, Clock } from "lucide-react";
import { api } from "../../services/api";
import { toast } from "sonner";

const NAVY = "#0A2472";
const NAVY_LIGHT = "#0C2D8A";
const CREAM = "#F8F9FA";
const MUTED = "#6B7280";

type Child = { id: string; name: string; class_name: string; admission_no?: string };
type AttendanceDay = { date: string; status: string };
type Event = {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  event_time?: string;
  event_type: string;
  location?: string;
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  general: "General", holiday: "Holiday", exam: "Exam", sports: "Sports", meeting: "Meeting", deadline: "Deadline",
};
const EVENT_TYPE_COLORS: Record<string, string> = {
  general: "#0A2472", holiday: "#10B981", exam: "#EF4444", sports: "#F59E0B", meeting: "#8B5CF6", deadline: "#EC4899",
};

export function ParentHome() {
  const navigate = useNavigate();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [attendance, setAttendance] = useState<AttendanceDay[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [now] = useState(() => new Date());
  const year = now.getFullYear();
  const month = now.getMonth();

  useEffect(() => {
    api.get<{ children: Child[] }>("/api/school/parent/children")
      .then((res) => {
        const kids = res.data?.children || [];
        setChildren(kids);
        if (kids.length > 0) setSelectedChild(kids[0]);
      })
      .catch(() => toast.error("Failed to load children"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedChild) return;
    const days = getDaysInMonth(year, month);
    const start = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const end = `${year}-${String(month + 1).padStart(2, "0")}-${days}`;
    api.get<{ records: AttendanceDay[] }>(`/api/school/attendance/student/${selectedChild.id}?from=${start}&to=${end}`)
      .then((res) => setAttendance(res.data?.records || []))
      .catch(() => {});
  }, [selectedChild, year, month]);

  useEffect(() => {
    api.get<{ records: Event[] }>("/api/communication/events/list?upcoming=true&limit=10")
      .then((res) => setEvents(res.data?.records || []))
      .catch(() => {});
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" size={28} color={NAVY} /></div>;

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = new Date(year, month, 1).getDay();
  const attMap = Object.fromEntries(attendance.map((a) => [a.date, a.status]));

  return (
    <div className="space-y-5">
      {/* Child Switcher */}
      {children.length > 1 && (
        <div className="relative">
          <select
            value={selectedChild?.id || ""}
            onChange={(e) => setSelectedChild(children.find((c) => c.id === e.target.value) || null)}
            className="w-full p-3 rounded-2xl text-sm font-medium appearance-none cursor-pointer"
            style={{ background: "white", border: "1px solid rgba(10,36,114,0.1)", color: NAVY }}
          >
            {children.map((c) => <option key={c.id} value={c.id}>{c.name} — {c.class_name}</option>)}
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" color={MUTED} />
        </div>
      )}

      {selectedChild && (
        <>
          {/* Attendance Calendar */}
          <div className="p-4 rounded-2xl" style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)" }}>
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2" style={{ color: NAVY }}>
              <CalendarCheck size={16} /> Attendance — {now.toLocaleString("default", { month: "long" })}
            </h3>
            <div className="grid grid-cols-7 gap-1 text-center">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                <span key={d} className="text-[10px] font-medium" style={{ color: MUTED }}>{d}</span>
              ))}
              {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const status = attMap[dateStr];
                const isToday = day === now.getDate() && month === now.getMonth() && year === now.getFullYear();
                return (
                  <div
                    key={day}
                    className="flex items-center justify-center w-8 h-8 rounded-lg text-xs font-medium"
                    style={{
                      background: status === "present" ? "#10B98120" : status === "absent" ? "#EF444420" : status === "late" ? "#F59E0B20" : "transparent",
                      color: status ? (status === "present" ? "#10B981" : status === "absent" ? "#EF4444" : "#F59E0B") : MUTED,
                      border: isToday ? `2px solid ${NAVY}` : "none",
                      fontWeight: isToday ? 700 : 400,
                    }}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
            <div className="flex gap-4 mt-3 text-[10px]" style={{ color: MUTED }}>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#10B981]" /> Present</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#EF4444]" /> Absent</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#F59E0B]" /> Late</span>
            </div>
          </div>

          {/* Upcoming Events */}
          {events.length > 0 && (
            <div className="p-4 rounded-2xl" style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)" }}>
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2" style={{ color: NAVY }}>
                <CalendarDays size={16} /> Upcoming Events
              </h3>
              <div className="space-y-2">
                {events.map((ev) => {
                  const date = new Date(ev.event_date);
                  const day = date.getDate();
                  const monthName = date.toLocaleString("default", { month: "short" });
                  const color = EVENT_TYPE_COLORS[ev.event_type] || NAVY;
                  return (
                    <div key={ev.id} className="flex gap-3 items-start">
                      <div className="flex flex-col items-center w-10 pt-0.5">
                        <span className="text-[10px] font-bold uppercase" style={{ color }}>{monthName}</span>
                        <span className="text-lg font-bold leading-none" style={{ color: NAVY }}>{day}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: NAVY }}>{ev.title}</p>
                        <div className="flex flex-wrap gap-3 mt-0.5">
                          {ev.event_type !== "general" && (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ background: `${color}15`, color }}>
                              {EVENT_TYPE_LABELS[ev.event_type] || ev.event_type}
                            </span>
                          )}
                          {ev.event_time && (
                            <span className="text-[10px] flex items-center gap-1" style={{ color: MUTED }}>
                              <Clock size={10} /> {ev.event_time.slice(0, 5)}
                            </span>
                          )}
                          {ev.location && (
                            <span className="text-[10px] flex items-center gap-1 truncate" style={{ color: MUTED }}>
                              <MapPin size={10} /> {ev.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick links */}
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => navigate(`/parent/fees?child=${selectedChild.id}`)}
              className="p-4 rounded-2xl text-left" style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)" }}>
              <span className="text-xl">💰</span>
              <p className="text-sm font-semibold mt-2" style={{ color: NAVY }}>Fee Status</p>
              <p className="text-[11px]" style={{ color: MUTED }}>View balance & pay</p>
            </button>
            <button onClick={() => navigate(`/parent/reports?child=${selectedChild.id}`)}
              className="p-4 rounded-2xl text-left" style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)" }}>
              <span className="text-xl">📊</span>
              <p className="text-sm font-semibold mt-2" style={{ color: NAVY }}>Report Cards</p>
              <p className="text-[11px]" style={{ color: MUTED }}>View term results</p>
            </button>
          </div>
        </>
      )}

      {children.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-20">
          <AlertCircle size={32} color={MUTED} />
          <p className="text-sm" style={{ color: MUTED }}>No children linked to your account yet.</p>
          <p className="text-xs" style={{ color: MUTED }}>Contact your school to link your profile.</p>
        </div>
      )}
    </div>
  );
}
