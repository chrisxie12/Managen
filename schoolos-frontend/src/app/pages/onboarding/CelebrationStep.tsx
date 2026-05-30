import { useEffect } from "react";
import { motion } from "motion/react";
import { Check, School, BookOpen, Palette, Bell } from "lucide-react";
import confetti from "canvas-confetti";

const INDIGO = "#6366F1";
const NAVY = "#031B4E";
const MUTED = "#6B7280";

const FEATURES = [
  { label: "Fee Management", color: "#16A34A" },
  { label: "Attendance Tracking", color: "#F59E0B" },
  { label: "Grade Management", color: "#6366F1" },
  { label: "AI Insights", color: "#8B5CF6" },
  { label: "Parent Communication", color: "#EC4899" },
];

export function CelebrationStep({ schoolName, currentTerm, academicYear, primaryColor, communicationMethod, onDone }: {
  schoolName: string; currentTerm: string; academicYear: string;
  primaryColor: string; communicationMethod: string; onDone: () => void;
}) {
  useEffect(() => {
    const duration = 2000;
    const end = Date.now() + duration;
    const frame = () => {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: [primaryColor, INDIGO, "#16A34A"] });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: [primaryColor, INDIGO, "#16A34A"] });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, []);

  return (
    <div className="text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
        style={{ background: "#16A34A" }}
      >
        <Check size={36} color="white" />
      </motion.div>

      <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif", color: NAVY }}>
        {schoolName} is ready!
      </h1>
      <p className="text-sm mb-8 max-w-md mx-auto" style={{ color: MUTED }}>
        Your school management system is fully configured and ready to use.
      </p>

      <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto mb-8">
        {[
          { icon: School, label: "School", value: schoolName },
          { icon: BookOpen, label: "Term", value: `${currentTerm}, ${academicYear}` },
          { icon: Palette, label: "Theme", value: primaryColor },
          { icon: Bell, label: "Notifications", value: communicationMethod },
        ].map((item, i) => (
          <motion.div key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="p-4 rounded-2xl text-left"
            style={{ background: "#F8F9FA", border: "1px solid rgba(0,0,0,0.04)" }}
          >
            <item.icon size={16} color={INDIGO} className="mb-1" />
            <p className="text-xs mt-1" style={{ color: MUTED }}>{item.label}</p>
            <p className="text-sm font-semibold truncate" style={{ color: NAVY }}>{item.value}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mb-8"
      >
        <p className="text-sm font-medium mb-3" style={{ color: NAVY }}>Here's what's waiting for you:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {FEATURES.map(f => (
            <span key={f.label}
              className="px-3 py-1.5 rounded-full text-xs font-medium"
              style={{ background: `${f.color}10`, color: f.color }}
            >
              {f.label}
            </span>
          ))}
        </div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        onClick={onDone}
        className="px-8 py-3 rounded-xl text-sm font-semibold active:scale-95 transition-transform"
        style={{ background: `linear-gradient(135deg, ${INDIGO}, #4f46e5)`, color: "white" }}
      >
        Open My Dashboard
      </motion.button>

      <p className="text-xs mt-3" style={{ color: MUTED }}>
        Redirecting to your dashboard...
      </p>
    </div>
  );
}
