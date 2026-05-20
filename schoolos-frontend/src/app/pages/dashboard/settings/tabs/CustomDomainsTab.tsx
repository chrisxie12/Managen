import { useState, useEffect, useRef } from "react";
import { Globe, Loader2, Check, X, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Input } from "../../../../components/ui/input";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { api } from "../../../../services/api";

const NAVY = "#0A2472";
const MUTED = "#6B7280";

function SectionCard({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="p-5 rounded-2xl mb-4" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
      <h3 className="text-sm font-semibold mb-1" style={{ color: NAVY }}>{title}</h3>
      {desc && <p className="text-xs mb-4" style={{ color: MUTED }}>{desc}</p>}
      {children}
    </div>
  );
}

type ValidationStatus = "pending_dns" | "validating_ssl" | "active" | "failed" | "not_configured";

const STATUS_CONFIG: Record<ValidationStatus, { label: string; color: string; bg: string }> = {
  not_configured: { label: "Not Configured", color: MUTED, bg: "rgba(56,25,50,0.06)" },
  pending_dns: { label: "Pending DNS", color: "#D97706", bg: "rgba(217,119,6,0.1)" },
  validating_ssl: { label: "Validating SSL", color: "#2563EB", bg: "rgba(37,99,235,0.1)" },
  active: { label: "Active", color: "#10B981", bg: "rgba(16,185,129,0.1)" },
  failed: { label: "Validation Failed", color: "#EF4444", bg: "rgba(239,68,68,0.1)" },
};

type Props = { role: string };

export function CustomDomainsTab({ role }: Props) {
  const isReadOnly = role !== "school_admin" && role !== "admin";
  const [domain, setDomain] = useState("");
  const [status, setStatus] = useState<ValidationStatus>("not_configured");
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [loading, setLoading] = useState(true);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<any>("/api/school/settings/kv/custom_domain").catch(() => null);
        if (res?.data) {
          const cfg = res.data.data || res.data;
          if (cfg.domain) setDomain(cfg.domain);
          if (cfg.status) setStatus(cfg.status);
        }
      } catch { /* ignore */ }
      finally { setLoading(false); }
    })();
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, []);

  useEffect(() => {
    if (status === "validating_ssl") {
      pollingRef.current = setInterval(async () => {
        try {
          const res = await api.get<any>("/api/school/settings/kv/custom_domain").catch(() => null);
          if (res?.data) {
            const cfg = res.data.data || res.data;
            if (cfg.status === "active" || cfg.status === "failed") {
              setStatus(cfg.status);
              if (pollingRef.current) clearInterval(pollingRef.current);
            }
          }
        } catch { /* ignore */ }
      }, 10000);
    }
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [status]);

  const handleSave = async () => {
    if (isReadOnly) return;
    if (!domain.trim()) { toast.error("Please enter a domain name"); return; }
    setSaving(true);
    try {
      const payload = { key: "custom_domain", value: { domain: domain.trim(), status: "pending_dns" } };
      const res = await api.put<any>("/api/school/settings/kv", payload);
      if (res.data) {
        setStatus("pending_dns");
        toast.success("Custom domain saved. Configure your DNS and click Verify.");
      } else {
        toast.error(res.error || "Failed to save");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to save custom domain");
    } finally { setSaving(false); }
  };

  const handleRemove = async () => {
    if (isReadOnly) return;
    try {
      await api.delete("/api/school/settings/kv/custom_domain");
      setDomain("");
      setStatus("not_configured");
      toast.success("Custom domain removed");
    } catch { toast.error("Failed to remove custom domain"); }
  };

  const handleVerify = async () => {
    if (!domain.trim()) { toast.error("No domain configured to verify"); return; }
    setVerifying(true);
    try {
      setStatus("validating_ssl");
      const payload = { key: "custom_domain", value: { domain: domain.trim(), status: "validating_ssl" } };
      await api.put<any>("/api/school/settings/kv", payload);
      toast.success("Validation started. Polling for results every 10 seconds...");
    } catch (err: any) {
      toast.error(err?.message || "Failed to start verification");
      setStatus("pending_dns");
    } finally { setVerifying(false); }
  };

  const statusCfg = STATUS_CONFIG[status];

  if (loading) {
    return <div className="flex items-center justify-center min-h-[30vh]"><Loader2 className="animate-spin" size={24} color={NAVY} /></div>;
  }

  return (
    <div>
      <SectionCard title="Custom Domain" desc="Point your own domain to your school portal">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
          <div className="flex-1 w-full">
            <label className="text-xs font-medium mb-1 block" style={{ color: NAVY }}>Domain Name</label>
            <Input value={domain} onChange={(e) => setDomain(e.target.value)}
              disabled={isReadOnly}
              className="h-9 text-sm rounded-xl w-full"
              style={{ borderColor: "rgba(56,25,50,0.12)" }}
              placeholder="portal.myschool.com" />
          </div>
          {!isReadOnly && (
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving || !domain.trim()}
                className="text-xs rounded-xl h-9 px-4" style={{ background: NAVY }}>
                {saving ? <Loader2 size={14} className="animate-spin mr-1" /> : <Globe size={14} className="mr-1" />}
                Save Domain
              </Button>
              {status !== "not_configured" && (
                <Button onClick={handleRemove} variant="outline"
                  className="text-xs rounded-xl h-9 px-4" style={{ color: "#EF4444", borderColor: "rgba(239,68,68,0.2)" }}>
                  Remove
                </Button>
              )}
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard title="Domain Status">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: statusCfg.bg }}>
              {status === "active" ? <Check size={20} color={statusCfg.color} />
                : status === "failed" ? <X size={20} color={statusCfg.color} />
                : <Globe size={20} color={statusCfg.color} />}
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: NAVY }}>
                {domain || "No domain configured"}
              </p>
              <Badge className="text-[10px] font-medium px-2 py-0.5 mt-0.5 rounded-full"
                style={{ background: statusCfg.bg, color: statusCfg.color, border: "none" }}>
                {status === "validating_ssl" && <Loader2 size={10} className="animate-spin mr-1" />}
                {statusCfg.label}
              </Badge>
            </div>
          </div>
          {(status === "pending_dns" || status === "failed") && !isReadOnly && (
            <Button onClick={handleVerify} disabled={verifying}
              className="text-xs rounded-xl h-9 px-4" style={{ background: NAVY }}>
              {verifying ? <Loader2 size={14} className="animate-spin mr-1" /> : <RefreshCw size={14} className="mr-1" />}
              Verify Now
            </Button>
          )}
        </div>

        {status === "pending_dns" && (
          <div className="mt-4 p-3 rounded-xl text-xs" style={{ background: "rgba(217,119,6,0.06)", border: "1px solid rgba(217,119,6,0.15)" }}>
            <p className="font-medium mb-1" style={{ color: "#D97706" }}>DNS Configuration Required</p>
            <p style={{ color: MUTED }}>
              Add a CNAME record pointing <span className="font-mono font-medium" style={{ color: NAVY }}>{domain}</span> to{' '}
              <span className="font-mono font-medium" style={{ color: NAVY }}>portal.schoolos.io</span>
              {' '}in your DNS provider settings. Click "Verify Now" after adding the record.
            </p>
          </div>
        )}

        {status === "validating_ssl" && (
          <div className="mt-4 flex items-center gap-2 text-xs" style={{ color: "#2563EB" }}>
            <Loader2 size={14} className="animate-spin" />
            Checking DNS records and provisioning SSL certificate... This may take a few minutes.
          </div>
        )}

        {status === "active" && (
          <div className="mt-4 p-3 rounded-xl text-xs" style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)" }}>
            <p className="font-medium" style={{ color: "#10B981" }}>
              <Check size={12} className="inline mr-1" />
              Your domain is active and secured with an SSL certificate.
            </p>
            <p className="mt-1" style={{ color: MUTED }}>
              Access your school portal at <span className="font-mono font-medium" style={{ color: NAVY }}>https://{domain}</span>
            </p>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
