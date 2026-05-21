import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface CalendarEvent {
  date: number;
  title: string;
  type: "exam" | "holiday" | "event" | "deadline";
  color: string;
}

interface DashboardCalendarProps {
  events?: CalendarEvent[];
  onDateSelect?: (date: number) => void;
}

export function DashboardCalendar({ events = [], onDateSelect }: DashboardCalendarProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today);

  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const monthName = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const days = [];
  const totalCells = firstDayOfMonth(currentMonth) + daysInMonth(currentMonth);
  const totalRows = Math.ceil(totalCells / 7);

  for (let i = 0; i < totalRows * 7; i++) {
    if (i < firstDayOfMonth(currentMonth)) {
      days.push(null);
    } else {
      const dayNum = i - firstDayOfMonth(currentMonth) + 1;
      if (dayNum <= daysInMonth(currentMonth)) {
        days.push(dayNum);
      } else {
        days.push(null);
      }
    }
  }

  const getEventForDate = (date: number) => {
    return events.find((e) => e.date === date);
  };

  return (
    <div
      className="p-6 rounded-2xl border"
      style={{ background: "white", borderColor: "#E5E7EB" }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>
          {monthName}
        </h3>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            onClick={prevMonth}
            style={{
              padding: "0.5rem",
              borderRadius: "0.5rem",
              border: "1px solid #E5E7EB",
              background: "white",
              cursor: "pointer",
            }}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={nextMonth}
            style={{
              padding: "0.5rem",
              borderRadius: "0.5rem",
              border: "1px solid #E5E7EB",
              background: "white",
              cursor: "pointer",
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "0.5rem",
          marginBottom: "0.5rem",
        }}
      >
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            style={{
              textAlign: "center",
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "#9CA3AF",
              padding: "0.5rem",
            }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "0.5rem",
        }}
      >
        {days.map((day, idx) => {
          const event = day ? getEventForDate(day) : null;
          const isToday =
            day ===
            today.getDate() &&
            currentMonth.getMonth() === today.getMonth() &&
            currentMonth.getFullYear() === today.getFullYear();

          return (
            <button
              key={idx}
              onClick={() => day && onDateSelect?.(day)}
              style={{
                padding: "0.5rem",
                borderRadius: "0.5rem",
                border: isToday ? "2px solid #0A2472" : "1px solid #E5E7EB",
                background: isToday ? "#E0E7FF" : day ? "#FAFAFA" : "transparent",
                cursor: day ? "pointer" : "default",
                position: "relative",
                minHeight: "2.5rem",
                fontSize: "0.875rem",
                fontWeight: day ? 500 : 400,
                color: day ? (isToday ? "#0A2472" : "#1F2937") : "#D1D5DB",
              }}
              title={event?.title}
            >
              {day}
              {event && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "2px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "4px",
                    height: "4px",
                    borderRadius: "50%",
                    background: event.color,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid #E5E7EB" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
          {[
            { color: "#EF4444", label: "Exam" },
            { color: "#F59E0B", label: "Holiday" },
            { color: "#10B981", label: "Event" },
            { color: "#3B82F6", label: "Deadline" },
          ].map((item) => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem" }}>
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: item.color,
                }}
              />
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
