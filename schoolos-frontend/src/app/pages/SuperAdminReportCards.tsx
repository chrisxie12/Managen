import { useState, useEffect } from "react";
import { Upload, FileText, Loader2, Check, X, AlertCircle } from "lucide-react";
import { api } from "../utils/api";

const ACCENT = "#ff6b35";

type School = { id: string; name: string; slug: string };
type Template = { id: string; name: string; file_name: string; created_at: string };

export function SuperAdminReportCards() {
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    api.get<any>("/api/superadmin/schools?limit=100")
      .then(res => setSchools(res.data?.data?.schools || []))
      .catch(() => {});
  }, []);

  const loadTemplates = async (schoolId: string) => {
    try {
      const res = await api.get<any>(`/api/superadmin/schools/templates/${schoolId}`);
      setTemplates(res.data?.data?.templates || []);
    } catch { setTemplates([]); }
  };

  useEffect(() => {
    if (selectedSchool) loadTemplates(selectedSchool);
  }, [selectedSchool]);

  const uploadTemplate = async () => {
    if (!file || !selectedSchool) return;
    setUploading(true);
    setMessage(null);
    try {
      const form = new FormData();
      form.append("template", file);
      form.append("schoolId", selectedSchool);
      await api.post("/api/superadmin/report-card/upload-template", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage({ type: "success", text: `Template "${file.name}" uploaded to school successfully.` });
      setFile(null);
      loadTemplates(selectedSchool);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Upload failed" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold">Report Card Templates</h1>
        <p className="text-sm" style={{ color: "#64748b" }}>Upload .docx templates to any school on the platform</p>
      </div>

      {message && (
        <div className="p-3 rounded-xl flex items-center gap-2 text-sm" style={{
          background: message.type === "error" ? "#7F1D1D" : "#064E3B",
          color: message.type === "error" ? "#FCA5A5" : "#6EE7B7",
          border: `1px solid ${message.type === "error" ? "#991B1B" : "#065F46"}`,
        }}>
          {message.type === "error" ? <AlertCircle size={14} /> : <Check size={14} />}
          <span className="flex-1">{message.text}</span>
          <button onClick={() => setMessage(null)}><X size={14} /></button>
        </div>
      )}

      <div className="p-6 rounded-xl" style={{ background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.07)" }}>
        <h3 className="font-semibold text-sm mb-4">Upload Template to School</h3>

        <div className="grid gap-4 sm:grid-cols-2 mb-4">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>School</label>
            <select value={selectedSchool} onChange={(e) => setSelectedSchool(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl outline-none text-sm"
              style={{ background: "#080810", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0" }}>
              <option value="">Select school...</option>
              {schools.map(s => <option key={s.id} value={s.id}>{s.name} ({s.slug})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Template (.docx)</label>
            <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer text-sm"
              style={{ background: "#080810", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0" }}>
              <Upload size={15} />
              <span>{file ? file.name : "Choose file"}</span>
              <input type="file" accept=".docx" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </label>
          </div>
        </div>

        <button onClick={uploadTemplate} disabled={!file || !selectedSchool || uploading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold active:scale-95 disabled:opacity-50"
          style={{ background: ACCENT, color: "white" }}>
          {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
          {uploading ? "Uploading..." : "Upload Template"}
        </button>
      </div>

      {selectedSchool && (
        <div className="rounded-xl overflow-hidden" style={{ background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.07)" }}>
          <h3 className="px-4 py-3 font-semibold text-sm" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            Templates for {schools.find(s => s.id === selectedSchool)?.name || "Selected School"}
          </h3>
          {templates.length === 0 ? (
            <div className="text-center py-8">
              <FileText size={36} color="#64748b" className="mx-auto mb-2" />
              <p className="text-sm" style={{ color: "#64748b" }}>No templates uploaded yet for this school</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[400px]">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider" style={{ color: "#64748b", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">File</th>
                    <th className="px-4 py-3 font-medium">Uploaded</th>
                  </tr>
                </thead>
                <tbody>
                  {templates.map(t => (
                    <tr key={t.id} className="text-sm" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <td className="px-4 py-3 font-medium">{t.name}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: "#64748b" }}>{t.file_name}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: "#64748b" }}>{new Date(t.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
