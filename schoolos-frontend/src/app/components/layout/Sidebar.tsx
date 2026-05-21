import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { ChevronDown, Menu, X, Settings, LogOut, BarChart3, Sun, Moon } from "lucide-react";
import { getNavigation, type UserRole, type NavSection } from "../../config/navigation";
import { useAuth } from "../../contexts/AuthContext";

const NAVY = "#0A2472";
const NAVY_LIGHT = "#0C2D8A";
const CREAM = "#F8F9FA";
const MUTED = "#6B7280";

interface SidebarProps {
  role: UserRole;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ role, isOpen = true, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, school, logout } = useAuth();
  const [expandedSections, setExpandedSections] = useState<string[]>(["command-center"]);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const navigation = getNavigation(role);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]
    );
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (onClose) onClose();
  };

  return (
    <div
      className="w-64 h-full flex flex-col shadow-xl z-40 overflow-y-auto border-r"
      style={{ background: theme === "dark" ? "#1a1a1a" : "white", borderColor: "rgba(10,36,114,0.07)" }}
    >
      {/* Header */}
      <div
        className="p-6 border-b"
        style={{
          borderColor: "rgba(10,36,114,0.1)",
          background: NAVY,
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              color: CREAM,
              fontSize: "1.1rem",
              fontWeight: 700,
            }}
          >
            SchoolOS
          </h1>
          {onClose && (
            <button onClick={onClose} className="lg:hidden text-white hover:opacity-75">
              <X size={20} />
            </button>
          )}
        </div>
        <p
          style={{
            color: "rgba(248,249,250,0.7)",
            fontSize: "0.8rem",
            fontWeight: 500,
            textTransform: "uppercase",
          }}
        >
          {role.replace("-", " ")}
        </p>
      </div>

      {/* School Info (if school admin or higher) */}
      {["school-admin", "teacher", "bursar"].includes(role) && school && (
        <div
          className="p-4 border-b"
          style={{
            borderColor: "rgba(10,36,114,0.1)",
            background: "rgba(10,36,114,0.02)",
          }}
        >
          <p style={{ color: NAVY, fontWeight: 600, fontSize: "0.9rem" }}>
            {school.name}
          </p>
          <p style={{ color: MUTED, fontSize: "0.75rem", marginTop: "0.25rem" }}>
            {school.region || "Ghana"}
          </p>
        </div>
      )}

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto py-4">
        {navigation.map((section) => (
          <div key={section.id} className="mb-2">
            {/* Section Header */}
            <button
              onClick={() => toggleSection(section.id)}
              className={`w-full px-4 py-2 flex items-center justify-between text-left transition-all ${
                expandedSections.includes(section.id) ? "bg-opacity-100" : "hover:bg-opacity-50"
              }`}
              style={{
                background:
                  expandedSections.includes(section.id)
                    ? "rgba(10,36,114,0.08)"
                    : "transparent",
              }}
            >
              <div className="flex items-center gap-3 flex-1">
                <section.icon
                  size={18}
                  style={{ color: NAVY, flexShrink: 0 }}
                />
                <span
                  style={{
                    color: NAVY,
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  {section.label}
                </span>
              </div>
              <ChevronDown
                size={16}
                style={{
                  color: MUTED,
                  transform: expandedSections.includes(section.id)
                    ? "rotate(0deg)"
                    : "rotate(-90deg)",
                  transition: "transform 0.2s",
                }}
              />
            </button>

            {/* Section Status Badge */}
            {section.status === "coming-soon" && !expandedSections.includes(section.id) && (
              <div
                className="absolute right-4 px-2 py-0.5 text-xs rounded"
                style={{
                  background: "rgba(245,158,11,0.15)",
                  color: "#F59E0B",
                  fontWeight: 600,
                }}
              >
                Soon
              </div>
            )}

            {/* Subsections */}
            {expandedSections.includes(section.id) && section.subsections && (
              <div className="mt-1 space-y-1">
                {section.subsections.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.status !== "coming-soon") {
                        handleNavigation(item.path);
                      }
                    }}
                    disabled={item.status === "coming-soon"}
                    className={`w-full px-6 py-2 text-left text-sm transition-all flex items-center justify-between ${
                      item.status === "coming-soon"
                        ? "opacity-50 cursor-not-allowed"
                        : location.pathname === item.path
                        ? "bg-opacity-100"
                        : "hover:bg-opacity-50"
                    }`}
                    style={{
                      color:
                        location.pathname === item.path
                          ? NAVY
                          : item.status === "coming-soon"
                          ? MUTED
                          : MUTED,
                      background:
                        location.pathname === item.path
                          ? `rgba(10,36,114,0.1)`
                          : "transparent",
                      fontWeight:
                        location.pathname === item.path ? 600 : 500,
                    }}
                  >
                    <span>{item.label}</span>
                    {item.status === "coming-soon" && (
                      <span
                        className="text-xs px-2 py-0.5 rounded"
                        style={{
                          background: "rgba(245,158,11,0.2)",
                          color: "#F59E0B",
                          fontWeight: 600,
                        }}
                      >
                        Soon
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        className="border-t p-4 space-y-2"
        style={{
          borderColor: "rgba(10,36,114,0.1)",
          background: "rgba(10,36,114,0.02)",
        }}
      >
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {theme === "light" ? (
            <Moon size={18} style={{ color: NAVY }} />
          ) : (
            <Sun size={18} style={{ color: NAVY }} />
          )}
          <span style={{ color: NAVY, fontSize: "0.875rem", fontWeight: 500 }}>
            {theme === "light" ? "Dark" : "Light"} Mode
          </span>
        </button>

        {/* Profile */}
        <button
          onClick={() => navigate("/profile")}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Settings size={18} style={{ color: NAVY }} />
          <div style={{ textAlign: "left", flex: 1 }}>
            <p style={{ color: NAVY, fontSize: "0.875rem", fontWeight: 500 }}>
              {user?.firstName} {user?.lastName}
            </p>
            <p style={{ color: MUTED, fontSize: "0.75rem" }}>Profile</p>
          </div>
        </button>

        {/* Logout */}
        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
        >
          <LogOut size={18} style={{ color: "#EF4444" }} />
          <span style={{ color: "#EF4444", fontSize: "0.875rem", fontWeight: 500 }}>
            Logout
          </span>
        </button>
      </div>
    </div>
  );
}


