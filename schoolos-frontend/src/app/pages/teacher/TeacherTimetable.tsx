import { useState } from "react";
import { Printer, Calendar } from "lucide-react";

const NAVY = "#031B4E";
const MUTED = "#6B7280";
const PRIMARY = "#0080FF";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const DAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri"];

const PERIODS = [
  { label: "Period 1", time: "7:30am" },
  { label: "Period 2", time: "8:30am" },
  { label: "Period 3", time: "9:30am" },
  { label: "Break",   time: "10:00am", isBreak: true },
  { label: "Period 4", time: "10:30am" },
  { label: "Period 5", time: "11:30am" },
  { label: "Lunch",   time: "12:30pm", isBreak: true },
  { label: "Period 6", time: "1:00pm" },
  { label: "Period 7", time: "2:00pm" },
  { label: "Period 8", time: "3:00pm" },
];

type Cell = { subject: string; class: string; room: string } | null;

// [day][period] schedule — days 0=Mon…4=Fri, periods match PERIODS array
const SCHEDULE: (Cell[])[] = [
  // Monday
  [
    { subject: "Mathematics", class: "Form 1A", room: "R101" },
    { subject: "Mathematics", class: "Form 1B", room: "R102" },
    { subject: "English",     class: "Form 2A", room: "R201" },
    null,
    { subject: "Science",     class: "Form 3",  room: "R301" },
    { subject: "Mathematics", class: "Form 1A", room: "R101" },
    null,
    { subject: "English",     class: "Form 2A", room: "R201" },
    null,
    null,
  ],
  // Tuesday
  [
    { subject: "Mathematics", class: "Form 1B", room: "R102" },
    null,
    { subject: "Science",     class: "Form 3",  room: "R301" },
    null,
    { subject: "Mathematics", class: "Form 1A", room: "R101" },
    { subject: "English",     class: "Form 2A", room: "R201" },
    null,
    { subject: "Mathematics", class: "Form 1B", room: "R102" },
    { subject: "Science",     class: "Form 3",  room: "R301" },
    null,
  ],
  // Wednesday
  [
    { subject: "English",     class: "Form 2A", room: "R201" },
    { subject: "Mathematics", class: "Form 1A", room: "R101" },
    null,
    null,
    { subject: "Mathematics", class: "Form 1B", room: "R102" },
    null,
    null,
    { subject: "Science",     class: "Form 3",  room: "R301" },
    { subject: "English",     class: "Form 2A", room: "R201" },
    null,
  ],
  // Thursday
  [
    { subject: "Science",     class: "Form 3",  room: "R301" },
    { subject: "English",     class: "Form 2A", room: "R201" },
    { subject: "Mathematics", class: "Form 1B", room: "R102" },
    null,
    null,
    { subject: "Mathematics", class: "Form 1A", room: "R101" },
    null,
    { subject: "Mathematics", class: "Form 1B", room: "R102" },
    null,
    null,
  ],
  // Friday
  [
    { subject: "Mathematics", class: "Form 1A", room: "R101" },
    { subject: "Science",     class: "Form 3",  room: "R301" },
    { subject: "Mathematics", class: "Form 1B", room: "R102" },
    null,
    { subject: "English",     class: "Form 2A", room: "R201" },
    null,
    null,
    { subject: "Mathematics", class: "Form 1A", room: "R101" },
    { subject: "Science",     class: "Form 3",  room: "R301" },
    null,
  ],
];

const SUBJECT_COLORS: Record<string, { bg: string; text: string }> = {
  Mathematics: { bg: "#EFF6FF", text: "#1D4ED8" },
  English:     { bg: "#F0FDF4", text: "#15803D" },
  Science:     { bg: "#FFF7ED", text: "#C2410C" },
};

function getCurrentDayAndPeriod() {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon...
  const todayIndex = dayOfWeek >= 1 && dayOfWeek <= 5 ? dayOfWeek - 1 : -1;

  const hours = now.getHours();
  const minutes = now.getMinutes();
  const totalMins = hours * 60 + minutes;

  const periodTimes = [
    [7*60+30, 8*60+30],
    [8*60+30, 9*60+30],
    [9*60+30, 10*60],
    [10*60, 10*60+30],
    [10*60+30, 11*60+30],
    [11*60+30, 12*60+30],
    [12*60+30, 13*60],
    [13*60, 14*60],
    [14*60, 15*60],
    [15*60, 16*60],
  ];

  const currentPeriod = periodTimes.findIndex(([start, end]) => totalMins >= start && totalMins < end);
  return { todayIndex, currentPeriod };
}

export function TeacherTimetable() {
  const [view, setView] = useState<"week" | "day">("week");
  const { todayIndex, currentPeriod } = getCurrentDayAndPeriod();
  // For demo, if it's a weekend, highlight Wednesday (index 2)
  const highlightDay = todayIndex >= 0 ? todayIndex : 2;

  const handlePrint = () => window.print();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: NAVY }}>My Timetable</h1>
          <p className="text-sm mt-1" style={{ color: MUTED }}>
            Weekly class schedule — {new Date().toLocaleDateString("en-GH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-border overflow-hidden text-sm">
            <button
              onClick={() => setView("week")}
              className="px-4 py-2 font-medium transition-colors"
              style={{ background: view === "week" ? NAVY : "white", color: view === "week" ? "white" : MUTED }}
            >Week</button>
            <button
              onClick={() => setView("day")}
              className="px-4 py-2 font-medium transition-colors"
              style={{ background: view === "day" ? NAVY : "white", color: view === "day" ? "white" : MUTED }}
            >Today</button>
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-border hover:bg-slate-50 transition-colors"
            style={{ color: NAVY }}
          >
            <Printer size={15} />
            Print Timetable
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(SUBJECT_COLORS).map(([subj, colors]) => (
          <span key={subj} className="flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full" style={{ background: colors.bg, color: colors.text }}>
            <span className="w-2 h-2 rounded-full" style={{ background: colors.text }} />
            {subj}
          </span>
        ))}
        <span className="flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full" style={{ background: "#F3F4F6", color: MUTED }}>
          <span className="w-2 h-2 rounded-full bg-gray-400" />
          Break / Lunch
        </span>
      </div>

      {view === "week" ? (
        /* Weekly Grid */
        <div className="bg-card border border-border rounded-2xl overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="p-3 text-left font-semibold border-b border-border w-28" style={{ color: MUTED, background: "#F9FAFB" }}>
                  <div className="flex items-center gap-1.5"><Calendar size={14} /> Period</div>
                </th>
                {DAYS.map((day, di) => (
                  <th
                    key={day}
                    className="p-3 text-center font-semibold border-b border-border"
                    style={{
                      color: di === highlightDay ? "white" : NAVY,
                      background: di === highlightDay ? PRIMARY : "#F9FAFB",
                    }}
                  >
                    <div>{DAY_SHORT[di]}</div>
                    <div className="text-xs font-normal opacity-75">{day}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERIODS.map((period, pi) => (
                <tr key={pi} className={period.isBreak ? "" : "hover:bg-slate-50 transition-colors"}>
                  {/* Time label */}
                  <td
                    className="p-3 border-b border-border align-middle"
                    style={{ background: period.isBreak ? "#F9FAFB" : "white" }}
                  >
                    <div className="font-medium text-xs" style={{ color: period.isBreak ? MUTED : NAVY }}>{period.label}</div>
                    <div className="text-[11px]" style={{ color: MUTED }}>{period.time}</div>
                  </td>

                  {DAYS.map((_, di) => {
                    const cell = SCHEDULE[di]?.[pi] ?? null;
                    const isCurrentCell = di === highlightDay && pi === currentPeriod;
                    const colors = cell ? SUBJECT_COLORS[cell.subject] : null;

                    if (period.isBreak) {
                      return (
                        <td key={di} className="p-2 border-b border-border text-center" style={{ background: "#F9FAFB" }}>
                          <span className="text-[11px]" style={{ color: MUTED }}>{period.label}</span>
                        </td>
                      );
                    }

                    return (
                      <td
                        key={di}
                        className="p-2 border-b border-border align-middle"
                        style={{
                          background: di === highlightDay ? "#EFF6FF" : "white",
                        }}
                      >
                        {cell && colors ? (
                          <div
                            className="rounded-xl p-2 transition-all"
                            style={{
                              background: isCurrentCell ? colors.text : colors.bg,
                              outline: isCurrentCell ? `2px solid ${colors.text}` : "none",
                              outlineOffset: "1px",
                            }}
                          >
                            <div className="font-semibold text-xs leading-tight" style={{ color: isCurrentCell ? "white" : colors.text }}>
                              {cell.subject}
                              {isCurrentCell && (
                                <span className="ml-1 text-[10px] opacity-80 font-normal">● NOW</span>
                              )}
                            </div>
                            <div className="text-[11px] mt-0.5" style={{ color: isCurrentCell ? "rgba(255,255,255,0.8)" : MUTED }}>
                              {cell.class}
                            </div>
                            <div className="text-[10px]" style={{ color: isCurrentCell ? "rgba(255,255,255,0.65)" : MUTED }}>
                              Room {cell.room}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center text-[11px]" style={{ color: "#D1D5DB" }}>—</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Day View */
        <div className="space-y-3">
          <h2 className="text-lg font-bold" style={{ color: NAVY }}>
            {DAYS[highlightDay]} Schedule
          </h2>
          {PERIODS.map((period, pi) => {
            const cell = SCHEDULE[highlightDay]?.[pi] ?? null;
            const isNow = pi === currentPeriod;
            const colors = cell ? SUBJECT_COLORS[cell.subject] : null;

            if (period.isBreak) {
              return (
                <div key={pi} className="flex items-center gap-4 py-2">
                  <div className="w-20 text-right text-xs" style={{ color: MUTED }}>{period.time}</div>
                  <div className="flex-1 h-px" style={{ background: "#E5E7EB" }} />
                  <span className="text-xs font-medium px-3 py-1 rounded-full" style={{ background: "#F3F4F6", color: MUTED }}>{period.label}</span>
                  <div className="flex-1 h-px" style={{ background: "#E5E7EB" }} />
                </div>
              );
            }

            return (
              <div key={pi} className="flex items-center gap-4">
                <div className="w-20 text-right">
                  <div className="text-xs font-medium" style={{ color: isNow ? PRIMARY : MUTED }}>{period.time}</div>
                </div>
                <div className="w-1 self-stretch rounded-full" style={{ background: isNow ? PRIMARY : "#E5E7EB" }} />
                <div className="flex-1">
                  {cell && colors ? (
                    <div
                      className="p-4 rounded-2xl border"
                      style={{
                        background: isNow ? colors.bg : "white",
                        borderColor: isNow ? colors.text : "#E5E7EB",
                        borderWidth: isNow ? 2 : 1,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold" style={{ color: colors.text }}>{cell.subject}</div>
                          <div className="text-sm mt-0.5" style={{ color: MUTED }}>{cell.class} · Room {cell.room}</div>
                        </div>
                        {isNow && (
                          <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: colors.text, color: "white" }}>
                            NOW
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl border border-dashed border-gray-200">
                      <span className="text-sm" style={{ color: "#D1D5DB" }}>Free period</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
