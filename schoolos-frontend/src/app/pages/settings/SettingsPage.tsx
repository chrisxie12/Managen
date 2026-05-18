import { useState, useEffect, useCallback } from "react";
import { useBlocker } from "react-router";
import {
  Building2, BookOpen, Wallet, Bell, Users, Shield,
  CreditCard, AlertTriangle, ChevronDown, Loader2,
} from "lucide-react";
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

const PLUM = "#381932";
const PLUM_LIGHT = "#512b4a";
const MUTED = "#7D6077";

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
  { key: "profile", label: "School Profile", icon: Building2, roles: ["school_admin", "headmaster"] },
  { key: "academic", label: "Academic Settings", icon: BookOpen, roles: ["school_admin", "headmaster"] },
  { key: "fee", label: "Fee Settings", icon: Wallet, roles: ["school_admin"] },
  { key: "notifications", label: "Notifications", icon: Bell, roles: ["school_admin"] },
  { key: "users", label: "User Management", icon: Users, roles: ["school_admin"] },
  { key: "security", label: "Security", icon: Shield, roles: ["school_admin"] },
  { key: "billing", label: "Billing", icon: CreditCard, roles: ["school_admin"] },
  { key: "danger", label: "Danger Zone", icon: AlertTriangle, roles: ["school_admin"] },
];

export function SettingsPage() {
  const { user } = useAuth();
  const role = user?.role || "school_admin";
  const [profile, setProfile] = useState<SchoolProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [dirty, setDirty] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const blocker = useBlocker(dirty);

  const visibleTabs = tabs.filter(t => t.roles.includes(role) || role === "school_admin");

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<any>("/school/settings");
      if (res.data) setProfile(res.data.data || res.data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleSave = async (data: Record<string, any>) => {
    setSaving(true);
    try {
      const res = await api.put<any>(`/school/settings/${activeTab}`, data);
      if (res.data) setProfile(prev => prev ? { ...prev, ...(res.data.data || res.data) } : null);
      setDirty(false);
    } finally { setSaving(false); }
  };

  const renderTab = () => {
    if (!profile) return null;
    const props = { profile, onSave: handleSave, saving, role };
    switch (activeTab) {
      case "profile": return <SchoolProfileTab {...props} />;
      case "academic": return <AcademicSettingsTab {...props} />;
      case "fee": return <FeeSettingsTab {...props} />;
      case "notifications": return <NotificationSettingsTab {...props} />;
      case "users": return <UserManagementTab role={role} />;
      case "security": return <SecurityTab role={role} />;
      case "billing": return <BillingTab profile={profile} />;
      case "danger": return <DangerZoneTab profile={profile} />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin" size={32} color={PLUM} />
      </div>
    );
  }

  return (
    <div className="flex gap-0 min-h-[calc(100vh-80px)]">
      {blocker.state === "blocked" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="font-semibold text-sm mb-2" style={{ color: PLUM }}>Unsaved Changes</h3>
            <p className="text-xs mb-4" style={{ color: MUTED }}>You have unsaved changes. Are you sure you want to leave?</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => blocker.reset?.()}
                className="px-4 py-2 rounded-xl text-xs font-medium"
                style={{ background: "rgba(56,25,50,0.06)", color: PLUM }}>Stay</button>
              <button onClick={() => blocker.proceed?.()}
                className="px-4 py-2 rounded-xl text-xs font-medium text-white"
                style={{ background: PLUM }}>Leave</button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-[280px] flex-shrink-0 p-4 gap-1"
        style={{ background: "#F9F1E7", borderRight: "1px solid rgba(56,25,50,0.07)" }}>
        <h2 className="text-sm font-bold mb-3 px-3" style={{ color: PLUM }}>Settings</h2>
        {visibleTabs.map(tab => {
          const active = activeTab === tab.key;
          return (
            <button key={tab.key} onClick={() => { setActiveTab(tab.key); setDirty(false); }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-left transition-all active:scale-95"
              style={{ background: active ? PLUM : "transparent", color: active ? "#FFF3E6" : PLUM_LIGHT }}>
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
            style={{ background: "white", border: "1px solid rgba(56,25,50,0.1)", color: PLUM }}>
            {visibleTabs.find(t => t.key === activeTab)?.label || "Settings"}
            <ChevronDown size={16} />
          </button>
          {mobileOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-10 shadow-lg"
              style={{ background: "white", border: "1px solid rgba(56,25,50,0.1)" }}>
              {visibleTabs.map(tab => (
                <button key={tab.key} onClick={() => { setActiveTab(tab.key); setMobileOpen(false); setDirty(false); }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm"
                  style={{ color: activeTab === tab.key ? PLUM : MUTED, fontWeight: activeTab === tab.key ? 600 : 400 }}>
                  <tab.icon size={15} /> {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
        {dirty && (
          <div className="mb-4 px-4 py-2 rounded-xl text-xs flex items-center gap-2"
            style={{ background: "#FEF3C7", color: "#92400E", border: "1px solid #FDE68A" }}>
            <span>You have unsaved changes</span>
          </div>
        )}
        {profile ? renderTab() : (
          <div className="text-center py-16">
            <p className="text-sm" style={{ color: "#EF4444" }}>Failed to load settings.</p>
            <button onClick={fetchProfile} className="mt-2 text-xs underline" style={{ color: PLUM }}>Retry</button>
          </div>
        )}
      </div>
    </div>
  );
}
