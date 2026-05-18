import { useState, useEffect } from "react";
import { MapPin, Link2, Loader2, Copy, Check, X, AlertCircle } from "lucide-react";
import { api } from "../services/api";

const PLUM = "#381932";
const PLUM_LIGHT = "#512b4a";
const MILK = "#FFF3E6";
const MUTED = "#7D6077";

type AttendanceLink = {
  id: string; link_code: string; target_group: string; expires_at: string;
  is_active: boolean; is_one_time: boolean; created_at: string;
  created_by_user?: { name: string; email: string };
};

type GeofenceRecord = {
  id: string; user_id: string; latitude: number; longitude: number;
  timestamp: string; status: string;
  user?: { name: string; email: string; department?: string; role_title?: string };
  link?: { link_code: string; target_group: string };
};

function LoadingSpinner({ height = 48 }: { height?: number }) {
  return (
    <div className="flex items-center justify-center" style={{ height }}>
      <Loader2 className="animate-spin" size={24} color={PLUM} />
    </div>
  );
}

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

export function AttendanceLinks() {
  const [tab, setTab] = useState("generate");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const tabs = [
    { key: "generate", label: "Generate Link", icon: Link2 },
    { key: "links", label: "My Links", icon: Link2 },
    { key: "records", label: "Attendance Records", icon: MapPin },
  ];

  return (
    <div>
      {error && <AlertBanner type="error" message={error} onClose={() => setError("")} />}
      {success && <AlertBanner type="success" message={success} onClose={() => setSuccess("")} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold" style={{ color: PLUM }}>Geofenced Attendance</h2>
          <p className="text-sm" style={{ color: MUTED }}>Generate location-verified attendance links for staff</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95"
              style={{
                background: tab === t.key ? PLUM : "white",
                color: tab === t.key ? MILK : PLUM_LIGHT,
                border: tab === t.key ? "none" : "1px solid rgba(56,25,50,0.1)",
              }}>
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "generate" && <GenerateLinkTab setError={setError} setSuccess={setSuccess} />}
      {tab === "links" && <LinksTab />}
      {tab === "records" && <RecordsTab />}
    </div>
  );
}

function GenerateLinkTab({ setError, setSuccess }: { setError: (s: string) => void; setSuccess: (s: string) => void }) {
  const [expiry, setExpiry] = useState(60);
  const [group, setGroup] = useState("all");
  const [generating, setGenerating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<AttendanceLink | null>(null);
  const [copied, setCopied] = useState(false);

  const linkUrl = generatedLink
    ? `${window.location.origin}/attendance/${generatedLink.link_code}`
    : "";

  const generate = async () => {
    setGenerating(true);
    setError("");
    setSuccess("");
    try {
      const res = await api.post<{ data: { link: AttendanceLink } }>("/api/school/features/attendance-link/generate", {
        expiresInMinutes: Number(expiry),
        targetGroup: group,
      });
      setGeneratedLink(res.data?.data?.link || null);
      setSuccess("Attendance link generated! Share the URL with staff.");
    } catch (err: any) {
      setError(err.message || "Failed to generate link");
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(linkUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
        <h3 className="font-semibold text-sm mb-4" style={{ color: PLUM }}>Generate New Attendance Link</h3>

        <div className="grid gap-4 sm:grid-cols-2 mb-4">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: MUTED }}>Expires In (minutes)</label>
            <select value={expiry} onChange={(e) => setExpiry(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl outline-none text-sm"
              style={{ background: MILK, border: "1px solid rgba(56,25,50,0.1)", color: PLUM }}>
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={120}>2 hours</option>
              <option value={360}>6 hours</option>
              <option value={1440}>24 hours</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: MUTED }}>Target Group</label>
            <select value={group} onChange={(e) => setGroup(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl outline-none text-sm"
              style={{ background: MILK, border: "1px solid rgba(56,25,50,0.1)", color: PLUM }}>
              <option value="all">All Staff</option>
              <option value="teachers">Teachers Only</option>
              <option value="non_teaching">Non-Teaching Staff Only</option>
            </select>
          </div>
        </div>

        <button onClick={generate} disabled={generating}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold active:scale-95 transition-transform disabled:opacity-50"
          style={{ background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})`, color: MILK }}>
          {generating ? <Loader2 size={15} className="animate-spin" /> : <Link2 size={15} />}
          {generating ? "Generating..." : "Generate Link"}
        </button>
      </div>

      {generatedLink && (
        <div className="p-6 rounded-xl" style={{ background: "#D1FAE5", border: "1px solid #A7F3D0" }}>
          <div className="flex items-center gap-2 mb-3">
            <Check size={16} color="#065F46" />
            <h3 className="font-semibold text-sm" style={{ color: "#065F46" }}>Link Generated!</h3>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: "white", border: "1px solid #A7F3D0" }}>
            <code className="flex-1 text-sm break-all" style={{ color: PLUM }}>{linkUrl}</code>
            <button onClick={copyToClipboard}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{ background: copied ? "#D1FAE5" : PLUM, color: copied ? "#065F46" : MILK }}>
              {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
            </button>
          </div>
          <p className="text-xs mt-2" style={{ color: "#065F46" }}>
            Expires: {new Date(generatedLink.expires_at).toLocaleString()} &middot;
            Target: {generatedLink.target_group} &middot;
            One-time use: {generatedLink.is_one_time ? "Yes" : "No"}
          </p>
        </div>
      )}

      <div className="p-6 rounded-xl" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
        <div className="flex items-start gap-3">
          <MapPin size={20} color={PLUM} className="mt-0.5" />
          <div>
            <h3 className="font-semibold text-sm mb-1" style={{ color: PLUM }}>How it works</h3>
            <ul className="text-sm space-y-1" style={{ color: MUTED }}>
              <li>1. Generate a unique attendance link with expiry time</li>
              <li>2. Share the link with staff via their dashboard, email, or SMS</li>
              <li>3. Staff click the link from their mobile device while at school</li>
              <li>4. The system verifies GPS coordinates before recording attendance</li>
              <li>5. Each link is one-time use and expires after the set duration</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function LinksTab() {
  const [links, setLinks] = useState<AttendanceLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ data: { links: AttendanceLink[] } }>("/api/school/features/attendance-links")
      .then(res => setLinks(res.data?.data?.links || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner height={200} />;

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
      {links.length === 0 ? (
        <div className="text-center py-12">
          <Link2 size={40} color={MUTED} className="mx-auto mb-3" />
          <p style={{ color: PLUM, fontWeight: 600 }}>No links generated yet</p>
          <p className="text-sm mt-1" style={{ color: MUTED }}>Generate your first attendance link above</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider" style={{ color: MUTED, borderBottom: "1px solid rgba(56,25,50,0.07)" }}>
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Target</th>
                <th className="px-4 py-3 font-medium">Expires</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Created By</th>
              </tr>
            </thead>
            <tbody>
              {links.map(link => (
                <tr key={link.id} className="text-sm" style={{ borderBottom: "1px solid rgba(56,25,50,0.05)" }}>
                  <td className="px-4 py-3">
                    <code className="text-xs px-2 py-1 rounded" style={{ background: MILK, color: PLUM }}>
                      {link.link_code.slice(0, 16)}...
                    </code>
                  </td>
                  <td className="px-4 py-3 capitalize" style={{ color: PLUM }}>{link.target_group.replace('_', ' ')}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs" style={{ color: new Date(link.expires_at) < new Date() ? "#EF4444" : MUTED }}>
                      {new Date(link.expires_at).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${link.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {link.is_active ? "Active" : "Used"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: MUTED }}>{link.created_by_user?.name || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function RecordsTab() {
  const [records, setRecords] = useState<GeofenceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ data: { records: GeofenceRecord[]; total: number } }>("/api/school/features/geofence-attendance")
      .then(res => setRecords(res.data?.data?.records || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner height={200} />;

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
      {records.length === 0 ? (
        <div className="text-center py-12">
          <MapPin size={40} color={MUTED} className="mx-auto mb-3" />
          <p style={{ color: PLUM, fontWeight: 600 }}>No attendance records</p>
          <p className="text-sm mt-1" style={{ color: MUTED }}>Records appear when staff use attendance links</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider" style={{ color: MUTED, borderBottom: "1px solid rgba(56,25,50,0.07)" }}>
                <th className="px-4 py-3 font-medium">Staff</th>
                <th className="px-4 py-3 font-medium">Time</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map(r => (
                <tr key={r.id} className="text-sm" style={{ borderBottom: "1px solid rgba(56,25,50,0.05)" }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})`, color: MILK }}>
                        {r.user?.name?.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() || "?"}
                      </div>
                      <div>
                        <span className="font-medium" style={{ color: PLUM }}>{r.user?.name || "Unknown"}</span>
                        {r.user?.department && <span className="text-xs ml-1" style={{ color: MUTED }}>({r.user.department})</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: MUTED }}>{new Date(r.timestamp).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs" style={{ color: MUTED }}>
                      {r.latitude.toFixed(4)}, {r.longitude.toFixed(4)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      r.status === "present" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {r.status === "present" ? "Present" : "Rejected"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
