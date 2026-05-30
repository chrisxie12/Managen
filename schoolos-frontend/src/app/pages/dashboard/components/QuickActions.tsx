import { useNavigate } from "react-router";
import { UserPlus, CreditCard, MessageSquare, Shield } from "lucide-react";

const NAVY = "#031B4E";
const NAVY_LIGHT = "#0069D9";

interface QuickActionItem {
  label: string;
  desc: string;
  icon: typeof UserPlus;
  color: string;
  bg: string;
  path: string;
}

const actions: QuickActionItem[] = [
  {
    label: "Admit New Learner",
    desc: "Enroll a new student",
    icon: UserPlus,
    color: "#6366F1",
    bg: "rgba(99,102,241,0.1)",
    path: "/dashboard/students?action=onboard",
  },
  {
    label: "Record Paystack / Cash Receipt",
    desc: "Log a payment collection",
    icon: CreditCard,
    color: "#16A34A",
    bg: "rgba(16,185,129,0.1)",
    path: "/dashboard/fees?action=collect",
  },
  {
    label: "Broadcast Bulk Arkesel SMS",
    desc: "Send mass notification",
    icon: MessageSquare,
    color: "#25D366",
    bg: "rgba(37,211,102,0.1)",
    path: "/dashboard/communication?action=broadcast",
  },
  {
    label: "Audit Security / RBAC Overrides",
    desc: "Review roles & permissions",
    icon: Shield,
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.1)",
    path: "/dashboard/roles",
  },
];

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="p-6 rounded-[24px]" style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)", boxShadow: "0 4px 24px rgba(10,36,114,0.06)" }}>
      <h3 style={{ fontFamily: "'Playfair Display', serif", color: NAVY, fontWeight: 700, fontSize: "1rem", marginBottom: "1rem" }}>
        Quick Actions
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {actions.map((action) => (
          <button
            key={action.path}
            onClick={() => navigate(action.path)}
            className="p-4 rounded-2xl text-left hover:scale-[1.02] active:scale-95 transition-all"
            style={{ background: action.bg, border: `1px solid ${action.color}20` }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2.5"
              style={{ background: `${action.color}18` }}>
              <action.icon size={17} color={action.color} />
            </div>
            <p style={{ color: NAVY, fontSize: "0.82rem", fontWeight: 600, lineHeight: 1.3, marginBottom: "0.15rem" }}>
              {action.label}
            </p>
            <p style={{ color: NAVY_LIGHT, fontSize: "0.7rem", opacity: 0.7 }}>{action.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
