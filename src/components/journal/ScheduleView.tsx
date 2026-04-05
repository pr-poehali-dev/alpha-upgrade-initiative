import { getSubjectsForClass, dayNames } from "@/data/schoolData";
import Icon from "@/components/ui/icon";

interface Props { classId: string; }

const lessonTimes = [
  "8:00 – 8:45",
  "8:55 – 9:40",
  "9:55 – 10:40",
  "10:55 – 11:40",
  "12:10 – 12:55",
  "13:05 – 13:50",
  "14:00 – 14:45",
];

const subjectColors: Record<string, string> = {
  "Математика": "bg-blue-100 text-blue-700 border-blue-200",
  "Русский язык": "bg-violet-100 text-violet-700 border-violet-200",
  "Литература": "bg-pink-100 text-pink-700 border-pink-200",
  "Физика": "bg-orange-100 text-orange-700 border-orange-200",
  "Химия": "bg-green-100 text-green-700 border-green-200",
  "Биология": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "История": "bg-amber-100 text-amber-700 border-amber-200",
  "География": "bg-teal-100 text-teal-700 border-teal-200",
  "Английский язык": "bg-sky-100 text-sky-700 border-sky-200",
  "Физкультура": "bg-red-100 text-red-700 border-red-200",
  "Информатика": "bg-indigo-100 text-indigo-700 border-indigo-200",
  "Музыка": "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200",
  "ИЗО": "bg-rose-100 text-rose-700 border-rose-200",
  "Обществознание": "bg-cyan-100 text-cyan-700 border-cyan-200",
};

function getColor(name: string) {
  return subjectColors[name] || "bg-gray-100 text-gray-700 border-gray-200";
}

function generateSchedule(classId: string, subjects: { name: string; icon: string }[]) {
  const seed = classId.charCodeAt(0) * 3 + classId.charCodeAt(1) * 7;
  const result: Record<string, string[]> = {};
  dayNames.forEach((day, di) => {
    const dayLessons: string[] = [];
    const count = 5 + ((seed + di * 3) % 3);
    for (let i = 0; i < count; i++) {
      const idx = (seed + di * 11 + i * 7) % subjects.length;
      dayLessons.push(subjects[idx].name);
    }
    result[day] = dayLessons;
  });
  return result;
}

const today = new Date(2026, 3, 5);
const todayDayIndex = today.getDay() === 0 ? 4 : today.getDay() === 6 ? 4 : today.getDay() - 1;

export default function ScheduleView({ classId }: Props) {
  const subjects = getSubjectsForClass(classId);
  const schedule = generateSchedule(classId, subjects);

  return (
    <div className="space-y-4">
      {/* Today highlight */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-5 text-white shadow-lg shadow-blue-200">
        <div className="flex items-center gap-2 mb-3">
          <Icon name="CalendarDays" size={16} className="text-blue-200" />
          <span className="text-sm font-medium text-blue-100">Сегодня · {dayNames[todayDayIndex]}, 5 апреля</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {schedule[dayNames[todayDayIndex]]?.map((lesson, i) => (
            <div key={i} className="bg-white/15 rounded-xl px-3 py-2.5 backdrop-blur-sm">
              <div className="text-[11px] text-blue-200 mb-0.5">{lessonTimes[i] || ""}</div>
              <div className="text-sm font-semibold">{i + 1}. {lesson}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Full week */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {dayNames.map((day, di) => (
          <div
            key={day}
            className={`bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-sm border transition-all ${
              di === todayDayIndex ? "border-blue-200 ring-2 ring-blue-100" : "border-white/60"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`text-sm font-bold ${di === todayDayIndex ? "text-blue-600" : "text-gray-700"}`}>{day}</span>
              {di === todayDayIndex && (
                <span className="text-[10px] bg-blue-100 text-blue-600 rounded-full px-2 py-0.5 font-semibold">Сегодня</span>
              )}
            </div>
            <div className="space-y-1.5">
              {schedule[day]?.map((lesson, i) => {
                const subject = subjects.find(s => s.name === lesson);
                return (
                  <div key={i} className={`rounded-xl px-3 py-2 border text-xs font-medium ${getColor(lesson)}`}>
                    <div className="flex items-center gap-2">
                      <span className="opacity-60 text-[11px]">{i + 1}</span>
                      {subject && <Icon name={subject.icon} size={11} />}
                      <span>{lesson}</span>
                    </div>
                    <div className="mt-0.5 opacity-50 text-[10px]">{lessonTimes[i]}</div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
