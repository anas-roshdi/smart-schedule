import { RegisteredCourse, OfferedSection, Session } from "../components/schedule/data";

export type ApiDay = "SUN" | "MON" | "TUE" | "WED" | "THU";
export type ApiSectionType = "THEORY" | "PRACTICAL";
export type ApiSectionMode = "ONSITE" | "REMOTE";
export type ApiSectionStatus = "OPEN" | "CLOSED";

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
}

export interface ApiSchedule {
  id: string;
  totalCredits: number;
  maxCredits: number;
  overCredits: boolean;
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
}

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

export function getCourseColor(code: string): string {
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
  };
}

export function toRegisteredCourse(api: ApiSection & { locked?: boolean }): RegisteredCourse {
  return {
    id: api.id,
    name: api.name,
    code: api.code,
    credits: api.credits,
    section: api.section,
    color: getCourseColor(api.code),
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
  };
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
  };

  if (trimmedInstructor.length > 0) {
    body.instructor = trimmedInstructor;
  }

  if (data.status !== undefined) {
    body.status = data.status === "closed" || data.status === "CLOSED" ? "CLOSED" : "OPEN";
  }

  return body;
}
