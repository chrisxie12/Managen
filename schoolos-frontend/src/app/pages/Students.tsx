import { Users, Plus } from "lucide-react";
import { useNavigate } from "react-router";

const NAVY = "#0A2472";
const MUTED = "#6B7280";

export function Students() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontWeight: 800, fontSize: "1.5rem", color: NAVY }}>Students</h1>
          <p style={{ color: MUTED, fontSize: "0.85rem" }}>Manage student records</p>
        </div>
        <button className="px-4 py-2 rounded-full text-sm flex items-center gap-2" style={{ background: NAVY, color: "#F8F9FA" }}>
          <Plus size={15} /> Add Student
        </button>
      </div>

      <div className="flex items-center justify-center min-h-[400px] rounded-[24px]" style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)" }}>
        <div className="text-center p-8">
          <Users size={48} color={MUTED} className="mx-auto mb-4" />
          <p style={{ color: NAVY, fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.3rem" }}>No Students Yet</p>
          <p style={{ color: MUTED, fontSize: "0.85rem", marginBottom: "1.5rem" }}>Add your first student to get started.</p>
          <button onClick={() => navigate("/dashboard/students")} className="px-6 py-2.5 rounded-full text-sm" style={{ background: NAVY, color: "#F8F9FA" }}>
            <Plus size={15} className="inline mr-1" /> Add Student
          </button>
        </div>
      </div>
    </div>
  );
}
