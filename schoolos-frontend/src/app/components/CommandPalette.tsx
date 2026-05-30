import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router";
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
  Loader2,
} from "lucide-react";
import { api } from "../services/api";

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

const NAVIGATION_ITEMS: NavigationItem[] = [
  { id: "nav-dashboard", label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, shortcut: "G D" },
  { id: "nav-gradebook", label: "Gradebook & SBA", path: "/dashboard/gradebook", icon: BookOpen, shortcut: "G G" },
  { id: "nav-settings", label: "School Settings", path: "/dashboard/settings", icon: Settings, shortcut: "G O" },
  { id: "nav-billing", label: "Billing Ledger", path: "/dashboard/fees", icon: CreditCard, shortcut: "G F" },
  { id: "nav-students", label: "Student Directory", path: "/dashboard/students", icon: Users, shortcut: "G S" },
  { id: "nav-attendance", label: "Attendance Tracker", path: "/dashboard/attendance", icon: GraduationCap, shortcut: "G A" },
  { id: "nav-reports", label: "Terminal Reports", path: "/dashboard/reports", icon: BookOpen, shortcut: "G R" },
  { id: "nav-communication", label: "Broadcast & Notice Board", path: "/dashboard/communication", icon: Megaphone, shortcut: "G C" },
];

const QUICK_ACTIONS: QuickActionItem[] = [
  { id: "action-admit", label: "Admit New Student", path: "/dashboard/students?action=onboard", icon: UserPlus },
  { id: "action-broadcast", label: "Broadcast General SMS", path: "/dashboard/communication?action=broadcast", icon: Megaphone },
  { id: "action-fee", label: "Record Offline Fee Payment", path: "/dashboard/fees?action=record", icon: Wallet },
];

export function CommandPalette() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ id: string; name: string; class_name: string; path: string }[]>([]);
  const [searching, setSearching] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await api.get<{ students: { id: string; name: string; class_name: string; path: string }[] }>(`/api/school/search?q=${encodeURIComponent(query)}`);
        if (!controller.signal.aborted) {
          setResults(res.data?.students || []);
        }
      } catch {
        if (!controller.signal.aborted) setResults([]);
      }
      finally { if (!controller.signal.aborted) setSearching(false); }
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const handleSelect = useCallback((path: string) => {
    setOpen(false);
    navigate(path);
  }, [navigate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search commands, students, pages..." onValueChange={setQuery} />
      <CommandList className="max-h-[420px]">
        <CommandEmpty>
          <div className="flex flex-col items-center gap-2 py-6">
            <SearchX className="size-8 text-muted-foreground opacity-40" />
            <p className="text-sm text-muted-foreground">{query.length < 2 ? "Type at least 2 characters to search" : "No results found."}</p>
          </div>
        </CommandEmpty>

        {results.length > 0 && (
          <>
            <CommandGroup heading="Students">
              {results.map((s) => (
                <CommandItem key={s.id} value={`${s.name} ${s.class_name}`} onSelect={() => handleSelect(s.path)} className="cursor-pointer">
                  <User className="mr-2 size-4 shrink-0 opacity-60" />
                  <div className="flex flex-1 items-center justify-between">
                    <span>{s.name} <span className="text-xs text-muted-foreground">— {s.class_name}</span></span>
                    <ChevronRight className="ml-2 size-3 opacity-30" />
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {searching && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        )}

        <CommandGroup heading="Quick Actions">
          {QUICK_ACTIONS.map((action) => (
            <CommandItem key={action.id} value={action.label} onSelect={() => handleSelect(action.path)} className="cursor-pointer">
              <action.icon className="mr-2 size-4 shrink-0 opacity-60" />
              <span>{action.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Navigation">
          {NAVIGATION_ITEMS.map((item) => (
            <CommandItem key={item.id} value={item.label} onSelect={() => handleSelect(item.path)} className="cursor-pointer">
              <item.icon className="mr-2 size-4 shrink-0 opacity-60" />
              <span>{item.label}</span>
              {item.shortcut && <span className="ml-auto text-xs tracking-widest opacity-40">{item.shortcut}</span>}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
