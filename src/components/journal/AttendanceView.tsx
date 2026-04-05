import { useState, useMemo } from "react";
import { classes, generateAttendance, recentDates, type AttendanceEntry } from "@/data/schoolData";
import Icon from "@/components/ui/icon";

interface Props { classId: string; }

export default function AttendanceView({ classId }: Props) {
  const cls = classes.find(c => c.id === classId)!;
  const [attendance, setAttendance] = useState<AttendanceEntry[]>(() => generateAttendance(classId));

  const formatDate = (d: string) => {
    const dt = new Date(d);
    const days = ["Вс","Пн","Вт","Ср","Чт","Пт","Сб"];
    return { day: `${dt.getDate().toString().padStart(2,"0")}.${(dt.getMonth()+1).toString().padStart(2,"0")}`, weekday: days[dt.getDay()] };
  };

  function getEntry(studentId: number, date: string) {
    return attendance.find(a => a.studentId === studentId && a.date === date);
  }

  function togglePresent(studentId: number, date: string) {
    setAttendance(prev => prev.map(a =>
      a.studentId === studentId && a.date === date ? { ...a, present: !a.present } : a
    ));
  }

  const stats = useMemo(() => {
    return cls.students.map(student => {
      const entries = attendance.filter(a => a.studentId === student.id);
      const absences = entries.filter(a => !a.present).length;
      const rate = Math.round((entries.filter(a => a.present).length / Math.max(entries.length, 1)) * 100);
      return { studentId: student.id, absences, rate };
    });
  }, [attendance, cls.students]);

  const totalPresent = useMemo(() => {
    const today = recentDates[recentDates.length - 1];
    return attendance.filter(a => a.date === today && a.present).length;
  }, [attendance]);

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-sm border border-white/60">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Icon name="UserCheck" size={14} className="text-emerald-600" />
            </div>
            <span className="text-xs font-medium text-gray-500">Сегодня</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalPresent}</p>
          <p className="text-xs text-gray-400 mt-0.5">из {cls.students.length} учеников</p>
        </div>
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-sm border border-white/60">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-xl bg-red-100 flex items-center justify-center">
              <Icon name="UserX" size={14} className="text-red-500" />
            </div>
            <span className="text-xs font-medium text-gray-500">Отсутствуют</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{cls.students.length - totalPresent}</p>
          <p className="text-xs text-gray-400 mt-0.5">сегодня</p>
        </div>
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-sm border border-white/60">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-xl bg-blue-100 flex items-center justify-center">
              <Icon name="Percent" size={14} className="text-blue-600" />
            </div>
            <span className="text-xs font-medium text-gray-500">Посещаемость</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {Math.round((totalPresent / cls.students.length) * 100)}%
          </p>
          <p className="text-xs text-gray-400 mt-0.5">сегодня</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-white/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 min-w-[180px] sticky left-0 bg-white/90">Ученик</th>
                {recentDates.map(d => {
                  const { day, weekday } = formatDate(d);
                  return (
                    <th key={d} className="py-2 px-1 text-center min-w-[48px]">
                      <div className="text-[10px] text-gray-400 font-medium">{weekday}</div>
                      <div className="text-xs font-semibold text-gray-600">{day}</div>
                    </th>
                  );
                })}
                <th className="py-3 px-3 text-xs font-semibold text-gray-500 min-w-[80px] text-center">Пропуски</th>
                <th className="py-3 px-3 text-xs font-semibold text-gray-500 min-w-[80px] text-center">%</th>
              </tr>
            </thead>
            <tbody>
              {cls.students.map((student, idx) => {
                const s = stats.find(x => x.studentId === student.id)!;
                return (
                  <tr key={student.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                    <td className="py-2.5 px-4 sticky left-0 bg-white/90 group-hover:bg-gray-50/50">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs text-gray-300 w-4">{idx + 1}</span>
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-300 to-purple-400 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                          {student.avatar}
                        </div>
                        <span className="font-medium text-gray-700 whitespace-nowrap">{student.name}</span>
                      </div>
                    </td>
                    {recentDates.map(date => {
                      const entry = getEntry(student.id, date);
                      const present = entry?.present ?? true;
                      return (
                        <td key={date} className="py-2.5 px-1 text-center">
                          <button
                            onClick={() => togglePresent(student.id, date)}
                            className={`w-8 h-8 rounded-xl transition-all hover:scale-110 active:scale-95 mx-auto flex items-center justify-center ${
                              present
                                ? "bg-emerald-100 text-emerald-600"
                                : entry?.reason
                                ? "bg-blue-100 text-blue-600"
                                : "bg-red-100 text-red-500"
                            }`}
                          >
                            {present
                              ? <Icon name="Check" size={13} />
                              : entry?.reason
                              ? <Icon name="FileText" size={13} />
                              : <Icon name="X" size={13} />}
                          </button>
                        </td>
                      );
                    })}
                    <td className="py-2.5 px-3 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-6 rounded-lg text-xs font-bold ${
                        s.absences === 0 ? "text-gray-300" :
                        s.absences <= 2 ? "bg-amber-100 text-amber-600" : "bg-red-100 text-red-600"
                      }`}>
                        {s.absences === 0 ? "0" : s.absences}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center gap-1.5">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden min-w-[32px]">
                          <div
                            className={`h-full rounded-full ${s.rate >= 90 ? "bg-emerald-400" : s.rate >= 75 ? "bg-amber-400" : "bg-red-400"}`}
                            style={{ width: `${s.rate}%` }}
                          />
                        </div>
                        <span className={`text-xs font-semibold ${s.rate >= 90 ? "text-emerald-600" : s.rate >= 75 ? "text-amber-600" : "text-red-600"}`}>
                          {s.rate}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-400">
        <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-emerald-100 flex items-center justify-center"><Icon name="Check" size={10} className="text-emerald-600" /></div> Присутствует</div>
        <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-red-100 flex items-center justify-center"><Icon name="X" size={10} className="text-red-500" /></div> Отсутствует</div>
        <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-blue-100 flex items-center justify-center"><Icon name="FileText" size={10} className="text-blue-500" /></div> Уважительная причина</div>
      </div>
    </div>
  );
}
