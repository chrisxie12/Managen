import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Users, GraduationCap, Loader2, AlertCircle, CheckCircle2, X } from "lucide-react";
import { api } from "../services/api";
import { ChildCard } from "../components/parent/ChildCard";

const PLUM = "#381932";
const MUTED = "#7D6077";

function AlertBanner({ type, message, onClose }: { type: "error" | "success"; message: string; onClose: () => void }) {
  return (
    <div className="mb-4 p-3 rounded-xl flex items-center gap-2" style={{
      background: type === "error" ? "#FEF2F2" : "#D1FAE5",
      color: type === "error" ? "#EF4444" : "#065F46",
      border: `1px solid ${type === "error" ? "#FECACA" : "#A7F3D0"}`,
      fontSize: "0.9rem",
    }}>
      {type === "error" ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose}><X size={14} /></button>
    </div>
  );
}

type ChildData = {
  id: string;
  name: string;
  class_name: string;
  admission_no?: string;
};

export function ParentDashboard() {
  const navigate = useNavigate();
  const [children, setChildren] = useState<ChildData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get<{ children: ChildData[] }>("/api/school/parent/children")
      .then(res => setChildren(res.data?.children || []))
      .catch((err) => setError(err.message || "Failed to load children."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="animate-spin" size={32} color={PLUM} /></div>;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <AlertBanner type="error" message={error} onClose={() => setError("")} />
        <div className="text-center py-16" style={{ color: MUTED }}>
          <GraduationCap size={48} className="mx-auto mb-4" color={MUTED} />
          <p className="text-lg font-semibold" style={{ color: PLUM }}>Could not load data</p>
        </div>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px] rounded-[24px]" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
        <div className="text-center p-8">
          <GraduationCap size={40} color={MUTED} className="mx-auto mb-4" />
          <p className="text-lg font-semibold" style={{ color: PLUM }}>No Children Linked Yet</p>
          <p className="text-sm mt-1" style={{ color: MUTED }}>
            Your child's attendance, grades, and fee status will appear here once your account is linked by the school.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: PLUM, fontFamily: "'Playfair Display', serif" }}>My Children</h2>
          <p className="text-sm" style={{ color: MUTED }}>Track your child's progress</p>
        </div>
        <div className="flex items-center gap-2 text-sm" style={{ color: MUTED }}>
          <Users size={14} /> {children.length} child{children.length !== 1 ? "ren" : ""}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {children.map(child => (
          <ChildCard key={child.id} child={child} onClick={() => navigate(`/dashboard/parent/child/${child.id}`)} />
        ))}
      </div>
    </div>
  );
}
