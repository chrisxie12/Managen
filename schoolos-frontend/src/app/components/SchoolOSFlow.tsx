import { useState } from "react";

const roles = [
  {
    id: "superadmin",
    label: "Super Admin",
    color: "#ff6b35",
    bg: "rgba(255,107,53,0.12)",
    border: "rgba(255,107,53,0.4)",
    icon: "⚡",
    position: { x: 50, y: 5 },
    actions: [
      "Create / suspend schools",
      "Manage billing & subscriptions",
      "Impersonate any role",
      "Platform-wide analytics",
      "System health monitoring",
      "Global announcements",
    ],
    triggers: [
      { to: "schooladmin", label: "Creates School Admin account" },
      { to: "all", label: "Global announcements broadcast" },
    ],
  },
  {
    id: "schooladmin",
    label: "School Admin",
    color: "#7c3aed",
    bg: "rgba(124,58,237,0.12)",
    border: "rgba(124,58,237,0.4)",
    icon: "🏫",
    position: { x: 20, y: 25 },
    actions: [
      "Enroll students & staff",
      "Create classes & subjects",
      "Manage timetables",
      "Full fee management",
      "School-wide reports",
      "Configure school settings",
    ],
    triggers: [
      { to: "teacher", label: "Assigns teacher to class" },
      { to: "parent", label: "Sends welcome & fee profile" },
      { to: "student", label: "Creates student portal access" },
      { to: "accountant", label: "Fee structure pushed" },
      { to: "headmaster", label: "Academic config pushed" },
    ],
  },
  {
    id: "headmaster",
    label: "Headmaster",
    color: "#0891b2",
    bg: "rgba(8,145,178,0.12)",
    border: "rgba(8,145,178,0.4)",
    icon: "🎓",
    position: { x: 75, y: 25 },
    actions: [
      "Approve timetables & exams",
      "Monitor teacher performance",
      "Academic reports & analytics",
      "Approve exam results",
      "AI performance insights",
      "Staff announcements",
    ],
    triggers: [
      { to: "teacher", label: "Approves timetable → teacher notified" },
      { to: "student", label: "Exam results approved → student sees grades" },
      { to: "parent", label: "Academic digest sent weekly" },
    ],
  },
  {
    id: "accountant",
    label: "Accountant",
    color: "#059669",
    bg: "rgba(5,150,105,0.12)",
    border: "rgba(5,150,105,0.4)",
    icon: "💰",
    position: { x: 10, y: 55 },
    actions: [
      "Record fee payments",
      "Generate invoices & receipts",
      "Track expenses",
      "Financial reports",
      "Fee defaulter alerts",
      "Multi-currency support",
    ],
    triggers: [
      { to: "parent", label: "Payment confirmed → receipt sent" },
      { to: "student", label: "Fee status updated instantly" },
      { to: "schooladmin", label: "Daily collection summary" },
    ],
  },
  {
    id: "teacher",
    label: "Teacher",
    color: "#d97706",
    bg: "rgba(217,119,6,0.12)",
    border: "rgba(217,119,6,0.4)",
    icon: "📚",
    position: { x: 45, y: 50 },
    actions: [
      "Mark attendance (own classes)",
      "Upload grades & results",
      "Set assignments",
      "Message parents & students",
      "View own timetable",
      "AI assignment suggestions",
    ],
    triggers: [
      { to: "parent", label: "Absence → real-time parent alert" },
      { to: "student", label: "Assignment posted → student notified" },
      { to: "headmaster", label: "Results uploaded → approval queue" },
    ],
  },
  {
    id: "parent",
    label: "Parent",
    color: "#db2777",
    bg: "rgba(219,39,119,0.12)",
    border: "rgba(219,39,119,0.4)",
    icon: "👨👩👧",
    position: { x: 80, y: 55 },
    actions: [
      "View child's attendance",
      "View grades & results",
      "Pay fees online",
      "Receive real-time alerts",
      "Message teachers",
      "Weekly AI child report",
    ],
    triggers: [
      { to: "accountant", label: "Online payment → auto-reconciled" },
      { to: "teacher", label: "Direct message to teacher" },
    ],
  },
  {
    id: "student",
    label: "Student",
    color: "#6366f1",
    bg: "rgba(99,102,241,0.12)",
    border: "rgba(99,102,241,0.4)",
    icon: "🧑💻",
    position: { x: 45, y: 80 },
    actions: [
      "View timetable & schedule",
      "Submit assignments",
      "Check grades & attendance",
      "View fee status",
      "Earn gamification badges",
      "School announcements",
    ],
    triggers: [
      { to: "teacher", label: "Assignment submitted → teacher notified" },
    ],
  },
];

const connections = [
  { from: "superadmin", to: "schooladmin", type: "creates" },
  { from: "schooladmin", to: "teacher", type: "manages" },
  { from: "schooladmin", to: "accountant", type: "manages" },
  { from: "schooladmin", to: "headmaster", type: "manages" },
  { from: "schooladmin", to: "parent", type: "notifies" },
  { from: "schooladmin", to: "student", type: "enrolls" },
  { from: "headmaster", to: "teacher", type: "approves" },
  { from: "headmaster", to: "student", type: "results" },
  { from: "headmaster", to: "parent", type: "reports" },
  { from: "teacher", to: "parent", type: "alerts" },
  { from: "teacher", to: "student", type: "teaches" },
  { from: "teacher", to: "headmaster", type: "submits" },
  { from: "accountant", to: "parent", type: "invoices" },
  { from: "accountant", to: "student", type: "fee status" },
  { from: "parent", to: "accountant", type: "pays" },
  { from: "parent", to: "teacher", type: "messages" },
  { from: "student", to: "teacher", type: "submits" },
];

const centralHub = {
  layers: [
    { label: "PostgreSQL + RLS", color: "#ff6b35", desc: "Single source of truth with row-level security" },
    { label: "Event Bus / Triggers", color: "#7c3aed", desc: "Every action fires cross-role notifications" },
    { label: "WebSocket / Realtime", color: "#0891b2", desc: "Live sync across all dashboards" },
    { label: "Permission Engine", color: "#059669", desc: "Every request validated against role permissions" },
    { label: "Audit Logger", color: "#d97706", desc: "Every action logged with user, time, IP" },
    { label: "AI Engine", color: "#db2777", desc: "Insights generated per role context" },
    { label: "Notification Router", color: "#6366f1", desc: "SMS, WhatsApp, Email, Push — per role" },
  ],
};

export default function SchoolOSFlow() {
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("roles");

  const selected = roles.find((r) => r.id === activeRole);

  return (
    <div style={{
      background: "#080810",
      minHeight: "100vh",
      fontFamily: "'Courier New', monospace",
      color: "#e2e8f0",
      padding: "24px",
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <div style={{
          display: "inline-block",
          background: "rgba(255,107,53,0.1)",
          border: "1px solid rgba(255,107,53,0.3)",
          borderRadius: "8px",
          padding: "4px 16px",
          fontSize: "11px",
          letterSpacing: "3px",
          color: "#ff6b35",
          marginBottom: "12px",
          textTransform: "uppercase",
        }}>SchoolOS Architecture</div>
        <h1 style={{
          fontSize: "clamp(24px, 4vw, 40px)",
          fontWeight: "900",
          margin: "0 0 8px",
          background: "linear-gradient(135deg, #fff 0%, #94a3b8 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: "-1px",
        }}>Complete Role System Flow</h1>
        <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>
          Click any role to explore its actions, triggers & connections
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex",
        gap: "8px",
        justifyContent: "center",
        marginBottom: "28px",
      }}>
        {["roles", "hub", "triggers", "flow"].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: "8px 20px",
            borderRadius: "6px",
            border: activeTab === tab ? "1px solid #ff6b35" : "1px solid rgba(255,255,255,0.1)",
            background: activeTab === tab ? "rgba(255,107,53,0.15)" : "rgba(255,255,255,0.03)",
            color: activeTab === tab ? "#ff6b35" : "#64748b",
            fontSize: "12px",
            letterSpacing: "1px",
            textTransform: "uppercase",
            cursor: "pointer",
            transition: "all 0.2s",
          }}>{tab}</button>
        ))}
      </div>

      {/* ROLES TAB */}
      {activeTab === "roles" && (
        <div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "16px",
            marginBottom: "24px",
          }}>
            {roles.map((role) => (
              <div key={role.id}
                onClick={() => setActiveRole(activeRole === role.id ? null : role.id)}
                style={{
                  background: activeRole === role.id ? role.bg : "rgba(255,255,255,0.02)",
                  border: `1px solid ${activeRole === role.id ? role.border : "rgba(255,255,255,0.07)"}`,
                  borderRadius: "12px",
                  padding: "20px",
                  cursor: "pointer",
                  transition: "all 0.25s",
                  transform: activeRole === role.id ? "scale(1.02)" : "scale(1)",
                }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
                  <div style={{
                    width: "40px", height: "40px",
                    borderRadius: "10px",
                    background: role.bg,
                    border: `1px solid ${role.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "20px",
                  }}>{role.icon}</div>
                  <div>
                    <div style={{ fontWeight: "700", fontSize: "15px", color: role.color }}>{role.label}</div>
                    <div style={{ fontSize: "11px", color: "#475569" }}>{role.actions.length} core actions</div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {role.actions.map((a, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: "8px",
                      fontSize: "12px", color: "#94a3b8",
                    }}>
                      <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: role.color, flexShrink: 0 }} />
                      {a}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Selected role triggers */}
          {selected && (
            <div style={{
              background: selected.bg,
              border: `1px solid ${selected.border}`,
              borderRadius: "12px",
              padding: "24px",
            }}>
              <div style={{ fontSize: "13px", color: selected.color, letterSpacing: "2px", marginBottom: "16px", textTransform: "uppercase" }}>
                {selected.icon} {selected.label} — Cross-Role Triggers
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "12px" }}>
                {selected.triggers.map((t, i) => {
                  const target = roles.find(r => r.id === t.to || t.to === "all");
                  return (
                    <div key={i} style={{
                      background: "rgba(0,0,0,0.3)",
                      borderRadius: "8px",
                      padding: "14px",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                        <span style={{ fontSize: "16px" }}>{selected.icon}</span>
                        <div style={{ fontSize: "11px", color: "#475569" }}>→</div>
                        <span style={{ fontSize: "16px" }}>{target?.icon || "📢"}</span>
                        <span style={{ fontSize: "12px", color: target?.color || "#94a3b8", fontWeight: "700" }}>
                          {target?.label || "All Roles"}
                        </span>
                      </div>
                      <div style={{ fontSize: "12px", color: "#94a3b8" }}>{t.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* HUB TAB */}
      {activeTab === "hub" && (
        <div>
          <div style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "16px",
            padding: "28px",
            marginBottom: "20px",
            textAlign: "center",
          }}>
            <div style={{ fontSize: "13px", color: "#64748b", letterSpacing: "2px", marginBottom: "8px" }}>THE CENTRAL NERVOUS SYSTEM</div>
            <div style={{ fontSize: "28px", fontWeight: "900", marginBottom: "8px" }}>SchoolOS Core Engine</div>
            <div style={{ fontSize: "13px", color: "#475569" }}>All 7 roles connect through these 7 infrastructure layers</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "14px" }}>
            {centralHub.layers.map((layer, i) => (
              <div key={i} style={{
                background: `rgba(${layer.color === '#ff6b35' ? '255,107,53' : layer.color === '#7c3aed' ? '124,58,237' : layer.color === '#0891b2' ? '8,145,178' : layer.color === '#059669' ? '5,150,105' : layer.color === '#d97706' ? '217,119,6' : layer.color === '#db2777' ? '219,39,119' : '99,102,241'},0.08)`,
                border: `1px solid ${layer.color}30`,
                borderRadius: "12px",
                padding: "20px",
                display: "flex",
                gap: "16px",
                alignItems: "flex-start",
              }}>
                <div style={{
                  width: "36px", height: "36px", borderRadius: "8px",
                  background: `${layer.color}20`,
                  border: `1px solid ${layer.color}50`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "14px", fontWeight: "900", color: layer.color, flexShrink: 0,
                }}>{i + 1}</div>
                <div>
                  <div style={{ fontWeight: "700", color: layer.color, marginBottom: "6px", fontSize: "14px" }}>{layer.label}</div>
                  <div style={{ fontSize: "12px", color: "#64748b", lineHeight: "1.6" }}>{layer.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TRIGGERS TAB */}
      {activeTab === "triggers" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "8px",
          }}>
            <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "4px" }}>HOW IT WORKS</div>
            <div style={{ fontSize: "14px", color: "#94a3b8", lineHeight: "1.7" }}>
              Every action in SchoolOS is an <span style={{ color: "#ff6b35" }}>event</span>. That event fires through the 
              <span style={{ color: "#7c3aed" }}> Event Bus</span>, which routes 
              <span style={{ color: "#0891b2" }}> real-time updates</span> to affected roles automatically. 
              No manual refresh. No data lag. One action, instant ripple effect.
            </div>
          </div>
          {connections.map((c, i) => {
            const from = roles.find(r => r.id === c.from);
            const to = roles.find(r => r.id === c.to);
            return (
              <div key={i} style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "10px",
                padding: "14px 20px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}>
                <span style={{ fontSize: "18px" }}>{from?.icon}</span>
                <span style={{ fontSize: "12px", fontWeight: "700", color: from?.color }}>{from?.label}</span>
                <div style={{
                  flex: 1,
                  height: "1px",
                  background: `linear-gradient(90deg, ${from?.color}80, ${to?.color}80)`,
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <span style={{
                    background: "#080810",
                    padding: "2px 10px",
                    fontSize: "10px",
                    color: "#64748b",
                    letterSpacing: "1px",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: "20px",
                    textTransform: "uppercase",
                  }}>{c.type}</span>
                </div>
                <span style={{ fontSize: "12px", fontWeight: "700", color: to?.color }}>{to?.label}</span>
                <span style={{ fontSize: "18px" }}>{to?.icon}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* FLOW TAB */}
      {activeTab === "flow" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {[
            {
              title: "🆕 New Student Enrolled",
              color: "#7c3aed",
              steps: [
                { role: "School Admin", icon: "🏫", action: "Adds student to system", color: "#7c3aed" },
                { role: "Database", icon: "🗄️", action: "Student record created with school_id isolation", color: "#ff6b35" },
                { role: "Event Bus", icon: "⚡", action: "enrollment.created event fires", color: "#ff6b35" },
                { role: "Accountant", icon: "💰", action: "Fee profile auto-generated for student", color: "#059669" },
                { role: "Parent", icon: "👨👩👧", action: "Welcome email + student portal credentials sent", color: "#db2777" },
                { role: "Student", icon: "🧑💻", action: "Portal access activated, timetable visible", color: "#6366f1" },
                { role: "Teacher", icon: "📚", action: "Student appears in class roster", color: "#d97706" },
                { role: "Audit Log", icon: "📋", action: "Action logged: who, when, IP address", color: "#64748b" },
              ],
            },
            {
              title: "✅ Attendance Marked Absent",
              color: "#d97706",
              steps: [
                { role: "Teacher", icon: "📚", action: "Marks student absent in their class", color: "#d97706" },
                { role: "Database", icon: "🗄️", action: "Attendance record written (RLS: teacher's class only)", color: "#ff6b35" },
                { role: "Event Bus", icon: "⚡", action: "attendance.absent event fires", color: "#ff6b35" },
                { role: "Parent", icon: "👨👩👧", action: "Real-time WhatsApp + push notification", color: "#db2777" },
                { role: "Headmaster", icon: "🎓", action: "Attendance analytics updated live", color: "#0891b2" },
                { role: "AI Engine", icon: "🧠", action: "Checks if 3+ consecutive absences → flags for counselor", color: "#ff6b35" },
              ],
            },
            {
              title: "💳 Fee Payment Received",
              color: "#059669",
              steps: [
                { role: "Parent", icon: "👨👩👧", action: "Pays online via portal (card/mobile money)", color: "#db2777" },
                { role: "Payment Gateway", icon: "🏦", action: "Payment verified & confirmed", color: "#64748b" },
                { role: "Accountant", icon: "💰", action: "Payment auto-reconciled in accounts", color: "#059669" },
                { role: "Database", icon: "🗄️", action: "Fee status updated to PAID", color: "#ff6b35" },
                { role: "Event Bus", icon: "⚡", action: "payment.received event fires", color: "#ff6b35" },
                { role: "Student", icon: "🧑💻", action: "Portal shows fee status as cleared instantly", color: "#6366f1" },
                { role: "Parent", icon: "👨👩👧", action: "Receipt auto-generated & emailed", color: "#db2777" },
                { role: "School Admin", icon: "🏫", action: "Daily collection dashboard updates", color: "#7c3aed" },
              ],
            },
            {
              title: "📝 Exam Results Uploaded",
              color: "#0891b2",
              steps: [
                { role: "Teacher", icon: "📚", action: "Uploads grades for their class", color: "#d97706" },
                { role: "Database", icon: "🗄️", action: "Results saved (NOT yet visible to students)", color: "#ff6b35" },
                { role: "Headmaster", icon: "🎓", action: "Approval request appears in dashboard", color: "#0891b2" },
                { role: "Headmaster", icon: "🎓", action: "Reviews & approves results", color: "#0891b2" },
                { role: "Event Bus", icon: "⚡", action: "results.approved event fires", color: "#ff6b35" },
                { role: "Student", icon: "🧑💻", action: "Grades now visible in portal", color: "#6366f1" },
                { role: "Parent", icon: "👨👩👧", action: "Result notification sent via SMS & email", color: "#db2777" },
                { role: "AI Engine", icon: "🧠", action: "Generates performance trend analysis per student", color: "#ff6b35" },
              ],
            },
          ].map((flow, fi) => (
            <div key={fi} style={{
              background: "rgba(255,255,255,0.02)",
              border: `1px solid ${flow.color}25`,
              borderRadius: "14px",
              overflow: "hidden",
            }}>
              <div style={{
                padding: "16px 20px",
                background: `${flow.color}12`,
                borderBottom: `1px solid ${flow.color}25`,
                fontSize: "14px",
                fontWeight: "700",
                color: flow.color,
              }}>{flow.title}</div>
              <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "8px" }}>
                {flow.steps.map((step, si) => (
                  <div key={si} style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div style={{
                        width: "28px", height: "28px", borderRadius: "50%",
                        background: `${step.color}20`,
                        border: `1px solid ${step.color}50`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "13px", flexShrink: 0,
                      }}>{step.icon}</div>
                      {si < flow.steps.length - 1 && (
                        <div style={{ width: "1px", height: "16px", background: "rgba(255,255,255,0.08)", margin: "2px 0" }} />
                      )}
                    </div>
                    <div style={{ paddingTop: "4px" }}>
                      <span style={{ fontSize: "11px", color: step.color, fontWeight: "700" }}>{step.role}: </span>
                      <span style={{ fontSize: "12px", color: "#94a3b8" }}>{step.action}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div style={{ textAlign: "center", marginTop: "40px", color: "#1e293b", fontSize: "11px", letterSpacing: "2px" }}>
        SCHOOLOS © 2026 — BUILT FOR AFRICA'S FINEST INSTITUTIONS
      </div>
    </div>
  );
}
