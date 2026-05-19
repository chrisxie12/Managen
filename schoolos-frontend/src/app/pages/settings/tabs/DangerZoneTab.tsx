import { useState } from "react";
import { AlertTriangle, Loader2, Download, Trash2, Skull, Power } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../../services/api";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { useAuth } from "../../../contexts/AuthContext";

const PLUM = "#381932";
const MUTED = "#7D6077";
const RED = "#DC2626";
const ORANGE = "#EA580C";

type DangerActionProps = {
  icon: React.ElementType;
  title: string;
  desc: string;
  confirmLabel: string;
  buttonLabel: string;
  buttonColor: string;
  loading: boolean;
  onAction: () => void;
  confirmValue: string;
  onConfirmChange: (v: string) => void;
  showPassword?: boolean;
  passwordValue?: string;
  onPasswordChange?: (v: string) => void;
};

function DangerAction({
  icon: Icon,
  title,
  desc,
  confirmLabel,
  buttonLabel,
  buttonColor,
  loading,
  onAction,
  confirmValue,
  onConfirmChange,
  showPassword,
  passwordValue,
  onPasswordChange,
}: DangerActionProps) {
  const match = confirmValue === confirmLabel;
  const showPw = showPassword && match;
  const canSubmit = match && !loading && !(showPassword && !passwordValue);
  return (
    <div className="py-4 first:pt-0 last:pb-0 border-t border-red-100 first:border-t-0">
      <div className="flex items-start gap-2 mb-3">
        <div className="mt-0.5">
          <Icon size={16} color={buttonColor} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium" style={{ color: PLUM }}>{title}</h4>
          <p className="text-xs mt-0.5" style={{ color: MUTED }}>{desc}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Input
          value={confirmValue}
          onChange={(e) => onConfirmChange(e.target.value)}
          placeholder={confirmLabel}
          className="h-9 text-xs rounded-xl flex-1"
          style={{ borderColor: "rgba(56,25,50,0.12)" }}
        />
        <Button
          onClick={onAction}
          disabled={!canSubmit}
          className="text-xs rounded-xl h-9 px-4 whitespace-nowrap"
          style={{ background: canSubmit ? buttonColor : undefined, color: canSubmit ? "white" : undefined }}
        >
          {loading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            buttonLabel
          )}
        </Button>
      </div>
      {showPw && (
        <div className="mt-2">
          <Input
            type="password"
            value={passwordValue || ""}
            onChange={(e) => onPasswordChange?.(e.target.value)}
            placeholder="Enter your current password"
            className="h-9 text-xs rounded-xl w-full"
            style={{ borderColor: "rgba(56,25,50,0.12)" }}
          />
        </div>
      )}
    </div>
  );
}

type Props = { profile: Record<string, any> };

export function DangerZoneTab({ profile }: Props) {
  const { user } = useAuth();
  if (user?.role !== "school_admin" && user?.role !== "admin") {
    return (
      <p className="text-xs py-4 text-center" style={{ color: "#7D6077" }}>
        You don't have permission to access the Danger Zone.
      </p>
    );
  }
  const schoolName = profile?.name || "";

  const [exporting, setExporting] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [deactivateSchool, setDeactivateSchool] = useState("");
  const [resetTerm, setResetTerm] = useState("");
  const [resetting, setResetting] = useState(false);
  const [archiveYear, setArchiveYear] = useState("");
  const [archiving, setArchiving] = useState(false);
  const [clearAllData, setClearAllData] = useState("");
  const [clearAllDataPassword, setClearAllDataPassword] = useState("");
  const [clearingAllData, setClearingAllData] = useState(false);
  const [deleteStudents, setDeleteStudents] = useState("");
  const [deletingStudents, setDeletingStudents] = useState(false);
  const [deleteAccount, setDeleteAccount] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await api.post("/api/school/settings/export", {});
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Export job queued. You will receive an email when ready.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to queue export");
    } finally {
      setExporting(false);
    }
  };

  const handleDeactivateSchool = async () => {
    setDeactivating(true);
    try {
      const res = await api.put("/api/school/settings/deactivate", { confirm: schoolName });
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("School deactivated. Contact support to reactivate.");
        setDeactivateSchool("");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to deactivate school");
    } finally {
      setDeactivating(false);
    }
  };

  const handleResetTerm = async () => {
    setResetting(true);
    try {
      const res = await api.post("/api/school/settings/reset-term", { confirm: "RESET TERM" });
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Term data has been reset successfully");
        setResetTerm("");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to reset term data");
    } finally {
      setResetting(false);
    }
  };

  const handleArchiveYear = async () => {
    setArchiving(true);
    try {
      const res = await api.post("/api/school/settings/archive-year", { confirm: schoolName });
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("School year archived. A new academic year has been started.");
        setArchiveYear("");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to archive school year");
    } finally {
      setArchiving(false);
    }
  };

  const handleClearAllData = async () => {
    setClearingAllData(true);
    try {
      const res = await api.post("/api/school/settings/clear-all-data", { confirm: "DELETE ALL DATA", password: clearAllDataPassword });
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("All school data has been cleared.");
        setClearAllData("");
        setClearAllDataPassword("");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to clear all data");
    } finally {
      setClearingAllData(false);
    }
  };

  const handleDeleteStudents = async () => {
    setDeletingStudents(true);
    try {
      const res = await api.delete("/api/school/students/all", { body: JSON.stringify({ confirm: "DELETE STUDENTS" }) });
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("All student data has been permanently deleted");
        setDeleteStudents("");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete student data");
    } finally {
      setDeletingStudents(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      const res = await api.delete("/api/school/settings/account", { body: JSON.stringify({ confirm: schoolName }) });
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Deletion scheduled. A confirmation email will be sent.");
        setDeleteAccount("");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to schedule account deletion");
    } finally {
      setDeletingAccount(false);
    }
  };

  return (
    <div
      className="p-5 rounded-2xl"
      style={{ background: "white", border: "1px solid #FECACA" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle size={18} color={RED} />
        <h3 className="text-sm font-semibold" style={{ color: RED }}>Danger Zone</h3>
      </div>

      {/* Export All Data */}
      <div className="py-4 first:pt-0 border-t border-red-100 first:border-t-0">
        <div className="flex items-start gap-2 mb-3">
          <div className="mt-0.5">
            <Download size={16} color={MUTED} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium" style={{ color: PLUM }}>Export All Data</h4>
            <p className="text-xs mt-0.5" style={{ color: MUTED }}>
              Download a complete export of all your school data (students, teachers, grades, fees, attendance)
            </p>
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            onClick={handleExport}
            disabled={exporting}
            className="text-xs rounded-xl h-9 px-4"
            style={{ background: PLUM }}
          >
            {exporting ? (
              <>
                <Loader2 size={14} className="animate-spin mr-1" />
                Downloading...
              </>
            ) : (
              <>
                <Download size={14} className="mr-1" />
                Export All Data
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Deactivate School */}
      <DangerAction
        icon={Power}
        title="Deactivate School"
        desc="Temporarily deactivate your school. All users will lose access. Reactivation requires contact with support."
        confirmLabel={schoolName}
        buttonLabel="Deactivate School"
        buttonColor={ORANGE}
        loading={deactivating}
        onAction={handleDeactivateSchool}
        confirmValue={deactivateSchool}
        onConfirmChange={setDeactivateSchool}
      />

      <DangerAction
        icon={AlertTriangle}
        title="Reset Current Term Data"
        desc="Clear all attendance and grades for current term. This cannot be undone."
        confirmLabel="RESET TERM"
        buttonLabel="Reset Term Data"
        buttonColor={RED}
        loading={resetting}
        onAction={handleResetTerm}
        confirmValue={resetTerm}
        onConfirmChange={setResetTerm}
      />

      <DangerAction
        icon={AlertTriangle}
        title="Archive School Year"
        desc="Move current year data to archive and start fresh"
        confirmLabel={schoolName}
        buttonLabel="Archive & Start New Year"
        buttonColor={ORANGE}
        loading={archiving}
        onAction={handleArchiveYear}
        confirmValue={archiveYear}
        onConfirmChange={setArchiveYear}
      />

      {/* Clear All Data */}
      <DangerAction
        icon={Trash2}
        title="Clear All School Data"
        desc="Remove all attendance, grades, fee records, and class schedules. School profile and user accounts will be preserved."
        confirmLabel="DELETE ALL DATA"
        buttonLabel="Clear All Data"
        buttonColor={RED}
        loading={clearingAllData}
        onAction={handleClearAllData}
        confirmValue={clearAllData}
        onConfirmChange={setClearAllData}
        showPassword
        passwordValue={clearAllDataPassword}
        onPasswordChange={setClearAllDataPassword}
      />

      <DangerAction
        icon={Trash2}
        title="Delete All Student Data"
        desc="Permanently delete all student records. This is irreversible."
        confirmLabel="DELETE STUDENTS"
        buttonLabel="Delete Student Data"
        buttonColor={RED}
        loading={deletingStudents}
        onAction={handleDeleteStudents}
        confirmValue={deleteStudents}
        onConfirmChange={setDeleteStudents}
      />

      <DangerAction
        icon={Skull}
        title="Delete School Account"
        desc="Permanently delete your school and all data. This will immediately terminate your account."
        confirmLabel={schoolName}
        buttonLabel="Delete School Account"
        buttonColor={RED}
        loading={deletingAccount}
        onAction={handleDeleteAccount}
        confirmValue={deleteAccount}
        onConfirmChange={setDeleteAccount}
      />
    </div>
  );
}
