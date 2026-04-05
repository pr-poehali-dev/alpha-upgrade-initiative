import { classes } from "@/data/schoolData";
import { ViewType } from "./SchoolJournal";
import Icon from "@/components/ui/icon";

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
  selectedClass: string;
  onSelectClass: (id: string) => void;
  view: ViewType;
  onSelectView: (v: ViewType) => void;
}

const navItems: { id: ViewType; label: string; icon: string }[] = [
  { id: "grades", label: "Оценки", icon: "BookOpen" },
  { id: "attendance", label: "Посещаемость", icon: "CalendarCheck" },
  { id: "schedule", label: "Расписание", icon: "Clock" },
  { id: "stats", label: "Статистика", icon: "BarChart2" },
  { id: "students", label: "Ученики", icon: "Users" },
];

const gradeGroups = [
  { label: "5 класс", ids: ["5А", "5Б", "5В"] },
  { label: "6 класс", ids: ["6А", "6Б"] },
  { label: "7 класс", ids: ["7А", "7Б"] },
  { label: "8 класс", ids: ["8А", "8Б"] },
  { label: "9 класс", ids: ["9А", "9Б"] },
  { label: "10 класс", ids: ["10А", "10Б"] },
  { label: "11 класс", ids: ["11А", "11Б"] },
];

export default function Sidebar({ open, onToggle, selectedClass, onSelectClass, view, onSelectView }: SidebarProps) {
  if (!open) return null;

  return (
    <aside className="w-64 h-full flex flex-col bg-white/70 backdrop-blur-2xl border-r border-white/60 shadow-xl flex-shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
            <Icon name="GraduationCap" size={16} className="text-white" />
          </div>
          <span className="font-bold text-gray-900 text-[15px]">ШкольЖур</span>
        </div>
        <button
          onClick={onToggle}
          className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors"
        >
          <Icon name="PanelLeftClose" size={16} />
        </button>
      </div>

      {/* Navigation */}
      <div className="px-3 mb-4">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-2 mb-1.5">Разделы</p>
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onSelectView(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-0.5 ${
              view === item.id
                ? "bg-blue-500 text-white shadow-md shadow-blue-200"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Icon name={item.icon} size={16} />
            {item.label}
          </button>
        ))}
      </div>

      <div className="w-[calc(100%-24px)] mx-auto h-px bg-gray-100 mb-3" />

      {/* Classes */}
      <div className="flex-1 overflow-auto px-3 pb-4">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">Классы</p>
        {gradeGroups.map(group => {
          const groupClasses = group.ids.filter(id => classes.find(c => c.id === id));
          if (groupClasses.length === 0) return null;
          return (
            <div key={group.label} className="mb-3">
              <p className="text-[11px] text-gray-400 px-2 mb-1 font-medium">{group.label}</p>
              {groupClasses.map(id => (
                <button
                  key={id}
                  onClick={() => onSelectClass(id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all mb-0.5 ${
                    selectedClass === id
                      ? "bg-indigo-50 text-indigo-700 font-semibold"
                      : "text-gray-600 hover:bg-gray-50 font-medium"
                  }`}
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold ${
                    selectedClass === id ? "bg-indigo-500 text-white" : "bg-gray-100 text-gray-500"
                  }`}>
                    {id[0]}
                  </div>
                  {id}
                  <span className="ml-auto text-[11px] text-gray-400">
                    {classes.find(c => c.id === id)?.students.length}
                  </span>
                </button>
              ))}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
            АД
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-800">Администратор</p>
            <p className="text-[11px] text-gray-400">Школа №47</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
