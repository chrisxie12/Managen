import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import { Card, Header, QuickLink, QuickLinksCard, StatusRow, PlatformStatus, TenantHealthSummary, SyncStatus, EventTable, JobTable, AlertList } from "./superadmin/Components";

/**
 * System Admin Overview - internal support dashboard.
 * Visible only to users with the "admin:system:view" permission (superadmin).
 * Data is fetched from real admin endpoints; no mock data is used.
 */
export function SuperAdminOverview() {
  const navigate = useNavigate();
  const [platform, setPlatform] = useState<{ healthy: boolean; uptime: string; version: string } | null>(null);
  const [tenant, setTenant] = useState<{ total: number; healthy: number; degraded: number } | null>(null);
  const [sync, setSync] = useState<{ lastRun: string; lagSeconds: number; errors: string[] } | null>(null);

  // Poll lightweight status endpoints
  useEffect(() => {
    const fetchStatus = async () => {
      const [p, t, s] = await Promise.all([
        api.get<any>("/api/admin/status/platform"),
        api.get<any>("/api/admin/status/tenants"),
        api.get<any>("/api/admin/status/sync"),
      ]);
      setPlatform(p.data);
      setTenant(t.data);
      setSync(s.data);
    };
    fetchStatus();
    const id = setInterval(fetchStatus, 15000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="max-w-screen-xl mx-auto p-4">
      <Header title="System Admin Overview" />
      <StatusRow>
        <PlatformStatus data={platform} />
        <TenantHealthSummary data={tenant} />
        <SyncStatus data={sync} />
      </StatusRow>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <Card title="Critical Events">
          <EventTable endpoint="/api/admin/events?severity=critical&limit=10" />
          <button onClick={() => navigate("/admin/events")}
            className="mt-2 text-sm text-blue-600 hover:underline">
            View all
          </button>
        </Card>

        <Card title="Failed Jobs">
          <JobTable endpoint="/api/admin/jobs?status=failed&limit=10" />
          <button onClick={() => navigate("/admin/jobs")}
            className="mt-2 text-sm text-blue-600 hover:underline">
            View all
          </button>
        </Card>

        <Card title="Security Alerts">
          <AlertList endpoint="/api/admin/security/alerts?limit=5" />
          <button onClick={() => navigate("/admin/security")}
            className="mt-2 text-sm text-blue-600 hover:underline">
            View all
          </button>
        </Card>

        <QuickLinksCard>
          <QuickLink icon="🪵" label="Logs" href="/admin/logs" />
          <QuickLink icon="👥" label="Users" href="/admin/users" />
          <QuickLink icon="🔐" label="Roles" href="/admin/roles" />
          <QuickLink icon="💳" label="Billing" href="/admin/billing" />
          <QuickLink icon="📊" label="Reports" href="/admin/reports" />
        </QuickLinksCard>
      </div>
    </div>
  );
}
