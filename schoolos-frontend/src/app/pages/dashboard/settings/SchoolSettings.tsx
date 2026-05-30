import { useState } from "react";
import {
  Building2, BookOpen, Shield, CreditCard, MessageSquare,
  ClipboardCheck, Download, Globe, MessageCircle,
} from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { GeneralProfileTab } from "./tabs/GeneralProfileTab";
import { AcademicsTab } from "./tabs/AcademicsTab";
import { PaystackConfigTab } from "./tabs/PaystackConfigTab";
import { ArkeselSmsTab } from "./tabs/ArkeselSmsTab";
import { AdmissionTab } from "./tabs/AdmissionTab";
import { SecurityAuditTab } from "./tabs/SecurityAuditTab";
import { BackupsTab } from "./tabs/BackupsTab";
import { CustomDomainsTab } from "./tabs/CustomDomainsTab";
import { WhatsAppTab } from "./tabs/WhatsAppTab";

const NAVY = "#031B4E";
const NAVY_LIGHT = "#0069D9";
const CREAM = "#F8F9FA";
const MUTED = "#6B7280";

const tabs = [
  { key: "profile", label: "General Profile", icon: Building2 },
  { key: "academics", label: "Academics & NaCCA", icon: BookOpen },
  { key: "paystack", label: "Paystack Config", icon: CreditCard },
  { key: "arkesel", label: "Arkesel SMS", icon: MessageSquare },
  { key: "whatsapp", label: "WhatsApp API", icon: MessageCircle },
  { key: "admission", label: "Admission Checklists", icon: ClipboardCheck },
  { key: "security", label: "Security & Audit Logs", icon: Shield },
  { key: "backups", label: "Backups & Export", icon: Download },
  { key: "domains", label: "Custom Domains", icon: Globe },
];

export function SchoolSettings() {
  const { user } = useAuth();
  const role = user?.role || "";
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex gap-0 min-h-[calc(100vh-80px)]">
      {/* Desktop sidebar */}
      <TabsList
        className="hidden lg:flex flex-col w-[240px] flex-shrink-0 p-4 gap-1 h-fit rounded-2xl bg-transparent"
        style={{ background: "#F9F1E7", borderRight: "1px solid rgba(10,36,114,0.07)" }}
      >
        <h2 className="text-sm font-bold mb-3 px-3" style={{ color: NAVY }}>School Settings</h2>
        {tabs.map(tab => (
          <TabsTrigger key={tab.key} value={tab.key}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-left justify-start transition-all active:scale-95 data-[state=active]:scale-100"
            style={{
              background: activeTab === tab.key ? NAVY : "transparent",
              color: activeTab === tab.key ? CREAM : NAVY_LIGHT,
              fontSize: "0.9rem",
              fontWeight: activeTab === tab.key ? 600 : 400,
            }}
          >
            <tab.icon size={17} />
            <span>{tab.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>

      {/* Mobile scrollable horizontal tabs bar */}
      <div className="lg:hidden w-full pt-4 px-4 pb-0">
        <TabsList className="flex-nowrap overflow-x-auto gap-1 p-1 w-full rounded-2xl bg-transparent"
          style={{ border: "1px solid rgba(10,36,114,0.07)" }}>
          {tabs.map(tab => (
            <TabsTrigger key={tab.key} value={tab.key}
              className="whitespace-nowrap px-3 py-1.5 text-xs rounded-xl shrink-0 data-[state=active]:scale-100"
              style={{
                background: activeTab === tab.key ? NAVY : "#F9F1E7",
                color: activeTab === tab.key ? CREAM : NAVY_LIGHT,
              }}
            >
              <tab.icon size={14} className="mr-1" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {/* Content area */}
      <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
        {tabs.map(tab => (
          <TabsContent key={tab.key} value={tab.key} className="mt-0 rounded-2xl">
            {(() => {
              switch (tab.key) {
                case "profile": return <GeneralProfileTab role={role} />;
                case "academics": return <AcademicsTab role={role} />;
                case "paystack": return <PaystackConfigTab role={role} />;
                case "arkesel": return <ArkeselSmsTab role={role} />;
                case "whatsapp": return <WhatsAppTab role={role} />;
                case "admission": return <AdmissionTab role={role} />;
                case "security": return <SecurityAuditTab role={role} />;
                case "backups": return <BackupsTab role={role} />;
                case "domains": return <CustomDomainsTab role={role} />;
                default: return null;
              }
            })()}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
}
