import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";

export interface Student {
  id: string;
  name: string;
  admission_no: string;
  class_name: string;
  gender: string;
  parent_name: string;
  parent_phone: string;
  parent_email: string;
  created_at: string;
}

interface StudentsResponse {
  students: Student[];
  total: number;
}

interface UseStudentsParams {
  view?: string;
  selectedClass?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export function useStudents(params: UseStudentsParams = {}) {
  const { view = "overall", selectedClass = "", search = "", sortBy = "name", sortOrder = "asc", page = 1, limit = 50 } = params;

  return useQuery({
    queryKey: ["students", { view, selectedClass, search, sortBy, sortOrder, page, limit }],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (view === "by_class" && selectedClass) queryParams.set("className", selectedClass);
      if (search) queryParams.set("search", search);
      queryParams.set("sortBy", sortBy);
      queryParams.set("sortOrder", sortOrder);
      queryParams.set("page", String(page));
      queryParams.set("limit", String(limit));

      const res = await api.get<{ data: StudentsResponse }>(`/api/school/features/students?${queryParams}`);
      return res.data?.data ?? { students: [], total: 0 };
    },
    placeholderData: (prev) => prev,
  });
}

export function useClasses() {
  return useQuery({
    queryKey: ["classes"],
    queryFn: async () => {
      const res = await api.get<{ data: { classes: { id?: string; name: string }[] } }>("/api/school/classes");
      return res.data?.data?.classes ?? [];
    },
    staleTime: 10 * 60 * 1000,
  });
}
