import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Users, GraduationCap } from "lucide-react";
import { api } from "../services/api";
import { ChildCard } from "../components/parent/ChildCard";
import { LoadingSpinner, ErrorState, EmptyState, AlertBanner, palette } from "../components/dashboard";

const { PLUM, MUTED } = palette;

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

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="space-y-4">
        <AlertBanner type="error" message={error} onClose={() => setError("")} />
        <ErrorState message="Please try again or contact support." />
      </div>
    );
  }

  if (children.length === 0) {
    return <EmptyState icon={GraduationCap} title="No Children Linked Yet" desc="Your child's attendance, grades, and fee status will appear here once your account is linked by the school." />;
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
