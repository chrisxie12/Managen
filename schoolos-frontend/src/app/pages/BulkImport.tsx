import { useState } from "react";
import { Upload, FileSpreadsheet, AlertCircle, Check, X, Loader2, Users, UserCheck, Briefcase } from "lucide-react";
import { api } from "../services/api";

const NAVY = "#0A2472";
const NAVY_LIGHT = "#0C2D8A";
const CREAM = "#F8F9FA";
const MUTED = "#6B7280";

type PreviewRow = Record<string, string>;
type ImportError = { row: number; field: string; message: string };

const ENTITY_TYPES = [
  { value: "students", label: "Class Students", icon: Users, desc: "name, class, roll number, parent contact" },
  { value: "teachers", label: "Teachers", icon: UserCheck, desc: "name, employee id, department, email, phone" },
  { value: "non-teaching", label: "Non-Teaching Staff", icon: Briefcase, desc: "name, employee id, role, phone" },
];

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

export function BulkImport() {
  const [step, setStep] = useState<"select" | "preview" | "result">("select");
  const [entityType, setEntityType] = useState("students");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<{ preview: PreviewRow[]; totalRows: number; errors: ImportError[]; requiredColumns: string[] } | null>(null);
  const [result, setResult] = useState<{ imported: number; skipped: number; errors: ImportError[] } | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setStep("select");
      setPreview(null);
      setResult(null);
    }
  };

  const previewImport = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("entityType", entityType);
      const res = await api.post<{ data: any }>("/api/school/features/import/preview", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPreview(res.data?.data || null);
      setStep("preview");
    } catch (err: any) {
      setError(err.message || "Preview failed");
    } finally {
      setLoading(false);
    }
  };

  const confirmImport = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("entityType", entityType);
      const res = await api.post<{ data: { imported: number; skipped: number; errors: ImportError[] } }>("/api/school/features/import/confirm", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data?.data || null);
      setStep("result");
      setSuccess(`Import completed: ${res.data?.data?.imported || 0} records imported.`);
    } catch (err: any) {
      setError(err.message || "Import failed");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep("select");
    setFile(null);
    setPreview(null);
    setResult(null);
    setError("");
    setSuccess("");
  };

  return (
    <div>
      {error && <AlertBanner type="error" message={error} onClose={() => setError("")} />}
      {success && <AlertBanner type="success" message={success} onClose={() => setSuccess("")} />}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold" style={{ color: NAVY }}>Bulk Import</h2>
          <p className="text-sm" style={{ color: MUTED }}>Import students, teachers, or staff from spreadsheet</p>
        </div>
        {step !== "select" && (
          <button onClick={reset}
            className="px-4 py-2 rounded-xl text-sm"
            style={{ background: "white", border: "1px solid rgba(56,25,50,0.1)", color: NAVY }}>
            Start New Import
          </button>
        )}
      </div>

      {step === "select" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {ENTITY_TYPES.map(et => (
              <button key={et.value} onClick={() => setEntityType(et.value)}
                className="p-5 rounded-xl text-left transition-all active:scale-95"
                style={{
                  background: entityType === et.value ? NAVY : "white",
                  border: `1px solid ${entityType === et.value ? NAVY : "rgba(56,25,50,0.1)"}`,
                  color: entityType === et.value ? CREAM : NAVY,
                }}>
                <et.icon size={24} className="mb-2" />
                <p className="font-semibold text-sm mb-1">{et.label}</p>
                <p className="text-xs opacity-70">Required: {et.desc}</p>
              </button>
            ))}
          </div>

          <div className="p-6 rounded-xl" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
            <label className="flex flex-col items-center justify-center p-8 rounded-xl cursor-pointer"
              style={{ border: "2px dashed rgba(56,25,50,0.15)", background: CREAM }}>
              <Upload size={32} color={MUTED} className="mb-3" />
              <p className="font-medium text-sm mb-1" style={{ color: NAVY }}>
                {file ? file.name : "Click to upload spreadsheet"}
              </p>
              <p className="text-xs" style={{ color: MUTED }}>Supports .xlsx and .csv files (max 20MB)</p>
              <input type="file" accept=".xlsx,.csv" className="hidden" onChange={handleFileSelect} />
            </label>

            {file && (
              <div className="flex items-center justify-between mt-4 p-3 rounded-lg" style={{ background: CREAM }}>
                <div className="flex items-center gap-2">
                  <FileSpreadsheet size={16} color={NAVY} />
                  <span className="text-sm" style={{ color: NAVY }}>{file.name}</span>
                  <span className="text-xs" style={{ color: MUTED }}>({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
                <button onClick={previewImport} disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold active:scale-95 disabled:opacity-50"
                  style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_LIGHT})`, color: CREAM }}>
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  Preview
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {step === "preview" && preview && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="p-4 rounded-xl" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
              <p className="text-xs uppercase tracking-wider mb-1" style={{ color: MUTED }}>Entity Type</p>
              <p className="font-semibold" style={{ color: NAVY }}>{entityType}</p>
            </div>
            <div className="p-4 rounded-xl" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
              <p className="text-xs uppercase tracking-wider mb-1" style={{ color: MUTED }}>Total Rows</p>
              <p className="font-semibold" style={{ color: NAVY }}>{preview.totalRows}</p>
            </div>
            <div className="p-4 rounded-xl" style={{ background: preview.errors.length > 0 ? "#FEF2F2" : "white", border: `1px solid ${preview.errors.length > 0 ? "#FECACA" : "rgba(56,25,50,0.07)"}` }}>
              <p className="text-xs uppercase tracking-wider mb-1" style={{ color: MUTED }}>Validation Errors</p>
              <p className="font-semibold" style={{ color: preview.errors.length > 0 ? "#EF4444" : NAVY }}>{preview.errors.length}</p>
            </div>
          </div>

          <div className="rounded-xl overflow-hidden" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
            <h3 className="px-4 py-3 font-semibold text-sm" style={{ color: NAVY }}>Preview (First 5 Rows)</h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider" style={{ color: MUTED, borderBottom: "1px solid rgba(56,25,50,0.07)" }}>
                    {preview.requiredColumns.map(col => (
                      <th key={col} className="px-4 py-3 font-medium">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.preview.map((row, i) => (
                    <tr key={i} className="text-sm" style={{ borderBottom: "1px solid rgba(56,25,50,0.05)" }}>
                      {preview.requiredColumns.map(col => (
                        <td key={col} className="px-4 py-3" style={{ color: NAVY }}>{row[col] || "—"}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {preview.errors.length > 0 && (
            <div className="p-4 rounded-xl" style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}>
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2" style={{ color: "#991B1B" }}>
                <AlertCircle size={14} /> Validation Errors
              </h4>
              <div className="space-y-1">
                {preview.errors.slice(0, 10).map((err, i) => (
                  <p key={i} className="text-xs" style={{ color: "#B91C1C" }}>
                    Row {err.row}: {err.message}
                  </p>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={confirmImport} disabled={loading || preview.errors.length > 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold active:scale-95 transition-transform disabled:opacity-50"
              style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_LIGHT})`, color: CREAM }}>
              {loading ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
              {loading ? "Importing..." : `Confirm Import (${preview.totalRows} rows)`}
            </button>
            <button onClick={reset}
              className="px-5 py-2.5 rounded-xl text-sm"
              style={{ background: "white", border: "1px solid rgba(56,25,50,0.1)", color: NAVY }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {step === "result" && result && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="p-5 rounded-xl" style={{ background: "#D1FAE5", border: "1px solid #A7F3D0" }}>
              <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "#065F46" }}>Imported</p>
              <p className="text-2xl font-bold" style={{ color: "#065F46" }}>{result.imported}</p>
            </div>
            <div className="p-5 rounded-xl" style={{ background: "#FEF3C7", border: "1px solid #FDE68A" }}>
              <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "#92400E" }}>Skipped (Duplicates)</p>
              <p className="text-2xl font-bold" style={{ color: "#92400E" }}>{result.skipped}</p>
            </div>
            <div className="p-5 rounded-xl" style={{ background: result.errors.length > 0 ? "#FEF2F2" : "#D1FAE5", border: `1px solid ${result.errors.length > 0 ? "#FECACA" : "#A7F3D0"}` }}>
              <p className="text-xs uppercase tracking-wider mb-1" style={{ color: result.errors.length > 0 ? "#991B1B" : "#065F46" }}>Errors</p>
              <p className="text-2xl font-bold" style={{ color: result.errors.length > 0 ? "#991B1B" : "#065F46" }}>{result.errors.length}</p>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div className="p-4 rounded-xl" style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}>
              <h4 className="font-semibold text-sm mb-2" style={{ color: "#991B1B" }}>Import Errors</h4>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {result.errors.map((err, i) => (
                  <p key={i} className="text-xs" style={{ color: "#B91C1C" }}>Row {err.row}: {err.message}</p>
                ))}
              </div>
            </div>
          )}

          <button onClick={reset}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_LIGHT})`, color: CREAM }}>
            Import Another File
          </button>
        </div>
      )}
    </div>
  );
}
