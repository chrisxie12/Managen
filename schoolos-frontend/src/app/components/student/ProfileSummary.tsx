import { User, BookOpen, Hash, Calendar } from "lucide-react";
import type { StudentProfile } from "./types";

const NAVY = "#031B4E";
const NAVY_LIGHT = "#0069D9";
const CREAM = "#F8F9FA";
const MUTED = "#6B7280";

export function ProfileSummary({ student }: { student: StudentProfile }) {
  const initials = student.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="p-5 rounded-[24px]" style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)", boxShadow: "0 4px 24px rgba(10,36,114,0.06)" }}>
      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold" style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_LIGHT})`, color: CREAM }}>
          {initials}
        </div>
        <div>
          <p className="text-lg font-bold" style={{ color: NAVY, fontFamily: "'Playfair Display', serif" }}>{student.name}</p>
          <p className="text-sm" style={{ color: MUTED }}>{student.class_name}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        {student.admission_no && (
          <div className="flex items-center gap-2 p-2 rounded-xl" style={{ background: CREAM }}>
            <Hash size={13} color={NAVY_LIGHT} />
            <span style={{ color: NAVY }}>{student.admission_no}</span>
          </div>
        )}
        {student.gender && (
          <div className="flex items-center gap-2 p-2 rounded-xl" style={{ background: CREAM }}>
            <User size={13} color={NAVY_LIGHT} />
            <span style={{ color: NAVY }}>{student.gender}</span>
          </div>
        )}
        {student.dob && (
          <div className="flex items-center gap-2 p-2 rounded-xl" style={{ background: CREAM }}>
            <Calendar size={13} color={NAVY_LIGHT} />
            <span style={{ color: NAVY }}>{new Date(student.dob).toLocaleDateString()}</span>
          </div>
        )}
        <div className="flex items-center gap-2 p-2 rounded-xl" style={{ background: CREAM }}>
          <BookOpen size={13} color={NAVY_LIGHT} />
          <span style={{ color: NAVY }}>{student.class_name}</span>
        </div>
      </div>
    </div>
  );
}
