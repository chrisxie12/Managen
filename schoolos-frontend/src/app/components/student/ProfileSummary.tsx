import { User, BookOpen, Hash, Calendar } from "lucide-react";
import type { StudentProfile } from "./types";

const PLUM = "#381932";
const PLUM_LIGHT = "#512b4a";
const MILK = "#FFF3E6";
const MUTED = "#7D6077";

export function ProfileSummary({ student }: { student: StudentProfile }) {
  const initials = student.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="p-5 rounded-[24px]" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)", boxShadow: "0 4px 24px rgba(56,25,50,0.06)" }}>
      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold" style={{ background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})`, color: MILK }}>
          {initials}
        </div>
        <div>
          <p className="text-lg font-bold" style={{ color: PLUM, fontFamily: "'Playfair Display', serif" }}>{student.name}</p>
          <p className="text-sm" style={{ color: MUTED }}>{student.class_name}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        {student.admission_no && (
          <div className="flex items-center gap-2 p-2 rounded-xl" style={{ background: MILK }}>
            <Hash size={13} color={PLUM_LIGHT} />
            <span style={{ color: PLUM }}>{student.admission_no}</span>
          </div>
        )}
        {student.gender && (
          <div className="flex items-center gap-2 p-2 rounded-xl" style={{ background: MILK }}>
            <User size={13} color={PLUM_LIGHT} />
            <span style={{ color: PLUM }}>{student.gender}</span>
          </div>
        )}
        {student.dob && (
          <div className="flex items-center gap-2 p-2 rounded-xl" style={{ background: MILK }}>
            <Calendar size={13} color={PLUM_LIGHT} />
            <span style={{ color: PLUM }}>{new Date(student.dob).toLocaleDateString()}</span>
          </div>
        )}
        <div className="flex items-center gap-2 p-2 rounded-xl" style={{ background: MILK }}>
          <BookOpen size={13} color={PLUM_LIGHT} />
          <span style={{ color: PLUM }}>{student.class_name}</span>
        </div>
      </div>
    </div>
  );
}
