export type Grade = 2 | 3 | 4 | 5 | null;

export interface Student {
  id: number;
  name: string;
  avatar: string;
}

export interface Subject {
  id: string;
  name: string;
  teacher: string;
  icon: string;
}

export interface GradeEntry {
  studentId: number;
  subjectId: string;
  date: string;
  grade: Grade;
  comment?: string;
}

export interface AttendanceEntry {
  studentId: number;
  date: string;
  present: boolean;
  reason?: string;
}

export interface ClassInfo {
  id: string;
  name: string;
  teacher: string;
  students: Student[];
}

const firstNames = [
  "Александр","Дмитрий","Иван","Михаил","Никита","Артём","Андрей","Максим",
  "Кирилл","Егор","Алина","Виктория","Екатерина","Мария","Анастасия",
  "Дарья","Полина","Ксения","Юлия","Валерия","Тимур","Даниил","Роман",
  "Сергей","Денис","Ольга","Наталья","Светлана","Ирина","Татьяна"
];

const lastNames = [
  "Иванов","Петров","Сидоров","Кузнецов","Попов","Смирнов","Новиков",
  "Морозов","Козлов","Лебедев","Соколов","Волков","Захаров","Зайцев",
  "Павлов","Семёнов","Голубев","Виноградов","Богданов","Воробьёв",
  "Фёдоров","Михайлов","Беляев","Тарасов","Белов","Комаров","Орлов",
  "Киселёв","Макаров","Андреев"
];

function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function generateStudents(classId: string, count: number): Student[] {
  const students: Student[] = [];
  const seed = classId.charCodeAt(0) + classId.charCodeAt(1) * 100;
  for (let i = 0; i < count; i++) {
    const fnIdx = Math.floor(seededRandom(seed + i * 3) * firstNames.length);
    const lnIdx = Math.floor(seededRandom(seed + i * 3 + 1) * lastNames.length);
    students.push({
      id: seed * 100 + i,
      name: `${lastNames[lnIdx]} ${firstNames[fnIdx]}`,
      avatar: firstNames[fnIdx][0] + lastNames[lnIdx][0],
    });
  }
  return students;
}

const classCounts: Record<string, number> = {
  "5А": 18, "5Б": 17, "5В": 16,
  "6А": 19, "6Б": 18,
  "7А": 17, "7Б": 16,
  "8А": 20, "8Б": 15,
  "9А": 18, "9Б": 17,
  "10А": 16, "10Б": 15,
  "11А": 17, "11Б": 16,
};

export const classes: ClassInfo[] = Object.entries(classCounts).map(([name, count]) => ({
  id: name,
  name,
  teacher: getClassTeacher(name),
  students: generateStudents(name, count),
}));

function getClassTeacher(name: string): string {
  const teachers: Record<string, string> = {
    "5А": "Смирнова Елена Александровна",
    "5Б": "Петрова Ольга Николаевна",
    "5В": "Козлова Татьяна Ивановна",
    "6А": "Новикова Марина Сергеевна",
    "6Б": "Лебедева Анна Владимировна",
    "7А": "Захарова Наталья Петровна",
    "7Б": "Волкова Светлана Юрьевна",
    "8А": "Морозов Андрей Игоревич",
    "8Б": "Соколова Ирина Михайловна",
    "9А": "Попов Дмитрий Андреевич",
    "9Б": "Кузнецова Вера Николаевна",
    "10А": "Иванова Людмила Фёдоровна",
    "10Б": "Сидоров Алексей Владимирович",
    "11А": "Фёдорова Галина Петровна",
    "11Б": "Орлов Павел Андреевич",
  };
  return teachers[name] || "Классный руководитель";
}

export const subjects: Subject[] = [
  { id: "math", name: "Математика", teacher: "Петров Алексей Иванович", icon: "Calculator" },
  { id: "russian", name: "Русский язык", teacher: "Иванова Светлана Петровна", icon: "BookOpen" },
  { id: "literature", name: "Литература", teacher: "Сергеева Мария Владимировна", icon: "BookMarked" },
  { id: "history", name: "История", teacher: "Громов Николай Степанович", icon: "Landmark" },
  { id: "geography", name: "География", teacher: "Белова Тамара Ивановна", icon: "Globe" },
  { id: "biology", name: "Биология", teacher: "Орлова Надежда Сергеевна", icon: "Leaf" },
  { id: "chemistry", name: "Химия", teacher: "Кирилловна Анна Борисовна", icon: "FlaskConical" },
  { id: "physics", name: "Физика", teacher: "Захаров Сергей Михайлович", icon: "Atom" },
  { id: "english", name: "Английский язык", teacher: "Соловьёва Екатерина Алексеевна", icon: "Languages" },
  { id: "pe", name: "Физкультура", teacher: "Тарасов Виктор Николаевич", icon: "Dumbbell" },
  { id: "it", name: "Информатика", teacher: "Морозов Игорь Петрович", icon: "Monitor" },
  { id: "music", name: "Музыка", teacher: "Лазарева Ольга Борисовна", icon: "Music" },
  { id: "art", name: "ИЗО", teacher: "Крылова Юлия Анатольевна", icon: "Palette" },
  { id: "social", name: "Обществознание", teacher: "Павлова Лариса Ивановна", icon: "Users" },
];

const subjectsByGrade: Record<string, string[]> = {
  "5": ["math","russian","literature","history","geography","biology","english","pe","music","art"],
  "6": ["math","russian","literature","history","geography","biology","english","pe","music","art"],
  "7": ["math","russian","literature","history","geography","biology","chemistry","english","pe","it"],
  "8": ["math","russian","literature","history","geography","biology","chemistry","physics","english","pe","it","social"],
  "9": ["math","russian","literature","history","geography","biology","chemistry","physics","english","pe","it","social"],
  "10": ["math","russian","literature","history","geography","biology","chemistry","physics","english","pe","it","social"],
  "11": ["math","russian","literature","history","geography","biology","chemistry","physics","english","pe","it","social"],
};

export function getSubjectsForClass(classId: string): Subject[] {
  const grade = classId[0];
  const ids = subjectsByGrade[grade] || subjectsByGrade["5"];
  return subjects.filter(s => ids.includes(s.id));
}

const today = new Date(2026, 3, 5);
function getDates(count: number): string[] {
  const dates: string[] = [];
  const d = new Date(today);
  let added = 0;
  while (added < count) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) {
      dates.unshift(d.toISOString().split("T")[0]);
      added++;
    }
    d.setDate(d.getDate() - 1);
  }
  return dates;
}

export const recentDates = getDates(10);

const gradeValues: Grade[] = [2, 3, 4, 5, null, null, 5, 4, 3, 5, 4, null, 5, 3, 4, 5, null, 4, 3, 5];

export function generateGrades(classId: string): GradeEntry[] {
  const cls = classes.find(c => c.id === classId);
  if (!cls) return [];
  const subs = getSubjectsForClass(classId);
  const entries: GradeEntry[] = [];
  const seed = classId.charCodeAt(0) * 7 + classId.charCodeAt(1) * 13;
  cls.students.forEach((student, si) => {
    subs.forEach((subject, subj) => {
      recentDates.forEach((date, di) => {
        const idx = (seed + si * 17 + subj * 11 + di * 7) % gradeValues.length;
        const g = gradeValues[idx];
        if (g !== null) {
          entries.push({ studentId: student.id, subjectId: subject.id, date, grade: g });
        }
      });
    });
  });
  return entries;
}

export function generateAttendance(classId: string): AttendanceEntry[] {
  const cls = classes.find(c => c.id === classId);
  if (!cls) return [];
  const entries: AttendanceEntry[] = [];
  const seed = classId.charCodeAt(0) * 5 + classId.charCodeAt(1) * 9;
  cls.students.forEach((student, si) => {
    recentDates.forEach((date, di) => {
      const rand = seededRandom(seed + si * 31 + di * 13);
      const present = rand > 0.12;
      entries.push({
        studentId: student.id,
        date,
        present,
        reason: !present ? (rand < 0.05 ? "Болезнь" : rand < 0.09 ? "Уважительная причина" : undefined) : undefined,
      });
    });
  });
  return entries;
}

export const schedule: Record<string, Record<string, string[]>> = {
  "Понедельник": {
    "5А": ["Математика","Русский язык","Литература","Английский язык","История","Физкультура"],
    "default": ["Математика","Русский язык","Биология","Английский язык","История","Физкультура"],
  },
  "Вторник": {
    "default": ["Физика","Математика","Химия","Литература","Обществознание","Музыка"],
  },
  "Среда": {
    "default": ["Английский язык","Физкультура","Математика","Русский язык","Информатика","ИЗО"],
  },
  "Четверг": {
    "default": ["Биология","История","Математика","Физика","Английский язык","География"],
  },
  "Пятница": {
    "default": ["Русский язык","Литература","Химия","Математика","Обществознание","Физкультура"],
  },
};

export const dayNames = ["Понедельник","Вторник","Среда","Четверг","Пятница"];
