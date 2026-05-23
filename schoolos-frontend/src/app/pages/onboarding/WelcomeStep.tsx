import { motion } from "motion/react";
import { Sparkles, Zap, BarChart3, Clock, ArrowRight } from "lucide-react";

const NAVY = "#0A2472";
const MUTED = "#6B7280";
const INDIGO = "#6366F1";

const features = [
  { icon: Zap, title: "Smart Fee Management", desc: "Automate fee collection and reminders" },
  { icon: Clock, title: "Real-time Attendance", desc: "Track attendance with instant parent alerts" },
  { icon: BarChart3, title: "AI-Powered Insights", desc: "Get intelligent reports about your school" },
];

export function WelcomeStep({ adminName, onNext, onSkip }: { adminName: string; onNext: () => void; onSkip: () => void }) {
  return (
    <div className="text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
        style={{ background: `linear-gradient(135deg, ${INDIGO}, #4f46e5)` }}
      >
        <Sparkles size={28} color="white" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold mb-3"
        style={{ fontFamily: "'Playfair Display', serif", color: NAVY }}
      >
        Welcome to SchoolOS, {adminName}!
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-base mb-10 max-w-lg mx-auto"
        style={{ color: MUTED }}
      >
        You're just a few steps away from transforming how your school operates.
      </motion.p>

      <div className="grid gap-3 mb-10 max-w-xl mx-auto">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.15 }}
            className="flex items-center gap-4 p-4 rounded-2xl text-left"
            style={{ background: "#F8F9FA", border: "1px solid rgba(99,102,241,0.08)" }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(99,102,241,0.1)" }}>
              <f.icon size={20} color={INDIGO} />
            </div>
            <div>
              <h3 className="font-semibold text-sm" style={{ color: NAVY }}>{f.title}</h3>
              <p className="text-xs mt-0.5" style={{ color: MUTED }}>{f.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-sm mb-6"
        style={{ color: MUTED }}
      >
        Takes about 3 minutes
      </motion.p>

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        onClick={onNext}
        className="px-8 py-3 rounded-xl text-sm font-semibold inline-flex items-center gap-2 active:scale-95 transition-transform"
        style={{ background: `linear-gradient(135deg, ${INDIGO}, #4f46e5)`, color: "white" }}
      >
        Let's Get Started <ArrowRight size={16} />
      </motion.button>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-6"
      >
        <button onClick={onSkip} className="text-xs hover:underline" style={{ color: MUTED }}>
          I'll do this later
        </button>
      </motion.div>
    </div>
  );
}
