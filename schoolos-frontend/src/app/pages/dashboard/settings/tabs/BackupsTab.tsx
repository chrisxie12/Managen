import { useState, useEffect } from "react";
import { Download, Loader2, Calendar, AlertTriangle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../../../../components/ui/select";
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

export function BackupsTab({ role }: Props) {
  const isReadOnly = role !== "school_admin" && role !== "admin";
  const [exporting, setExporting] = useState(false);
  const [schedule, setSchedule] = useState("never");
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [lastExport, setLastExport] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<any>("/api/school/settings/kv/backup_schedule").catch(() => null);
        if (res?.data) {
          const cfg = res.data.data || res.data;
          if (cfg.schedule) setSchedule(cfg.schedule);
          if (cfg.last_export) setLastExport(cfg.last_export);
        }
      } catch { /* ignore */ }
      finally { setLoading(false); }
    })();
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await api.post<any>("/api/school/settings/export", {});
      if (!res.error) {
        toast.success("Export started. You will be notified when it's ready.");
        setLastExport(new Date().toISOString());
      } else {
        toast.error(res.error || "Failed to start export");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to start export");
    } finally { setExporting(false); }
  };

  const handleSaveSchedule = async () => {
    setSavingSchedule(true);
    try {
      const payload = { key: "backup_schedule", value: { schedule, last_export: lastExport } };
      const res = await api.put<any>("/api/school/settings/kv", payload);
      if (res.data) toast.success("Backup schedule saved");
      else toast.error(res.error || "Failed to save");
    } catch (err: any) {
      toast.error(err?.message || "Failed to save backup schedule");
    } finally { setSavingSchedule(false); }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[30vh]"><Loader2 className="animate-spin" size={24} color={NAVY} /></div>;
  }

  return (
    <div>
      <SectionCard title="One-Click Data Export" desc="Export all your school data as a CSV archive">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium" style={{ color: NAVY }}>Complete CSV Export</p>
            <p className="text-xs mt-0.5" style={{ color: MUTED }}>
              Includes students, staff, attendance, fees, assessments, and grades
              {lastExport && <span className="block mt-0.5">Last export: {new Date(lastExport).toLocaleDateString()}</span>}
            </p>
          </div>
          <Button onClick={handleExport} disabled={exporting || isReadOnly}
            className="text-xs rounded-xl h-9 px-5" style={{ background: NAVY }}>
            {exporting ? (
              <Loader2 size={14} className="animate-spin mr-1" />
            ) : (
              <Download size={14} className="mr-1" />
            )}
            {exporting ? "Exporting..." : "Export CSV"}
          </Button>
        </div>
      </SectionCard>

      <SectionCard title="Auto-Backup Schedule" desc="Set a recurring schedule for automatic data backups">
        <div className="flex items-end gap-4">
          <div className="flex-1 max-w-xs">
            <label className="text-xs font-medium mb-1 block" style={{ color: NAVY }}>Frequency</label>
            <Select value={schedule} onValueChange={setSchedule} disabled={isReadOnly}>
              <SelectTrigger className="h-9 text-xs rounded-xl" style={{ borderColor: "rgba(10,36,114,0.12)" }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="never" className="text-xs">Never (manual only)</SelectItem>
                <SelectItem value="daily" className="text-xs">Daily</SelectItem>
                <SelectItem value="weekly" className="text-xs">Weekly</SelectItem>
                <SelectItem value="monthly" className="text-xs">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {!isReadOnly && (
            <Button onClick={handleSaveSchedule} disabled={savingSchedule}
              className="text-xs rounded-xl h-9 px-5" style={{ background: NAVY }}>
              {savingSchedule ? <Loader2 size={14} className="animate-spin mr-1" /> : <Calendar size={14} className="mr-1" />}
              Save Schedule
            </Button>
          )}
        </div>
        {schedule !== "never" && (
          <p className="text-[11px] mt-2 flex items-center gap-1" style={{ color: "#10B981" }}>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
            Auto-backup is {schedule}
          </p>
        )}
      </SectionCard>

      {!isReadOnly && (
        <DangerZone />
      )}
    </div>
  );
}

function DangerZone() {
  const [confirmText, setConfirmText] = useState("");
  const [resetting, setResetting] = useState(false);
  const confirmed = confirmText === "RESET";

  const handleReset = async () => {
    if (!confirmed) return;
    setResetting(true);
    try {
      const res = await api.post<any>("/api/school/settings/reset-tenant", {});
      if (!res.error) {
        toast.success("Tenant data has been reset. Redirecting...");
        setTimeout(() => window.location.reload(), 2000);
      } else {
        toast.error(res.error || "Failed to reset tenant data");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to reset tenant data");
    } finally { setResetting(false); }
  };

  return (
    <div className="p-5 rounded-2xl mb-4" style={{ background: "white", border: "1px solid rgba(239,68,68,0.2)" }}>
      <div className="flex items-center gap-2 mb-1">
        <AlertTriangle size={16} color="#EF4444" />
        <h3 className="text-sm font-semibold" style={{ color: "#EF4444" }}>Danger Zone</h3>
      </div>
      <p className="text-xs mb-4" style={{ color: MUTED }}>
        These actions are irreversible. Proceed with extreme caution.
      </p>

      <div className="p-3 rounded-xl" style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.15)" }}>
        <p className="text-xs font-medium mb-1" style={{ color: "#EF4444" }}>Reset All Tenant Data</p>
        <p className="text-[11px] mb-3" style={{ color: MUTED }}>
          This will permanently delete all students, staff, attendance records, fees, assessments, and grades
          associated with your school. School profile and settings will be preserved. This action cannot be undone.
        </p>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)}
            placeholder='Type "RESET" to confirm'
            className="h-9 text-sm rounded-xl max-w-[200px]"
            style={{ borderColor: confirmText === "RESET" ? "#EF4444" : "rgba(239,68,68,0.3)" }} />
          <Button onClick={handleReset} disabled={!confirmed || resetting}
            className="text-xs rounded-xl h-9 px-5" style={{ background: "#EF4444" }}>
            {resetting ? <Loader2 size={14} className="animate-spin mr-1" /> : <Trash2 size={14} className="mr-1" />}
            {resetting ? "Resetting..." : "Reset Tenant Data"}
          </Button>
        </div>
      </div>
    </div>
  );
}
