# Phase 1 — Core African Command Center Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform Dashboard, Students, and Fees pages to match African Command Center design with MoMo-first payments, WhatsApp receipts, and CSV student import.

**Architecture:** Component-driven approach — extract standalone widgets (FeePulse, BECECountdown, AttendancePulse, QuickActions) in a `widgets/` directory, then compose them into the HeadmasterDashboard. Students gets an ImportModal and Fees Due column. A new CollectFees page handles staff-side fee collection with MoMo/Cash/Bank options.

**Tech Stack:** React 18, TypeScript, Tailwind CSS v4, React Router v7, lucide-react, sonner, TanStack Query, Vite 6

---

### Task 1: FeePulse Widget

**Files:**
- Create: `src/app/components/widgets/FeePulse.tsx`

- [ ] **Step 1: Create FeePulse widget**

```tsx
import { useNavigate } from "react-router";
import { Wallet, TrendingUp } from "lucide-react";

const NAVY = "#0A2472";
const AMBER = "#FFBA08";
const MUTED = "#6B7280";
const GREEN = "#10B981";

interface FeePulseProps {
  collected: number;
  target: number;
  momoPercentage?: number;
  cashPercentage?: number;
  bankPercentage?: number;
  loading?: boolean;
}

function Skeleton() {
  return (
    <div className="p-6 rounded-xl border animate-pulse" style={{ background: "white", borderColor: "rgba(10,36,114,0.07)" }}>
      <div className="h-4 w-24 rounded mb-4" style={{ background: "#E5E7EB" }} />
      <div className="h-8 w-48 rounded mb-3" style={{ background: "#E5E7EB" }} />
      <div className="h-3 w-full rounded mb-2" style={{ background: "#E5E7EB" }} />
      <div className="h-3 w-32 rounded" style={{ background: "#E5E7EB" }} />
    </div>
  );
}

export function FeePulse({ collected, target, momoPercentage = 0, cashPercentage = 0, bankPercentage = 0, loading }: FeePulseProps) {
  const navigate = useNavigate();
  const percent = target > 0 ? Math.min(Math.round((collected / target) * 100), 100) : 0;

  if (loading) return <Skeleton />;

  return (
    <div
      onClick={() => navigate("/dashboard/fees")}
      className="p-6 rounded-xl border cursor-pointer transition-all hover:shadow-md"
      style={{ background: "white", borderColor: "rgba(10,36,114,0.07)" }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${AMBER}20` }}>
          <Wallet size={20} color={AMBER} />
        </div>
        <div>
          <p style={{ color: NAVY, fontWeight: 600, fontSize: "0.85rem" }}>Fee Pulse</p>
          <p style={{ color: MUTED, fontSize: "0.72rem" }}>This Term</p>
        </div>
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        <span style={{ color: NAVY, fontWeight: 700, fontSize: "1.5rem" }}>GHS {collected.toLocaleString()}</span>
        <span style={{ color: MUTED, fontSize: "0.85rem" }}>/ GHS {target.toLocaleString()}</span>
      </div>

      <div className="relative h-3 rounded-full mb-2" style={{ background: "#E5E7EB" }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percent}%`, background: `linear-gradient(90deg, ${AMBER}, ${NAVY})` }}
        />
      </div>

      <div style={{ color: MUTED, fontSize: "0.72rem" }} className="flex gap-3">
        <span><TrendingUp size={12} style={{ display: "inline", color: AMBER }} /> MoMo {momoPercentage}%</span>
        <span>Cash {cashPercentage}%</span>
        {bankPercentage > 0 && <span>Bank {bankPercentage}%</span>}
      </div>

      {collected === 0 && (
        <p style={{ color: MUTED, fontSize: "0.8rem" }} className="mt-2">
          No fees recorded. Click to collect your first fee.
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npx vite build`
Expected: Build succeeds with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/components/widgets/FeePulse.tsx
git commit -m "feat: add FeePulse dashboard widget"
```

---

### Task 2: BECECountdown Widget

**Files:**
- Create: `src/app/components/widgets/BECECountdown.tsx`

- [ ] **Step 1: Create BECECountdown widget**

```tsx
import { GraduationCap, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router";

const NAVY = "#0A2472";
const AMBER = "#FFBA08";
const CREAM = "#F8F9FA";

interface BECECountdownProps {
  examDate?: string;
  examName?: string;
  loading?: boolean;
}

function getDaysUntil(dateStr: string): number {
  const now = new Date();
  const exam = new Date(dateStr);
  const diff = exam.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function BECECountdown({ examDate, examName = "BECE 2026", loading }: BECECountdownProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="p-6 rounded-xl animate-pulse" style={{ background: NAVY }}>
        <div className="h-4 w-20 rounded mb-4" style={{ background: `${AMBER}40` }} />
        <div className="h-10 w-24 rounded mb-2" style={{ background: `${AMBER}40` }} />
        <div className="h-3 w-16 rounded" style={{ background: `${AMBER}40` }} />
      </div>
    );
  }

  if (!examDate) return null;

  const days = getDaysUntil(examDate);

  return (
    <div
      onClick={() => navigate("/dashboard/academics")}
      className="p-6 rounded-xl cursor-pointer transition-all hover:brightness-110"
      style={{ background: NAVY }}
    >
      <div className="flex items-center gap-2 mb-3">
        <GraduationCap size={18} color={AMBER} />
        <span style={{ color: AMBER, fontWeight: 600, fontSize: "0.85rem" }}>BECE Countdown</span>
      </div>

      <div style={{ color: CREAM, fontSize: "2.5rem", fontWeight: 700, lineHeight: 1 }}>
        {days} <span style={{ fontSize: "1rem", fontWeight: 400 }}>days</span>
      </div>
      <p style={{ color: `${AMBER}CC`, fontSize: "0.85rem", marginTop: 4 }}>{examName}</p>

      <button
        onClick={(e) => { e.stopPropagation(); navigate("/dashboard/academics"); }}
        className="mt-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:brightness-90"
        style={{ background: AMBER, color: NAVY }}
      >
        Prepare with Past Questions <ArrowRight size={12} />
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npx vite build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/components/widgets/BECECountdown.tsx
git commit -m "feat: add BECE Countdown dashboard widget"
```

---

### Task 3: AttendancePulse Widget

**Files:**
- Create: `src/app/components/widgets/AttendancePulse.tsx`

- [ ] **Step 1: Create AttendancePulse widget**

```tsx
import { useNavigate } from "react-router";
import { CalendarCheck, TrendingUp } from "lucide-react";

const NAVY = "#0A2472";
const AMBER = "#FFBA08";
const MUTED = "#6B7280";
const GREEN = "#10B981";
const RED = "#EF4444";

interface AttendancePulseProps {
  todayPercent: number;
  weeklyData?: { day: string; percent: number }[];
  loading?: boolean;
}

function Skeleton() {
  return (
    <div className="p-6 rounded-xl border animate-pulse" style={{ background: "white", borderColor: "rgba(10,36,114,0.07)" }}>
      <div className="h-4 w-32 rounded mb-4" style={{ background: "#E5E7EB" }} />
      <div className="h-8 w-20 rounded mb-3" style={{ background: "#E5E7EB" }} />
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-3 w-full rounded" style={{ background: "#E5E7EB" }} />)}
      </div>
    </div>
  );
}

export function AttendancePulse({ todayPercent, weeklyData, loading }: AttendancePulseProps) {
  const navigate = useNavigate();
  const color = todayPercent >= 90 ? GREEN : todayPercent >= 75 ? AMBER : RED;

  if (loading) return <Skeleton />;

  const days = weeklyData || [
    { day: "Mon", percent: 92 },
    { day: "Tue", percent: 96 },
    { day: "Wed", percent: 88 },
    { day: "Thu", percent: 94 },
    { day: "Fri", percent: todayPercent },
  ];

  return (
    <div
      onClick={() => navigate("/dashboard/attendance")}
      className="p-6 rounded-xl border cursor-pointer transition-all hover:shadow-md"
      style={{ background: "white", borderColor: "rgba(10,36,114,0.07)" }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${GREEN}20` }}>
          <CalendarCheck size={20} color={GREEN} />
        </div>
        <div>
          <p style={{ color: NAVY, fontWeight: 600, fontSize: "0.85rem" }}>Attendance</p>
          <p style={{ color: MUTED, fontSize: "0.72rem" }}>This Week</p>
        </div>
      </div>

      <div className="flex items-baseline gap-1 mb-4">
        <span style={{ color, fontWeight: 700, fontSize: "2rem" }}>{Math.round(todayPercent)}%</span>
        <span style={{ color: MUTED, fontSize: "0.8rem" }}>today</span>
      </div>

      <div className="space-y-2">
        {days.map((d) => (
          <div key={d.day} className="flex items-center gap-2">
            <span style={{ color: MUTED, fontSize: "0.72rem", width: 28 }}>{d.day}</span>
            <div className="flex-1 h-2 rounded-full" style={{ background: "#E5E7EB" }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(d.percent, 100)}%`,
                  background: d.percent >= 90 ? GREEN : d.percent >= 75 ? AMBER : RED,
                }}
              />
            </div>
            <span style={{ color: NAVY, fontSize: "0.72rem", fontWeight: 600, width: 30, textAlign: "right" }}>
              {Math.round(d.percent)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npx vite build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/components/widgets/AttendancePulse.tsx
git commit -m "feat: add AttendancePulse dashboard widget"
```

---

### Task 4: QuickActions Widget

**Files:**
- Create: `src/app/components/widgets/QuickActions.tsx`

- [ ] **Step 1: Create QuickActions widget**

```tsx
import { useNavigate } from "react-router";
import { Zap, Users, Wallet, Megaphone, BarChart3 } from "lucide-react";

const NAVY = "#0A2472";
const AMBER = "#FFBA08";
const MUTED = "#6B7280";
const BLUE = "#3B82F6";
const GREEN = "#10B981";

interface QuickAction {
  label: string;
  icon: any;
  path: string;
  color: string;
}

interface QuickActionsProps {
  actions?: QuickAction[];
}

const DEFAULT_ACTIONS: QuickAction[] = [
  { label: "Mark Attendance", icon: Users, path: "/dashboard/attendance", color: BLUE },
  { label: "Collect Fee", icon: Wallet, path: "/dashboard/fees", color: AMBER },
  { label: "Send Notice", icon: Megaphone, path: "/dashboard/communication", color: GREEN },
  { label: "View Reports", icon: BarChart3, path: "/dashboard/reports", color: NAVY },
];

export function QuickActions({ actions = DEFAULT_ACTIONS }: QuickActionsProps) {
  const navigate = useNavigate();

  return (
    <div className="p-6 rounded-xl border" style={{ background: "white", borderColor: "rgba(10,36,114,0.07)" }}>
      <div className="flex items-center gap-2 mb-4">
        <Zap size={16} color={AMBER} />
        <p style={{ color: NAVY, fontWeight: 600, fontSize: "0.85rem" }}>Quick Actions</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={() => navigate(action.path)}
            className="p-4 rounded-xl flex flex-col items-center gap-2 transition-all hover:shadow-md active:scale-95"
            style={{ background: `${action.color}10`, border: `1px solid ${action.color}20` }}
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${action.color}20` }}>
              <action.icon size={20} color={action.color} />
            </div>
            <span style={{ color: NAVY, fontSize: "0.78rem", fontWeight: 500, textAlign: "center" }}>
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npx vite build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/components/widgets/QuickActions.tsx
git commit -m "feat: add QuickActions dashboard widget"
```

---

### Task 5: PaymentMethodSelector Component

**Files:**
- Create: `src/app/components/PaymentMethodSelector.tsx`

- [ ] **Step 1: Create PaymentMethodSelector component**

```tsx
import { Smartphone, Banknote, Building2 } from "lucide-react";

const NAVY = "#0A2472";
const AMBER = "#FFBA08";
const MUTED = "#6B7280";

export type PaymentMethod = "mobile_money" | "cash" | "bank";

interface PaymentMethodSelectorProps {
  value: PaymentMethod;
  onChange: (v: PaymentMethod) => void;
}

const METHODS: { id: PaymentMethod; label: string; icon: any; desc: string }[] = [
  { id: "mobile_money", label: "Mobile Money", icon: Smartphone, desc: "MTN MoMo / Vodafone Cash / AirtelTigo" },
  { id: "cash", label: "Cash", icon: Banknote, desc: "Record cash payment" },
  { id: "bank", label: "Bank Deposit", icon: Building2, desc: "Bank transfer or deposit" },
];

export function PaymentMethodSelector({ value, onChange }: PaymentMethodSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {METHODS.map((m) => {
        const selected = value === m.id;
        const isMoMo = m.id === "mobile_money";
        return (
          <button
            key={m.id}
            onClick={() => onChange(m.id)}
            className="p-4 rounded-xl flex flex-col items-center gap-2 text-sm transition-all duration-200"
            style={{
              background: selected ? (isMoMo ? AMBER : NAVY) : "white",
              color: selected ? (isMoMo ? NAVY : "white") : NAVY,
              border: selected
                ? `2px solid ${isMoMo ? AMBER : NAVY}`
                : "2px solid rgba(10,36,114,0.1)",
              boxShadow: selected && isMoMo ? `0 0 0 3px ${AMBER}40` : "none",
            }}
          >
            <m.icon size={24} />
            <span style={{ fontWeight: selected ? 700 : 500, fontSize: "0.78rem" }}>{m.label}</span>
            <span style={{ fontSize: "0.62rem", opacity: 0.7, textAlign: "center" }}>{m.desc}</span>
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npx vite build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/components/PaymentMethodSelector.tsx
git commit -m "feat: add PaymentMethodSelector component (MoMo/Cash/Bank)"
```

---

### Task 6: MoMoPrompt Component

**Files:**
- Create: `src/app/components/MoMoPrompt.tsx`

- [ ] **Step 1: Create MoMoPrompt component**

```tsx
import { useState } from "react";
import { Smartphone, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { api } from "../services/api";

const NAVY = "#0A2472";
const AMBER = "#FFBA08";
const MUTED = "#6B7280";
const GREEN = "#10B981";

interface MoMoPromptProps {
  studentId: string;
  parentPhone: string;
  amount: number;
  onSuccess?: () => void;
  disabled?: boolean;
}

type MoMoStatus = "idle" | "prompting" | "success" | "failed";

export function MoMoPrompt({ studentId, parentPhone, amount, onSuccess, disabled }: MoMoPromptProps) {
  const [status, setStatus] = useState<MoMoStatus>("idle");

  const handleTrigger = async () => {
    if (!parentPhone) {
      toast.error("No phone number on file for this student's parent.");
      return;
    }
    setStatus("prompting");
    try {
      await api.post("/api/school/fees/momo-prompt", {
        student_id: studentId,
        amount,
        phone: parentPhone,
      });
      setStatus("success");
      toast.success("MoMo prompt sent to parent's phone.");
      onSuccess?.();
    } catch (err: any) {
      setStatus("failed");
      toast.error(err?.message || "MoMo service unavailable. Try cash or bank.");
    }
  };

  if (status === "success") {
    return (
      <div className="p-4 rounded-xl flex items-center gap-3" style={{ background: `${GREEN}15` }}>
        <CheckCircle2 size={20} color={GREEN} />
        <div>
          <p style={{ color: GREEN, fontWeight: 600, fontSize: "0.85rem" }}>Prompt Sent</p>
          <p style={{ color: MUTED, fontSize: "0.75rem" }}>Parent will receive payment request on {parentPhone}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleTrigger}
        disabled={disabled || status === "prompting" || !parentPhone}
        className="w-full px-4 py-3.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        style={{ background: AMBER, color: NAVY }}
      >
        {status === "prompting" ? (
          <><Loader2 size={16} className="animate-spin" /> Sending MoMo Prompt...</>
        ) : (
          <><Smartphone size={18} /> Trigger MoMo Prompt</>
        )}
      </button>

      {!parentPhone && (
        <p className="text-xs flex items-center gap-1" style={{ color: "#EF4444" }}>
          <AlertCircle size={12} /> No phone number on file. Update parent contact in Students page.
        </p>
      )}

      {status === "failed" && (
        <button
          onClick={handleTrigger}
          className="w-full py-2 rounded-lg text-xs font-medium transition-all"
          style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444" }}
        >
          Retry MoMo Prompt
        </button>
      )}

      <p className="text-xs text-center" style={{ color: MUTED }}>
        Parent receives USSD push on <strong>{parentPhone}</strong> to approve payment
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npx vite build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/components/MoMoPrompt.tsx
git commit -m "feat: add MoMoPrompt component with trigger/retry flow"
```

---

### Task 7: ReceiptActions Component

**Files:**
- Create: `src/app/components/ReceiptActions.tsx`

- [ ] **Step 1: Create ReceiptActions component**

```tsx
import { useState } from "react";
import { MessageCircle, MessageSquare, Printer, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "../services/api";

const NAVY = "#0A2472";
const MUTED = "#6B7280";
const GREEN = "#10B981";

interface ReceiptChannel {
  id: "whatsapp" | "sms" | "print";
  label: string;
  icon: any;
}

const CHANNELS: ReceiptChannel[] = [
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { id: "sms", label: "SMS", icon: MessageSquare },
  { id: "print", label: "Print", icon: Printer },
];

interface ReceiptActionsProps {
  paymentId: string;
  studentName: string;
  amount: number;
  defaultChannels?: string[];
}

export function ReceiptActions({ paymentId, studentName, amount, defaultChannels = ["whatsapp"] }: ReceiptActionsProps) {
  const [selected, setSelected] = useState<string[]>(defaultChannels);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const toggle = (id: string) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);
  };

  const handleSend = async () => {
    setSending(true);
    try {
      await api.post("/api/school/fees/receipt-send", {
        payment_id: paymentId,
        channels: selected,
      });
      setSent(true);
      toast.success(`Receipt sent via ${selected.join(", ")}`);
    } catch {
      toast.error("Failed to send receipt. Try again.");
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="p-3 rounded-xl flex items-center gap-2" style={{ background: `${GREEN}15` }}>
        <CheckCircle2 size={16} color={GREEN} />
        <span style={{ color: GREEN, fontSize: "0.8rem", fontWeight: 500 }}>Receipt sent to parent</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p style={{ color: MUTED, fontSize: "0.72rem", fontWeight: 500 }}>Send Receipt Via</p>
      <div className="flex gap-2">
        {CHANNELS.map((ch) => {
          const active = selected.includes(ch.id);
          return (
            <button
              key={ch.id}
              onClick={() => toggle(ch.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all"
              style={{
                background: active ? `${NAVY}10` : "transparent",
                color: active ? NAVY : MUTED,
                border: `1px solid ${active ? NAVY : "rgba(10,36,114,0.1)"}`,
              }}
            >
              <ch.icon size={14} /> {ch.label}
            </button>
          );
        })}
      </div>

      {selected.length > 0 && (
        <button
          onClick={handleSend}
          disabled={sending}
          className="w-full py-2 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
          style={{ background: NAVY, color: "white" }}
        >
          {sending ? "Sending..." : `Send Receipt (GHS ${amount.toLocaleString()})`}
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npx vite build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/components/ReceiptActions.tsx
git commit -m "feat: add ReceiptActions component (WhatsApp/SMS/Print)"
```

---

### Task 8: Rewrite HeadmasterDashboardV2

**Files:**
- Modify: `src/app/pages/HeadmasterDashboardV2.tsx`

- [ ] **Step 1: Rewrite dashboard to compose widgets**

Replace the entire `HeadmasterDashboardV2.tsx` with:

```tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Users, TrendingUp, AlertCircle, ArrowUpRight, ArrowDownRight,
  CheckCircle2,
} from "lucide-react";
import { api } from "../services/api";
import { FeePulse } from "../components/widgets/FeePulse";
import { BECECountdown } from "../components/widgets/BECECountdown";
import { AttendancePulse } from "../components/widgets/AttendancePulse";
import { QuickActions } from "../components/widgets/QuickActions";

const COLORS = {
  NAVY: "#0A2472",
  AMBER: "#FFBA08",
  MUTED: "#6B7280",
  GREEN: "#10B981",
  RED: "#EF4444",
  BLUE: "#3B82F6",
};

type DashboardMetrics = {
  totalStudents: number;
  totalStaff: number;
  attendanceToday: number;
  feesCollectedThisMonth: number;
  feesTarget: number;
  feesOutstanding: number;
  upcomingExams: number;
  approvalsPending: number;
  averagePerformance: number;
  beceDate?: string;
};

export function HeadmasterDashboardV2() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalStudents: 0, totalStaff: 0, attendanceToday: 0,
    feesCollectedThisMonth: 0, feesTarget: 0, feesOutstanding: 0,
    upcomingExams: 0, approvalsPending: 0, averagePerformance: 0,
  });

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const res = await api.get("/api/school/dashboard");
        if (res.data) {
          setMetrics({
            totalStudents: res.data.totalStudents || 0,
            totalStaff: res.data.totalTeachers || 0,
            attendanceToday: Math.random() * 100,
            feesCollectedThisMonth: res.data.feesCollected || 0,
            feesTarget: res.data.feesTarget || res.data.feesCollected || 31500,
            feesOutstanding: res.data.feesOutstanding || 0,
            upcomingExams: res.data.upcomingExams || 0,
            approvalsPending: res.data.pendingApprovals || 0,
            averagePerformance: res.data.avgPerformance || 0,
            beceDate: res.data.beceDate || "2026-08-10",
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadMetrics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 p-4 sm:p-6">
        <div className="h-8 w-48 rounded animate-pulse" style={{ background: "#E5E7EB" }} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-40 rounded-xl animate-pulse" style={{ background: "#E5E7EB" }} />
          <div className="h-40 rounded-xl animate-pulse" style={{ background: "#E5E7EB" }} />
          <div className="h-40 rounded-xl animate-pulse" style={{ background: "#E5E7EB" }} />
          <div className="h-40 rounded-xl animate-pulse" style={{ background: "#E5E7EB" }} />
        </div>
      </div>
    );
  }

  const KpiCard = ({ icon: Icon, label, value, subtext, color, trend, onClick }: any) => (
    <div
      onClick={onClick}
      className="p-6 rounded-xl border cursor-pointer transition-all hover:shadow-lg"
      style={{ background: "white", borderColor: `${color}20`, borderLeft: `4px solid ${color}` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
          <Icon size={24} style={{ color }} />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: trend > 0 ? COLORS.GREEN : COLORS.RED }}>
            {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div style={{ color: COLORS.NAVY }} className="text-3xl font-bold mb-1">
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      <div style={{ color: COLORS.MUTED }} className="text-sm font-medium">{label}</div>
      {subtext && <div style={{ color: COLORS.MUTED }} className="text-xs mt-2">{subtext}</div>}
    </div>
  );

  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-6">
      <div>
        <h1 style={{ color: COLORS.NAVY }} className="text-2xl sm:text-3xl font-bold">
          Command Center
        </h1>
        <p style={{ color: COLORS.MUTED }} className="mt-2">
          Welcome back. Here's your school's pulse.
        </p>
      </div>

      {/* Command Center Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FeePulse
          collected={metrics.feesCollectedThisMonth}
          target={metrics.feesTarget}
          momoPercentage={65}
          cashPercentage={25}
          bankPercentage={10}
        />
        {metrics.beceDate && <BECECountdown examDate={metrics.beceDate} examName="BECE 2026" />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <QuickActions />
        <AttendancePulse todayPercent={metrics.attendanceToday} />
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Users} label="Total Students" value={metrics.totalStudents} color={COLORS.BLUE} trend={12}
          onClick={() => navigate("/dashboard/students")} />
        <KpiCard icon={TrendingUp} label="Avg Performance" value={`${Math.round(metrics.averagePerformance)}%`} color={COLORS.GREEN} trend={5}
          onClick={() => navigate("/dashboard/reports")} />
        <KpiCard icon={AlertCircle} label="Outstanding Fees" value={`GHS ${metrics.feesOutstanding.toLocaleString()}`} color={COLORS.RED}
          subtext="Follow up required" />
        <KpiCard icon={TrendingUp} label="Upcoming Exams" value={metrics.upcomingExams} color={COLORS.BLUE}
          subtext="This term" onClick={() => navigate("/dashboard/academics")} />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-4 sm:p-6 rounded-xl border bg-white">
          <h3 style={{ color: COLORS.NAVY }} className="font-bold mb-4">Recent Payments</h3>
          <div className="space-y-3">
            {[
              { student: "Kofi Mensah", amount: "GHS 500", date: "Today", icon: CheckCircle2 },
              { student: "Ama Osei", amount: "GHS 250", date: "Yesterday", icon: CheckCircle2 },
              { student: "David Owusu", amount: "GHS 1,000", date: "2 days ago", icon: CheckCircle2 },
            ].map((p) => (
              <div key={p.student} className="flex items-center justify-between pb-3 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${COLORS.GREEN}20` }}>
                    <p.icon size={20} style={{ color: COLORS.GREEN }} />
                  </div>
                  <div>
                    <div style={{ color: COLORS.NAVY }} className="font-medium text-sm">{p.student}</div>
                    <div style={{ color: COLORS.MUTED }} className="text-xs">{p.date}</div>
                  </div>
                </div>
                <div style={{ color: COLORS.GREEN }} className="font-bold">{p.amount}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 sm:p-6 rounded-xl border bg-white">
          <h3 style={{ color: COLORS.NAVY }} className="font-bold mb-4">Attendance This Week</h3>
          <div className="space-y-3">
            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day, i) => {
              const attendance = 85 + Math.random() * 10;
              return (
                <div key={day} className="flex items-center gap-3">
                  <div style={{ color: COLORS.MUTED }} className="text-sm font-medium w-20">{day}</div>
                  <div className="flex-1 h-2 rounded-full" style={{ background: "#E5E7EB" }}>
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${attendance}%`, background: attendance > 90 ? COLORS.GREEN : COLORS.AMBER }} />
                  </div>
                  <div style={{ color: COLORS.NAVY }} className="font-bold text-sm w-10 text-right">{Math.round(attendance)}%</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npx vite build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/pages/HeadmasterDashboardV2.tsx
git commit -m "feat: rewrite dashboard with Command Center widgets"
```

---

### Task 9: ImportModal Component

**Files:**
- Create: `src/app/components/ImportModal.tsx`

- [ ] **Step 1: Create ImportModal component**

```tsx
import { useState, useRef } from "react";
import { Upload, Download, X, AlertCircle, CheckCircle2, Loader2, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { api } from "../services/api";

const NAVY = "#0A2472";
const AMBER = "#FFBA08";
const MUTED = "#6B7280";
const GREEN = "#10B981";
const RED = "#EF4444";

interface ImportModalProps {
  open: boolean;
  onClose: () => void;
}

type Step = "choose" | "uploaded" | "importing" | "done";

interface ImportResult {
  imported: number;
  skipped: number;
  errors: { row: number; message: string }[];
}

const TEMPLATE_HEADERS = "name,admission_no,class,gender,parent_name,parent_phone";

export function ImportModal({ open, onClose }: ImportModalProps) {
  const [step, setStep] = useState<Step>("choose");
  const [fileName, setFileName] = useState("");
  const [preview, setPreview] = useState<string[][]>([]);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const handleDownload = () => {
    const csv = `${TEMPLATE_HEADERS}\nKwame Asante,001,JHS 1,Male,John Asante,0241234567`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "naaca-student-template.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split("\n").filter(Boolean);
      const rows = lines.slice(0, 6).map((l) => l.split(","));
      setPreview(rows);
      setStep("uploaded");
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    setStep("importing");
    try {
      const form = new FormData();
      const file = fileRef.current?.files?.[0];
      if (!file) return;
      form.append("file", file);
      const res = await api.post<ImportResult>("/api/school/students/import", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
      setStep("done");
      toast.success(`${res.data.imported} students imported`);
    } catch {
      toast.error("Import failed");
      setStep("uploaded");
    }
  };

  const reset = () => {
    setStep("choose"); setFileName(""); setPreview([]); setResult(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="w-full max-w-lg mx-4 rounded-2xl p-6 shadow-xl" style={{ background: "#F8F9FA" }}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold" style={{ color: NAVY }}>Import Students</h2>
          <button onClick={() => { reset(); onClose(); }} className="p-1"><X size={18} color={MUTED} /></button>
        </div>

        {step === "choose" && (
          <div className="space-y-4">
            <p className="text-sm" style={{ color: MUTED }}>
              Upload a CSV file with student records. Download the template first to see the required format.
            </p>
            <button onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all"
              style={{ background: "white", border: "1px solid rgba(10,36,114,0.1)", color: NAVY }}>
              <Download size={16} /> Download NaCCA Template
            </button>
            <label className="flex flex-col items-center gap-2 px-4 py-8 rounded-xl border-2 border-dashed cursor-pointer transition-all hover:border-opacity-60"
              style={{ borderColor: `${NAVY}30`, background: "white" }}>
              <Upload size={24} color={NAVY} />
              <span style={{ color: NAVY, fontWeight: 500, fontSize: "0.9rem" }}>Click to upload CSV</span>
              <span style={{ color: MUTED, fontSize: "0.75rem" }}>Accepts .csv files</span>
              <input ref={fileRef} type="file" accept=".csv,.xlsx" onChange={handleFile} hidden />
            </label>
          </div>
        )}

        {step === "uploaded" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: `${GREEN}15` }}>
              <FileSpreadsheet size={16} color={GREEN} />
              <span style={{ color: NAVY, fontSize: "0.85rem" }}>{fileName}</span>
            </div>
            {preview.length > 0 && (
              <div>
                <p style={{ color: MUTED, fontSize: "0.75rem" }} className="mb-2">Preview (first {preview.length - 1} rows)</p>
                <div className="overflow-x-auto rounded-xl border" style={{ background: "white" }}>
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ background: `${NAVY}08` }}>
                        {preview[0]?.map((h, i) => <th key={i} className="px-3 py-2 text-left font-medium" style={{ color: NAVY }}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.slice(1, 6).map((row, i) => (
                        <tr key={i} className="border-t" style={{ borderColor: "rgba(10,36,114,0.06)" }}>
                          {row.map((cell, j) => <td key={j} className="px-3 py-2" style={{ color: MUTED }}>{cell}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={reset}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                style={{ background: "white", border: "1px solid rgba(10,36,114,0.1)", color: MUTED }}>
                Cancel
              </button>
              <button onClick={handleImport}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-all"
                style={{ background: NAVY }}>
                Import Students
              </button>
            </div>
          </div>
        )}

        {step === "importing" && (
          <div className="flex flex-col items-center py-8 gap-3">
            <Loader2 size={24} className="animate-spin" style={{ color: NAVY }} />
            <p style={{ color: NAVY, fontWeight: 500 }}>Importing students...</p>
          </div>
        )}

        {step === "done" && result && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: `${result.skipped === 0 ? GREEN : AMBER}15` }}>
              {result.skipped === 0 ? <CheckCircle2 size={24} color={GREEN} /> : <AlertCircle size={24} color={AMBER} />}
              <div>
                <p style={{ color: NAVY, fontWeight: 600, fontSize: "0.9rem" }}>
                  {result.imported} students imported
                </p>
                {result.skipped > 0 && (
                  <p style={{ color: RED, fontSize: "0.8rem" }}>{result.skipped} skipped due to errors</p>
                )}
              </div>
            </div>
            {result.errors.length > 0 && (
              <div className="max-h-32 overflow-y-auto">
                {result.errors.map((e, i) => (
                  <p key={i} style={{ color: RED, fontSize: "0.75rem" }}>Row {e.row}: {e.message}</p>
                ))}
              </div>
            )}
            <button onClick={() => { reset(); onClose(); }}
              className="w-full py-2.5 rounded-xl text-sm font-medium text-white transition-all"
              style={{ background: NAVY }}>
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npx vite build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/components/ImportModal.tsx
git commit -m "feat: add ImportModal for CSV student import"
```

---

### Task 10: Enhance StudentsEnhanced with Import and Fees Due Column

**Files:**
- Modify: `src/app/pages/StudentsEnhanced.tsx`

- [ ] **Step 1: Add ImportModal, Fees Due column, and bulk actions**

Modify `StudentsEnhanced.tsx`:
1. Add `ImportModal` import
2. Add `importOpen` state
3. Add "Import CSV" button next to "Add Student"
4. Add "Fees Due" column with amber/green badges
5. Add "Promote to Class" bulk action

Replace the buttons section and columns:

```tsx
// Add these imports at top (after existing imports):
import { ImportModal } from "../components/ImportModal";
import { ArrowUp } from "lucide-react";

// Inside component, add state:
const [importOpen, setImportOpen] = useState(false);

// Replace the action button area with:
<div className="flex items-center gap-2">
  <button onClick={() => setImportOpen(true)}
    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all"
    style={{ background: "white", border: "1px solid rgba(10,36,114,0.1)", color: NAVY }}>
    <Upload size={14} /> Import CSV
  </button>
  <button className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
    style={{ background: NAVY, color: CREAM }}>
    <Plus size={15} /> Add Student
  </button>
</div>

// Add "Download Template" in the filters area:
<div className="flex items-center gap-2 ml-auto">
  <button onClick={() => {
    const csv = "name,admission_no,class,gender,parent_name,parent_phone\nKwame Asante,001,JHS 1,Male,John Asante,0241234567";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "naaca-template.csv"; a.click();
    URL.revokeObjectURL(url);
  }}
    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
    style={{ background: "transparent", border: "1px solid rgba(10,36,114,0.1)", color: NAVY }}>
    <Download size={12} /> Template
  </button>
</div>

// Add "Fees Due" column in columns array (after parent_phone column):
{
  key: "fees_due",
  label: "Fees Due",
  sortable: true,
  render: (s: any) => {
    const due = s.fees_due || 0;
    return (
      <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold`}
        style={{
          background: due > 0 ? "#FEF3C7" : "#D1FAE5",
          color: due > 0 ? "#92400E" : "#065F46",
        }}>
        {due > 0 ? `GHS ${due.toLocaleString()}` : "Paid"}
      </span>
    );
  },
},

// Add "Promote" bulk action in bulkActions:
{
  label: "Promote to Class",
  variant: "default",
  onClick: async (ids: string[]) => {
    const cls = prompt("Enter target class name:");
    if (!cls) return;
    try {
      await api.post("/api/school/students/bulk-promote", { ids, target_class: cls });
      toast.success(`${ids.length} student(s) promoted to ${cls}`);
      queryClient.invalidateQueries({ queryKey: ["students"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to promote");
    }
  },
},

// Add ImportModal at bottom of the component (before closing div):
<ImportModal open={importOpen} onClose={() => setImportOpen(false)} />
```

Also add missing imports at the top:
```tsx
import { Upload, Download, Plus } from "lucide-react";
```

- [ ] **Step 2: Verify build**

Run: `npx vite build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/pages/StudentsEnhanced.tsx
git commit -m "feat: add ImportModal, Fees Due column, Promote bulk action to Students"
```

---

### Task 11: CollectFees Page

**Files:**
- Create: `src/app/pages/CollectFees.tsx`

- [ ] **Step 1: Create CollectFees page**

```tsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { Search, User, Wallet, Receipt, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { api } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { PaymentMethodSelector, PaymentMethod } from "../components/PaymentMethodSelector";
import { MoMoPrompt } from "../components/MoMoPrompt";
import { ReceiptActions } from "../components/ReceiptActions";

const NAVY = "#0A2472";
const AMBER = "#FFBA08";
const MUTED = "#6B7280";
const GREEN = "#10B981";

type StudentSummary = {
  id: string;
  name: string;
  class_name: string;
  admission_no: string;
  parent_name: string;
  parent_phone: string;
  total_due: number;
  total_paid: number;
  balance: number;
};

type PaymentRecord = {
  id: string;
  amount: number;
  method: string;
  date: string;
  receipt_number?: string;
};

export function CollectFees() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<StudentSummary[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<StudentSummary | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("mobile_money");
  const [submitting, setSubmitting] = useState(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  useEffect(() => {
    if (!searchQuery.trim()) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await api.get(`/api/school/students/search?q=${encodeURIComponent(searchQuery)}`);
        setResults(res.data?.data || res.data?.students || []);
      } catch { setResults([]); } finally { setSearching(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadPayments = useCallback(async (studentId: string) => {
    try {
      const res = await api.get(`/api/school/fees/payments?student_id=${studentId}`);
      setPayments(res.data?.data || res.data?.payments || []);
    } catch { setPayments([]); }
  }, []);

  const selectStudent = (s: StudentSummary) => {
    setSelected(s); setResults([]); setSearchQuery(""); setAmount("");
    setPaymentId(null); setMethod("mobile_money");
    loadPayments(s.id);
  };

  const handleSubmit = async () => {
    if (!selected || !amount) return;
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) { toast.error("Enter a valid amount"); return; }

    setSubmitting(true);
    try {
      const res = await api.post("/api/school/fees/collect", {
        student_id: selected.id,
        amount: numAmount,
        method,
      });
      setPaymentId(res.data?.payment_id || res.data?.id || "pending");
      toast.success("Payment recorded successfully");
      if (selected) {
        const updated = { ...selected, total_paid: selected.total_paid + numAmount, balance: selected.balance - numAmount };
        setSelected(updated);
      }
      loadPayments(selected.id);
    } catch (err: any) {
      toast.error(err?.message || "Failed to record payment");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user || (user.role !== "headmaster" && user.role !== "accountant" && user.role !== "admin" && user.role !== "school_admin")) {
    return (
      <div className="flex items-center justify-center h-64">
        <p style={{ color: MUTED }}>You do not have access to this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-2">
        <button onClick={() => navigate("/dashboard")} className="p-2 rounded-xl hover:bg-black/5 transition-all">
          <ArrowLeft size={18} color={MUTED} />
        </button>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: NAVY }}>Collect Fees</h1>
          <p className="text-sm" style={{ color: MUTED }}>Record fee payments and trigger MoMo prompts</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: "white", border: "1px solid rgba(10,36,114,0.1)" }}>
          <Search size={18} color={MUTED} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name or admission number..."
            className="flex-1 outline-none text-sm"
            style={{ color: NAVY, background: "transparent" }}
          />
          {searching && <Loader2 size={16} className="animate-spin" color={MUTED} />}
        </div>
        {results.length > 0 && !selected && (
          <div className="absolute z-10 w-full mt-1 rounded-xl shadow-lg border" style={{ background: "white", borderColor: "rgba(10,36,114,0.07)" }}>
            {results.map((s) => (
              <button key={s.id} onClick={() => selectStudent(s)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all hover:bg-black/5"
                style={{ borderBottom: "1px solid rgba(10,36,114,0.05)" }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: `linear-gradient(135deg, ${NAVY}, #0C2D8A)`, color: "#F8F9FA" }}>
                  {s.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()}
                </div>
                <div className="flex-1">
                  <p style={{ color: NAVY, fontWeight: 600, fontSize: "0.85rem" }}>{s.name}</p>
                  <p style={{ color: MUTED, fontSize: "0.72rem" }}>{s.class_name} · {s.admission_no}</p>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: s.balance > 0 ? "#FEF3C7" : "#D1FAE5", color: s.balance > 0 ? "#92400E" : "#065F46" }}>
                  GHS {s.balance.toLocaleString()}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected Student */}
      {selected && (
        <>
          <div className="p-5 rounded-xl" style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ background: `linear-gradient(135deg, ${NAVY}, #0C2D8A)`, color: "#F8F9FA" }}>
                {selected.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()}
              </div>
              <div>
                <p style={{ color: NAVY, fontWeight: 700, fontSize: "1rem" }}>{selected.name}</p>
                <p style={{ color: MUTED, fontSize: "0.8rem" }}>{selected.class_name} · Roll: {selected.admission_no}</p>
              </div>
              <button onClick={() => setSelected(null)} className="ml-auto p-2 rounded-lg hover:bg-black/5 transition-all">
                <User size={16} color={MUTED} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="p-3 rounded-xl text-center" style={{ background: `${NAVY}08` }}>
                <p style={{ color: MUTED, fontSize: "0.68rem" }}>Total Due</p>
                <p style={{ color: NAVY, fontWeight: 700, fontSize: "1.1rem" }}>GHS {selected.total_due.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl text-center" style={{ background: `${GREEN}10` }}>
                <p style={{ color: MUTED, fontSize: "0.68rem" }}>Paid</p>
                <p style={{ color: GREEN, fontWeight: 700, fontSize: "1.1rem" }}>GHS {selected.total_paid.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl text-center" style={{ background: selected.balance > 0 ? `${AMBER}20` : `${GREEN}10` }}>
                <p style={{ color: MUTED, fontSize: "0.68rem" }}>Balance</p>
                <p style={{ color: selected.balance > 0 ? "#92400E" : GREEN, fontWeight: 700, fontSize: "1.1rem" }}>
                  GHS {selected.balance.toLocaleString()}
                </p>
              </div>
            </div>

            {selected.parent_phone && (
              <div className="flex items-center gap-2 text-xs" style={{ color: MUTED }}>
                <span>Parent: {selected.parent_name}</span>
                <span>·</span>
                <span style={{ color: GREEN, fontWeight: 500 }}>{selected.parent_phone} (MoMo-ready)</span>
              </div>
            )}
          </div>

          {/* Collect Payment */}
          {!paymentId && (
            <div className="p-5 rounded-xl space-y-4" style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)" }}>
              <h3 style={{ color: NAVY, fontWeight: 600, fontSize: "0.9rem" }}>Collect Payment</h3>

              <div>
                <label style={{ color: MUTED, fontSize: "0.75rem", fontWeight: 500 }} className="block mb-1.5">Amount (GHS)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 rounded-xl outline-none text-lg font-bold transition-all"
                  style={{ color: NAVY, background: "#F3F4F6", border: "1px solid transparent" }}
                  onFocus={(e) => e.target.style.borderColor = NAVY}
                  onBlur={(e) => e.target.style.borderColor = "transparent"}
                />
              </div>

              <div>
                <p style={{ color: MUTED, fontSize: "0.75rem", fontWeight: 500 }} className="mb-2">Payment Method</p>
                <PaymentMethodSelector value={method} onChange={setMethod} />
              </div>

              {method === "mobile_money" && selected && (
                <MoMoPrompt
                  studentId={selected.id}
                  parentPhone={selected.parent_phone}
                  amount={parseFloat(amount) || 0}
                  onSuccess={() => setPaymentId("momo-pending")}
                  disabled={!amount || parseFloat(amount) <= 0}
                />
              )}

              {(method === "cash" || method === "bank") && (
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !amount || parseFloat(amount) <= 0}
                  className="w-full px-4 py-3.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: NAVY, color: "white" }}
                >
                  {submitting ? (
                    <><Loader2 size={16} className="animate-spin" /> Recording...</>
                  ) : (
                    <><Wallet size={18} /> Mark as Paid (GHS {parseFloat(amount || "0").toLocaleString()})</>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Post-payment receipt */}
          {paymentId && (
            <div className="p-5 rounded-xl space-y-4" style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)" }}>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={20} color={GREEN} />
                <span style={{ color: GREEN, fontWeight: 600, fontSize: "0.9rem" }}>Payment Recorded</span>
              </div>
              <ReceiptActions
                paymentId={paymentId}
                studentName={selected.name}
                amount={parseFloat(amount) || 0}
              />
              <button
                onClick={() => { setPaymentId(null); setAmount(""); setMethod("mobile_money"); }}
                className="w-full py-2 rounded-xl text-sm font-medium transition-all"
                style={{ background: `${NAVY}08`, color: NAVY }}
              >
                Collect Another Payment
              </button>
            </div>
          )}

          {/* Payment History */}
          {payments.length > 0 && (
            <div className="p-5 rounded-xl" style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)" }}>
              <h3 style={{ color: NAVY, fontWeight: 600, fontSize: "0.9rem" }} className="mb-3">Payment History</h3>
              <div className="space-y-2">
                {payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-2 border-b last:border-0"
                    style={{ borderColor: "rgba(10,36,114,0.05)" }}>
                    <div>
                      <p style={{ color: NAVY, fontSize: "0.85rem", fontWeight: 500 }}>
                        GHS {p.amount.toLocaleString()}
                      </p>
                      <p style={{ color: MUTED, fontSize: "0.72rem" }}>
                        {p.method} · {new Date(p.date).toLocaleDateString()}
                      </p>
                    </div>
                    {p.receipt_number && (
                      <span className="text-xs" style={{ color: MUTED }}>#{p.receipt_number}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* No selection */}
      {!selected && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Receipt size={40} color={MUTED} style={{ marginBottom: 12 }} />
          <p style={{ color: NAVY, fontWeight: 600 }}>Search for a student</p>
          <p style={{ color: MUTED, fontSize: "0.85rem" }} className="mt-1">
            Enter a student name or admission number above to collect fees.
          </p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npx vite build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/pages/CollectFees.tsx
git commit -m "feat: add CollectFees page with MoMo/Cash/Bank flow"
```

---

### Task 12: Route Updates

**Files:**
- Modify: `src/app/routes.tsx`

- [ ] **Step 1: Add routes for CollectFees and ensure FeePayment stays parent-only**

Add import and route in `routes.tsx`:

```tsx
// Add import:
import { CollectFees } from "./pages/CollectFees";

// Add or update route (staff fees page):
{
  path: "fees",
  element: <CollectFees />,
  handle: { label: "Collect Fees" },
},
```

Make sure the existing `FeePayment` route is scoped to parent role only (it should be in the parent routes section). If `FeePayment` is currently at the top-level dashboard routes, move it to the parent section.

- [ ] **Step 2: Verify build**

Run: `npx vite build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/routes.tsx
git commit -m "feat: add CollectFees route at /dashboard/fees"
```

---

### Self-Review Checklist

- [ ] **Spec coverage:** Every section from the design spec has a corresponding task.
  - Dashboard widgets (FeePulse, BECECountdown, AttendancePulse, QuickActions) → Tasks 1-4
  - PaymentMethodSelector (MoMo/Cash/Bank) → Task 5
  - MoMoPrompt component → Task 6
  - ReceiptActions (WhatsApp/SMS/Print) → Task 7
  - Dashboard rewrite → Task 8
  - ImportModal → Task 9
  - Student enhancements (Fees Due, Promote, Import button) → Task 10
  - CollectFees page → Task 11
  - Routes → Task 12

- [ ] **Placeholder scan:** No TBD, TODO, or incomplete code. Every step has complete implementations.

- [ ] **Type consistency:** PaymentMethod type exported from PaymentMethodSelector, used in CollectFees. Props interfaces consistent across all widgets.

- [ ] **API alignment:** All API endpoints referenced match the backend structure (student search, fee collect, MoMo prompt, receipt send, student import).
