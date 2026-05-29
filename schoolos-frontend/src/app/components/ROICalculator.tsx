import { useState } from "react";
import { TrendingUp, ArrowRight } from "lucide-react";

const COLORS = {
  NAVY: "#0A2472",
  AMBER: "#10B981",
  GREEN: "#10B981",
  MUTED: "#6B7280",
};

export function ROICalculator() {
  const [students, setStudents] = useState(300);
  const [currentCollection, setCurrentCollection] = useState(40);
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");

  // Calculate ROI
  const monthlyFeePerStudent = 400; // GHS average
  const currentMonthlyRevenue = students * monthlyFeePerStudent * (currentCollection / 100);
  const projectedCollection = Math.min(currentCollection + 52, 98); // Increase to 92% typically
  const projectedMonthlyRevenue = students * monthlyFeePerStudent * (projectedCollection / 100);
  const monthlyGain = projectedMonthlyRevenue - currentMonthlyRevenue;
  const annualGain = monthlyGain * 12;
  const yearlySubscriptionCost = 499 * 12; // Growth tier annual

  return (
    <div className="max-w-2xl mx-auto p-8 rounded-2xl border"
      style={{
        background: dark ? "rgba(30,41,59,0.8)" : "rgba(248,249,250,1)",
        borderColor: `${COLORS.AMBER}30`,
      }}>
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp size={24} style={{ color: COLORS.AMBER }} />
        <h3 className="text-2xl font-bold" style={{ color: COLORS.NAVY }}>See Your ROI</h3>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Students slider */}
        <div>
          <label className="text-sm font-semibold" style={{ color: COLORS.NAVY }}>
            Number of students
          </label>
          <div className="flex items-center gap-3 mt-3">
            <input
              type="range"
              min="50"
              max="800"
              value={students}
              onChange={(e) => setStudents(Number(e.target.value))}
              className="flex-1"
              style={{
                accentColor: COLORS.AMBER,
              }}
            />
            <span className="text-xl font-bold w-12 text-right" style={{ color: COLORS.NAVY }}>
              {students}
            </span>
          </div>
        </div>

        {/* Collection rate slider */}
        <div>
          <label className="text-sm font-semibold" style={{ color: COLORS.NAVY }}>
            Current collection rate
          </label>
          <div className="flex items-center gap-3 mt-3">
            <input
              type="range"
              min="10"
              max="85"
              value={currentCollection}
              onChange={(e) => setCurrentCollection(Number(e.target.value))}
              className="flex-1"
              style={{
                accentColor: COLORS.GREEN,
              }}
            />
            <span className="text-xl font-bold w-12 text-right" style={{ color: COLORS.NAVY }}>
              {currentCollection}%
            </span>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border"
          style={{
            background: dark ? "rgba(55,65,81,0.5)" : "#F3F4F6",
            borderColor: `${COLORS.MUTED}20`,
          }}>
          <div className="text-xs font-semibold" style={{ color: COLORS.MUTED }}>
            Monthly gain
          </div>
          <div className="text-2xl font-bold mt-2" style={{ color: COLORS.NAVY }}>
            ₵{monthlyGain.toLocaleString()}
          </div>
        </div>

        <div className="p-4 rounded-lg border"
          style={{
            background: dark ? "rgba(55,65,81,0.5)" : "#F3F4F6",
            borderColor: `${COLORS.MUTED}20`,
          }}>
          <div className="text-xs font-semibold" style={{ color: COLORS.MUTED }}>
            Annual gain
          </div>
          <div className="text-2xl font-bold mt-2" style={{ color: COLORS.GREEN }}>
            ₵{annualGain.toLocaleString()}
          </div>
        </div>

        <div className="p-4 rounded-lg border"
          style={{
            background: dark ? "rgba(55,65,81,0.5)" : "#F3F4F6",
            borderColor: `${COLORS.MUTED}20`,
          }}>
          <div className="text-xs font-semibold" style={{ color: COLORS.MUTED }}>
            Net after SchoolOS
          </div>
          <div className="text-2xl font-bold mt-2" style={{ color: COLORS.GREEN }}>
            ₵{(annualGain - yearlySubscriptionCost).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 rounded-lg"
        style={{ background: `${COLORS.AMBER}10` }}>
        <p className="text-sm" style={{ color: COLORS.NAVY }}>
          <span className="font-bold">With SchoolOS:</span> Collection improves from {currentCollection}% to ~92%, 
          generating <span className="font-bold">₵{(annualGain - yearlySubscriptionCost).toLocaleString()} net annual profit</span>.
        </p>
      </div>
    </div>
  );
}
