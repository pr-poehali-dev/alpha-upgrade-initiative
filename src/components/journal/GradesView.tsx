import { useState, useMemo, useRef, useEffect } from "react";
import { classes, getSubjectsForClass, generateGrades, recentDates, type Grade, type GradeEntry } from "@/data/schoolData";
import Icon from "@/components/ui/icon";

interface Props { classId: string; }

interface GradeEntryEx extends GradeEntry {
  comment?: string;
  history?: { grade: Grade; comment?: string; changedAt: string }[];
}

const gradeColor: Record<number, string> = {
  5: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  4: "bg-blue-100 text-blue-700 border border-blue-200",
  3: "bg-amber-100 text-amber-700 border border-amber-200",
  2: "bg-red-100 text-red-700 border border-red-200",
};
const gradeBg: Record<number, string> = {
  5: "from-emerald-400 to-teal-500",
  4: "from-blue-400 to-indigo-500",
  3: "from-amber-400 to-orange-400",
  2: "from-red-400 to-rose-500",
};
const gradeLabel: Record<number, string> = {
  5: "Отлично",
  4: "Хорошо",
  3: "Удовлетворительно",
  2: "Неудовлетворительно",
};

function formatDateShort(d: string) {
  const dt = new Date(d);
  return `${dt.getDate().toString().padStart(2, "0")}.${(dt.getMonth() + 1).toString().padStart(2, "0")}`;
}
function formatDateTime(iso: string) {
  const d = new Date(iso);
  return `${d.getDate().toString().padStart(2,"0")}.${(d.getMonth()+1).toString().padStart(2,"0")} в ${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}`;
}

interface GradeCellProps {
  grade: Grade;
  hasComment: boolean;
  corrected: boolean;
  onClick: () => void;
}
function GradeCell({ grade, hasComment, corrected, onClick }: GradeCellProps) {
  return (
    <button
      onClick={onClick}
      className={`relative w-9 h-9 rounded-xl text-sm font-bold transition-all hover:scale-110 active:scale-95 flex items-center justify-center ${
        grade ? gradeColor[grade] : "text-gray-200 hover:bg-gray-50 border border-dashed border-gray-200"
      }`}
    >
      {grade ?? "·"}
      {hasComment && (
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-400 rounded-full border-2 border-white" />
      )}
      {corrected && !hasComment && (
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full border-2 border-white" />
      )}
      {corrected && hasComment && (
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-purple-400 rounded-full border-2 border-white" />
      )}
    </button>
  );
}

interface GradeModalProps {
  studentName: string;
  studentAvatar: string;
  subjectName: string;
  date: string;
  entry: GradeEntryEx | null;
  onSave: (grade: Grade, comment: string) => void;
  onClose: () => void;
}
function GradeModal({ studentName, studentAvatar, subjectName, date, entry, onSave, onClose }: GradeModalProps) {
  const [selectedGrade, setSelectedGrade] = useState<Grade>(entry?.grade ?? null);
  const [comment, setComment] = useState(entry?.comment ?? "");
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const isEdit = entry?.grade != null;
  const hasChanges = selectedGrade !== entry?.grade || comment !== (entry?.comment ?? "");

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
      onClick={e => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        {/* Header */}
        <div className={`bg-gradient-to-br ${selectedGrade ? gradeBg[selectedGrade] : "from-gray-300 to-gray-400"} p-5 text-white transition-all duration-300`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-white/80">
              {isEdit ? "Исправление оценки" : "Новая оценка"}
            </span>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all"
            >
              <Icon name="X" size={14} />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center text-base font-bold">
              {studentAvatar}
            </div>
            <div>
              <p className="font-bold text-[15px] leading-tight">{studentName}</p>
              <p className="text-white/70 text-sm">{subjectName} · {formatDateShort(date)}</p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Grade picker */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5">Оценка</p>
            <div className="grid grid-cols-4 gap-2">
              {[5, 4, 3, 2].map(g => (
                <button
                  key={g}
                  onClick={() => setSelectedGrade(g as Grade)}
                  className={`flex flex-col items-center gap-1 py-3 rounded-2xl border-2 transition-all ${
                    selectedGrade === g
                      ? `border-transparent bg-gradient-to-br ${gradeBg[g]} text-white shadow-lg scale-105`
                      : "border-gray-100 hover:border-gray-200 bg-gray-50 text-gray-700"
                  }`}
                >
                  <span className="text-xl font-bold">{g}</span>
                  <span className="text-[10px] font-medium opacity-70">{gradeLabel[g].split(" ")[0]}</span>
                </button>
              ))}
            </div>
            {selectedGrade && (
              <p className="text-center text-xs text-gray-400 mt-2">{gradeLabel[selectedGrade]}</p>
            )}
          </div>

          {/* Comment */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Комментарий <span className="normal-case font-normal">(необязательно)</span>
            </p>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Например: контрольная работа, ответ у доски, домашнее задание..."
              rows={3}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm text-gray-700 placeholder-gray-300 outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-200 resize-none transition-all"
            />
          </div>

          {/* History */}
          {entry?.history && entry.history.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Icon name="History" size={11} />
                История исправлений
              </p>
              <div className="space-y-1.5 max-h-28 overflow-y-auto">
                {entry.history.map((h, i) => (
                  <div key={i} className="flex items-start gap-2.5 bg-gray-50 rounded-xl px-3 py-2">
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br ${h.grade ? gradeBg[h.grade] : "from-gray-300 to-gray-400"} flex-shrink-0`}>
                      {h.grade ?? "—"}
                    </span>
                    <div className="min-w-0">
                      {h.comment && <p className="text-xs text-gray-600 truncate">{h.comment}</p>}
                      <p className="text-[11px] text-gray-400">{formatDateTime(h.changedAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            {isEdit && (
              <button
                onClick={() => onSave(null, "")}
                className="flex-shrink-0 px-4 py-2.5 rounded-2xl bg-red-50 text-red-500 text-sm font-medium hover:bg-red-100 transition-all flex items-center gap-1.5"
              >
                <Icon name="Trash2" size={13} />
                Удалить
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-2xl bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition-all"
            >
              Отмена
            </button>
            <button
              onClick={() => { if (selectedGrade || isEdit) onSave(selectedGrade, comment); }}
              disabled={!hasChanges && isEdit}
              className={`flex-1 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                selectedGrade && (hasChanges || !isEdit)
                  ? `bg-gradient-to-r ${selectedGrade ? gradeBg[selectedGrade] : "from-blue-500 to-indigo-600"} text-white shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]`
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              {isEdit ? "Исправить" : "Выставить"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GradesView({ classId }: Props) {
  const cls = classes.find(c => c.id === classId)!;
  const subjects = getSubjectsForClass(classId);
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.id || "");
  const [grades, setGrades] = useState<GradeEntryEx[]>(() => generateGrades(classId));
  const [modal, setModal] = useState<{ studentId: number; date: string } | null>(null);

  // reset grades when class changes
  useMemo(() => {
    setGrades(generateGrades(classId));
    setSelectedSubject(getSubjectsForClass(classId)[0]?.id || "");
  }, [classId]);

  const filteredGrades = useMemo(
    () => grades.filter(g => g.subjectId === selectedSubject),
    [grades, selectedSubject]
  );

  function getEntry(studentId: number, date: string): GradeEntryEx | null {
    return filteredGrades.find(g => g.studentId === studentId && g.date === date) ?? null;
  }

  function saveGrade(studentId: number, date: string, grade: Grade, comment: string) {
    setGrades(prev => {
      const existing = prev.find(g => g.studentId === studentId && g.subjectId === selectedSubject && g.date === date);
      const rest = prev.filter(g => !(g.studentId === studentId && g.subjectId === selectedSubject && g.date === date));
      if (grade === null) return rest;
      const newHistory = existing?.grade != null
        ? [...(existing.history ?? []), { grade: existing.grade, comment: existing.comment, changedAt: new Date().toISOString() }]
        : existing?.history ?? [];
      return [...rest, { studentId, subjectId: selectedSubject, date, grade, comment: comment || undefined, history: newHistory }];
    });
    setModal(null);
  }

  function getAvg(studentId: number): string {
    const sg = grades.filter(g => g.studentId === studentId && g.subjectId === selectedSubject && g.grade !== null);
    if (!sg.length) return "—";
    return (sg.reduce((a, b) => a + (b.grade || 0), 0) / sg.length).toFixed(1);
  }

  const subjectObj = subjects.find(s => s.id === selectedSubject);
  const modalStudent = modal ? cls.students.find(s => s.id === modal.studentId) : null;
  const modalEntry = modal ? getEntry(modal.studentId, modal.date) : null;

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
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-800">{subjectObj.name}</p>
            <p className="text-xs text-gray-400">{subjectObj.teacher}</p>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-gray-400">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block" /> Комментарий</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> Исправлено</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-purple-400 inline-block" /> Оба</span>
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
                  <th key={d} className="py-3 px-1 text-xs font-semibold text-gray-400 min-w-[48px] text-center">{formatDateShort(d)}</th>
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
                  {recentDates.map(date => {
                    const entry = getEntry(student.id, date);
                    return (
                      <td key={date} className="py-2 px-1 text-center">
                        <div className="flex justify-center">
                          <GradeCell
                            grade={entry?.grade ?? null}
                            hasComment={!!entry?.comment}
                            corrected={!!(entry?.history && entry.history.length > 0)}
                            onClick={() => setModal({ studentId: student.id, date })}
                          />
                        </div>
                      </td>
                    );
                  })}
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

      <p className="text-xs text-gray-400 text-center">Нажмите на ячейку, чтобы выставить или исправить оценку</p>

      {/* Modal */}
      {modal && modalStudent && (
        <GradeModal
          studentName={modalStudent.name}
          studentAvatar={modalStudent.avatar}
          subjectName={subjectObj?.name ?? ""}
          date={modal.date}
          entry={modalEntry}
          onSave={(grade, comment) => saveGrade(modal.studentId, modal.date, grade, comment)}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
