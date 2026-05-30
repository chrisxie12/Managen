import { useState, useEffect, useCallback } from "react";
import { FileText, Upload, Download, Loader2, Check, X, AlertCircle, FileDown } from "lucide-react";
import { api } from "../services/api";

const NAVY = "#031B4E";
const NAVY_LIGHT = "#0069D9";
const CREAM = "#F8F9FA";
const MUTED = "#6B7280";

type Template = { id: string; name: string; file_name: string; created_at: string; uploader?: { name: string } };
type ClassOption = { id: string; name: string };
type TermOption = { id: string; name: string };
type ReportCard = { id: string; student_id: string; status: string; generated_at: string; student?: { name: string; admission_no: string; class_name: string }; term?: { name: string } };

function AlertBanner({ type, message, onClose }: { type: "error" | "success"; message: string; onClose: () => void }) {
  return (
    <div className="mb-4 p-3 rounded-xl flex items-center gap-2" style={{
      background: type === "error" ? "#FEF2F2" : "#D1FAE5",
      color: type === "error" ? "#EF4444" : "#065F46",
      border: `1px solid ${type === "error" ? "#FECACA" : "#A7F3D0"}`,
      fontSize: "0.9rem"
    }}>
      {type === "error" ? <AlertCircle size={14} /> : <Check size={14} />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose}><X size={14} /></button>
    </div>
  );
}

export function ReportCards() {
  const [tab, setTab] = useState("upload");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  return (
    <div>
      {error && <AlertBanner type="error" message={error} onClose={() => setError("")} />}
      {success && <AlertBanner type="success" message={success} onClose={() => setSuccess("")} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold" style={{ color: NAVY }}>Report Cards</h2>
          <p className="text-sm" style={{ color: MUTED }}>Generate student report cards from Word templates</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { key: "upload", label: "Upload Template", icon: Upload },
            { key: "generate", label: "Generate Cards", icon: FileText },
            { key: "view", label: "View Cards", icon: FileDown },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95"
              style={{
                background: tab === t.key ? NAVY : "white",
                color: tab === t.key ? CREAM : NAVY_LIGHT,
                border: tab === t.key ? "none" : "1px solid rgba(10,36,114,0.1)",
              }}>
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "upload" && <UploadTemplateTab setError={setError} setSuccess={setSuccess} />}
      {tab === "generate" && <GenerateCardsTab setError={setError} setSuccess={setSuccess} />}
      {tab === "view" && <ViewCardsTab />}
    </div>
  );
}

function UploadTemplateTab({ setError, setSuccess }: { setError: (s: string) => void; setSuccess: (s: string) => void }) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const loadTemplates = useCallback(async () => {
    try {
      const res = await api.get<{ data: { templates: Template[] } }>("/api/school/features/report-card/templates");
      setTemplates(res.data?.data?.templates || []);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { loadTemplates(); }, [loadTemplates]);

  const uploadFile = async () => {
    if (!file) return;
    setUploading(true);
    setError("");
    setSuccess("");
    try {
      const form = new FormData();
      form.append("template", file);
      await api.post("/api/school/features/report-card/upload-template", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess(`Template "${file.name}" uploaded successfully.`);
      setFile(null);
      loadTemplates();
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl" style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)" }}>
        <h3 className="font-semibold text-sm mb-4" style={{ color: NAVY }}>Upload Word Template</h3>
        <p className="text-xs mb-4" style={{ color: MUTED }}>
          Upload a .docx file with placeholders: {`{{student_name}}, {{roll_no}}, {{class}}, {{term}}, {{subject_scores}}, {{total_score}}, {{percentage}}, {{grade}}, {{remark}}`}
        </p>

        <div className="flex items-center gap-3 mb-4">
          <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer text-sm"
            style={{ background: CREAM, border: "1px solid rgba(10,36,114,0.1)", color: NAVY }}>
            <Upload size={15} />
            <span>{file ? file.name : "Choose .docx file"}</span>
            <input type="file" accept=".docx" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </label>
          <button onClick={uploadFile} disabled={!file || uploading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold active:scale-95 transition-transform disabled:opacity-50"
            style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_LIGHT})`, color: CREAM }}>
            {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)" }}>
        <h3 className="px-4 py-3 font-semibold text-sm" style={{ color: NAVY }}>Uploaded Templates</h3>
        {templates.length === 0 ? (
          <div className="text-center py-8">
            <FileText size={36} color={MUTED} className="mx-auto mb-2" />
            <p className="text-sm" style={{ color: MUTED }}>No templates uploaded yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider" style={{ color: MUTED, borderBottom: "1px solid rgba(10,36,114,0.07)" }}>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">File</th>
                  <th className="px-4 py-3 font-medium">Uploaded</th>
                </tr>
              </thead>
              <tbody>
                {templates.map(t => (
                  <tr key={t.id} className="text-sm" style={{ borderBottom: "1px solid rgba(10,36,114,0.05)" }}>
                    <td className="px-4 py-3 font-medium" style={{ color: NAVY }}>{t.name}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: MUTED }}>{t.file_name}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: MUTED }}>{new Date(t.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function GenerateCardsTab({ setError, setSuccess }: { setError: (s: string) => void; setSuccess: (s: string) => void }) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [terms, setTerms] = useState<TermOption[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{ generated: number; total: number } | null>(null);

  useEffect(() => {
    Promise.all([
      api.get<{ data: { templates: Template[] } }>("/api/school/features/report-card/templates"),
      api.get<{ data: { classes: ClassOption[] } }>("/api/school/classes"),
      api.get<{ data: any }>("/api/school/settings/terms"),
    ]).then(([tRes, cRes, termRes]) => {
      setTemplates(tRes.data?.data?.templates || []);
      setClasses(cRes.data?.data?.classes || []);
      const termsData = termRes.data?.data?.terms || termRes.data?.data || [];
      setTerms(Array.isArray(termsData) ? termsData : []);
    }).catch(() => {});
  }, []);

  const generate = async () => {
    if (!selectedTemplate || !selectedClass || !selectedTerm) return;
    setGenerating(true);
    setError("");
    setSuccess("");
    setResult(null);
    try {
      const res = await api.post<{ data: { generated: number; total: number } }>("/api/school/features/report-card/generate", {
        template_id: selectedTemplate,
        class_id: selectedClass,
        term_id: selectedTerm,
      });
      setResult(res.data?.data || null);
      setSuccess(`Generated ${res.data?.data?.generated || 0} report cards.`);
    } catch (err: any) {
      setError(err.message || "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl" style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)" }}>
        <h3 className="font-semibold text-sm mb-4" style={{ color: NAVY }}>Generate Report Cards</h3>

        <div className="grid gap-4 sm:grid-cols-3 mb-4">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: MUTED }}>Template</label>
            <select value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl outline-none text-sm"
              style={{ background: CREAM, border: "1px solid rgba(10,36,114,0.1)", color: NAVY }}>
              <option value="">Select template...</option>
              {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: MUTED }}>Class</label>
            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl outline-none text-sm"
              style={{ background: CREAM, border: "1px solid rgba(10,36,114,0.1)", color: NAVY }}>
              <option value="">Select class...</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: MUTED }}>Term</label>
            <select value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl outline-none text-sm"
              style={{ background: CREAM, border: "1px solid rgba(10,36,114,0.1)", color: NAVY }}>
              <option value="">Select term...</option>
              {terms.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>

        <button onClick={generate} disabled={generating || !selectedTemplate || !selectedClass || !selectedTerm}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold active:scale-95 transition-transform disabled:opacity-50"
          style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_LIGHT})`, color: CREAM }}>
          {generating ? <Loader2 size={15} className="animate-spin" /> : <FileText size={15} />}
          {generating ? "Generating..." : "Generate Report Cards"}
        </button>
      </div>

      {result && (
        <div className="p-6 rounded-xl" style={{ background: "#D1FAE5", border: "1px solid #A7F3D0" }}>
          <div className="flex items-center gap-2 mb-2">
            <Check size={16} color="#065F46" />
            <h3 className="font-semibold text-sm" style={{ color: "#065F46" }}>Generation Complete</h3>
          </div>
          <p className="text-sm" style={{ color: "#065F46" }}>
            Generated {result.generated} of {result.total} report cards successfully.
          </p>
        </div>
      )}
    </div>
  );
}

function ViewCardsTab() {
  const [cards, setCards] = useState<ReportCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    api.get<{ data: { cards: ReportCard[] } }>("/api/school/features/report-cards")
      .then(res => setCards(res.data?.data?.cards || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const downloadZip = async () => {
    setDownloading(true);
    try {
      const a = document.createElement("a");
      a.href = "/api/school/features/report-cards/download-zip";
      a.click();
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="animate-spin" size={24} color={NAVY} />
    </div>
  );

  return (
    <div>
      {cards.length > 0 && (
        <button onClick={downloadZip} disabled={downloading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold mb-4 active:scale-95 transition-transform disabled:opacity-50"
          style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_LIGHT})`, color: CREAM }}>
          <Download size={15} />
          {downloading ? "Preparing..." : "Download All as ZIP"}
        </button>
      )}

      <div className="rounded-xl overflow-hidden" style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)" }}>
        {cards.length === 0 ? (
          <div className="text-center py-12">
            <FileDown size={40} color={MUTED} className="mx-auto mb-3" />
            <p style={{ color: NAVY, fontWeight: 600 }}>No report cards yet</p>
            <p className="text-sm mt-1" style={{ color: MUTED }}>Generate report cards to see them here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider" style={{ color: MUTED, borderBottom: "1px solid rgba(10,36,114,0.07)" }}>
                  <th className="px-4 py-3 font-medium">Student</th>
                  <th className="px-4 py-3 font-medium">Admission No.</th>
                  <th className="px-4 py-3 font-medium">Term</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Generated</th>
                </tr>
              </thead>
              <tbody>
                {cards.map(card => (
                  <tr key={card.id} className="text-sm" style={{ borderBottom: "1px solid rgba(10,36,114,0.05)" }}>
                    <td className="px-4 py-3 font-medium" style={{ color: NAVY }}>{card.student?.name || "—"}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: MUTED }}>{card.student?.admission_no || "—"}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: MUTED }}>{card.term?.name || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        card.status === "generated" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      }`}>{card.status}</span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: MUTED }}>{new Date(card.generated_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
