import { useState } from "react";
import { useNavigate } from "react-router";
import { Slider } from "../../../components/ui/slider";
import { ArrowRight, TrendingUp, Clock } from "lucide-react";

const NAVY = "#031B4E";
const NAVY_LIGHT = "#0069D9";

function formatCurrency(value: number): string {
  return `GHS ${value.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function RoiCalculator() {
  const navigate = useNavigate();
  const [students, setStudents] = useState(500);
  const [tuition, setTuition] = useState("1500");

  const tuitionNum = parseFloat(tuition) || 0;
  const revenueSaved = students * tuitionNum * 0.15;
  const hoursReclaimed = Math.round(students * 0.05);

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="mb-6">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          <TrendingUp className="size-3" /> ROI Calculator
        </span>
        <h3 className="mt-3 text-2xl font-bold tracking-tight" style={{ color: NAVY }}>
          See What SchoolOS Saves You
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Increase fee recovery by up to 80% and reclaim 20+ administrative hours per term.
        </p>
      </div>

      {/* Student Enrollment Slider */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-slate-700">Student Enrollment</label>
          <span className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-semibold tabular-nums" style={{ color: NAVY }}>
            {students.toLocaleString()} students
          </span>
        </div>
        <Slider
          value={[students]}
          onValueChange={([v]) => setStudents(v)}
          min={50}
          max={2000}
          step={25}
          className="mt-1"
        />
        <div className="mt-1 flex justify-between text-xs text-slate-400">
          <span>50</span>
          <span>2,000</span>
        </div>
      </div>

      {/* Tuition Input */}
      <div className="mb-8">
        <label className="mb-2 block text-sm font-medium text-slate-700">Average Term Tuition (GHS)</label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">GHS</span>
          <input
            type="number"
            value={tuition}
            onChange={(e) => setTuition(e.target.value)}
            min={0}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm font-semibold tabular-nums outline-none transition focus:border-[#031B4E] focus:ring-2 focus:ring-[#031B4E]/20"
            style={{ color: NAVY }}
          />
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1">
            <TrendingUp className="size-3.5 text-emerald-500" />
            Revenue Saved Per Term
          </div>
          <div className="text-3xl font-extrabold tracking-tight" style={{ color: NAVY }}>
            {formatCurrency(revenueSaved)}
          </div>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1">
            <Clock className="size-3.5 text-amber-500" />
            Hours Reclaimed Per Term
          </div>
          <div className="text-3xl font-extrabold tracking-tight" style={{ color: NAVY }}>
            {hoursReclaimed}h
          </div>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={() => navigate("/auth?mode=signup")}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-all active:scale-[0.98] hover:shadow-lg"
        style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_LIGHT})`, boxShadow: `0 4px 14px ${NAVY}40` }}
      >
        See How It Works
        <ArrowRight className="size-4" />
      </button>
    </div>
  );
}
