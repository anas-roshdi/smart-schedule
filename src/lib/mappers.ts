import { RegisteredCourse, OfferedSection, Session } from "../components/schedule/data";

export type ApiDay = "SUN" | "MON" | "TUE" | "WED" | "THU";
export type ApiSectionType = "THEORY" | "PRACTICAL";
export type ApiSectionMode = "ONSITE" | "REMOTE";
export type ApiSectionStatus = "OPEN" | "CLOSED";
export type ApiPreferredTime = "MORNING" | "EVENING" | "ANY";
export type ApiScheduleDensity = "COMPACT" | "RELAXED";

export interface ApiSession {
  id: string;
  day: ApiDay;
  startTime: string; // 'HH:mm'
  endTime: string;   // 'HH:mm'
}

export interface ApiSection {
  id: string;
  name: string;
  code: string;
  credits: number;
  section: string;
  type: ApiSectionType;
  mode: ApiSectionMode;
  status: ApiSectionStatus;
  instructor: string | null;
  room: string | null;
  sessions: ApiSession[];
  prerequisites?: string[];
}

export interface ApiSchedule {
  id: string;
  totalCredits: number;
  maxCredits: number;
  overCredits: boolean;
  sections: (ApiSection & { locked: boolean })[];
}

export interface ApiPreferences {
  preferredTime: ApiPreferredTime;
  offDays: ApiDay[];
  density: ApiScheduleDensity;
  maxBreakMinutes: number | null;
  maxCredits: number;
  blockedTimes: { id?: string; startTime: string; endTime: string }[];
}

export interface ApiSuggestion {
  id: string;
  score: number;
  perks: string[];
  totalCredits: number;
  changes: {
    added: string[];
    dropped: string[];
    swapped: string[];
  };
  prerequisiteWarnings: {
    courseCode: string;
    prerequisites: string[];
  }[];
  sections: (ApiSection & { locked: boolean })[];
}

export interface ApiSectionBody {
  name: string;
  code: string;
  credits: number;
  section: string;
  type: ApiSectionType;
  mode: ApiSectionMode;
  status?: ApiSectionStatus;
  instructor?: string;
  sessions: {
    day: ApiDay;
    startTime: string;
    endTime: string;
  }[];
  prerequisites?: string[];
}

export const PREFERRED_TIME_UI_TO_API: Record<string, ApiPreferredTime> = {
  "صباحي": "MORNING",
  "مسائي": "EVENING",
  "مرن": "ANY",
};

export const PREFERRED_TIME_API_TO_UI: Record<ApiPreferredTime, "صباحي" | "مسائي" | "مرن"> = {
  MORNING: "صباحي",
  EVENING: "مسائي",
  ANY: "مرن",
};

export const DENSITY_UI_TO_API: Record<string, ApiScheduleDensity> = {
  "مضغوط": "COMPACT",
  "مريح": "RELAXED",
};

export const DENSITY_API_TO_UI: Record<ApiScheduleDensity, "مضغوط" | "مريح"> = {
  COMPACT: "مضغوط",
  RELAXED: "مريح",
};

export const DAY_MAP_API_TO_UI: Record<ApiDay, string> = {
  SUN: "الأحد",
  MON: "الإثنين",
  TUE: "الثلاثاء",
  WED: "الأربعاء",
  THU: "الخميس",
};

export const DAY_MAP_UI_TO_API: Record<string, ApiDay> = {
  "الأحد": "SUN",
  "الإثنين": "MON",
  "الاثنين": "MON",
  "الثلاثاء": "TUE",
  "الأربعاء": "WED",
  "الاربعاء": "WED",
  "الخميس": "THU",
};

export function apiDayToUiDay(day: ApiDay): string {
  return DAY_MAP_API_TO_UI[day] || day;
}

export function uiDayToApiDay(day: string): ApiDay {
  const trimmed = day.trim();
  const mapped = DAY_MAP_UI_TO_API[trimmed];
  if (mapped) return mapped;
  if (trimmed === "SUN" || trimmed === "MON" || trimmed === "TUE" || trimmed === "WED" || trimmed === "THU") {
    return trimmed;
  }
  return "SUN";
}

export function toUiTime(apiTime: string): string {
  if (!apiTime) return "";
  const clean = apiTime.trim();
  const parts = clean.split(":");
  if (parts.length < 2) return apiTime;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return apiTime;

  let period = "ص";
  let h12 = h;
  if (h === 0) {
    h12 = 12;
    period = "ص";
  } else if (h === 12) {
    h12 = 12;
    period = "م";
  } else if (h > 12) {
    h12 = h - 12;
    period = "م";
  } else {
    period = "ص";
  }

  const hStr = String(h12).padStart(2, "0");
  const mStr = String(m).padStart(2, "0");
  return `${hStr}:${mStr} ${period}`;
}

export function toApiTime(uiTime: string): string {
  if (!uiTime) return "00:00";
  const clean = uiTime.trim();

  // If already in 24-hour format (e.g., "13:00", "08:30")
  if (/^\d{1,2}:\d{2}$/.test(clean)) {
    const [h, m] = clean.split(":").map(Number);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }

  // Matches "08:30 ص" or "01:00 م"
  const match = clean.match(/^(\d{1,2}):(\d{2})\s*(ص|م)$/);
  if (match) {
    let h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    const period = match[3];

    if (period === "ص") {
      if (h === 12) h = 0;
    } else if (period === "م") {
      if (h !== 12) h += 12;
    }
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }

  return clean;
}
export function toApiTimeLoose(input: string): string | null {
  if (!input) return null;
  const clean = input.trim();

  // 12-hour format with ص/م: e.g. "08:30 ص", "8:30 ص", "12:00 م", "01:00 م", "1:00 م"
  const match12 = clean.match(/^(\d{1,2}):(\d{2})\s*(ص|م)$/);
  if (match12) {
    let h = parseInt(match12[1], 10);
    const m = parseInt(match12[2], 10);
    const period = match12[3];
    if (h < 1 || h > 12 || m < 0 || m > 59) return null;
    if (period === "ص") {
      if (h === 12) h = 0;
    } else if (period === "م") {
      if (h !== 12) h += 12;
    }
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }

  // 24-hour format: e.g. "08:30", "8:30", "13:00", "00:00"
  const match24 = clean.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const h = parseInt(match24[1], 10);
    const m = parseInt(match24[2], 10);
    if (h < 0 || h > 23 || m < 0 || m > 59) return null;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }

  return null;
}

export function toUiTimeFrom24(value: string): string {
  return toUiTime(value);
}

export const COURSE_COLORS = [
  "bg-sky-500",
  "bg-emerald-500",
  "bg-indigo-500",
  "bg-purple-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-teal-500",
  "bg-blue-500",
  "bg-orange-500",
  "bg-cyan-500",
];

export interface CourseColorStyle {
  bg: string;
  border: string;
  text: string;
}

export const COURSE_COLOR_STYLES: CourseColorStyle[] = [
  { bg: "#eef2ff", border: "#c7d2fe", text: "#4338ca" }, // indigo
  { bg: "#fef3c7", border: "#fde68a", text: "#92400e" }, // amber
  { bg: "#dbeafe", border: "#93c5fd", text: "#1e40af" }, // blue
  { bg: "#d1fae5", border: "#6ee7b7", text: "#065f46" }, // emerald
  { bg: "#fce7f3", border: "#f9a8d4", text: "#9d174d" }, // pink
  { bg: "#f3e8ff", border: "#d8b4fe", text: "#6b21a8" }, // purple
  { bg: "#e0f2fe", border: "#bae6fd", text: "#0369a1" }, // sky
  { bg: "#ccfbf1", border: "#99f6e4", text: "#0f766e" }, // teal
  { bg: "#ffedd5", border: "#fed7aa", text: "#c2410c" }, // orange
  { bg: "#cffafe", border: "#a5f3fc", text: "#0e7490" }, // cyan
];

export const DEFAULT_COURSE_COLOR: CourseColorStyle = {
  bg: "#f1f5f9",
  border: "#cbd5e1",
  text: "#334155",
};

export function getCourseColor(code: string): CourseColorStyle {
  if (!code) return DEFAULT_COURSE_COLOR;
  const sum = code.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return COURSE_COLOR_STYLES[Math.abs(sum) % COURSE_COLOR_STYLES.length];
}

export function getCourseTailwindColor(code: string): string {
  const sum = (code || "").split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return COURSE_COLORS[Math.abs(sum) % COURSE_COLORS.length];
}

export function toOfferedSection(api: ApiSection): OfferedSection {
  return {
    id: api.id,
    name: api.name,
    code: api.code,
    credits: api.credits,
    section: api.section,
    status: api.status === "OPEN" ? "open" : "closed",
    type: api.type === "THEORY" ? "نظري" : "عملي",
    mode: api.mode === "ONSITE" ? "حضوري" : "عن بعد",
    instructor: api.instructor ?? "",
    sessions: (api.sessions || []).map((s) => ({
      id: s.id,
      day: apiDayToUiDay(s.day),
      startTime: toUiTime(s.startTime),
      endTime: toUiTime(s.endTime),
    })),
    prerequisites: api.prerequisites || [],
  };
}

export function toRegisteredCourse(api: ApiSection & { locked?: boolean }): RegisteredCourse {
  return {
    id: api.id,
    name: api.name,
    code: api.code,
    credits: api.credits,
    section: api.section,
    color: getCourseTailwindColor(api.code),
    type: api.type === "THEORY" ? "نظري" : "عملي",
    mode: api.mode === "ONSITE" ? "حضوري" : "عن بعد",
    instructor: api.instructor ?? "",
    sessions: (api.sessions || []).map((s) => ({
      id: s.id,
      day: apiDayToUiDay(s.day),
      startTime: toUiTime(s.startTime),
      endTime: toUiTime(s.endTime),
    })),
    locked: !!api.locked,
    prerequisites: api.prerequisites || [],
  };
}

export interface CourseEntry {
  id: string;
  code: string;
  time: string;
  name: string;
  section: string;
  type: string;
}

export interface DaySchedule {
  day: string;
  courses: CourseEntry[];
}

export interface Schedule {
  id: string;
  title: string;
  perk: string;
  days: DaySchedule[];
}

export const ALL_SCHEDULE_DAYS = [
  "يوم الأحد",
  "يوم الإثنين",
  "يوم الثلاثاء",
  "يوم الأربعاء",
  "يوم الخميس",
] as const;

export function toScheduleFromSections(
  title: string,
  id: string,
  perk: string,
  sections: (ApiSection & { locked?: boolean })[] | RegisteredCourse[]
): Schedule {
  const dayBuckets = new Map<string, CourseEntry[]>();
  for (const d of ALL_SCHEDULE_DAYS) {
    dayBuckets.set(d, []);
  }

  for (const sec of sections || []) {
    const secType =
      sec.type === "عملي" || sec.type === "PRACTICAL" ? "عملي" : "نظري";

    for (const sess of sec.sessions || []) {
      let dayName = "";
      if (sess.day.startsWith("يوم ")) {
        dayName = sess.day;
      } else {
        const uiDay = apiDayToUiDay(sess.day as ApiDay);
        dayName = `يوم ${uiDay}`;
      }

      if (!dayBuckets.has(dayName)) {
        continue;
      }

      const start24 = toApiTime(sess.startTime);
      const end24 = toApiTime(sess.endTime);

      const entry: CourseEntry = {
        id: `${sec.id}-${sess.id}`,
        code: sec.code,
        time: `${start24} - ${end24}`,
        name: sec.name,
        section: sec.section,
        type: secType,
      };

      dayBuckets.get(dayName)!.push(entry);
    }
  }

  const days: DaySchedule[] = [];
  for (const d of ALL_SCHEDULE_DAYS) {
    const list = dayBuckets.get(d)!;
    if (list.length > 0) {
      list.sort((a, b) => {
        const [aH, aM] = a.time.split("-")[0].trim().split(":").map(Number);
        const [bH, bM] = b.time.split("-")[0].trim().split(":").map(Number);
        return (aH * 60 + aM) - (bH * 60 + bM);
      });
      days.push({ day: d, courses: list });
    }
  }

  return {
    id,
    title,
    perk,
    days,
  };
}

export function perkLabel(perks: string[]): string {
  const map: Record<string, string> = {
    OFF_SUN: "✨ أوف يوم الأحد",
    OFF_MON: "✨ أوف يوم الإثنين",
    OFF_TUE: "✨ أوف يوم الثلاثاء",
    OFF_WED: "✨ أوف يوم الأربعاء",
    OFF_THU: "✨ أوف يوم الخميس",
    MORNING: "🌅 دوام صباحي",
    EVENING: "🌙 دوام مسائي",
    NO_LONG_BREAKS: "⚡ بدون بريكات طويلة",
    COMPACT: "📦 جدول مضغوط",
  };
  const labels = (perks || []).map((p) => map[p] || p).filter(Boolean);
  if (labels.length === 0) {
    return "جدول بديل مناسب لقيودك";
  }
  return labels.slice(0, 3).join(" • ");
}

export function toApiSectionBody(data: {
  name: string;
  code: string;
  credits: number;
  section: string;
  type: "نظري" | "عملي" | ApiSectionType;
  mode: "حضوري" | "عن بعد" | ApiSectionMode;
  status?: "open" | "closed" | ApiSectionStatus;
  instructor?: string | null;
  sessions: Session[] | ApiSession[];
  prerequisites?: string[];
}): ApiSectionBody {
  const trimmedInstructor = data.instructor ? data.instructor.trim() : "";
  const body: ApiSectionBody = {
    name: data.name.trim(),
    code: data.code.trim(),
    credits: Number(data.credits),
    section: data.section.trim(),
    type: data.type === "عملي" || data.type === "PRACTICAL" ? "PRACTICAL" : "THEORY",
    mode: data.mode === "عن بعد" || data.mode === "REMOTE" ? "REMOTE" : "ONSITE",
    sessions: (data.sessions || []).map((s) => ({
      day: uiDayToApiDay(s.day),
      startTime: toApiTime(s.startTime),
      endTime: toApiTime(s.endTime),
    })),
    prerequisites: Array.isArray(data.prerequisites) ? data.prerequisites : [],
  };

  if (trimmedInstructor.length > 0) {
    body.instructor = trimmedInstructor;
  }

  if (data.status !== undefined) {
    body.status = data.status === "closed" || data.status === "CLOSED" ? "CLOSED" : "OPEN";
  }

  return body;
}
