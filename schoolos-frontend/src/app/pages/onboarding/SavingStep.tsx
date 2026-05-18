import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { api } from "../../services/api";

const INDIGO = "#6366F1";
const PLUM = "#381932";
const MUTED = "#7D6077";

const STEPS = [
  { label: "Saving school information...", key: "school" },
  { label: "Uploading school logo...", key: "logo" },
  { label: "Configuring your dashboard...", key: "dashboard" },
  { label: "Setting up fee templates...", key: "fees" },
  { label: "Preparing your first report...", key: "report" },
];

export function SavingStep({ schoolData, logoData, onComplete, onError }: {
  schoolData: any; surveyAnswers: any; logoData: string | null;
  primaryColor: string; onComplete: () => void; onError: () => void;
}) {
  const [completed, setCompleted] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentLabel, setCurrentLabel] = useState(STEPS[0].label);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      for (let i = 0; i < STEPS.length; i++) {
        if (cancelled) return;
        setCurrentLabel(STEPS[i].label);
        await new Promise(r => setTimeout(r, 600));
        if (cancelled) return;
        setCompleted(prev => [...prev, STEPS[i].key]);
        setProgress(((i + 1) / STEPS.length) * 100);
      }

      try {
        if (cancelled) return;
        setCurrentLabel("Saving school information...");
        await api.post("/api/school/onboarding/school", schoolData);

        if (logoData) {
          setCurrentLabel("Uploading school logo...");
          await api.post("/api/school/onboarding/logo", { logo: logoData });
        }

        setCurrentLabel("Applying your preferences...");
        await new Promise(r => setTimeout(r, 500));

        setCurrentLabel("Finalizing setup...");
        await api.post("/api/school/onboarding/complete", {});

        if (!cancelled) {
          setProgress(100);
          await new Promise(r => setTimeout(r, 400));
          onComplete();
        }
      } catch {
        if (!cancelled) onError();
      }
    };
    run();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-full max-w-md">
        <div className="h-2 rounded-full bg-gray-100 overflow-hidden mb-10">
          <div className="h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%`, background: `linear-gradient(135deg, ${INDIGO}, #4f46e5)` }}
          />
        </div>

        <div className="space-y-4">
          {STEPS.map((step) => {
            const done = completed.includes(step.key);
            const active = currentLabel === step.label && !done;
            return (
              <div key={step.key} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                  style={{
                    background: done ? "#10B981" : active ? INDIGO : "#f3f4f6",
                  }}>
                  {done ? (
                    <Check size={14} color="white" />
                  ) : active ? (
                    <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                  ) : (
                    <div className="w-2 h-2 rounded-full" style={{ background: MUTED }} />
                  )}
                </div>
                <span className="text-sm" style={{
                  color: done ? "#10B981" : active ? PLUM : MUTED,
                  fontWeight: done || active ? 500 : 400,
                }}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
