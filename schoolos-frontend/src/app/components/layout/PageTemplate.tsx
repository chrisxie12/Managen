import { ReactNode } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { DashboardLayout } from "./Sidebar";
import { type UserRole } from "../../config/navigation";

interface PageTemplateProps {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: React.ReactNode;
  breadcrumb?: Array<{ label: string; href?: string }>;
}

const NAVY = "#0A2472";
const MUTED = "#6B7280";

export function PageTemplate({
  title,
  description,
  children,
  actions,
  breadcrumb,
}: PageTemplateProps) {
  const { user } = useAuth();
  const userRole = (user?.role || "school-admin") as UserRole;

  return (
    <DashboardLayout role={userRole}>
      {/* Breadcrumb */}
      {breadcrumb && breadcrumb.length > 0 && (
        <div className="mb-6 flex items-center gap-2 text-sm">
          {breadcrumb.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              {idx > 0 && <span style={{ color: MUTED }}>/</span>}
              {item.href ? (
                <a
                  href={item.href}
                  style={{ color: NAVY, fontWeight: 500 }}
                  className="hover:underline"
                >
                  {item.label}
                </a>
              ) : (
                <span style={{ color: NAVY, fontWeight: 500 }}>
                  {item.label}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              color: NAVY,
              fontSize: "2rem",
              fontWeight: 700,
            }}
          >
            {title}
          </h1>
          {description && (
            <p style={{ color: MUTED, fontSize: "0.95rem", marginTop: "0.5rem" }}>
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>

      {/* Content */}
      <div className="space-y-6">{children}</div>
    </DashboardLayout>
  );
}
