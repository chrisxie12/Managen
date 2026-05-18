import { BookOpen, Users, GraduationCap, ChevronRight } from "lucide-react";
import type { TeacherClass } from "./types";

const PLUM = "#381932";
const PLUM_LIGHT = "#512b4a";
const MILK = "#FFF3E6";
const MUTED = "#7D6077";

export function ClassCard({ c, onClick }: { c: TeacherClass; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="p-5 rounded-[24px] cursor-pointer hover:scale-[1.02] transition-all active:scale-[0.98]"
      style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)", boxShadow: "0 4px 24px rgba(56,25,50,0.06)" }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: `${PLUM}15` }}>
          <BookOpen size={18} color={PLUM} />
        </div>
        <ChevronRight size={14} color={MUTED} />
      </div>
      <p style={{ fontFamily: "'Playfair Display', serif", color: PLUM, fontWeight: 700, fontSize: "1.15rem", marginBottom: "0.25rem" }}>
        {c.name}
      </p>
      <p style={{ color: MUTED, fontSize: "0.75rem", marginBottom: "0.75rem" }}>
        {c.role === "form_teacher" ? "Form Teacher" : c.role === "assistant" ? "Assistant Teacher" : "Subject Teacher"}
      </p>
      <div className="flex items-center gap-4 text-sm" style={{ color: PLUM_LIGHT }}>
        <span className="flex items-center gap-1"><Users size={13} /> {c.student_count} students</span>
        <span className="flex items-center gap-1"><GraduationCap size={13} /> {c.subjects?.length || 0} subjects</span>
      </div>
      {c.subjects && c.subjects.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {c.subjects.map((s: any) => (
            <span key={s.code || s.name} className="px-2 py-0.5 rounded-full text-xs" style={{ background: MILK, color: PLUM_LIGHT }}>
              {s.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
