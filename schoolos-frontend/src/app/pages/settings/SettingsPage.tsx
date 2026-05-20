import { useState, useEffect, useCallback } from "react";
import { useBlocker, useLocation } from "react-router";
import {
  Building2, BookOpen, Wallet, Bell, Users, Shield,
  CreditCard, AlertTriangle, ChevronDown, Loader2, Info,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { SchoolProfileTab } from "./tabs/SchoolProfileTab";
import { AcademicSettingsTab } from "./tabs/AcademicSettingsTab";
import { FeeSettingsTab } from "./tabs/FeeSettingsTab";
import { NotificationSettingsTab } from "./tabs/NotificationSettingsTab";
import { UserManagementTab } from "./tabs/UserManagementTab";
import { SecurityTab } from "./tabs/SecurityTab";
import { BillingTab } from "./tabs/BillingTab";
import { DangerZoneTab } from "./tabs/DangerZoneTab";

const NAVY = "#0A2472";
const NAVY_LIGHT = "#0C2D8A";
const MUTED = "#6B7280";

type SchoolProfile = {
  id: string; name: string; email: string; phone: string | null;
  motto: string | null; address: string | null; website: string | null;
  city: string | null; region: string | null; country: string | null;
  slug: string; logo_url: string | null;
  primary_color: string; school_type: string | null;
  registration_number: string | null; year_established: number | null;
  grading_system: string; academic_year: string | null;
  current_term: string | null; term_start_date: string | null;
  term_end_date: string | null; pass_mark: number | null;
  payment_methods: any[]; fee_categories: any[];
  late_fee_settings: any; receipt_settings: any;
  notification_settings: any; attendance_settings: any;
  class_settings: any; security_settings: any;
  billing_plan: string; billing_status: string;
  billing_renewal_date: string | null;
  metadata: any; is_active: boolean;
  created_at: string;
};

const tabs = [
  { key: "profile", label: "School Profile", icon: Building2, allowedRoles: ["school_admin", "admin", "superadmin"] },
  { key: "academic", label: "Academic Settings", icon: BookOpen, allowedRoles: ["school_admin", "admin", "superadmin"] },
  { key: "fee", label: "Fee Settings", icon: Wallet, allowedRoles: ["school_admin", "admin", "superadmin", "accountant"] },
  { key: "notifications", label: "Notifications", icon: Bell, allowedRoles: ["school_admin", "admin", "superadmin"] },
  { key: "users", label: "User Management", icon: Users, allowedRoles: ["school_admin", "admin", "superadmin"] },
  { key: "security", label: "Security", icon: Shield, allowedRoles: ["school_admin", "admin", "superadmin"] },
  { key: "billing", label: "Billing", icon: CreditCard, allowedRoles: ["school_admin", "admin", "superadmin"] },
  { key: "danger", label: "Danger Zone", icon: AlertTriangle, allowedRoles: ["school_admin", "admin", "superadmin"] },
];

export function SettingsPage() {
  const { user } = useAuth();
  const role = user?.role || "";
  const location = useLocation();
  const missingFromGuard = (location.state as { missing?: string[] })?.missing || null;
  const [profile, setProfile] = useState<SchoolProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(missingFromGuard ? "profile" : "profile");
  const [dirty, setDirty] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const blocker = useBlocker(dirty);

  const visibleTabs = tabs.filter(t => t.allowedRoles.includes(role));

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<any>("/api/school/settings");
      if (res.data) setProfile(res.data.data || res.data);
    } catch (e) { console.error("Settings fetch failed:", e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  useEffect(() => {
    const currentTab = tabs.find(t => t.key === activeTab);
    if (currentTab && !currentTab.allowedRoles.includes(role)) {
      const first = visibleTabs[0];
      if (first) {
        setActiveTab(first.key);
        toast.error("You don't have access to that section.");
      }
    }
  }, [activeTab, role, visibleTabs]);

  const handleSave = async (data: Record<string, any>) => {
    setSaving(true);
    try {
      const res = await api.put<any>(`/api/school/settings/${activeTab}`, data);
      if (res.data) setProfile(prev => prev ? { ...prev, ...(res.data.data || res.data) } : null);
      setDirty(false);
      return true;
    } catch (err: any) {
      toast.error(err?.response?.data?.error || err?.message || "Failed to save settings");
      return false;
    } finally { setSaving(false); }
  };

  const renderTab = () => {
    const props = { profile, onSave: handleSave, saving, role, redirectOnComplete: !!missingFromGuard };
    switch (activeTab) {
      case "profile": return <SchoolProfileTab />;
      case "academic": return profile ? <AcademicSettingsTab {...props} /> : null;
      case "fee": return profile ? <FeeSettingsTab {...props} /> : null;
      case "notifications": return profile ? <NotificationSettingsTab {...props} /> : null;
      case "users": return <UserManagementTab role={role} />;
      case "security": return <SecurityTab role={role} />;
      case "billing": return profile ? <BillingTab profile={profile} role={role} /> : null;
      case "danger": return profile ? <DangerZoneTab profile={profile} /> : null;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin" size={32} color={NAVY} />
      </div>
    );
  }

  if (visibleTabs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-sm" style={{ color: MUTED }}>You don't have access to Settings.</p>
      </div>
    );
  }

  return (
    <div className="flex gap-0 min-h-[calc(100vh-80px)]">
      {blocker.state === "blocked" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="font-semibold text-sm mb-2" style={{ color: NAVY }}>Unsaved Changes</h3>
            <p className="text-xs mb-4" style={{ color: MUTED }}>You have unsaved changes. Are you sure you want to leave?</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => blocker.reset?.()}
                className="px-4 py-2 rounded-xl text-xs font-medium"
                style={{ background: "rgba(56,25,50,0.06)", color: NAVY }}>Stay</button>
              <button onClick={() => blocker.proceed?.()}
                className="px-4 py-2 rounded-xl text-xs font-medium text-white"
                style={{ background: NAVY }}>Leave</button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-[280px] flex-shrink-0 p-4 gap-1"
        style={{ background: "#F9F1E7", borderRight: "1px solid rgba(56,25,50,0.07)" }}>
        <h2 className="text-sm font-bold mb-3 px-3" style={{ color: NAVY }}>Settings</h2>
        {visibleTabs.map(tab => {
          const active = activeTab === tab.key;
          return (
            <button key={tab.key} onClick={() => { setActiveTab(tab.key); setDirty(false); }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-left transition-all active:scale-95"
              style={{ background: active ? NAVY : "transparent", color: active ? "#F8F9FA" : NAVY_LIGHT }}>
              <tab.icon size={17} />
              <span style={{ fontSize: "0.9rem", fontWeight: active ? 600 : 400 }}>{tab.label}</span>
            </button>
          );
        })}
      </aside>

      {/* Mobile dropdown */}
      <div className="lg:hidden px-4 pt-4 w-full">
        <div className="relative">
          <button onClick={() => setMobileOpen(!mobileOpen)}
            className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-sm font-medium"
            style={{ background: "white", border: "1px solid rgba(56,25,50,0.1)", color: NAVY }}>
            {visibleTabs.find(t => t.key === activeTab)?.label || "Settings"}
            <ChevronDown size={16} />
          </button>
          {mobileOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-10 shadow-lg"
              style={{ background: "white", border: "1px solid rgba(56,25,50,0.1)" }}>
              {visibleTabs.map(tab => (
                <button key={tab.key} onClick={() => { setActiveTab(tab.key); setMobileOpen(false); setDirty(false); }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm"
                  style={{ color: activeTab === tab.key ? NAVY : MUTED, fontWeight: activeTab === tab.key ? 600 : 400 }}>
                  <tab.icon size={15} /> {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
        {missingFromGuard && (
          <div className="mb-4 px-4 py-3 rounded-xl text-xs flex items-start gap-2"
            style={{ background: "#FEF3C7", color: "#92400E", border: "1px solid #FDE68A" }}>
            <Info size={14} className="mt-0.5 shrink-0" />
            <div>
              <span className="font-semibold">Please complete your school profile.</span>
              {" "}The following fields are required: <span className="font-medium">{missingFromGuard.join(", ")}</span>
            </div>
          </div>
        )}
        {dirty && (
          <div className="mb-4 px-4 py-2 rounded-xl text-xs flex items-center gap-2"
            style={{ background: "#FEF3C7", color: "#92400E", border: "1px solid #FDE68A" }}>
            <span>You have unsaved changes</span>
          </div>
        )}
        {renderTab()}
      </div>
    </div>
  );
}
