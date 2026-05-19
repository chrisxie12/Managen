import { useState } from "react";
import {
  Building2, BookOpen, Shield, CreditCard, MessageSquare,
  ClipboardCheck, Download, Globe, ChevronDown,
} from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { GeneralProfileTab } from "./tabs/GeneralProfileTab";
import { AcademicsTab } from "./tabs/AcademicsTab";
import { PaystackConfigTab } from "./tabs/PaystackConfigTab";
import { ArkeselSmsTab } from "./tabs/ArkeselSmsTab";
import { AdmissionTab } from "./tabs/AdmissionTab";
import { SecurityAuditTab } from "./tabs/SecurityAuditTab";
import { BackupsTab } from "./tabs/BackupsTab";
import { CustomDomainsTab } from "./tabs/CustomDomainsTab";

const PLUM = "#381932";
const PLUM_LIGHT = "#512b4a";
const MILK = "#FFF3E6";
const MUTED = "#7D6077";

const tabs = [
  { key: "profile", label: "General Profile", icon: Building2 },
  { key: "academics", label: "Academics & NaCCA", icon: BookOpen },
  { key: "paystack", label: "Paystack Config", icon: CreditCard },
  { key: "arkesel", label: "Arkesel SMS", icon: MessageSquare },
  { key: "admission", label: "Admission Checklists", icon: ClipboardCheck },
  { key: "security", label: "Security & Audit Logs", icon: Shield },
  { key: "backups", label: "Backups & Export", icon: Download },
  { key: "domains", label: "Custom Domains", icon: Globe },
];

export function SchoolSettings() {
  const { user } = useAuth();
  const role = user?.role || "";
  const [activeTab, setActiveTab] = useState("profile");
  const [mobileOpen, setMobileOpen] = useState(false);

  const renderTab = () => {
    switch (activeTab) {
      case "profile": return <GeneralProfileTab role={role} />;
      case "academics": return <AcademicsTab role={role} />;
      case "paystack": return <PaystackConfigTab role={role} />;
      case "arkesel": return <ArkeselSmsTab role={role} />;
      case "admission": return <AdmissionTab role={role} />;
      case "security": return <SecurityAuditTab role={role} />;
      case "backups": return <BackupsTab role={role} />;
      case "domains": return <CustomDomainsTab role={role} />;
      default: return null;
    }
  };

  return (
    <div className="flex gap-0 min-h-[calc(100vh-80px)]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-[240px] flex-shrink-0 p-4 gap-1"
        style={{ background: "#F9F1E7", borderRight: "1px solid rgba(56,25,50,0.07)" }}>
        <h2 className="text-sm font-bold mb-3 px-3" style={{ color: PLUM }}>School Settings</h2>
        {tabs.map(tab => {
          const active = activeTab === tab.key;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-left transition-all active:scale-95"
              style={{ background: active ? PLUM : "transparent", color: active ? MILK : PLUM_LIGHT }}>
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
            {tabs.find(t => t.key === activeTab)?.label || "Settings"}
            <ChevronDown size={16} />
          </button>
          {mobileOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-10 shadow-lg"
              style={{ background: "white", border: "1px solid rgba(56,25,50,0.1)" }}>
              {tabs.map(tab => (
                <button key={tab.key} onClick={() => { setActiveTab(tab.key); setMobileOpen(false); }}
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
        {renderTab()}
      </div>
    </div>
  );
}
