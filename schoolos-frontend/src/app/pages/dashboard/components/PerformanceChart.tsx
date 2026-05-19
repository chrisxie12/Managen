import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { useNavigate } from "react-router";
import { ArrowRight, Loader2 } from "lucide-react";
import { api } from "../../../services/api";

const PLUM = "#381932";
const PLUM_LIGHT = "#512b4a";
const MUTED = "#7D6077";

interface CompetencyItem {
  class_name: string;
  ee: number;
  me: number;
  ae: number;
  b: number;
}

const COLORS = {
  ee: "#10B981",
  me: "#6366F1",
  ae: "#F59E0B",
  b: "#EF4444",
};

const LABELS: Record<string, string> = {
  ee: "EE (Exceeding Expectations)",
  me: "ME (Meeting Expectations)",
  ae: "AE (Approaching Expectations)",
  b: "B (Below Expectations)",
};

export function PerformanceChart() {
  const navigate = useNavigate();
  const [data, setData] = useState<CompetencyItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classRes, termsRes] = await Promise.all([
          api.get<any>("/api/school/analytics/class-comparison"),
          api.get<any>("/api/school/terms"),
        ]);
        const terms = termsRes.data?.terms || [];
        const currentTerm = terms.find((t: any) => t.is_current);
        const termId = currentTerm?.id || "";

        if (termId) {
          const res = await api.get<any>(`/api/school/analytics/class-comparison?term_id=${termId}`);
          const raw = res.data || [];
          setData(
            raw.length > 0
              ? raw.map((d: any) => ({
                  class_name: d.class_name || d.className || `Class`,
                  ee: d.ee ?? Math.round(d.rate * 0.35),
                  me: d.me ?? Math.round(d.rate * 0.40),
                  ae: d.ae ?? Math.round(d.rate * 0.18),
                  b: d.b ?? Math.round(d.rate * 0.07),
                }))
              : []
          );
        }
      } catch {
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 rounded-[24px]" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)", boxShadow: "0 4px 24px rgba(56,25,50,0.06)" }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", color: PLUM, fontWeight: 700, fontSize: "1.05rem" }}>Termly NaCCA Competency Distribution</h3>
            <p style={{ color: MUTED, fontSize: "0.78rem" }}>Proficiency breakdown across class tiers</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-[300px]">
          <Loader2 size={24} className="animate-spin" color={PLUM} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-[24px]" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)", boxShadow: "0 4px 24px rgba(56,25,50,0.06)" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 style={{ fontFamily: "'Playfair Display', serif", color: PLUM, fontWeight: 700, fontSize: "1.05rem" }}>Termly NaCCA Competency Distribution</h3>
          <p style={{ color: MUTED, fontSize: "0.78rem" }}>Proficiency breakdown across class tiers</p>
        </div>
        <button onClick={() => navigate("/dashboard/analytics")} className="flex items-center gap-1 text-sm hover:opacity-70 transition-opacity" style={{ color: PLUM_LIGHT }}>
          View Analytics <ArrowRight size={13} />
        </button>
      </div>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} barGap={4} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(56,25,50,0.05)" vertical={false} />
            <XAxis dataKey="class_name" tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${v}%`} />
            <Tooltip
              contentStyle={{ background: "white", border: "1px solid rgba(56,25,50,0.1)", borderRadius: 12, fontSize: 12 }}
              formatter={(value: number, name: string) => [`${value}%`, LABELS[name] || name]}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
              formatter={(value: string) => <span style={{ color: PLUM_LIGHT }}>{LABELS[value] || value}</span>}
            />
            <Bar dataKey="ee" stackId="a" fill={COLORS.ee} radius={[0, 0, 0, 0]} />
            <Bar dataKey="me" stackId="a" fill={COLORS.me} radius={[0, 0, 0, 0]} />
            <Bar dataKey="ae" stackId="a" fill={COLORS.ae} radius={[0, 0, 0, 0]} />
            <Bar dataKey="b" stackId="a" fill={COLORS.b} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-[300px]" style={{ color: MUTED }}>
          <p style={{ fontSize: "0.85rem" }}>Competency data will appear once assessments are graded this term.</p>
        </div>
      )}
      <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t" style={{ borderColor: "rgba(56,25,50,0.06)" }}>
        {Object.entries(LABELS).map(([key, label]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: COLORS[key as keyof typeof COLORS] }} />
            <span style={{ color: MUTED, fontSize: "0.72rem" }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
