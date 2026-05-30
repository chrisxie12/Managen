import { useState } from "react";
import { useNavigate } from "react-router";
import { ChevronLeft, UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageTemplate } from "../../components/layout/PageTemplate";
import { api } from "../../services/api";

const NAVY = "#031B4E";
const MUTED = "#6B7280";

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 mb-4">
      <h3 className="text-sm font-semibold mb-4" style={{ color: NAVY }}>{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium mb-1 block" style={{ color: NAVY }}>
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full h-9 px-3 rounded-xl text-sm border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30";
const selectCls = `${inputCls} appearance-none`;

export function AddStudentPage() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    fullName: "", dob: "", gender: "", religion: "", nationality: "Ghanaian",
    class: "", admissionNo: "", admissionDate: new Date().toISOString().split("T")[0], previousSchool: "",
    guardianName: "", relationship: "", phone: "", whatsapp: "", email: "", address: "",
    bloodGroup: "", allergies: "", emergencyContact: "",
  });

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.class || !form.guardianName || !form.phone) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSaving(true);
    try {
      await api.post("/api/school/students", {
        name: form.fullName,
        date_of_birth: form.dob,
        gender: form.gender,
        religion: form.religion,
        nationality: form.nationality,
        class_name: form.class,
        admission_no: form.admissionNo,
        admission_date: form.admissionDate,
        previous_school: form.previousSchool,
        guardian_name: form.guardianName,
        guardian_relationship: form.relationship,
        parent_phone: form.phone,
        parent_whatsapp: form.whatsapp,
        parent_email: form.email,
        home_address: form.address,
        blood_group: form.bloodGroup,
        known_allergies: form.allergies,
        emergency_contact: form.emergencyContact,
      });
      toast.success(`${form.fullName} enrolled successfully!`);
      navigate("/dashboard/students");
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to enroll student");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageTemplate
      title="Enroll New Student"
      description="Add a new student to the school register."
      breadcrumb={[
        { label: "Students", href: "/dashboard/students" },
        { label: "Add Student" },
      ]}
    >
      <form onSubmit={handleSubmit} className="max-w-3xl">
        <SectionCard title="Personal Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Name" required>
              <input className={inputCls} value={form.fullName} onChange={set("fullName")} placeholder="e.g. Kwame Asante" />
            </Field>
            <Field label="Date of Birth">
              <input type="date" className={inputCls} value={form.dob} onChange={set("dob")} />
            </Field>
            <Field label="Gender" required>
              <select className={selectCls} value={form.gender} onChange={set("gender")}>
                <option value="">Select gender</option>
                <option>Male</option>
                <option>Female</option>
              </select>
            </Field>
            <Field label="Religion">
              <select className={selectCls} value={form.religion} onChange={set("religion")}>
                <option value="">Select religion</option>
                <option>Christianity</option>
                <option>Islam</option>
                <option>Traditional</option>
                <option>Other</option>
              </select>
            </Field>
            <Field label="Nationality">
              <input className={inputCls} value={form.nationality} onChange={set("nationality")} />
            </Field>
          </div>
        </SectionCard>

        <SectionCard title="Academic Details">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Class" required>
              <select className={selectCls} value={form.class} onChange={set("class")}>
                <option value="">Select class</option>
                {["JHS 1", "JHS 2", "JHS 3", "SHS 1", "SHS 2", "SHS 3",
                  "Basic 1", "Basic 2", "Basic 3", "Basic 4", "Basic 5", "Basic 6"].map(c => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Admission No">
              <input className={inputCls} value={form.admissionNo} onChange={set("admissionNo")} placeholder="e.g. 2024/001" />
            </Field>
            <Field label="Admission Date">
              <input type="date" className={inputCls} value={form.admissionDate} onChange={set("admissionDate")} />
            </Field>
            <Field label="Previous School">
              <input className={inputCls} value={form.previousSchool} onChange={set("previousSchool")} placeholder="Name of previous school" />
            </Field>
          </div>
        </SectionCard>

        <SectionCard title="Parent / Guardian">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Guardian Name" required>
              <input className={inputCls} value={form.guardianName} onChange={set("guardianName")} placeholder="e.g. Kofi Asante" />
            </Field>
            <Field label="Relationship">
              <select className={selectCls} value={form.relationship} onChange={set("relationship")}>
                <option value="">Select relationship</option>
                <option>Father</option>
                <option>Mother</option>
                <option>Guardian</option>
                <option>Sibling</option>
                <option>Other</option>
              </select>
            </Field>
            <Field label="Phone Number" required>
              <input className={inputCls} value={form.phone} onChange={set("phone")} placeholder="+233 XX XXX XXXX" />
            </Field>
            <Field label="WhatsApp Number">
              <input className={inputCls} value={form.whatsapp} onChange={set("whatsapp")} placeholder="Same as phone if same" />
            </Field>
            <Field label="Email Address">
              <input type="email" className={inputCls} value={form.email} onChange={set("email")} placeholder="guardian@email.com" />
            </Field>
            <Field label="Home Address">
              <input className={inputCls} value={form.address} onChange={set("address")} placeholder="e.g. Labadi, Accra" />
            </Field>
          </div>
        </SectionCard>

        <SectionCard title="Health & Emergency">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Blood Group">
              <select className={selectCls} value={form.bloodGroup} onChange={set("bloodGroup")}>
                <option value="">Unknown</option>
                {["A+", "A−", "B+", "B−", "AB+", "AB−", "O+", "O−"].map(b => <option key={b}>{b}</option>)}
              </select>
            </Field>
            <Field label="Known Allergies">
              <input className={inputCls} value={form.allergies} onChange={set("allergies")} placeholder="e.g. Peanuts, Penicillin" />
            </Field>
            <Field label="Emergency Contact (if different from guardian)">
              <input className={inputCls} value={form.emergencyContact} onChange={set("emergencyContact")} placeholder="+233 XX XXX XXXX" />
            </Field>
          </div>
        </SectionCard>

        <div className="flex items-center gap-3 justify-end mt-2">
          <button type="button" onClick={() => navigate("/dashboard/students")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-border bg-card hover:bg-muted/50 transition-colors"
            style={{ color: MUTED }}>
            <ChevronLeft size={16} /> Cancel
          </button>
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-semibold text-white transition-all active:scale-95 hover:opacity-90"
            style={{ background: NAVY }}>
            {saving ? <Loader2 size={15} className="animate-spin" /> : <UserPlus size={15} />}
            {saving ? "Enrolling…" : "Enroll Student"}
          </button>
        </div>
      </form>
    </PageTemplate>
  );
}
