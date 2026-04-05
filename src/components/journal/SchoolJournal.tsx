import { useState } from "react";
import Sidebar from "./Sidebar";
import GradesView from "./GradesView";
import AttendanceView from "./AttendanceView";
import ScheduleView from "./ScheduleView";
import StatsView from "./StatsView";
import StudentsView from "./StudentsView";
import { classes } from "@/data/schoolData";

export type ViewType = "grades" | "attendance" | "schedule" | "stats" | "students";

export default function SchoolJournal() {
  const [selectedClass, setSelectedClass] = useState(classes[0].id);
  const [view, setView] = useState<ViewType>("grades");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const cls = classes.find(c => c.id === selectedClass)!;

  return (
    <div className="flex h-screen bg-[#F2F2F7] font-sans overflow-hidden">
      <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        selectedClass={selectedClass}
        onSelectClass={setSelectedClass}
        view={view}
        onSelectView={setView}
      />

      <main className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarOpen ? "ml-0" : "ml-0"}`}>
        {/* Top bar */}
        <div className="flex items-center gap-3 px-6 pt-6 pb-4">
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-9 h-9 rounded-xl bg-white/80 backdrop-blur-xl shadow-sm flex items-center justify-center text-gray-600 hover:bg-white transition-all"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              {view === "grades" && "Журнал оценок"}
              {view === "attendance" && "Посещаемость"}
              {view === "schedule" && "Расписание"}
              {view === "stats" && "Статистика"}
              {view === "students" && "Ученики"}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {cls.name} · {cls.teacher.split(" ")[0]} {cls.teacher.split(" ")[1]}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-auto px-6 pb-6">
          {view === "grades" && <GradesView classId={selectedClass} />}
          {view === "attendance" && <AttendanceView classId={selectedClass} />}
          {view === "schedule" && <ScheduleView classId={selectedClass} />}
          {view === "stats" && <StatsView classId={selectedClass} />}
          {view === "students" && <StudentsView classId={selectedClass} />}
        </div>
      </main>
    </div>
  );
}
