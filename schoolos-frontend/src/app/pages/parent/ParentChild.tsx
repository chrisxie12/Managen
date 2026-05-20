import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { User, GraduationCap, Hash, Phone, Mail, MapPin, Loader2 } from "lucide-react";
import { api } from "../../services/api";
import { toast } from "sonner";

const NAVY = "#0A2472";
const NAVY_LIGHT = "#0C2D8A";
const CREAM = "#F8F9FA";
const MUTED = "#6B7280";

type Child = { id: string; name: string; class_name: string; admission_no?: string };
type ChildDetail = Child & {
  gender?: string;
  dob?: string;
  parent_name?: string;
  parent_phone?: string;
  parent_email?: string;
  address?: string;
  avatar_url?: string;
};

export function ParentChild() {
  const [searchParams] = useSearchParams();
  const childId = searchParams.get("child");

  const [children, setChildren] = useState<Child[]>([]);
  const [selected, setSelected] = useState<Child | null>(null);
  const [details, setDetails] = useState<ChildDetail | null>(null);
  const [loading, setLoading] = useState(true);

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
    api.get<{ student: ChildDetail }>(`/api/school/parent/children/${selected.id}`)
      .then((res) => setDetails(res.data?.student || null))
      .catch(() => {});
  }, [selected]);

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

      {details && (
        <>
          {/* Avatar & Name */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold"
              style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_LIGHT})`, color: CREAM }}>
              {details.avatar_url ? (
                <img src={details.avatar_url} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                details.name.charAt(0)
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold" style={{ color: NAVY, fontFamily: "'Playfair Display', serif" }}>{details.name}</h2>
              <p className="text-sm" style={{ color: MUTED }}>{details.class_name}</p>
            </div>
          </div>

          {/* Info cards */}
          <div className="space-y-2">
            <InfoRow icon={GraduationCap} label="Class" value={details.class_name} />
            <InfoRow icon={Hash} label="Admission No" value={details.admission_no || "—"} />
            <InfoRow icon={User} label="Gender" value={details.gender || "—"} />
            <InfoRow icon={Phone} label="Parent Phone" value={details.parent_phone || "—"} />
            <InfoRow icon={Mail} label="Parent Email" value={details.parent_email || "—"} />
            <InfoRow icon={MapPin} label="Address" value={details.address || "—"} />
          </div>
        </>
      )}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)" }}>
      <Icon size={16} className="shrink-0" color={NAVY_LIGHT} />
      <div className="min-w-0">
        <p className="text-[10px] font-medium" style={{ color: MUTED }}>{label}</p>
        <p className="text-sm" style={{ color: NAVY }}>{value}</p>
      </div>
    </div>
  );
}
