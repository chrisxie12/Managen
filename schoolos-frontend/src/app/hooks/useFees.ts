import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "../services/api";

interface FeeStructure {
  id: string;
  name: string;
  amount: number;
  class_id: string;
  term_id: string;
}

interface FeePayment {
  id: string;
  student_id: string;
  amount: number;
  method: string;
  status: string;
  created_at: string;
}

interface FeeSummary {
  totalBilled: number;
  totalPaid: number;
  totalCollected: number;
  totalOutstanding: number;
  overdueCount: number;
}

export function useFeeStructures(termId: string) {
  return useQuery({
    queryKey: ["fee-structures", termId],
    queryFn: async () => {
      const res = await api.get<FeeStructure[]>(`/api/school/fees/structures?term_id=${termId}`);
      return res.data ?? [];
    },
    enabled: !!termId,
  });
}

export function useFeePayments(studentId?: string) {
  return useQuery({
    queryKey: ["fee-payments", studentId],
    queryFn: async () => {
      const endpoint = studentId
        ? `/api/school/fees/payments?student_id=${studentId}`
        : "/api/school/fees/payments";
      const res = await api.get<FeePayment[]>(endpoint);
      return res.data ?? [];
    },
  });
}

export function useFeeSummary() {
  return useQuery({
    queryKey: ["fee-summary"],
    queryFn: async () => {
      const res = await api.get<FeeSummary>("/api/school/finance/summary");
      return res.data ?? null;
    },
  });
}

export function useRecordFeePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      studentId,
      amount,
      method,
    }: {
      studentId: string;
      amount: number;
      method: string;
    }) => {
      const res = await api.post("/api/school/fees/payments", {
        student_id: studentId,
        amount,
        method,
      });
      return { studentId, amount, ...res.data };
    },

    onMutate: async ({ studentId, amount }) => {
      await queryClient.cancelQueries({ queryKey: ["fee-payments", studentId] });
      await queryClient.cancelQueries({ queryKey: ["fee-summary"] });

      const previousPayments = queryClient.getQueryData<FeePayment[]>(["fee-payments", studentId]);
      const previousSummary = queryClient.getQueryData<FeeSummary>(["fee-summary"]);

      queryClient.setQueryData<FeeSummary>(["fee-summary"], (old) => {
        if (!old) return old;
        return {
          ...old,
          totalPaid: old.totalPaid + amount,
          totalCollected: old.totalCollected + amount,
          totalOutstanding: Math.max(0, old.totalOutstanding - amount),
        };
      });

      return { previousPayments, previousSummary, studentId };
    },

    onError: (_err, _vars, context) => {
      if (context?.previousSummary) {
        queryClient.setQueryData(["fee-summary"], context.previousSummary);
      }
      toast.error("Failed to record payment");
    },

    onSuccess: (_data) => {
      toast.success("Payment recorded");
    },

    onSettled: (_data, _err, { studentId }) => {
      queryClient.invalidateQueries({ queryKey: ["fee-payments", studentId] });
      queryClient.invalidateQueries({ queryKey: ["fee-summary"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
