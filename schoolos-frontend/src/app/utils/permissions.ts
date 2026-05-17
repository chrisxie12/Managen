import type { User } from "../contexts/AuthContext";

// Centralized permission registry — single source of truth
// Format: {module}.{action}  (action: view, create, edit, delete)
export const Permissions = {
  Dashboard: { view: "dashboard.view" as const },
  Students: {
    view: "students.view" as const,
    create: "students.create" as const,
    edit: "students.edit" as const,
    delete: "students.delete" as const,
  },
  Teachers: {
    view: "teachers.view" as const,
    create: "teachers.create" as const,
    edit: "teachers.edit" as const,
    delete: "teachers.delete" as const,
  },
  Classes: {
    view: "classes.view" as const,
    create: "classes.create" as const,
    edit: "classes.edit" as const,
    delete: "classes.delete" as const,
  },
  Subjects: {
    view: "subjects.view" as const,
    create: "subjects.create" as const,
    edit: "subjects.edit" as const,
    delete: "subjects.delete" as const,
  },
  Timetable: {
    view: "timetable.view" as const,
    create: "timetable.create" as const,
    edit: "timetable.edit" as const,
    delete: "timetable.delete" as const,
  },
  Attendance: {
    view: "attendance.view" as const,
    create: "attendance.create" as const,
    edit: "attendance.edit" as const,
    delete: "attendance.delete" as const,
  },
  Grades: {
    view: "grades.view" as const,
    create: "grades.create" as const,
    edit: "grades.edit" as const,
    delete: "grades.delete" as const,
  },
  Fees: {
    view: "fees.view" as const,
    create: "fees.create" as const,
    edit: "fees.edit" as const,
    delete: "fees.delete" as const,
  },
  Payments: {
    view: "payments.view" as const,
    create: "payments.create" as const,
    edit: "payments.edit" as const,
    delete: "payments.delete" as const,
  },
  Invoices: {
    view: "invoices.view" as const,
    create: "invoices.create" as const,
    edit: "invoices.edit" as const,
    delete: "invoices.delete" as const,
  },
  Messages: {
    view: "messages.view" as const,
    create: "messages.create" as const,
    edit: "messages.edit" as const,
    delete: "messages.delete" as const,
  },
  Announcements: {
    view: "announcements.view" as const,
    create: "announcements.create" as const,
    edit: "announcements.edit" as const,
    delete: "announcements.delete" as const,
  },
  Notifications: {
    view: "notifications.view" as const,
    create: "notifications.create" as const,
    edit: "notifications.edit" as const,
    delete: "notifications.delete" as const,
  },
  Reports: {
    view: "reports.view" as const,
    create: "reports.create" as const,
    edit: "reports.edit" as const,
    delete: "reports.delete" as const,
  },
  Users: {
    view: "users.view" as const,
    create: "users.create" as const,
    edit: "users.edit" as const,
    delete: "users.delete" as const,
  },
  Roles: {
    view: "roles.view" as const,
    create: "roles.create" as const,
    edit: "roles.edit" as const,
    delete: "roles.delete" as const,
  },
  Permissions: {
    view: "permissions.view" as const,
    create: "permissions.create" as const,
    edit: "permissions.edit" as const,
    delete: "permissions.delete" as const,
  },
  Settings: {
    view: "settings.view" as const,
    edit: "settings.edit" as const,
  },
} as const;

type PermissionString = ReturnType<typeof getAllPermissions>[number];

function getAllPermissions(): readonly string[] {
  const result: string[] = [];
  for (const module of Object.values(Permissions)) {
    for (const perm of Object.values(module)) {
      result.push(perm);
    }
  }
  return result;
}

export function hasPermission(user: User | null, ...perms: PermissionString[]): boolean {
  if (!user) return false;
  if (!user.permissions || user.permissions.length === 0) {
    if (user.role === "superadmin") return true;
    return false;
  }
  return perms.some((p) => user.permissions.includes(p));
}

export function canAny(user: User | null, ...perms: string[]): boolean {
  if (!user) return false;
  if (!user.permissions || user.permissions.length === 0) {
    if (user.role === "superadmin") return true;
    return false;
  }
  return perms.some((p) => user.permissions.includes(p));
}

// Nav item permission map — which page requires which permission
export const pagePermissions: Record<string, string[]> = {
  "/dashboard": [Permissions.Dashboard.view],
  "/dashboard/students": [Permissions.Students.view],
  "/dashboard/academics": [Permissions.Grades.view],
  "/dashboard/finance": [Permissions.Fees.view],
  "/dashboard/fee-reminders": [Permissions.Fees.view],
  "/dashboard/communication": [Permissions.Messages.view],
  "/dashboard/users": [Permissions.Users.view],
  "/dashboard/roles": [Permissions.Roles.view],
  "/dashboard/attendance": [Permissions.Attendance.view],
};
