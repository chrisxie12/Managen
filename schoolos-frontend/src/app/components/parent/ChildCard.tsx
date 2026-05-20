import { ChevronRight, Users, BookOpen } from "lucide-react";

const NAVY = "#0A2472";
const NAVY_LIGHT = "#0C2D8A";
const CREAM = "#F8F9FA";
const MUTED = "#6B7280";

type ChildData = {
  id: string;
  name: string;
  class_name: string;
  admission_no?: string;
};

export function ChildCard({ child, onClick }: { child: ChildData; onClick: () => void }) {
  const initials = child.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div
      onClick={onClick}
      className="p-5 rounded-[24px] cursor-pointer hover:scale-[1.02] transition-all active:scale-[0.98]"
      style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)", boxShadow: "0 4px 24px rgba(10,36,114,0.06)" }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold" style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_LIGHT})`, color: CREAM }}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold truncate" style={{ color: NAVY, fontFamily: "'Playfair Display', serif", fontSize: "1.05rem" }}>{child.name}</p>
          <p className="text-sm" style={{ color: MUTED }}>{child.class_name}</p>
        </div>
        <ChevronRight size={16} color={MUTED} />
      </div>
      <div className="flex items-center gap-3 text-sm" style={{ color: NAVY_LIGHT }}>
        <span className="flex items-center gap-1"><BookOpen size={13} /> {child.class_name}</span>
        {child.admission_no && <span className="flex items-center gap-1"><Users size={13} /> {child.admission_no}</span>}
      </div>
    </div>
  );
}
