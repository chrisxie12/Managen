import { useState } from "react";
import { X, Zap, Eye, EyeOff, GripVertical } from "lucide-react";

interface DashboardWidget {
  id: string;
  title: string;
  enabled: boolean;
  category: "metrics" | "charts" | "tasks" | "alerts";
  description: string;
}

const DEFAULT_WIDGETS: DashboardWidget[] = [
  { id: "attendance", title: "Attendance Rate", enabled: true, category: "metrics", description: "Real-time attendance monitoring" },
  { id: "collection", title: "Fee Collection", enabled: true, category: "metrics", description: "Revenue and collection tracking" },
  { id: "students", title: "Total Students", enabled: true, category: "metrics", description: "Enrollment overview" },
  { id: "staff", title: "Staff Members", enabled: true, category: "metrics", description: "Staff directory & count" },
  { id: "attendance-chart", title: "Attendance Trend", enabled: true, category: "charts", description: "7-day attendance trend" },
  { id: "performance-chart", title: "Performance Metrics", enabled: true, category: "charts", description: "Academic performance trend" },
  { id: "tasks", title: "Pending Tasks", enabled: true, category: "tasks", description: "Your to-do list" },
  { id: "alerts", title: "System Alerts", enabled: true, category: "alerts", description: "Important notifications" },
];

interface DashboardSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  widgets: DashboardWidget[];
  onSave: (widgets: DashboardWidget[]) => void;
}

export function DashboardSettings({ isOpen, onClose, widgets, onSave }: DashboardSettingsProps) {
  const [localWidgets, setLocalWidgets] = useState(widgets || DEFAULT_WIDGETS);

  const toggleWidget = (id: string) => {
    setLocalWidgets(
      localWidgets.map((w) => (w.id === id ? { ...w, enabled: !w.enabled } : w))
    );
  };

  const handleSave = () => {
    onSave(localWidgets);
    onClose();
  };

  if (!isOpen) return null;

  const categories = [
    { name: "Metrics", value: "metrics" },
    { name: "Charts", value: "charts" },
    { name: "Tasks", value: "tasks" },
    { name: "Alerts", value: "alerts" },
  ];

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "flex-end",
        zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white",
          borderRadius: "24px 24px 0 0",
          width: "100%",
          maxWidth: "500px",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1.5rem",
            borderBottom: "1px solid #E5E7EB",
          }}
        >
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>
            Customize Dashboard
          </h2>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            <X size={24} color="#6B7280" />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "1.5rem" }}>
          {categories.map((category) => {
            const categoryWidgets = localWidgets.filter(
              (w) => w.category === category.value
            );

            return (
              <div key={category.value} style={{ marginBottom: "2rem" }}>
                <h3
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    color: "#6B7280",
                    marginBottom: "0.75rem",
                  }}
                >
                  {category.name}
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {categoryWidgets.map((widget) => (
                    <button
                      key={widget.id}
                      onClick={() => toggleWidget(widget.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        padding: "0.75rem",
                        borderRadius: "0.75rem",
                        border: `1px solid ${widget.enabled ? "#E5E7EB" : "#E5E7EB"}`,
                        background: widget.enabled ? "#F9FAFB" : "#F3F4F6",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      <div
                        style={{
                          opacity: widget.enabled ? 1 : 0.5,
                          cursor: "grab",
                        }}
                      >
                        <GripVertical size={16} color="#9CA3AF" />
                      </div>

                      <div style={{ flex: 1, textAlign: "left" }}>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: "0.875rem",
                            marginBottom: "0.125rem",
                          }}
                        >
                          {widget.title}
                        </div>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "#6B7280",
                          }}
                        >
                          {widget.description}
                        </div>
                      </div>

                      <div
                        style={{
                          width: "40px",
                          height: "24px",
                          borderRadius: "12px",
                          background: widget.enabled
                            ? "#10B981"
                            : "#E5E7EB",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: widget.enabled ? "flex-end" : "flex-start",
                          padding: "0 2px",
                          transition: "all 0.2s",
                        }}
                      >
                        <div
                          style={{
                            width: "20px",
                            height: "20px",
                            borderRadius: "10px",
                            background: "white",
                          }}
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            padding: "1.5rem",
            borderTop: "1px solid #E5E7EB",
          }}
        >
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "0.75rem",
              borderRadius: "0.75rem",
              border: "1px solid #E5E7EB",
              background: "white",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              flex: 1,
              padding: "0.75rem",
              borderRadius: "0.75rem",
              border: "none",
              background: "#0A2472",
              color: "white",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
