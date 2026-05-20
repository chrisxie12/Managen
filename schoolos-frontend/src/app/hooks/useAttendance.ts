import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "../services/api";

interface AttendanceRecord {
  student_id: string;
  date: string;
  status: string;
  class_id: string;
}

export function useAttendance(classId: string, date: string) {
  return useQuery({
    queryKey: ["attendance", { classId, date }],
    queryFn: async () => {
      const res = await api.get<AttendanceRecord[]>(
        `/api/school/attendance?class_id=${classId}&date=${date}`
      );
      return res.data ?? [];
    },
    enabled: !!classId && !!date,
  });
}

export function useMarkAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      classId,
      date,
      records,
    }: {
      classId: string;
      date: string;
      records: { student_id: string; status: string }[];
    }) => {
      const res = await api.post("/api/school/attendance/batch", {
        class_id: classId,
        date,
        records,
      });
      return res.data;
    },

    onMutate: async ({ classId, date, records }) => {
      await queryClient.cancelQueries({ queryKey: ["attendance", { classId, date }] });
      const previous = queryClient.getQueryData<AttendanceRecord[]>(["attendance", { classId, date }]);
      queryClient.setQueryData<AttendanceRecord[]>(["attendance", { classId, date }], (old) => {
        if (!old) return records.map((r) => ({ ...r, date, class_id: classId }));
        const updated = old.map(
          (o) => records.find((r) => r.student_id === o.student_id) ?? o
        );
        const added = records.filter(
          (r) => !old.some((o) => o.student_id === r.student_id)
        );
        return [...updated, ...added.map((a) => ({ ...a, date, class_id: classId }))];
      });
      return { previous };
    },

    onError: (_err, { classId, date }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["attendance", { classId, date }], context.previous);
      }
      toast.error("Failed to save attendance");
    },

    onSuccess: () => {
      toast.success("Attendance saved");
    },

    onSettled: (_data, _err, { classId, date }) => {
      queryClient.invalidateQueries({ queryKey: ["attendance", { classId, date }] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
