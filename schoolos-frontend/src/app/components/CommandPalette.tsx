import { useState, useEffect, useCallback } from "react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "./ui/command";
import {
  LayoutDashboard,
  BookOpen,
  Settings,
  CreditCard,
  UserPlus,
  Megaphone,
  Wallet,
  User,
  SearchX,
  GraduationCap,
  ChevronRight,
  Users,
} from "lucide-react";

// ===== TYPES =====

interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: React.ElementType;
  shortcut?: string;
}

interface QuickActionItem {
  id: string;
  label: string;
  path: string;
  icon: React.ElementType;
}

interface StudentItem {
  id: string;
  name: string;
  className: string;
  path: string;
  icon: React.ElementType;
}

// ===== MOCK SEARCH INDEX =====

const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: "nav-dashboard",
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    shortcut: "G D",
  },
  {
    id: "nav-gradebook",
    label: "Gradebook & SBA",
    path: "/dashboard/gradebook",
    icon: BookOpen,
    shortcut: "G G",
  },
  {
    id: "nav-settings",
    label: "School Settings",
    path: "/dashboard/settings",
    icon: Settings,
    shortcut: "G O",
  },
  {
    id: "nav-billing",
    label: "Billing Ledger",
    path: "/dashboard/fees",
    icon: CreditCard,
    shortcut: "G F",
  },
  {
    id: "nav-students",
    label: "Student Directory",
    path: "/dashboard/students",
    icon: Users,
    shortcut: "G S",
  },
  {
    id: "nav-attendance",
    label: "Attendance Tracker",
    path: "/dashboard/attendance",
    icon: GraduationCap,
    shortcut: "G A",
  },
  {
    id: "nav-reports",
    label: "Terminal Reports",
    path: "/dashboard/reports",
    icon: BookOpen,
    shortcut: "G R",
  },
  {
    id: "nav-communication",
    label: "Broadcast & Notice Board",
    path: "/dashboard/communication",
    icon: Megaphone,
    shortcut: "G C",
  },
];

const QUICK_ACTIONS: QuickActionItem[] = [
  {
    id: "action-admit",
    label: "Admit New Student",
    path: "/dashboard/students?action=onboard",
    icon: UserPlus,
  },
  {
    id: "action-broadcast",
    label: "Broadcast General SMS",
    path: "/dashboard/communication?action=broadcast",
    icon: Megaphone,
  },
  {
    id: "action-fee",
    label: "Record Offline Fee Payment",
    path: "/dashboard/fees?action=record",
    icon: Wallet,
  },
];

const STUDENT_DIRECTORY: StudentItem[] = [
  {
    id: "student-1",
    name: "Kofi Mensah",
    className: "JHS 2",
    path: "/dashboard/students/1",
    icon: User,
  },
  {
    id: "student-2",
    name: "Ama Serwaa",
    className: "Primary 4",
    path: "/dashboard/students/2",
    icon: User,
  },
  {
    id: "student-3",
    name: "Kwame Asante",
    className: "JHS 1",
    path: "/dashboard/students/3",
    icon: User,
  },
  {
    id: "student-4",
    name: "Abena Osei",
    className: "Primary 6",
    path: "/dashboard/students/4",
    icon: User,
  },
  {
    id: "student-5",
    name: "Yaw Boateng",
    className: "KG 2",
    path: "/dashboard/students/5",
    icon: User,
  },
];

// ===== COMMAND PALETTE COMPONENT =====

export function CommandPalette() {
  const [open, setOpen] = useState(false);

  const handleSelect = useCallback(
    (path: string) => {
      setOpen(false);
      console.log(`Navigating to: ${path}`);
    },
    [],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search commands, students, pages..." />
      <CommandList className="max-h-[420px]">
        <CommandEmpty>
          <div className="flex flex-col items-center gap-2 py-6">
            <SearchX className="size-8 text-muted-foreground opacity-40" />
            <p className="text-sm text-muted-foreground">No results found.</p>
          </div>
        </CommandEmpty>

        {/* Quick Actions */}
        <CommandGroup heading="Quick Actions">
          {QUICK_ACTIONS.map((action) => (
            <CommandItem
              key={action.id}
              value={action.label}
              onSelect={() => handleSelect(action.path)}
              className="cursor-pointer"
            >
              <action.icon className="mr-2 size-4 shrink-0 opacity-60" />
              <span>{action.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {/* Student Directory */}
        <CommandGroup heading="Student Directory">
          {STUDENT_DIRECTORY.map((student) => (
            <CommandItem
              key={student.id}
              value={`${student.name} ${student.className}`}
              onSelect={() => handleSelect(student.path)}
              className="cursor-pointer"
            >
              <student.icon className="mr-2 size-4 shrink-0 opacity-60" />
              <div className="flex flex-1 items-center justify-between">
                <span>
                  {student.name}{" "}
                  <span className="text-xs text-muted-foreground">
                    — {student.className}
                  </span>
                </span>
                <ChevronRight className="ml-2 size-3 opacity-30" />
              </div>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {/* Navigation */}
        <CommandGroup heading="Navigation">
          {NAVIGATION_ITEMS.map((item) => (
            <CommandItem
              key={item.id}
              value={item.label}
              onSelect={() => handleSelect(item.path)}
              className="cursor-pointer"
            >
              <item.icon className="mr-2 size-4 shrink-0 opacity-60" />
              <span>{item.label}</span>
              {item.shortcut && (
                <span className="ml-auto text-xs tracking-widest opacity-40">
                  {item.shortcut}
                </span>
              )}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
