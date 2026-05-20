import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "../services/api";

export interface ClassItem {
  id: string;
  name: string;
}

export interface Subject {
  id: string;
  name: string;
  code?: string;
}

export interface Term {
  id: string;
  name: string;
}

export interface StudentBasic {
  id: string;
  admission_number?: string;
  roll_number?: string;
  first_name: string;
  last_name: string;
}

export interface AssessmentItem {
  id: string;
  school_id: string;
  class_id: string;
  subject_id: string;
  term_id: string;
  assessment_type: "SBA" | "EXAM";
  name: string;
  max_points: number;
  sort_order: number;
}

interface ScoreEntry {
  student_id: string;
  assessment_item_id: string;
  score_achieved: number;
}

export function useMetaData() {
  return useQuery({
    queryKey: ["gradebook-meta"],
    queryFn: async () => {
      const [clsRes, subRes, termRes] = await Promise.all([
        api.get<{ data: ClassItem[] }>("/api/school/classes"),
        api.get<{ data: Subject[] }>("/api/school/subjects"),
        api.get<{ data: Term[] }>("/api/school/terms"),
      ]);
      return {
        classes: clsRes.data ?? [],
        subjects: subRes.data ?? [],
        terms: termRes.data ?? [],
      };
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useGradebookData(classId: string, subjectId: string, termId: string) {
  return useQuery({
    queryKey: ["gradebook", { classId, subjectId, termId }],
    queryFn: async () => {
      const [itemsRes, scoresRes, studentsRes] = await Promise.all([
        api.get<{ data: AssessmentItem[] }>(
          `/api/grades/items?class_id=${classId}&subject_id=${subjectId}&term_id=${termId}`
        ),
        api.get<{ data: ScoreEntry[] }>(
          `/api/grades/scores?class_id=${classId}&subject_id=${subjectId}&term_id=${termId}`
        ),
        api.get<{ data: StudentBasic[] }>(
          `/api/school/students?class_id=${classId}`
        ),
      ]);

      const scoreMap: Record<string, Record<string, string>> = {};
      (scoresRes.data || []).forEach((s: ScoreEntry) => {
        if (!scoreMap[s.student_id]) scoreMap[s.student_id] = {};
        scoreMap[s.student_id][s.assessment_item_id] = String(s.score_achieved);
      });

      return {
        items: itemsRes.data ?? [],
        students: studentsRes.data ?? [],
        scores: scoreMap,
      };
    },
    enabled: !!classId && !!subjectId && !!termId,
  });
}

export function useSaveScores() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      studentId,
      assessmentItemId,
      score,
    }: {
      studentId: string;
      assessmentItemId: string;
      score: string;
    }) => {
      const res = await api.post("/api/grades/scores", {
        student_id: studentId,
        assessment_item_id: assessmentItemId,
        score_achieved: Number(score),
      });
      return res.data;
    },

    onError: (_err) => {
      toast.error("Failed to save score");
    },

    onSuccess: () => {
      toast.success("Score saved");
    },
  });
}
