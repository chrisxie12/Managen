import { useState, useEffect, useCallback } from "react";
import { Save, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "../../../../components/ui/input";
import { Button } from "../../../../components/ui/button";
import { api } from "../../../../services/api";

const NAVY = "#031B4E";
const MUTED = "#6B7280";

function SectionCard({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="p-5 rounded-2xl mb-4" style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)" }}>
      <h3 className="text-sm font-semibold mb-1" style={{ color: NAVY }}>{title}</h3>
      {desc && <p className="text-xs mb-4" style={{ color: MUTED }}>{desc}</p>}
      {children}
    </div>
  );
}

function FormField({ label, error, children }: { label: string; error?: string | null; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <label className="text-xs font-medium mb-1 block" style={{ color: NAVY }}>{label}</label>
      {children}
      {error && <p className="text-xs mt-1" style={{ color: "#EF4444" }}>{error}</p>}
    </div>
  );
}

const DEFAULT_DOCUMENTS = [
  { id: "1", name: "Ghana Card", mandatory: true, requiredAtRegistration: true },
  { id: "2", name: "Birth Certificate", mandatory: true, requiredAtRegistration: true },
  { id: "3", name: "Immunization Card", mandatory: true, requiredAtRegistration: false },
  { id: "4", name: "Previous Report Card", mandatory: true, requiredAtRegistration: true },
  { id: "5", name: "Passport Photograph", mandatory: true, requiredAtRegistration: true },
  { id: "6", name: "Parent/Guardian ID", mandatory: true, requiredAtRegistration: false },
  { id: "7", name: "Medical Records", mandatory: false, requiredAtRegistration: false },
  { id: "8", name: "Transfer Letter", mandatory: false, requiredAtRegistration: false },
  { id: "9", name: "SHS Placement Letter", mandatory: false, requiredAtRegistration: true },
];

type DocItem = { id: string; name: string; mandatory: boolean; requiredAtRegistration: boolean };

type Props = { role: string };

export function AdmissionTab({ role }: Props) {
  const isReadOnly = role !== "school_admin" && role !== "admin";
  const [docs, setDocs] = useState<DocItem[]>(DEFAULT_DOCUMENTS);
  const [maxApplicationsPerTerm, setMaxApplicationsPerTerm] = useState(500);
  const [maxStudentsPerGrade, setMaxStudentsPerGrade] = useState(45);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<any>("/api/school/settings/kv/admission_checklist").catch(() => null);
        if (res?.data) {
          const items = res.data.data || res.data;
          if (Array.isArray(items) && items.length > 0) setDocs(items);
        }
      } catch { /* ignore */ }
      try {
        const limRes = await api.get<any>("/api/school/settings/kv/admission_limits").catch(() => null);
        if (limRes?.data) {
          const limits = limRes.data.data || limRes.data;
          if (limits.max_applications_per_term) setMaxApplicationsPerTerm(limits.max_applications_per_term);
          if (limits.max_students_per_grade) setMaxStudentsPerGrade(limits.max_students_per_grade);
        }
      } catch { /* ignore */ }
      finally { setLoading(false); }
    })();
  }, []);

  const handleSave = async () => {
    if (isReadOnly) return;
    setSaving(true);
    try {
      const [checklistRes, limitsRes] = await Promise.all([
        api.put<any>("/api/school/settings/kv", { key: "admission_checklist", value: docs }),
        api.put<any>("/api/school/settings/kv", {
          key: "admission_limits",
          value: { max_applications_per_term: maxApplicationsPerTerm, max_students_per_grade: maxStudentsPerGrade },
        }),
      ]);
      if (checklistRes.data && limitsRes.data) toast.success("Admission settings saved");
      else toast.error("Failed to save some admission settings");
    } catch (err: any) {
      toast.error(err?.message || "Failed to save admission checklist");
    } finally { setSaving(false); }
  };

  const toggleMandatory = useCallback((id: string) => {
    setDocs(prev => prev.map(d => d.id === id ? { ...d, mandatory: !d.mandatory } : d));
  }, []);

  const toggleRequiredAtRegistration = useCallback((id: string) => {
    setDocs(prev => prev.map(d => d.id === id ? { ...d, requiredAtRegistration: !d.requiredAtRegistration } : d));
  }, []);

  const addDoc = useCallback(() => {
    const newId = String(Date.now());
    setDocs(prev => [...prev, { id: newId, name: "", mandatory: true, requiredAtRegistration: false }]);
  }, []);

  const updateDocName = useCallback((id: string, name: string) => {
    setDocs(prev => prev.map(d => d.id === id ? { ...d, name } : d));
  }, []);

  const removeDoc = useCallback((id: string) => {
    setDocs(prev => prev.filter(d => d.id !== id));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[30vh]"><Loader2 className="animate-spin" size={24} color={NAVY} /></div>;
  }

  return (
    <div>
      <SectionCard title="Admission Document Checklist" desc="Configure documents required for new student registration">
        <div className="overflow-x-auto">
          <table className="w-full text-xs" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr className="text-left" style={{ color: MUTED }}>
                <th className="pb-2 pr-3 font-medium">Document</th>
                <th className="pb-2 pr-3 font-medium text-center">Mandatory</th>
                <th className="pb-2 pr-3 font-medium text-center">Required at Registration</th>
                <th className="pb-2 font-medium w-10" />
              </tr>
            </thead>
            <tbody>
              {docs.map((doc) => (
                <tr key={doc.id} className="border-t" style={{ borderColor: "rgba(10,36,114,0.07)" }}>
                  <td className="py-2 pr-3">
                    <Input value={doc.name} onChange={(e) => updateDocName(doc.id, e.target.value)}
                      disabled={isReadOnly}
                      className="h-8 text-xs rounded-xl min-w-[160px]"
                      style={{ borderColor: "rgba(10,36,114,0.12)" }} placeholder="Document name" />
                  </td>
                  <td className="py-2 pr-3 text-center">
                    <input type="checkbox" checked={doc.mandatory}
                      disabled={isReadOnly}
                      onChange={() => toggleMandatory(doc.id)}
                      className="accent-purple-700 w-4 h-4 cursor-pointer" />
                  </td>
                  <td className="py-2 pr-3 text-center">
                    <input type="checkbox" checked={doc.requiredAtRegistration}
                      disabled={isReadOnly}
                      onChange={() => toggleRequiredAtRegistration(doc.id)}
                      className="accent-purple-700 w-4 h-4 cursor-pointer" />
                  </td>
                  <td className="py-2 text-center">
                    {!isReadOnly && docs.length > 1 && (
                      <button onClick={() => removeDoc(doc.id)} className="p-1 rounded-lg hover:bg-red-50 transition-colors">
                        <Trash2 size={13} color="#EF4444" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!isReadOnly && (
          <button onClick={addDoc} className="mt-3 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl transition-colors"
            style={{ color: NAVY, background: "rgba(10,36,114,0.06)" }}>
            <Plus size={14} /> Add Document Type
          </button>
        )}
        <p className="text-[10px] mt-3" style={{ color: MUTED }}>
          Mandatory documents must be provided for admission. Documents required at registration are collected during the online application process.
        </p>
      </SectionCard>

      <SectionCard title="Onboarding Capacity Limits" desc="Set maximum capacities for admission intake">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
          <FormField label="Max Applications Per Term">
            <Input type="number" min={1} max={99999} value={maxApplicationsPerTerm}
              onChange={(e) => setMaxApplicationsPerTerm(Math.max(1, Number(e.target.value) || 1))}
              disabled={isReadOnly}
              className="h-9 text-sm rounded-xl" style={{ borderColor: "rgba(10,36,114,0.12)" }} />
          </FormField>
          <FormField label="Max Students Per Grade/Class">
            <Input type="number" min={1} max={999} value={maxStudentsPerGrade}
              onChange={(e) => setMaxStudentsPerGrade(Math.max(1, Number(e.target.value) || 1))}
              disabled={isReadOnly}
              className="h-9 text-sm rounded-xl" style={{ borderColor: "rgba(10,36,114,0.12)" }} />
          </FormField>
        </div>
      </SectionCard>

      {!isReadOnly && (
        <div className="flex justify-end mt-2">
          <Button onClick={handleSave} disabled={saving} className="text-xs rounded-xl h-9 px-6" style={{ background: NAVY }}>
            {saving ? <Loader2 size={14} className="animate-spin mr-1" /> : <Save size={14} className="mr-1" />}
            Save Admission Settings
          </Button>
        </div>
      )}
    </div>
  );
}
