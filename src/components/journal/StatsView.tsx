import { useMemo } from "react";
import { classes, generateGrades, generateAttendance, getSubjectsForClass } from "@/data/schoolData";
import Icon from "@/components/ui/icon";

interface Props { classId: string; }

export default function StatsView({ classId }: Props) {
  const cls = classes.find(c => c.id === classId)!;
  const grades = useMemo(() => generateGrades(classId), [classId]);
  const attendance = useMemo(() => generateAttendance(classId), [classId]);
  const subjects = getSubjectsForClass(classId);

  const overallStats = useMemo(() => {
    const withGrade = grades.filter(g => g.grade !== null);
    if (!withGrade.length) return { avg: 0, excellent: 0, good: 0, satisf: 0, poor: 0 };
    const avg = withGrade.reduce((a, b) => a + (b.grade || 0), 0) / withGrade.length;
    const excellent = cls.students.filter(s => {
      const sg = withGrade.filter(g => g.studentId === s.id);
      if (!sg.length) return false;
      return sg.reduce((a, b) => a + (b.grade || 0), 0) / sg.length >= 4.5;
    }).length;
    const good = cls.students.filter(s => {
      const sg = withGrade.filter(g => g.studentId === s.id);
      if (!sg.length) return false;
      const a = sg.reduce((acc, b) => acc + (b.grade || 0), 0) / sg.length;
      return a >= 3.5 && a < 4.5;
    }).length;
    const satisf = cls.students.filter(s => {
      const sg = withGrade.filter(g => g.studentId === s.id);
      if (!sg.length) return false;
      const a = sg.reduce((acc, b) => acc + (b.grade || 0), 0) / sg.length;
      return a >= 2.5 && a < 3.5;
    }).length;
    const poor = cls.students.filter(s => {
      const sg = withGrade.filter(g => g.studentId === s.id);
      if (!sg.length) return false;
      return sg.reduce((acc, b) => acc + (b.grade || 0), 0) / sg.length < 2.5;
    }).length;
    return { avg, excellent, good, satisf, poor };
  }, [grades, cls]);

  const subjectStats = useMemo(() => {
    return subjects.map(s => {
      const sg = grades.filter(g => g.subjectId === s.id && g.grade !== null);
      const avg = sg.length ? sg.reduce((a, b) => a + (b.grade || 0), 0) / sg.length : 0;
      return { subject: s, avg, count: sg.length };
    }).sort((a, b) => b.avg - a.avg);
  }, [grades, subjects]);

  const topStudents = useMemo(() => {
    return cls.students.map(student => {
      const sg = grades.filter(g => g.studentId === student.id && g.grade !== null);
      const avg = sg.length ? sg.reduce((a, b) => a + (b.grade || 0), 0) / sg.length : 0;
      const absences = attendance.filter(a => a.studentId === student.id && !a.present).length;
      return { student, avg, absences };
    }).sort((a, b) => b.avg - a.avg).slice(0, 5);
  }, [grades, attendance, cls]);

  const attendanceRate = useMemo(() => {
    const present = attendance.filter(a => a.present).length;
    return Math.round((present / Math.max(attendance.length, 1)) * 100);
  }, [attendance]);

  const gradeDistribution = useMemo(() => {
    const withGrade = grades.filter(g => g.grade !== null);
    const total = withGrade.length;
    return [5,4,3,2].map(g => ({
      grade: g,
      count: withGrade.filter(x => x.grade === g).length,
      pct: total ? Math.round((withGrade.filter(x => x.grade === g).length / total) * 100) : 0
    }));
  }, [grades]);

  const gradeColors: Record<number, string> = {
    5: "bg-emerald-400",
    4: "bg-blue-400",
    3: "bg-amber-400",
    2: "bg-red-400",
  };

  return (
    <div className="space-y-4">
      {/* Top KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Средний балл", value: overallStats.avg.toFixed(2), icon: "TrendingUp", color: "from-blue-500 to-indigo-500", light: "bg-blue-50" },
          { label: "Посещаемость", value: `${attendanceRate}%`, icon: "CalendarCheck", color: "from-emerald-500 to-teal-500", light: "bg-emerald-50" },
          { label: "Отличников", value: overallStats.excellent, icon: "Star", color: "from-amber-400 to-orange-500", light: "bg-amber-50" },
          { label: "Всего учеников", value: cls.students.length, icon: "Users", color: "from-violet-500 to-purple-600", light: "bg-violet-50" },
        ].map(card => (
          <div key={card.label} className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-sm border border-white/60">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-3 shadow-md`}>
              <Icon name={card.icon} size={16} className="text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Grade distribution */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-sm border border-white/60">
          <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Icon name="PieChart" size={15} className="text-gray-400" />
            Распределение оценок
          </h3>
          <div className="space-y-3">
            {gradeDistribution.map(({ grade, count, pct }) => (
              <div key={grade} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold text-white ${
                  grade === 5 ? "bg-emerald-400" : grade === 4 ? "bg-blue-400" : grade === 3 ? "bg-amber-400" : "bg-red-400"
                }`}>{grade}</div>
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600 font-medium">{count} оценок</span>
                    <span className="text-gray-400">{pct}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${gradeColors[grade]}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
            {[
              { label: "Отличники", count: overallStats.excellent, color: "text-emerald-600 bg-emerald-50" },
              { label: "Хорошисты", count: overallStats.good, color: "text-blue-600 bg-blue-50" },
              { label: "Троечники", count: overallStats.satisf, color: "text-amber-600 bg-amber-50" },
              { label: "Двоечники", count: overallStats.poor, color: "text-red-600 bg-red-50" },
            ].map(item => (
              <div key={item.label} className={`rounded-xl px-3 py-2 ${item.color.split(" ")[1]}`}>
                <p className={`text-lg font-bold ${item.color.split(" ")[0]}`}>{item.count}</p>
                <p className="text-xs text-gray-500">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top students */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-sm border border-white/60">
          <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Icon name="Trophy" size={15} className="text-amber-400" />
            Лучшие ученики
          </h3>
          <div className="space-y-2.5">
            {topStudents.map((item, i) => (
              <div key={item.student.id} className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-sm font-bold ${
                  i === 0 ? "bg-amber-400 text-white" :
                  i === 1 ? "bg-gray-300 text-white" :
                  i === 2 ? "bg-orange-300 text-white" : "bg-gray-100 text-gray-500"
                }`}>{i + 1}</div>
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-300 to-purple-400 flex items-center justify-center text-white text-[10px] font-bold">
                  {item.student.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-700 truncate">{item.student.name}</p>
                  <p className="text-xs text-gray-400">{item.absences} пропусков</p>
                </div>
                <span className={`text-sm font-bold px-2.5 py-1 rounded-xl ${
                  item.avg >= 4.5 ? "bg-emerald-100 text-emerald-700" :
                  item.avg >= 3.5 ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
                }`}>
                  {item.avg.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Subject ratings */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-sm border border-white/60 lg:col-span-2">
          <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Icon name="BarChart3" size={15} className="text-gray-400" />
            Средний балл по предметам
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {subjectStats.map(({ subject, avg }) => (
              <div key={subject.id} className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Icon name={subject.icon} size={13} className="text-gray-400" />
                  <span className="text-xs text-gray-500 truncate">{subject.name}</span>
                </div>
                <div className="flex items-end gap-2">
                  <span className={`text-lg font-bold ${
                    avg >= 4.5 ? "text-emerald-600" : avg >= 3.5 ? "text-blue-600" : avg >= 2.5 ? "text-amber-600" : "text-red-600"
                  }`}>{avg.toFixed(1)}</span>
                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden mb-1">
                    <div className={`h-full rounded-full ${avg >= 4.5 ? "bg-emerald-400" : avg >= 3.5 ? "bg-blue-400" : avg >= 2.5 ? "bg-amber-400" : "bg-red-400"}`} style={{ width: `${(avg / 5) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
