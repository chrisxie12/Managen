import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { FileText, Download, Loader2 } from "lucide-react";
import { api } from "../../services/api";
import { toast } from "sonner";

const NAVY = "#031B4E";
const MUTED = "#6B7280";

type Child = { id: string; name: string; class_name: string };
type ReportCard = {
  id: string;
  average: number;
  grade: string;
  total_score: number;
  status: string;
  term?: { name: string };
  session?: { name: string };
};

export function ParentReports() {
  const [searchParams] = useSearchParams();
  const childId = searchParams.get("child");

  const [children, setChildren] = useState<Child[]>([]);
  const [selected, setSelected] = useState<Child | null>(null);
  const [reportCards, setReportCards] = useState<ReportCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    api.get<{ children: Child[] }>("/api/school/parent/children")
      .then((res) => {
        const kids = res.data?.children || [];
        setChildren(kids);
        const preselected = childId ? kids.find((k) => k.id === childId) : kids[0];
        if (preselected) setSelected(preselected);
      })
      .catch(() => toast.error("Failed to load data"))
      .finally(() => setLoading(false));
  }, [childId]);

  useEffect(() => {
    if (!selected) return;
    api.get<{ reportCards: ReportCard[] }>(`/api/school/report-cards?student_id=${selected.id}`)
      .then((res) => setReportCards(res.data?.reportCards || []))
      .catch(() => {});
  }, [selected]);

  const handleDownload = async (cardId: string) => {
    setDownloading(cardId);
    try {
      const res = await api.get<{ url: string }>(`/api/school/report-cards/${cardId}/download`);
      if (res.data?.url) {
        window.open(res.data.url, "_blank");
      } else {
        toast.info("Report card PDF is being generated. Check back shortly.");
      }
    } catch {
      toast.error("Failed to download report card");
    } finally {
      setDownloading(null);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" size={28} color={NAVY} /></div>;

  return (
    <div className="space-y-5">
      {children.length > 1 && (
        <select
          value={selected?.id || ""}
          onChange={(e) => setSelected(children.find((c) => c.id === e.target.value) || null)}
          className="w-full p-3 rounded-2xl text-sm font-medium"
          style={{ background: "white", border: "1px solid rgba(10,36,114,0.1)", color: NAVY }}
        >
          {children.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      )}

      {selected && (
        <>
          <h2 className="text-lg font-bold" style={{ color: NAVY, fontFamily: "'Playfair Display', serif" }}>
            {selected.name} — Report Cards
          </h2>

          {reportCards.length === 0 && (
            <div className="text-center py-10" style={{ color: MUTED }}>
              <FileText size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No report cards available yet.</p>
            </div>
          )}

          <div className="space-y-3">
            {reportCards.map((card) => (
              <div key={card.id} className="p-4 rounded-2xl" style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)" }}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-sm font-semibold" style={{ color: NAVY }}>{card.term?.name || "Term"}</span>
                    <p className="text-[11px]" style={{ color: MUTED }}>{card.session?.name || ""}</p>
                  </div>
                  <span className="text-lg font-bold font-mono" style={{
                    color: card.average >= 80 ? "#16A34A" : card.average >= 65 ? "#6366F1" : card.average >= 50 ? "#F59E0B" : "#EF4444",
                  }}>
                    {card.average}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: MUTED }}>Grade: {card.grade} · {card.status}</span>
                  <button
                    onClick={() => handleDownload(card.id)}
                    disabled={downloading === card.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95 disabled:opacity-50"
                    style={{ background: NAVY, color: "white" }}
                  >
                    {downloading === card.id ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
