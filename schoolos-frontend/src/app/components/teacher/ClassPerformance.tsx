import { useState, useEffect } from "react";
import { Loader2, Trophy, TrendingDown, BarChart3 } from "lucide-react";
import { api } from "../../services/api";
import type { Performer, GradeRule } from "./types";

const NAVY = "#0A2472";
const CREAM = "#F8F9FA";
const MUTED = "#6B7280";

export function ClassPerformance({ classId }: { classId: string; className: string }) {
  const [terms, setTerms] = useState<{ id: string; name: string; is_current: boolean }[]>([]);
  const [selectedTerm, setSelectedTerm] = useState("");
  const [performers, setPerformers] = useState<{ top: Performer[]; bottom: Performer[] } | null>(null);
  const [gradeRules, setGradeRules] = useState<GradeRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ terms: any[] }>("/api/school/terms")
      .then(res => {
        const list = res.data?.terms || [];
        setTerms(list);
        const current = list.find((t: any) => t.is_current);
        if (current) setSelectedTerm(current.id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedTerm || !classId) return;
    setLoading(true);

    const load = async () => {
      try {
        // Get grading scale first (needed for grade rules query)
        const scalesRes = await api.get<{ scales: any[] }>("/api/school/grading-scales");
        const scales = scalesRes.data?.scales || [];
        const defaultScale = scales.find((s: any) => s.is_default) || scales[0];

        const [perfRes, rulesRes] = await Promise.all([
          api.get<any>(`/api/school/analytics/top-bottom?term_id=${selectedTerm}&class_id=${classId}&limit=5`),
          defaultScale
            ? api.get<{ rules: GradeRule[] }>(`/api/school/grade-rules?scale_id=${defaultScale.id}`)
            : Promise.resolve({ data: { rules: [] } }),
        ]);

        setPerformers(perfRes.data || null);
        setGradeRules(rulesRes.data?.rules || []);
      } catch { /* ignore */ } finally { setLoading(false); }
    };

    load();
  }, [selectedTerm, classId]);

  const gradeColor = (grade: string) => {
    const rule = gradeRules.find(r => r.grade === grade);
    if (!rule) return MUTED;
    if (rule.min_percent >= 80) return "#10B981";
    if (rule.min_percent >= 60) return "#6366F1";
    if (rule.min_percent >= 40) return "#F59E0B";
    return "#EF4444";
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin" color={MUTED} /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <select value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)}
          className="px-4 py-2.5 rounded-xl outline-none text-sm" style={{ background: "white", border: "1px solid rgba(10,36,114,0.1)", color: NAVY, minWidth: 180 }}>
          {terms.map(t => <option key={t.id} value={t.id}>{t.name} {t.is_current ? "(Current)" : ""}</option>)}
        </select>
      </div>

      {!performers ? (
        <div className="text-center py-12" style={{ color: MUTED }}>
          <BarChart3 size={36} className="mx-auto mb-3" color={MUTED} />
          <p className="font-semibold" style={{ color: NAVY }}>No Performance Data</p>
          <p className="text-sm mt-1">Grades and report cards need to be generated first.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-2xl p-5" style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)" }}>
            <div className="flex items-center gap-2 mb-4">
              <Trophy size={18} color="#10B981" />
              <h3 className="font-semibold text-sm" style={{ color: NAVY }}>Top Performers</h3>
            </div>
            {performers.top.length === 0 ? (
              <p className="text-sm" style={{ color: MUTED }}>No data available.</p>
            ) : (
              <div className="space-y-2">
                {performers.top.map((p, i) => (
                  <div key={p.id} className="flex items-center justify-between p-2.5 rounded-xl" style={{ background: CREAM }}>
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "#10B981", color: "white" }}>{i + 1}</span>
                      <div>
                        <p className="text-sm font-medium" style={{ color: NAVY }}>{p.student?.name || "Unknown"}</p>
                        <p className="text-xs" style={{ color: MUTED }}>{p.student?.admission_no || ""}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold" style={{ color: gradeColor(p.grade) }}>{p.average?.toFixed(1)}%</p>
                      <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: `${gradeColor(p.grade)}15`, color: gradeColor(p.grade) }}>{p.grade}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl p-5" style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)" }}>
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown size={18} color="#EF4444" />
              <h3 className="font-semibold text-sm" style={{ color: NAVY }}>Needs Improvement</h3>
            </div>
            {performers.bottom.length === 0 ? (
              <p className="text-sm" style={{ color: MUTED }}>No data available.</p>
            ) : (
              <div className="space-y-2">
                {performers.bottom.map((p, i) => (
                  <div key={p.id} className="flex items-center justify-between p-2.5 rounded-xl" style={{ background: "#FEF2F2" }}>
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "#EF4444", color: "white" }}>{i + 1}</span>
                      <div>
                        <p className="text-sm font-medium" style={{ color: NAVY }}>{p.student?.name || "Unknown"}</p>
                        <p className="text-xs" style={{ color: MUTED }}>{p.student?.admission_no || ""}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold" style={{ color: gradeColor(p.grade) }}>{p.average?.toFixed(1)}%</p>
                      <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: `${gradeColor(p.grade)}15`, color: gradeColor(p.grade) }}>{p.grade}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
