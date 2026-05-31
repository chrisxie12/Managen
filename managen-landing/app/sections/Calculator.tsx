"use client";
import { useState } from "react";
import ScrollReveal from "../components/ScrollReveal";

const STUDENT_OPTIONS = ["50", "100", "150", "300", "500", "800+"];
const CAMPUS_OPTIONS = ["1", "2-3", "4+"];

function getRecommendedPlan(students: string, campuses: string): string {
  const campusNum = campuses === "4+" ? 4 : campuses === "2-3" ? 2 : 1;
  if (students === "50" && campusNum === 1) return "Free Trial";
  if (students === "100" || students === "150") return "Starter — GHS 199/mo";
  if (students === "300") return "Growth — GHS 499/mo";
  if (students === "500") return campusNum >= 2 ? "Pro — GHS 999/mo" : "Growth — GHS 499/mo";
  if (students === "800+") return "Pro — GHS 999/mo";
  if (campusNum >= 4) return "Enterprise — Custom";
  return "Growth — GHS 499/mo";
}

function getTimeSaved(students: string): number {
  const map: Record<string, number> = {
    "50": 8, "100": 12, "150": 16, "300": 22, "500": 28, "800+": 35,
  };
  return map[students] ?? 12;
}

export default function Calculator() {
  const [students, setStudents] = useState("150");
  const [campuses, setCampuses] = useState("1");

  const plan = getRecommendedPlan(students, campuses);
  const hours = getTimeSaved(students);
  const hasPlan = students !== "" && campuses !== "";

  const selectStyle: React.CSSProperties = {
    background: "white",
    border: "2px solid #E5E7EB",
    borderRadius: 12,
    padding: "14px 18px",
    fontSize: 16,
    color: "#0B0F1C",
    outline: "none",
    cursor: "pointer",
    width: "100%",
    appearance: "none",
    WebkitAppearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 14px center",
    paddingRight: 44,
  };

  return (
    <section id="calculator" className="py-[100px]" style={{ background: "#F5F5F4" }}>
      <div className="max-w-[1200px] mx-auto px-6">
        <ScrollReveal className="text-center mb-12">
          <h2 className="text-4xl md:text-[40px] font-bold text-[#0B0F1C] mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            See how much time you could save
          </h2>
          <p className="text-lg text-gray-500">Calculate — Find your perfect plan</p>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="max-w-[800px] mx-auto">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Dropdown 1 */}
              <div className="flex-1">
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                  How many students?
                </label>
                <select
                  value={students}
                  onChange={(e) => setStudents(e.target.value)}
                  style={selectStyle}
                  onFocus={(e) => {
                    e.currentTarget.style.border = "2px solid #0B0F1C";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(11,15,28,0.08)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = "2px solid #E5E7EB";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {STUDENT_OPTIONS.map((o) => (
                    <option key={o} value={o}>{o} students</option>
                  ))}
                </select>
              </div>

              {/* Dropdown 2 */}
              <div className="flex-1">
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                  How many campuses?
                </label>
                <select
                  value={campuses}
                  onChange={(e) => setCampuses(e.target.value)}
                  style={selectStyle}
                  onFocus={(e) => {
                    e.currentTarget.style.border = "2px solid #0B0F1C";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(11,15,28,0.08)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = "2px solid #E5E7EB";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {CAMPUS_OPTIONS.map((o) => (
                    <option key={o} value={o}>{o} campus{o !== "1" ? "es" : ""}</option>
                  ))}
                </select>
              </div>

              {/* Recommended plan display */}
              <div className="flex-1">
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                  Recommended plan
                </label>
                <div
                  className="flex items-center rounded-xl px-4 py-[15px] text-base font-semibold"
                  style={{
                    border: "2px solid",
                    borderColor: hasPlan ? "#D4FF00" : "#E5E7EB",
                    background: hasPlan ? "#0B0F1C" : "white",
                    color: hasPlan ? "#D4FF00" : "#9CA3AF",
                    transition: "all 0.3s ease",
                    minHeight: 54,
                  }}
                >
                  {hasPlan ? plan : "Select options above"}
                </div>
              </div>
            </div>

            {/* Result */}
            {hasPlan && (
              <div
                className="text-center mt-10"
                style={{
                  animation: "fadeInUp 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
                }}
              >
                <p className="text-2xl md:text-3xl font-bold text-[#0B0F1C]">
                  You could save{" "}
                  <span style={{ color: "#D4FF00", WebkitTextStroke: "1px #0B0F1C" }}>
                    {hours} hours
                  </span>{" "}
                  per week on admin
                </p>
                <p className="text-gray-500 mt-2 text-base">
                  That&apos;s {hours * 52} hours a year — time better spent teaching.
                </p>
              </div>
            )}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
