import { useLocation, useNavigate } from "react-router";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "../ui/breadcrumb";
import { Home } from "lucide-react";

const PATH_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  admin: "Admin",
  students: "Students",
  staff: "Teachers & Staff",
  parents: "Guardians",
  classes: "Classes & Tiers",
  attendance: "Attendance",
  "attendance-links": "Attendance Links",
  gradebook: "Gradebook & SBA",
  reports: "Reports",
  fees: "Fee Collections",
  invoices: "Invoices & Accounts",
  communication: "Broadcast & Notice Board",
  settings: "School Settings",
  roles: "Security & Roles",
  profile: "My Profile",
  notifications: "Notifications",
  inbox: "Inbox",
  "daily-signin": "Daily Sign-In",
  assessments: "Assessments",
  "weighted-gradebook": "Weighted Gradebook",
  "timetable-scheduler": "Timetable Scheduler",
  analytics: "Analytics",
  academics: "Academics",
  finance: "Finance",
  "fee-reminders": "Fee Reminders",
  "audit-logs": "Audit Logs",
  "system-health": "System Health",
  "bulk-import": "Bulk Import",
  "report-cards": "Report Cards",
};

export function Breadcrumbs() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathSegments = location.pathname.split("/").filter(Boolean);

  if (pathSegments.length <= 1) return null;

  const crumbs = pathSegments.map((segment, index) => {
    const path = "/" + pathSegments.slice(0, index + 1).join("/");
    const label = PATH_LABELS[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
    const isLast = index === pathSegments.length - 1;
    return { path, label, isLast };
  });

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink
            href="/dashboard"
            onClick={(e) => { e.preventDefault(); navigate("/dashboard"); }}
            className="flex items-center gap-1"
          >
            <Home size={14} />
            <span className="sr-only">Home</span>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        {crumbs.map((crumb) => (
          <BreadcrumbItem key={crumb.path}>
            {crumb.isLast ? (
              <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
            ) : (
              <>
                <BreadcrumbLink
                  href={crumb.path}
                  onClick={(e) => { e.preventDefault(); navigate(crumb.path); }}
                >
                  {crumb.label}
                </BreadcrumbLink>
                <BreadcrumbSeparator />
              </>
            )}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
