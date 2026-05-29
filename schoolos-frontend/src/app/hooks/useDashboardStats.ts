import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";

interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalStaff: number;
  attendanceRate: number | string;
  teachingStaff: number;
}

interface FinanceSummary {
  totalBilled: number;
  totalPaid: number;
  totalCollected: number;
  totalOutstanding: number;
  overdueCount: number;
}

interface SmsBalance {
  balance: number;
  low_balance_threshold: number;
}

interface TermInfo {
  id: string;
  name: string;
  is_current: boolean;
}

interface DashboardData {
  stats: DashboardStats | null;
  finance: FinanceSummary | null;
  currentTerm: TermInfo | null;
  smsBalance: SmsBalance | null;
  pendingCount: number;
}

export function useDashboardStats() {
  return useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const [dashRes, finRes, termsRes, smsRes, assessRes] = await Promise.all([
        api.get<DashboardStats>("/api/school/dashboard"),
        api.get<FinanceSummary>("/api/school/finance/summary"),
        api.get<{ terms: TermInfo[] }>("/api/school/terms"),
        api.get<SmsBalance>("/api/school/settings/kv/sms_balance").catch(() => null),
        api.get<{ types: any[] }>("/api/school/assessment-types").catch(() => null),
      ]);

      const stats = dashRes.data ?? null;
      const finance = finRes.data ?? null;

      const terms = termsRes.data?.terms || [];
      const currentTerm = terms.find((t) => t.is_current) ?? null;

      let smsBalance: SmsBalance | null = null;
      if (smsRes?.data) {
        const bal = smsRes.data;
        smsBalance = typeof bal === "number" ? { balance: bal, low_balance_threshold: 100 } : bal;
      }

      const types = assessRes?.data?.types || [];
      const pendingCount = types.filter((t: any) => t.status === "pending" || t.is_active === false).length;

      return { stats, finance, currentTerm, smsBalance, pendingCount };
    },
  });
}
