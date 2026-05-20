import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const INDIGO = "#6366F1";
const NAVY = "#0A2472";
const MUTED = "#6B7280";

type SurveyAnswers = {
  size?: string;
  challenges?: string[];
  communication?: string;
  payment?: string[];
  type?: string;
};

const questions = [
  {
    id: "size",
    title: "How many students does your school have?",
    multi: false,
    options: [
      { value: "under_100", label: "🏫 Under 100 students" },
      { value: "100_500", label: "🏫 100 - 500 students" },
      { value: "500_1000", label: "🏫 500 - 1,000 students" },
      { value: "over_1000", label: "🏫 Over 1,000 students" },
    ],
  },
  {
    id: "challenges",
    title: "What is your biggest challenge right now?",
    multi: true,
    options: [
      { value: "fees", label: "💰 Collecting fees on time" },
      { value: "attendance", label: "📋 Tracking attendance" },
      { value: "grades", label: "📊 Managing student grades" },
      { value: "communication", label: "📱 Communicating with parents" },
      { value: "timetables", label: "📅 Organizing timetables" },
      { value: "reports", label: "📈 Generating reports" },
    ],
  },
  {
    id: "communication",
    title: "How do you currently communicate with parents?",
    multi: false,
    options: [
      { value: "whatsapp", label: "📱 WhatsApp" },
      { value: "sms", label: "💬 SMS" },
      { value: "email", label: "📧 Email" },
      { value: "phone", label: "📞 Phone calls" },
      { value: "in_person", label: "🗣 In person only" },
    ],
  },
  {
    id: "payment",
    title: "How do parents currently pay school fees?",
    multi: true,
    options: [
      { value: "mobile_money", label: "💳 Mobile Money (MTN, Vodafone)" },
      { value: "bank_transfer", label: "🏦 Bank transfer" },
      { value: "cash", label: "💵 Cash only" },
      { value: "online", label: "💳 Paystack/Flutterwave online" },
      { value: "mixed", label: "📱 Mix of methods" },
    ],
  },
  {
    id: "type",
    title: "What type of school do you run?",
    multi: false,
    options: [
      { value: "primary", label: "🎒 Primary School (KG - Class 6)" },
      { value: "jhs", label: "📚 Junior High School (JHS 1-3)" },
      { value: "shs", label: "🎓 Senior High School (SHS 1-3)" },
      { value: "primary_jhs", label: "🏛 Primary + JHS (Combined)" },
      { value: "full", label: "🎓 Primary + JHS + SHS (Full)" },
      { value: "vocational", label: "🏫 Vocational/Technical" },
    ],
  },
];

export function SurveyStep({ onNext, onBack }: { onNext: (answers: SurveyAnswers) => void; onBack: () => void }) {
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<SurveyAnswers>({});
  const [animating, setAnimating] = useState(false);
  const [personalizing, setPersonalizing] = useState(false);

  const question = questions[qIndex];
  const isLast = qIndex === questions.length - 1;

  const handleSelect = (value: string) => {
    if (animating) return;
    if (question.multi) {
      const current = (answers[question.id as keyof SurveyAnswers] as string[]) || [];
      const next = current.includes(value) ? current.filter(v => v !== value) : [...current, value];
      setAnswers(prev => ({ ...prev, [question.id]: next }));
    } else {
      setAnswers(prev => ({ ...prev, [question.id]: value }));
      if (isLast) {
        setPersonalizing(true);
        setTimeout(() => onNext({ ...answers, [question.id]: value }), 1500);
      } else {
        setAnimating(true);
        setTimeout(() => { setQIndex(i => i + 1); setAnimating(false); }, 300);
      }
    }
  };

  const handleNext = () => {
    if (question.multi) {
      const val = answers[question.id as keyof SurveyAnswers];
      if (!val || (Array.isArray(val) && val.length === 0)) return;
      if (isLast) {
        setPersonalizing(true);
        setTimeout(() => onNext(answers), 1500);
      } else {
        setAnimating(true);
        setTimeout(() => { setQIndex(i => i + 1); setAnimating(false); }, 300);
      }
    }
  };

  const handleBack = () => {
    if (qIndex === 0) { onBack(); return; }
    setAnimating(true);
    setTimeout(() => { setQIndex(i => i - 1); setAnimating(false); }, 300);
  };

  if (personalizing) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mb-6" style={{ borderColor: INDIGO, borderTopColor: "transparent" }} />
        <h2 className="text-xl font-semibold mb-2" style={{ color: NAVY }}>Personalizing your experience...</h2>
        <p style={{ color: MUTED }}>Setting up your school based on your answers</p>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="text-center mb-8">
        <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: INDIGO }}>
          Question {qIndex + 1} of {questions.length}
        </p>
        <h2 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: NAVY }}>
          Help us personalize SchoolOS for your school
        </h2>
        <p className="text-sm mt-1" style={{ color: MUTED }}>
          Answer a few quick questions so we can set up the perfect experience for you.
        </p>
      </div>

      <div className="flex items-center justify-center gap-1.5 mb-8">
        {questions.map((_, i) => (
          <div key={i} className="h-1.5 rounded-full transition-all" style={{
            width: i === qIndex ? 24 : 8,
            background: i <= qIndex ? INDIGO : "#e5e7eb",
          }} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={qIndex}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.25 }}
        >
          <h3 className="text-lg font-semibold text-center mb-6" style={{ color: NAVY }}>
            {question.title}
          </h3>

          <div className="space-y-3 max-w-lg mx-auto">
            {question.options.map((opt) => {
              const isSelected = question.multi
                ? ((answers[question.id as keyof SurveyAnswers] as string[]) || []).includes(opt.value)
                : answers[question.id as keyof SurveyAnswers] === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  className="w-full p-4 rounded-2xl text-left flex items-center gap-3 active:scale-[0.98] transition-all"
                  style={{
                    background: isSelected ? "rgba(99,102,241,0.08)" : "white",
                    border: isSelected ? `2px solid ${INDIGO}` : "2px solid rgba(0,0,0,0.06)",
                    boxShadow: isSelected ? `0 0 0 3px rgba(99,102,241,0.12)` : "none",
                  }}
                >
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: isSelected ? INDIGO : "transparent",
                      border: isSelected ? "none" : "2px solid #d1d5db",
                    }}>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <span className="text-sm font-medium" style={{ color: NAVY }}>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between mt-8 max-w-lg mx-auto">
        <button onClick={handleBack}
          className="px-5 py-2 rounded-xl text-sm font-medium inline-flex items-center gap-1 active:scale-95 transition-transform"
          style={{ background: "rgba(0,0,0,0.04)", color: NAVY }}>
          <ChevronLeft size={14} /> Back
        </button>
        {question.multi && (
          <button onClick={handleNext}
            disabled={!answers[question.id as keyof SurveyAnswers] || (Array.isArray(answers[question.id as keyof SurveyAnswers]) && (answers[question.id as keyof SurveyAnswers] as string[]).length === 0)}
            className="px-5 py-2 rounded-xl text-sm font-medium inline-flex items-center gap-1 active:scale-95 transition-transform disabled:opacity-40"
            style={{ background: INDIGO, color: "white" }}>
            {isLast ? "Finish" : "Next"} <ChevronRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
