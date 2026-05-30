import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Plus, Download, Calendar, TrendingUp } from "lucide-react";
import { PageTemplate } from "../../components/layout/PageTemplate";
import { api } from "../../services/api";

const NAVY = "#031B4E";
const MUTED = "#6B7280";
const PRIMARY = "#031B4E";
const SUCCESS = "#16A34A";
const WARNING = "#F59E0B";
const INFO = "#3B82F6";

interface AttendanceRecord {
  id: string;
  date: string;
  class: string;
  totalStudents: number;
  present: number;
  absent: number;
  excused: number;
  rate: number;
}


export function AttendancePage() {
  const navigate = useNavigate();
  const todayStr = new Date().toISOString().split("T")[0];
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [trendData, setTrendData] = useState<{ day: string; rate: number }[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch attendance stats on mount
  useEffect(() => {
    api.get<any>('/api/school/attendance/stats')
      .then((res) => {
        if (res.data) {
          const d = res.data;
          const total = d.totalStudents ?? d.total_students ?? 0;
          const present = d.present ?? 0;
          const absent = d.absent ?? 0;
          if (total > 0) {
            const syntheticRecord: AttendanceRecord = {
              id: "api-stats",
              date: todayStr,
              class: "All Classes",
              totalStudents: total,
              present,
              absent,
              excused: d.excused ?? 0,
              rate: Math.round((present / total) * 100),
            };
            setAttendance([syntheticRecord]);
          }
        }
      })
      .catch(() => {
        // keep mockAttendance as fallback
      });
  }, []);

  // Fetch 7-day trend on mount
  useEffect(() => {
    const end = todayStr;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 6);
    const start = startDate.toISOString().split("T")[0];
    api.get<any>(`/api/school/attendance/trends?start=${start}&end=${end}`)
      .then((res) => {
        if (res.data) {
          const raw: any[] = Array.isArray(res.data) ? res.data : res.data.trends ?? [];
          if (raw.length > 0) {
            const mapped = raw.map((d: any) => ({
              day: d.day ?? new Date(d.date).toLocaleDateString("en-US", { weekday: "short" }),
              rate: d.rate ?? d.attendance_rate ?? 0,
            }));
            setTrendData(mapped);
          }
        }
      })
      .catch(() => {
        // keep last7DaysData as fallback
      });
  }, []);

  // Fetch records when date changes
  useEffect(() => {
    setLoading(true);
    api.get<any>(`/api/school/attendance?date=${selectedDate}`)
      .then((res) => {
        if (res.data) {
          const raw: any[] = Array.isArray(res.data)
            ? res.data
            : (res.data.records ?? res.data.attendance ?? []);
          if (raw.length > 0) {
            const mapped: AttendanceRecord[] = raw.map((r: any, i: number) => ({
              id: String(r.id ?? i),
              date: r.date ?? selectedDate,
              class: r.class ?? r.class_name ?? r.className ?? "",
              totalStudents: r.totalStudents ?? r.total_students ?? 0,
              present: r.present ?? 0,
              absent: r.absent ?? 0,
              excused: r.excused ?? 0,
              rate: r.rate ?? r.attendance_rate ?? Math.round(((r.present ?? 0) / Math.max(r.totalStudents ?? r.total_students ?? 1, 1)) * 100),
            }));
            setAttendance(mapped);
          } else {
            setAttendance([]);
          }
        }
      })
      .catch(() => {
        setAttendance([]);
      })
      .finally(() => setLoading(false));
  }, [selectedDate]);

  const todayStats = {
    totalStudents: attendance.reduce((sum, a) => sum + a.totalStudents, 0),
    present: attendance.reduce((sum, a) => sum + a.present, 0),
    absent: attendance.reduce((sum, a) => sum + a.absent, 0),
    rate: (() => {
      const total = attendance.reduce((sum, a) => sum + a.totalStudents, 0);
      const present = attendance.reduce((sum, a) => sum + a.present, 0);
      return total > 0 ? Math.round((present / total) * 100) : 0;
    })(),
  };

  const last7DaysAvg = Math.round(
    trendData.reduce((sum, d) => sum + d.rate, 0) / Math.max(trendData.length, 1)
  );

  return (
    <PageTemplate
      title="Attendance"
      description="Track student attendance"
      breadcrumb={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Attendance" },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/dashboard/attendance")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all text-sm text-white"
            style={{ background: PRIMARY }}
          >
            <Plus size={18} />
            Mark Attendance
          </button>
        </div>
      }
    >
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div
          className="p-6 rounded-lg"
          style={{
            background: "white",
            border: `1px solid ${NAVY}20`,
          }}
        >
          <div style={{ color: MUTED, fontSize: "0.875rem", fontWeight: 500 }}>
            Total Students
          </div>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: NAVY,
              fontSize: "1.5rem",
              fontWeight: 700,
              marginTop: "0.5rem",
            }}
          >
            {todayStats.totalStudents}
          </div>
        </div>

        <div
          className="p-6 rounded-lg"
          style={{
            background: "white",
            border: `1px solid ${NAVY}20`,
          }}
        >
          <div style={{ color: MUTED, fontSize: "0.875rem", fontWeight: 500 }}>
            Present
          </div>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: SUCCESS,
              fontSize: "1.5rem",
              fontWeight: 700,
              marginTop: "0.5rem",
            }}
          >
            {todayStats.present}
          </div>
        </div>

        <div
          className="p-6 rounded-lg"
          style={{
            background: "white",
            border: `1px solid ${NAVY}20`,
          }}
        >
          <div style={{ color: MUTED, fontSize: "0.875rem", fontWeight: 500 }}>
            Absent
          </div>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: WARNING,
              fontSize: "1.5rem",
              fontWeight: 700,
              marginTop: "0.5rem",
            }}
          >
            {todayStats.absent}
          </div>
        </div>

        <div
          className="p-6 rounded-lg"
          style={{
            background: "white",
            border: `1px solid ${NAVY}20`,
          }}
        >
          <div style={{ color: MUTED, fontSize: "0.875rem", fontWeight: 500 }}>
            Today's Rate
          </div>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: todayStats.rate >= 85 ? SUCCESS : WARNING,
              fontSize: "1.5rem",
              fontWeight: 700,
              marginTop: "0.5rem",
            }}
          >
            {todayStats.rate}%
          </div>
        </div>
      </div>

      {/* Attendance Trend */}
      <div
        className="p-6 rounded-lg"
        style={{
          background: "white",
          border: `1px solid ${NAVY}20`,
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 style={{ fontWeight: 600, color: NAVY }}>
            Attendance Trend (7 days)
          </h3>
          <div style={{ color: MUTED, fontSize: "0.875rem" }}>
            Avg: <strong>{last7DaysAvg}%</strong>
          </div>
        </div>
        {trendData.length === 0 && (
          <div className="h-40 flex items-center justify-center" style={{ color: MUTED, fontSize: "0.875rem" }}>
            No trend data available yet
          </div>
        )}
        <div className="h-40 flex items-end gap-1">
          {trendData.map((data, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div
                className="w-full rounded-t transition-all hover:opacity-80 cursor-pointer"
                style={{
                  background: data.rate >= 85 ? SUCCESS : WARNING,
                  height: `${(data.rate / 100) * 100}%`,
                  minHeight: "4px",
                }}
                title={`${data.rate}%`}
              />
              <span style={{ fontSize: "0.7rem", color: MUTED, marginTop: "0.5rem" }}>
                {data.day}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Date Selector & Records */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Calendar size={18} style={{ color: NAVY }} />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 rounded-lg border text-sm"
            style={{ borderColor: `${NAVY}20`, color: NAVY }}
          />
          <button
            className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
            style={{
              background: `${PRIMARY}15`,
              color: PRIMARY,
            }}
          >
            <Download size={16} />
            Export Report
          </button>
        </div>

        {/* Attendance Table */}
        <div
          className="rounded-lg overflow-hidden"
          style={{ border: `1px solid ${NAVY}20` }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr
                  style={{
                    background: `${NAVY}08`,
                    borderBottom: `1px solid ${NAVY}20`,
                  }}
                >
                  <th
                    className="px-6 py-3 text-left text-xs font-semibold"
                    style={{ color: NAVY, textTransform: "uppercase" }}
                  >
                    Class
                  </th>
                  <th
                    className="px-6 py-3 text-right text-xs font-semibold"
                    style={{ color: NAVY, textTransform: "uppercase" }}
                  >
                    Total
                  </th>
                  <th
                    className="px-6 py-3 text-right text-xs font-semibold"
                    style={{ color: NAVY, textTransform: "uppercase" }}
                  >
                    Present
                  </th>
                  <th
                    className="px-6 py-3 text-right text-xs font-semibold"
                    style={{ color: NAVY, textTransform: "uppercase" }}
                  >
                    Absent
                  </th>
                  <th
                    className="px-6 py-3 text-right text-xs font-semibold"
                    style={{ color: NAVY, textTransform: "uppercase" }}
                  >
                    Rate
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-semibold"
                    style={{ color: NAVY, textTransform: "uppercase" }}
                  >
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((record) => (
                  <tr
                    key={record.id}
                    style={{ borderBottom: `1px solid ${NAVY}15` }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm" style={{ color: NAVY, fontWeight: 500 }}>
                      {record.class}
                    </td>
                    <td className="px-6 py-4 text-sm text-right" style={{ color: MUTED }}>
                      {record.totalStudents}
                    </td>
                    <td
                      className="px-6 py-4 text-sm text-right"
                      style={{ color: SUCCESS, fontWeight: 600 }}
                    >
                      {record.present}
                    </td>
                    <td
                      className="px-6 py-4 text-sm text-right"
                      style={{ color: WARNING, fontWeight: 600 }}
                    >
                      {record.absent}
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      <span
                        style={{
                          color: record.rate >= 85 ? SUCCESS : WARNING,
                          fontWeight: 600,
                        }}
                      >
                        {record.rate}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => navigate("/dashboard/attendance")}
                        className="text-xs font-medium px-3 py-1 rounded transition-colors"
                        style={{
                          color: PRIMARY,
                          background: `${PRIMARY}15`,
                        }}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className="p-4 rounded-lg"
        style={{
          background: `${NAVY}08`,
          border: `1px solid ${NAVY}20`,
        }}
      >
        <p style={{ color: MUTED, fontSize: "0.875rem" }}>
          {loading ? "Loading attendance records..." : <>Showing attendance for <strong>{selectedDate}</strong></>}
        </p>
      </div>
    </PageTemplate>
  );
}
