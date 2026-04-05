import { useState, useMemo } from "react";
import { classes, getSubjectsForClass, generateGrades, recentDates, type Grade, type GradeEntry } from "@/data/schoolData";
import Icon from "@/components/ui/icon";

interface Props { classId: string; }

const gradeColor: Record<number, string> = {
  5: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  4: "bg-blue-100 text-blue-700 border border-blue-200",
  3: "bg-amber-100 text-amber-700 border border-amber-200",
  2: "bg-red-100 text-red-700 border border-red-200",
};

function GradeCell({ grade, onClick }: { grade: Grade; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-8 h-8 rounded-lg text-sm font-bold transition-all hover:scale-110 active:scale-95 flex items-center justify-center ${
        grade ? gradeColor[grade] : "text-gray-200 hover:bg-gray-50 border border-dashed border-gray-200"
      }`}
    >
      {grade ?? "·"}
    </button>
  );
}

export default function GradesView({ classId }: Props) {
  const cls = classes.find(c => c.id === classId)!;
  const subjects = getSubjectsForClass(classId);
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.id || "");
  const [grades, setGrades] = useState<GradeEntry[]>(() => generateGrades(classId));
  const [editCell, setEditCell] = useState<{ studentId: number; date: string } | null>(null);

  const filteredGrades = useMemo(
    () => grades.filter(g => g.subjectId === selectedSubject),
    [grades, selectedSubject]
  );

  function getGrade(studentId: number, date: string): Grade {
    return filteredGrades.find(g => g.studentId === studentId && g.date === date)?.grade ?? null;
  }

  function setGrade(studentId: number, date: string, grade: Grade) {
    setGrades(prev => {
      const filtered = prev.filter(g => !(g.studentId === studentId && g.subjectId === selectedSubject && g.date === date));
      if (grade !== null) {
        return [...filtered, { studentId, subjectId: selectedSubject, date, grade }];
      }
      return filtered;
    });
    setEditCell(null);
  }

  function getAvg(studentId: number): string {
    const sg = grades.filter(g => g.studentId === studentId && g.subjectId === selectedSubject && g.grade !== null);
    if (!sg.length) return "—";
    const avg = sg.reduce((a, b) => a + (b.grade || 0), 0) / sg.length;
    return avg.toFixed(1);
  }

  const formatDate = (d: string) => {
    const dt = new Date(d);
    return `${dt.getDate().toString().padStart(2,"0")}.${(dt.getMonth()+1).toString().padStart(2,"0")}`;
  };

  const subjectObj = subjects.find(s => s.id === selectedSubject);

  return (
    <div className="space-y-4">
      {/* Subject selector */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {subjects.map(s => (
          <button
            key={s.id}
            onClick={() => setSelectedSubject(s.id)}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-medium transition-all ${
              selectedSubject === s.id
                ? "bg-blue-500 text-white shadow-md shadow-blue-200"
                : "bg-white/80 text-gray-600 hover:bg-white border border-white/60 shadow-sm"
            }`}
          >
            <Icon name={s.icon} size={14} />
            {s.name}
          </button>
        ))}
      </div>

      {/* Teacher info */}
      {subjectObj && (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm border border-white/60">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
            <Icon name={subjectObj.icon} size={14} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">{subjectObj.name}</p>
            <p className="text-xs text-gray-400">{subjectObj.teacher}</p>
          </div>
        </div>
      )}

      {/* Grade table */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-white/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 min-w-[180px] sticky left-0 bg-white/90 backdrop-blur-sm"># Ученик</th>
                {recentDates.map(d => (
                  <th key={d} className="py-3 px-1 text-xs font-semibold text-gray-400 min-w-[44px] text-center">{formatDate(d)}</th>
                ))}
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 min-w-[60px] text-center">Средн.</th>
              </tr>
            </thead>
            <tbody>
              {cls.students.map((student, idx) => (
                <tr key={student.id} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors group">
                  <td className="py-2.5 px-4 sticky left-0 bg-white/90 backdrop-blur-sm group-hover:bg-blue-50/30">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs text-gray-300 w-4">{idx + 1}</span>
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-300 to-purple-400 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                        {student.avatar}
                      </div>
                      <span className="font-medium text-gray-700 text-sm whitespace-nowrap">{student.name}</span>
                    </div>
                  </td>
                  {recentDates.map(date => (
                    <td key={date} className="py-2.5 px-1 text-center relative">
                      {editCell?.studentId === student.id && editCell?.date === date ? (
                        <div className="absolute z-10 top-0 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 flex gap-1.5">
                          {[5, 4, 3, 2].map(g => (
                            <button
                              key={g}
                              onClick={() => setGrade(student.id, date, g as Grade)}
                              className={`w-8 h-8 rounded-lg text-sm font-bold ${gradeColor[g]} hover:scale-110 transition-transform`}
                            >
                              {g}
                            </button>
                          ))}
                          <button
                            onClick={() => setGrade(student.id, date, null)}
                            className="w-8 h-8 rounded-lg bg-gray-100 text-gray-400 text-xs font-bold hover:scale-110 transition-transform"
                          >✕</button>
                        </div>
                      ) : null}
                      <div className="flex justify-center">
                        <GradeCell
                          grade={getGrade(student.id, date)}
                          onClick={() => setEditCell({ studentId: student.id, date })}
                        />
                      </div>
                    </td>
                  ))}
                  <td className="py-2.5 px-4 text-center">
                    <span className={`inline-flex items-center justify-center w-12 py-1 rounded-lg text-sm font-bold ${
                      parseFloat(getAvg(student.id)) >= 4.5 ? "bg-emerald-100 text-emerald-700" :
                      parseFloat(getAvg(student.id)) >= 3.5 ? "bg-blue-100 text-blue-700" :
                      parseFloat(getAvg(student.id)) >= 2.5 ? "bg-amber-100 text-amber-700" :
                      getAvg(student.id) !== "—" ? "bg-red-100 text-red-700" : "text-gray-300"
                    }`}>
                      {getAvg(student.id)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center">Нажмите на ячейку, чтобы выставить оценку</p>
    </div>
  );
}
