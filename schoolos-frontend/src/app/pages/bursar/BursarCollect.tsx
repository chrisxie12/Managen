import { useState, useEffect, useRef } from "react";
import type { ReactElement } from "react";
import {
  Search, User, Printer, Send, CheckCircle, CreditCard,
  Smartphone, Banknote, Clock, Receipt, X, Loader2,
} from "lucide-react";
import { api } from "../../services/api";

const NAVY = "#031B4E";
const MUTED = "#6B7280";
const SUCCESS = "#16A34A";

interface Student {
  id: string; name: string; admissionNo: string; class: string;
  totalFees: number; paid: number;
}

interface Payment {
  id: string; student: string; class: string;
  amount: number; method: string; time: string; receipt: string;
}

const METHOD_ICON: Record<string, ReactElement> = {
  Cash: <Banknote className="w-4 h-4" style={{ color: SUCCESS }} />,
  MoMo: <Smartphone className="w-4 h-4" style={{ color: "#F59E0B" }} />,
  "Bank Transfer": <CreditCard className="w-4 h-4" style={{ color: NAVY }} />,
};

function initials(name: string) {
  return name.split(" ").filter(Boolean).map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export function BursarCollect() {
  const [query, setQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Cash");
  const [reference, setReference] = useState("");
  const [momoPhone, setMomoPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [momoSent, setMomoSent] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    api.get<{ payments: any[] }>("/api/school/payments/today")
      .then((res) => {
        const raw = res.data?.payments ?? [];
        setRecentPayments(raw.slice(0, 10).map((p: any) => ({
          id: String(p.id),
          student: p.student_name || p.studentName || "",
          class: p.class || p.class_name || "",
          amount: Number(p.amount),
          method: p.payment_method === "bank_transfer" ? "Bank Transfer"
            : p.payment_method === "momo" ? "MoMo" : "Cash",
          time: p.time || new Date(p.created_at || p.date).toLocaleTimeString("en-GH", { hour: "2-digit", minute: "2-digit" }),
          receipt: p.receipt_no || `RCP-${p.id}`,
        })));
      })
      .catch(() => {});
  }, []);

  function handleSearch(q: string) {
    setQuery(q);
    setSelectedStudent(null);
    setRecorded(false);
    if (!q.trim()) { setSearchResults([]); return; }
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setSearchLoading(true);
      api.get<{ students: any[] }>(`/api/school/students?q=${encodeURIComponent(q)}&limit=8`)
        .then((res) => {
          setSearchResults((res.data?.students ?? []).map((s: any) => ({
            id: String(s.id),
            name: s.name || s.full_name || "",
            admissionNo: s.admissionNo || s.admission_no || s.admission_number || "",
            class: s.class || s.class_name || s.className || "",
            totalFees: Number(s.totalFees || s.total_fees || 0),
            paid: Number(s.amountPaid || s.amount_paid || s.paid || 0),
          })));
        })
        .catch(() => setSearchResults([]))
        .finally(() => setSearchLoading(false));
    }, 300);
  }

  function selectStudent(s: Student) {
    setSelectedStudent(s);
    setQuery(s.name);
    setSearchResults([]);
    setAmount("");
    setReference("");
    setNotes("");
    setMomoPhone("");
    setMomoSent(false);
    setRecorded(false);
  }

  async function handleRecord() {
    if (!selectedStudent || !amount || recording) return;
    setRecording(true);
    try {
      const res = await api.post<{ receipt_no?: string; id?: number }>("/api/school/payments", {
        student_id: selectedStudent.id,
        amount: Number(amount),
        payment_method: method === "Bank Transfer" ? "bank_transfer"
          : method === "MoMo" ? "momo" : "cash",
        reference: reference || undefined,
        notes: notes || undefined,
        phone: method === "MoMo" ? momoPhone : undefined,
      });
      const now = new Date();
      const timeStr = now.toLocaleTimeString("en-GH", { hour: "2-digit", minute: "2-digit" });
      const receiptNo = res.data?.receipt_no ||
        `RCP-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(Date.now()).slice(-4)}`;
      setRecentPayments((prev) => [{
        id: receiptNo,
        student: selectedStudent.name,
        class: selectedStudent.class,
        amount: Number(amount),
        method,
        time: timeStr,
        receipt: receiptNo,
      }, ...prev.slice(0, 9)]);
      setRecorded(true);
      setAmount("");
      setReference("");
      setNotes("");
      setMomoSent(false);
    } catch (err) {
      console.error("Failed to record payment:", err);
    } finally {
      setRecording(false);
    }
  }

  const outstanding = selectedStudent ? selectedStudent.totalFees - selectedStudent.paid : 0;
  const collectionPct = selectedStudent && selectedStudent.totalFees > 0
    ? Math.round((selectedStudent.paid / selectedStudent.totalFees) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: NAVY }}>Fee Collection Terminal</h1>
        <p className="text-sm mt-1" style={{ color: MUTED }}>Search for a student and record payment</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left – search + student card + form */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card border border-border rounded-2xl p-5">
            <label className="block text-sm font-medium mb-2" style={{ color: NAVY }}>Student Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: MUTED }} />
              <input
                className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Search by name or admission number…"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
              />
              {query && (
                <button className="absolute right-3 top-1/2 -translate-y-1/2"
                  onClick={() => { setQuery(""); setSearchResults([]); setSelectedStudent(null); }}>
                  <X className="w-4 h-4" style={{ color: MUTED }} />
                </button>
              )}
            </div>
            {searchLoading && (
              <div className="mt-2 flex items-center gap-2 px-1 py-2 text-sm" style={{ color: MUTED }}>
                <Loader2 className="w-4 h-4 animate-spin" /> Searching…
              </div>
            )}
            {!searchLoading && searchResults.length > 0 && (
              <div className="mt-2 border border-border rounded-xl overflow-hidden shadow-sm">
                {searchResults.map((s) => (
                  <button key={s.id}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center gap-3 border-b border-border last:border-0"
                    onClick={() => selectStudent(s)}>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                      style={{ background: NAVY }}>{initials(s.name)}</div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: NAVY }}>{s.name}</p>
                      <p className="text-xs" style={{ color: MUTED }}>{s.admissionNo} · {s.class}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {query && !searchLoading && searchResults.length === 0 && !selectedStudent && (
              <p className="mt-2 text-sm px-1" style={{ color: MUTED }}>No students found for "{query}"</p>
            )}
          </div>

          {selectedStudent && (
            <div className="bg-card border border-border rounded-2xl p-5">
              {recorded && (
                <div className="mb-4 flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                  <CheckCircle className="w-5 h-5" style={{ color: SUCCESS }} />
                  <span className="text-sm font-medium text-green-800">Payment recorded successfully!</span>
                </div>
              )}
              <div className="flex items-start gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
                  style={{ background: NAVY }}>{initials(selectedStudent.name)}</div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold" style={{ color: NAVY }}>{selectedStudent.name}</h2>
                  <p className="text-sm" style={{ color: MUTED }}>{selectedStudent.admissionNo} · {selectedStudent.class}</p>
                  <div className="mt-2 w-full bg-slate-100 rounded-full h-2">
                    <div className="h-2 rounded-full"
                      style={{ width: `${collectionPct}%`, background: collectionPct === 100 ? SUCCESS : NAVY }} />
                  </div>
                  <p className="text-xs mt-1" style={{ color: MUTED }}>{collectionPct}% paid</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { label: "Total Fees", value: selectedStudent.totalFees, color: NAVY },
                  { label: "Amount Paid", value: selectedStudent.paid, color: SUCCESS },
                  { label: "Outstanding", value: outstanding, color: outstanding > 0 ? "#EF4444" : SUCCESS },
                ].map((item) => (
                  <div key={item.label} className="bg-slate-50 rounded-xl p-3 text-center">
                    <p className="text-xs mb-1" style={{ color: MUTED }}>{item.label}</p>
                    <p className="text-base font-bold" style={{ color: item.color }}>GHS {item.value.toLocaleString()}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-5 space-y-4">
                <h3 className="text-sm font-semibold" style={{ color: NAVY }}>Record Payment</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: MUTED }}>Amount (GHS)</label>
                    <input type="number"
                      className="w-full border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                      placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: MUTED }}>Payment Method</label>
                    <select
                      className="w-full border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
                      value={method} onChange={(e) => { setMethod(e.target.value); setMomoSent(false); }}>
                      <option value="Cash">Cash</option>
                      <option value="MoMo">Mobile Money (MoMo)</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                    </select>
                  </div>
                  {method === "MoMo" && (
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium mb-1" style={{ color: MUTED }}>MoMo Phone Number</label>
                      <div className="flex gap-2">
                        <input
                          className="flex-1 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                          placeholder="024 XXX XXXX" value={momoPhone} onChange={(e) => setMomoPhone(e.target.value)} />
                        <button onClick={() => setMomoSent(true)} disabled={!momoPhone}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-colors"
                          style={{ background: momoSent ? SUCCESS : "#F59E0B", opacity: !momoPhone ? 0.6 : 1 }}>
                          {momoSent ? <CheckCircle className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                          {momoSent ? "Sent!" : "Send Request"}
                        </button>
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: MUTED }}>Reference / Receipt No</label>
                    <input className="w-full border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                      placeholder="Optional" value={reference} onChange={(e) => setReference(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: MUTED }}>Notes</label>
                    <input className="w-full border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                      placeholder="Optional" value={notes} onChange={(e) => setNotes(e.target.value)} />
                  </div>
                </div>
                <button onClick={handleRecord}
                  disabled={!amount || Number(amount) <= 0 || recording}
                  className="w-full py-3.5 rounded-xl text-white font-bold text-base transition-all flex items-center justify-center gap-2"
                  style={{ background: !amount || Number(amount) <= 0 || recording ? "#9CA3AF" : SUCCESS }}>
                  {recording && <Loader2 className="w-4 h-4 animate-spin" />}
                  {recording ? "Recording…" : `Record Payment — GHS ${Number(amount || 0).toLocaleString()}`}
                </button>
              </div>
            </div>
          )}

          {!selectedStudent && !query && (
            <div className="bg-card border border-border rounded-2xl p-10 flex flex-col items-center text-center">
              <User className="w-12 h-12 mb-3" style={{ color: "#D1D5DB" }} />
              <p className="text-sm font-medium" style={{ color: MUTED }}>Search for a student above to begin collecting payment</p>
            </div>
          )}
        </div>

        {/* Right – recent payments */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold" style={{ color: NAVY }}>Today's Payments</h3>
              <Receipt className="w-4 h-4" style={{ color: MUTED }} />
            </div>
            {recentPayments.length === 0 ? (
              <p className="text-sm text-center py-6" style={{ color: MUTED }}>No payments recorded today yet.</p>
            ) : (
              <div className="space-y-3">
                {recentPayments.slice(0, 8).map((p) => (
                  <div key={p.id} className="border border-border rounded-xl p-3">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <p className="text-sm font-medium" style={{ color: NAVY }}>{p.student}</p>
                        <p className="text-xs" style={{ color: MUTED }}>{p.class}</p>
                      </div>
                      <span className="text-sm font-bold" style={{ color: SUCCESS }}>GHS {p.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1.5">
                        {METHOD_ICON[p.method] || METHOD_ICON["Cash"]}
                        <span className="text-xs" style={{ color: MUTED }}>{p.method}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" style={{ color: MUTED }} />
                        <span className="text-xs" style={{ color: MUTED }}>{p.time}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                      <span className="text-xs font-mono" style={{ color: MUTED }}>{p.receipt}</span>
                      <button onClick={() => window.print()}
                        className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg border border-border hover:bg-slate-50 transition-colors"
                        style={{ color: NAVY }}>
                        <Printer className="w-3 h-3" /> Print
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
