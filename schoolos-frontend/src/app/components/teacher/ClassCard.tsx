import { BookOpen, Users, GraduationCap, ChevronRight } from "lucide-react";
import type { TeacherClass } from "./types";

const NAVY = "#031B4E";
const NAVY_LIGHT = "#0069D9";
const CREAM = "#F8F9FA";
const MUTED = "#6B7280";

export function ClassCard({ c, onClick }: { c: TeacherClass; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="p-5 rounded-[24px] cursor-pointer hover:scale-[1.02] transition-all active:scale-[0.98]"
      style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)", boxShadow: "0 4px 24px rgba(10,36,114,0.06)" }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: `${NAVY}15` }}>
          <BookOpen size={18} color={NAVY} />
        </div>
        <ChevronRight size={14} color={MUTED} />
      </div>
      <p style={{ fontFamily: "'Playfair Display', serif", color: NAVY, fontWeight: 700, fontSize: "1.15rem", marginBottom: "0.25rem" }}>
        {c.name}
      </p>
      <p style={{ color: MUTED, fontSize: "0.75rem", marginBottom: "0.75rem" }}>
        {c.role === "form_teacher" ? "Form Teacher" : c.role === "assistant" ? "Assistant Teacher" : "Subject Teacher"}
      </p>
      <div className="flex items-center gap-4 text-sm" style={{ color: NAVY_LIGHT }}>
        <span className="flex items-center gap-1"><Users size={13} /> {c.student_count} students</span>
        <span className="flex items-center gap-1"><GraduationCap size={13} /> {c.subjects?.length || 0} subjects</span>
      </div>
      {c.subjects && c.subjects.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {c.subjects.map((s: any) => (
            <span key={s.code || s.name} className="px-2 py-0.5 rounded-full text-xs" style={{ background: CREAM, color: NAVY_LIGHT }}>
              {s.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
