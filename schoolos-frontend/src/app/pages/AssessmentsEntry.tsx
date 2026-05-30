import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  Loader2, Save, AlertCircle, Search, FileSpreadsheet,
  Lock, Unlock, ChevronDown, CheckCircle2, ChevronRight, XCircle
} from "lucide-react";
import { toast } from "sonner";
import { api } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const COLORS = { NAVY: "#0A2472", CREAM: "#F8F9FA", MUTED: "#6B7280" };

type GradeRule = { id: string; min_percent: number; max_percent: number; grade: string };
type AssessmentType = { id: string; name: string; weight: number };
type Assessment = { id: string; assessment_type_id: string; max_score: number };
type Student = { id: string; name: string; roll_number: string };
type Score = { id?: string; student_id: string; assessment_id: string; score: number | null; _status?: 'saving' | 'error' | 'saved' | 'unsaved' };

export function AssessmentsEntry() {
  const { user } = useAuth();
  
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [terms, setTerms] = useState<any[]>([]);
  
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  
  const [students, setStudents] = useState<Student[]>([]);
  const [assessmentTypes, setAssessmentTypes] = useState<AssessmentType[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [gradeRules, setGradeRules] = useState<GradeRule[]>([]);
  const [scores, setScores] = useState<Record<string, Score>>({}); // key: student_id-assessment_id
  const [isLocked, setIsLocked] = useState(false);
  
  const [fetching, setFetching] = useState(false);
  const gridRef = useRef<HTMLTableElement>(null);
  
  // Data Loaders
  useEffect(() => {
    api.get<any>("/api/school/classes").then(r => setClasses(r.data?.data || []));
    api.get<any>("/api/school/subjects").then(r => setSubjects(r.data?.data || []));
    api.get<any>("/api/school/terms").then(r => setTerms(r.data?.data || []));
  }, []);

  const fetchGrid = useCallback(async () => {
    if (!selectedClass || !selectedSubject || !selectedTerm) return;
    setFetching(true);
    try {
      const res = await api.get<any>(`/api/assessments/grid?class_id=${selectedClass}&subject_id=${selectedSubject}&term_id=${selectedTerm}`);
      const d = res.data?.data ?? res.data;
      setStudents(d.students || []);
      setAssessmentTypes(d.assessmentTypes || []);
      setAssessments(d.assessments || []);
      setGradeRules(d.gradeRules || []);
      setIsLocked(d.is_locked || false);
      
      const scoreMap: Record<string, Score> = {};
      (d.scores || []).forEach((s: Score) => {
        scoreMap[`${s.student_id}-${s.assessment_id}`] = { ...s, _status: 'saved' };
      });
      setScores(scoreMap);
    } catch (err: any) {
      toast.error(err.message || "Failed to load gradebook grid");
    } finally {
      setFetching(false);
    }
  }, [selectedClass, selectedSubject, selectedTerm]);

  useEffect(() => {
    fetchGrid();
  }, [selectedClass, selectedSubject, selectedTerm]);

  // Calculations
  const computeFinal = useCallback((studentId: string) => {
    let totalWeight = 0;
    let weightedSum = 0;
    
    assessments.forEach(a => {
      const type = assessmentTypes.find(t => t.id === a.assessment_type_id);
      const scoreObj = scores[`${studentId}-${a.id}`];
      if (type && scoreObj && scoreObj.score !== null) {
        totalWeight += type.weight;
        weightedSum += (scoreObj.score / a.max_score) * 100 * type.weight;
      }
    });

    if (totalWeight === 0) return null;
    return weightedSum / totalWeight; // percentage 0-100
  }, [assessments, assessmentTypes, scores]);

  const getBand = useCallback((percentage: number | null) => {
    if (percentage === null) return null;
    const rule = gradeRules.find(r => percentage >= r.min_percent && percentage <= r.max_percent);
    return rule?.grade || "-";
  }, [gradeRules]);

  // Keyboard Nav
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, rowIndex: number, colIndex: number) => {
    const inputs = Array.from(gridRef.current?.querySelectorAll('input') || []);
    const colCount = assessments.length;
    let targetIndex = -1;

    switch (e.key) {
      case 'ArrowDown':
      case 'Enter':
        e.preventDefault();
        targetIndex = inputs.findIndex(input => input === e.currentTarget) + colCount;
        break;
      case 'ArrowUp':
        e.preventDefault();
        targetIndex = inputs.findIndex(input => input === e.currentTarget) - colCount;
        break;
      case 'ArrowRight':
        if (e.currentTarget.selectionStart === e.currentTarget.value.length) {
          e.preventDefault();
          targetIndex = inputs.findIndex(input => input === e.currentTarget) + 1;
        }
        break;
      case 'ArrowLeft':
        if (e.currentTarget.selectionStart === 0) {
          e.preventDefault();
          targetIndex = inputs.findIndex(input => input === e.currentTarget) - 1;
        }
        break;
    }

    if (targetIndex >= 0 && targetIndex < inputs.length) {
      (inputs[targetIndex] as HTMLInputElement).focus();
      (inputs[targetIndex] as HTMLInputElement).select();
    }
  };

  // Cell Edit & Save
  const handleScoreChange = (studentId: string, assessmentId: string, value: string) => {
    if (isLocked) return;
    const key = `${studentId}-${assessmentId}`;
    const assessment = assessments.find(a => a.id === assessmentId);
    
    // Numeric only, allow empty string
    if (value !== "" && !/^\d*\.?\d*$/.test(value)) return;
    
    let numVal = value === "" ? null : parseFloat(value);
    
    // Validate Max Score
    if (numVal !== null && assessment && numVal > assessment.max_score) {
      numVal = assessment.max_score; // Cap it
      toast.warning(`Score capped at maximum of ${assessment.max_score}`);
    }

    setScores(prev => ({
      ...prev,
      [key]: { ...prev[key], student_id: studentId, assessment_id: assessmentId, score: numVal, _status: 'unsaved' }
    }));
  };

  const handleBlur = async (studentId: string, assessmentId: string) => {
    if (isLocked) return;
    const key = `${studentId}-${assessmentId}`;
    const currentObj = scores[key];
    
    if (!currentObj || currentObj._status !== 'unsaved') return;

    // Optimistic Save
    setScores(prev => ({ ...prev, [key]: { ...prev[key], _status: 'saving' } }));

    try {
      if (currentObj.score === null) {
        if (currentObj.id) await api.delete(`/api/assessments/scores/${currentObj.id}`);
        setScores(prev => ({ ...prev, [key]: { ...prev[key], _status: 'saved', score: null } }));
      } else if (currentObj.id) {
        await api.patch(`/api/assessments/scores/${currentObj.id}`, { score: currentObj.score });
        setScores(prev => ({ ...prev, [key]: { ...prev[key], _status: 'saved' } }));
      } else {
        const res = await api.post<any>(`/api/assessments/scores`, { student_id: studentId, assessment_id: assessmentId, score: currentObj.score });
        setScores(prev => ({ ...prev, [key]: { ...(res.data?.data ?? res.data ?? {}), _status: 'saved' } }));
      }
    } catch (err) {
      setScores(prev => ({ ...prev, [key]: { ...prev[key], _status: 'error' } }));
      toast.error("Failed to save score");
    }
  };

  // Pasting from Excel
  const handlePaste = (e: React.ClipboardEvent<HTMLTableElement>) => {
    if (isLocked) return;
    e.preventDefault();
    const clipboardData = e.clipboardData.getData('text');
    const rows = clipboardData.split('\n').map(row => row.split('\t'));
    
    // A complex implementation would map rows to students/assessments.
    // Assuming paste starts at focused cell:
    const activeElement = document.activeElement as HTMLInputElement;
    if (activeElement && activeElement.tagName === 'INPUT') {
      const startStudentIdx = parseInt(activeElement.dataset.studentIdx || '0');
      const startAssesIdx = parseInt(activeElement.dataset.assesIdx || '0');
      
      const newScores = { ...scores };
      let patched = false;

      rows.forEach((row, rIdx) => {
        row.forEach((val, cIdx) => {
          const student = students[startStudentIdx + rIdx];
          const assessment = assessments[startAssesIdx + cIdx];
          if (student && assessment) {
            const numVal = parseFloat(val.trim());
            if (!isNaN(numVal) && numVal >= 0 && numVal <= assessment.max_score) {
              const key = `${student.id}-${assessment.id}`;
              const existingId = newScores[key]?.id;
              newScores[key] = { id: existingId, student_id: student.id, assessment_id: assessment.id, score: numVal, _status: 'unsaved' };
              patched = true;
              // Trigger save asynchronously
              api.post<any>(`/api/assessments/scores`, { student_id: student.id, assessment_id: assessment.id, score: numVal })
                .then(res => { setScores(prev => ({ ...prev, [key]: { ...(res.data?.data ?? res.data ?? {}), _status: 'saved' } })) })
                .catch(() => { setScores(prev => ({ ...prev, [key]: { ...newScores[key], _status: 'error' } })) });
            }
          }
        });
      });
      
      if (patched) {
        setScores(newScores);
        toast.success("Pasted successfully");
      }
    }
  };

  const getBandColor = (band: string) => {
    if (band === 'EE') return "bg-green-100 text-green-800 border-green-300";
    if (band === 'ME') return "bg-blue-100 text-blue-800 border-blue-300";
    if (band === 'AE') return "bg-yellow-100 text-yellow-800 border-yellow-300";
    if (band === 'BE') return "bg-red-100 text-red-800 border-red-300";
    return "bg-gray-100 text-gray-800 border-gray-300";
  };

  return (
    <div className="flex flex-col h-full bg-[#F8F9FA] font-['DM_Sans']">
      {/* Top Bar */}
      <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-[rgba(10,36,114,0.07)] bg-white">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold" style={{ color: COLORS.NAVY }}>Gradebook Entry</h1>
          {isLocked && <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold"><Lock size={14}/> Grades Locked</div>}
        </div>
        <div className="flex gap-2">
          <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="border rounded-lg px-3 py-1.5 text-sm">
            <option value="">Class...</option>{classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="border rounded-lg px-3 py-1.5 text-sm">
            <option value="">Subject...</option>{subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={selectedTerm} onChange={e => setSelectedTerm(e.target.value)} className="border rounded-lg px-3 py-1.5 text-sm">
            <option value="">Term...</option>{terms.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <button className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-50"><FileSpreadsheet size={16}/> Export</button>
        </div>
      </div>

      {/* Grid Area */}
      <div className="flex-1 overflow-auto p-4 relative">
        {fetching ? (
          <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-gray-400" size={32} /></div>
        ) : !selectedClass || !selectedSubject || !selectedTerm ? (
          <div className="flex h-full items-center justify-center text-gray-500">Select Class, Subject, and Term to view gradebook</div>
        ) : students.length === 0 ? (
          <div className="flex h-full items-center justify-center text-gray-500">No students found in this class</div>
        ) : (
          <table ref={gridRef} className="w-max min-w-full bg-white border-collapse border border-gray-200 shadow-sm rounded-lg" onPaste={handlePaste}>
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="border p-3 text-left text-xs font-semibold text-gray-600 sticky left-0 bg-gray-50 z-20">Student</th>
                {assessments.map(a => {
                  const type = assessmentTypes.find(t => t.id === a.assessment_type_id);
                  return (
                    <th key={a.id} className="border p-3 text-center text-xs font-semibold text-gray-600 min-w-[120px]">
                      {type?.name || "Unknown"}
                      <div className="text-[10px] text-gray-400 font-normal mt-0.5">Max: {a.max_score} | Wt: {type?.weight}%</div>
                    </th>
                  );
                })}
                <th className="border p-3 text-center text-xs font-semibold text-gray-600 bg-blue-50">Final Score</th>
                <th className="border p-3 text-center text-xs font-semibold text-gray-600 bg-blue-50">Band</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, sIdx) => {
                const finalPercentage = computeFinal(student.id);
                const band = getBand(finalPercentage);
                
                return (
                  <tr key={student.id} className="hover:bg-gray-50 group">
                    <td className="border p-2 sticky left-0 bg-white group-hover:bg-gray-50 z-10 text-sm font-medium whitespace-nowrap min-w-[200px]" style={{ color: COLORS.NAVY }}>
                      {student.name}
                      <div className="text-xs text-gray-400 font-normal">{student.roll_number || student.id.slice(0, 8)}</div>
                    </td>
                    {assessments.map((a, aIdx) => {
                      const key = `${student.id}-${a.id}`;
                      const scoreObj = scores[key];
                      const val = scoreObj?.score !== null && scoreObj?.score !== undefined ? scoreObj.score.toString() : "";
                      const status = scoreObj?._status;
                      
                      return (
                        <td key={a.id} className="border p-0 relative">
                          <input
                            type="text"
                            disabled={isLocked}
                            data-student-idx={sIdx}
                            data-asses-idx={aIdx}
                            value={val}
                            onChange={(e) => handleScoreChange(student.id, a.id, e.target.value)}
                            onBlur={() => handleBlur(student.id, a.id)}
                            onKeyDown={(e) => handleKeyDown(e, sIdx, aIdx)}
                            className={`w-full h-12 text-center text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-transparent ${isLocked ? 'cursor-not-allowed bg-gray-50 text-gray-500' : ''}`}
                            placeholder="-"
                          />
                          {status === 'saving' && <Loader2 size={12} className="absolute right-2 top-2 animate-spin text-blue-500" />}
                          {status === 'saved' && <CheckCircle2 size={12} className="absolute right-2 top-2 text-green-500 opacity-50" />}
                          {status === 'unsaved' && <div className="absolute right-2 top-2 w-2 h-2 rounded-full bg-orange-400" title="Unsaved changes" />}
                          {status === 'error' && <span title="Save failed"><XCircle size={12} className="absolute right-2 top-2 text-red-500" /></span>}
                        </td>
                      );
                    })}
                    <td className="border p-3 text-center text-sm font-bold bg-blue-50/30" style={{ color: COLORS.NAVY }}>
                      {finalPercentage !== null ? `${finalPercentage.toFixed(2)}%` : "-"}
                    </td>
                    <td className="border p-2 text-center bg-blue-50/30">
                      {band && band !== "-" && (
                        <span className={`px-2 py-1 border rounded font-bold text-xs ${getBandColor(band)}`}>{band}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
