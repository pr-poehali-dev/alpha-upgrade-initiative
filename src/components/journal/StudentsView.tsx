import { useMemo, useState } from "react";
import { classes, generateGrades, generateAttendance } from "@/data/schoolData";
import Icon from "@/components/ui/icon";

interface Props { classId: string; }

export default function StudentsView({ classId }: Props) {
  const cls = classes.find(c => c.id === classId)!;
  const grades = useMemo(() => generateGrades(classId), [classId]);
  const attendance = useMemo(() => generateAttendance(classId), [classId]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number | null>(null);

  const studentStats = useMemo(() => {
    return cls.students.map(student => {
      const sg = grades.filter(g => g.studentId === student.id && g.grade !== null);
      const avg = sg.length ? sg.reduce((a, b) => a + (b.grade || 0), 0) / sg.length : 0;
      const absences = attendance.filter(a => a.studentId === student.id && !a.present).length;
      const attRate = Math.round((attendance.filter(a => a.studentId === student.id && a.present).length / Math.max(attendance.filter(a => a.studentId === student.id).length, 1)) * 100);
      const fiveCount = sg.filter(g => g.grade === 5).length;
      const twoCount = sg.filter(g => g.grade === 2).length;
      return { student, avg, absences, attRate, fiveCount, twoCount, totalGrades: sg.length };
    });
  }, [grades, attendance, cls]);

  const filtered = studentStats.filter(s => s.student.name.toLowerCase().includes(search.toLowerCase()));
  const selectedStats = selected !== null ? studentStats.find(s => s.student.id === selected) : null;

  const avatarColors = [
    "from-blue-400 to-indigo-500",
    "from-purple-400 to-pink-500",
    "from-emerald-400 to-teal-500",
    "from-orange-400 to-red-500",
    "from-amber-400 to-yellow-500",
    "from-cyan-400 to-blue-500",
  ];

  return (
    <div className="flex gap-4 h-full">
      {/* List */}
      <div className="flex-1 space-y-3 min-w-0">
        <div className="relative">
          <Icon name="Search" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск ученика..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 shadow-sm text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-200 transition-all"
          />
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-white/60 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">{filtered.length} учеников</span>
            <span className="text-xs text-gray-400">{cls.name} · {cls.teacher.split(" ")[0]}</span>
          </div>
          <div className="divide-y divide-gray-50">
            {filtered.map(({ student, avg, absences, attRate }, i) => {
              const colorIdx = i % avatarColors.length;
              return (
                <button
                  key={student.id}
                  onClick={() => setSelected(selected === student.id ? null : student.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50/40 transition-all text-left ${selected === student.id ? "bg-blue-50/60" : ""}`}
                >
                  <span className="text-xs text-gray-300 w-5 text-right flex-shrink-0">{i + 1}</span>
                  <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarColors[colorIdx]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm`}>
                    {student.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{student.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-gray-400">{absences} пропусков</span>
                      <span className="text-gray-200">·</span>
                      <span className="text-[11px] text-gray-400">{attRate}% посещ.</span>
                    </div>
                  </div>
                  <span className={`text-sm font-bold px-2.5 py-1 rounded-xl ${
                    avg >= 4.5 ? "bg-emerald-100 text-emerald-700" :
                    avg >= 3.5 ? "bg-blue-100 text-blue-700" :
                    avg >= 2.5 ? "bg-amber-100 text-amber-700" :
                    avg > 0 ? "bg-red-100 text-red-600" : "text-gray-300 text-xs"
                  }`}>
                    {avg > 0 ? avg.toFixed(1) : "—"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detail panel */}
      {selectedStats && (
        <div className="w-72 flex-shrink-0 space-y-3">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-xl font-bold`}>
                {selectedStats.student.avatar}
              </div>
              <button onClick={() => setSelected(null)} className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all">
                <Icon name="X" size={14} />
              </button>
            </div>
            <h3 className="font-bold text-lg leading-tight">{selectedStats.student.name}</h3>
            <p className="text-indigo-200 text-sm mt-0.5">{cls.name} класс</p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {[
              { label: "Средний балл", value: selectedStats.avg > 0 ? selectedStats.avg.toFixed(2) : "—", icon: "TrendingUp", color: "text-blue-600 bg-blue-50" },
              { label: "Посещаемость", value: `${selectedStats.attRate}%`, icon: "CalendarCheck", color: "text-emerald-600 bg-emerald-50" },
              { label: "Пятёрок", value: selectedStats.fiveCount, icon: "Star", color: "text-amber-600 bg-amber-50" },
              { label: "Пропусков", value: selectedStats.absences, icon: "AlertCircle", color: selectedStats.absences > 3 ? "text-red-600 bg-red-50" : "text-gray-600 bg-gray-50" },
            ].map(card => (
              <div key={card.label} className={`rounded-2xl p-3 ${card.color.split(" ")[1]}`}>
                <Icon name={card.icon} size={14} className={`${card.color.split(" ")[0]} mb-2`} />
                <p className={`text-lg font-bold ${card.color.split(" ")[0]}`}>{card.value}</p>
                <p className="text-xs text-gray-500">{card.label}</p>
              </div>
            ))}
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-sm border border-white/60">
            <h4 className="text-xs font-semibold text-gray-500 mb-3">Академический профиль</h4>
            <div className="space-y-2">
              {[
                { label: "Успеваемость", value: selectedStats.avg / 5, color: selectedStats.avg >= 4 ? "bg-emerald-400" : selectedStats.avg >= 3 ? "bg-amber-400" : "bg-red-400" },
                { label: "Посещаемость", value: selectedStats.attRate / 100, color: selectedStats.attRate >= 90 ? "bg-blue-400" : selectedStats.attRate >= 75 ? "bg-amber-400" : "bg-red-400" },
              ].map(bar => (
                <div key={bar.label}>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{bar.label}</span>
                    <span className="font-medium">{Math.round(bar.value * 100)}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${bar.color} transition-all`} style={{ width: `${bar.value * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-400">Всего оценок: <span className="font-semibold text-gray-600">{selectedStats.totalGrades}</span></p>
              {selectedStats.twoCount > 0 && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <Icon name="AlertTriangle" size={11} /> {selectedStats.twoCount} двоек — требует внимания
                </p>
              )}
              {selectedStats.avg >= 4.7 && (
                <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                  <Icon name="Award" size={11} /> Отличник класса
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
