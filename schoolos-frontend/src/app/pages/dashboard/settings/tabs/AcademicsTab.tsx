import { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../../../components/ui/button";
import { Switch } from "../../../../components/ui/switch";
import { api } from "../../../../services/api";

const NAVY = "#0A2472";
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

type Props = { role: string };

export function AcademicsTab({ role }: Props) {
  const isReadOnly = role !== "school_admin" && role !== "admin" && role !== "headmaster";
  const [standardsCurriculum, setStandardsCurriculum] = useState(false);
  const [publishPositions, setPublishPositions] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<any>("/api/school/settings");
        if (res.data) {
          const d = res.data.data || res.data;
          const meta = d.metadata || {};
          if (meta.standards_based_curriculum !== undefined) setStandardsCurriculum(meta.standards_based_curriculum);
          if (meta.publish_class_positions !== undefined) setPublishPositions(meta.publish_class_positions);
        }
      } catch { /* ignore */ }
      finally { setLoading(false); }
    })();
  }, []);

  const handleSave = async () => {
    if (isReadOnly) return;
    setSaving(true);
    try {
      const res = await api.put<any>("/api/school/settings/academic", {
        metadata: {
          standards_based_curriculum: standardsCurriculum,
          publish_class_positions: publishPositions,
        },
      });
      if (res.data) {
        toast.success("Academic settings saved");
      } else {
        toast.error(res.error || "Failed to save");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to save academic settings");
    } finally { setSaving(false); }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[30vh]"><Loader2 className="animate-spin" size={24} color={NAVY} /></div>;
  }

  return (
    <div>
      <SectionCard title="NaCCA Standards-Based Curriculum" desc="Toggle Ghana NaCCA curriculum compliance features">
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium" style={{ color: NAVY }}>Enable Standards-Based Curriculum</p>
              <p className="text-xs mt-0.5" style={{ color: MUTED }}>Align assessments, grading, and reporting with NaCCA standards-based curriculum framework</p>
            </div>
            <Switch checked={standardsCurriculum} onCheckedChange={setStandardsCurriculum} disabled={isReadOnly} />
          </div>
          <div className="border-t pt-4 flex items-center justify-between" style={{ borderColor: "rgba(10,36,114,0.07)" }}>
            <div>
              <p className="text-sm font-medium" style={{ color: NAVY }}>Publish Class Positions on Terminal Reports</p>
              <p className="text-xs mt-0.5" style={{ color: MUTED }}>Include ranked class positions in end-of-term report cards</p>
            </div>
            <Switch checked={publishPositions} onCheckedChange={setPublishPositions} disabled={isReadOnly} />
          </div>
        </div>
      </SectionCard>

      {!isReadOnly && (
        <div className="flex justify-end mt-2">
          <Button onClick={handleSave} disabled={saving} className="text-xs rounded-xl h-9 px-6" style={{ background: NAVY }}>
            {saving ? <Loader2 size={14} className="animate-spin mr-1" /> : <Save size={14} className="mr-1" />}
            Save Academic Settings
          </Button>
        </div>
      )}
    </div>
  );
}
