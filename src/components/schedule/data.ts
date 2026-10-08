export type Session = {
  id: string
  day: string
  startTime: string
  endTime: string
}

export type RegisteredCourse = {
  id: string
  name: string
  code: string
  credits: number
  section: string
  color: string
  type: "نظري" | "عملي"
  mode: "حضوري" | "عن بعد"
  instructor: string
  sessions: Session[]
  locked: boolean
}

export type OfferedSection = {
  id: string
  name: string
  code: string
  credits: number
  section: string
  status: "open" | "closed"
  type: "نظري" | "عملي"
  mode: "حضوري" | "عن بعد"
  instructor: string
  sessions: Session[]
}

export const registeredCourses: RegisteredCourse[] = [
  {
    id: "1",
    name: "مقدمة في البرمجة",
    code: "CS101",
    credits: 3,
    section: "شعبة 5",
    color: "bg-sky-500",
    type: "نظري",
    mode: "حضوري",
    instructor: "د. أحمد الشهري",
    locked: false,
    sessions: [
      { id: "s1", day: "الأحد", startTime: "08:00 ص", endTime: "09:30 ص" },
      { id: "s2", day: "الثلاثاء", startTime: "08:00 ص", endTime: "09:30 ص" },
    ],
  },
  {
    id: "2",
    name: "مقدمة في البرمجة",
    code: "CS101",
    credits: 3,
    section: "شعبة 5",
    color: "bg-sky-500",
    type: "عملي",
    mode: "حضوري",
    instructor: "أ. سعد اليوسف",
    locked: false,
    sessions: [
      { id: "s3", day: "الخميس", startTime: "10:00 ص", endTime: "11:50 ص" },
    ],
  },
  {
    id: "3",
    name: "التفاضل والتكامل (1)",
    code: "MATH105",
    credits: 4,
    section: "شعبة 1",
    color: "bg-emerald-500",
    type: "نظري",
    mode: "حضوري",
    instructor: "د. خالد السعيد",
    locked: false,
    sessions: [
      { id: "s4", day: "الأحد", startTime: "12:00 م", endTime: "12:50 م" },
      { id: "s5", day: "الثلاثاء", startTime: "12:00 م", endTime: "12:50 م" },
      { id: "s6", day: "الخميس", startTime: "12:00 م", endTime: "12:50 م" },
    ],
  }
]

export const offeredSections: OfferedSection[] = [
  {
    id: "1",
    name: "مقدمة في البرمجة",
    code: "CS101",
    credits: 3,
    section: "شعبة 5",
    status: "open",
    type: "نظري",
    mode: "حضوري",
    instructor: "د. أحمد الشهري",
    sessions: [
      { id: "s1", day: "الأحد", startTime: "08:00 ص", endTime: "09:30 ص" },
      { id: "s2", day: "الثلاثاء", startTime: "08:00 ص", endTime: "09:30 ص" },
    ],
  },
  {
    id: "2",
    name: "مقدمة في البرمجة",
    code: "CS101",
    credits: 3,
    section: "شعبة 5",
    status: "open",
    type: "عملي",
    mode: "حضوري",
    instructor: "أ. بندر العتيبي",
    sessions: [
      { id: "s3", day: "الخميس", startTime: "10:00 ص", endTime: "11:50 ص" },
    ],
  },
  {
    id: "3",
    name: "التصميم المنطقي",
    code: "CS210",
    credits: 3,
    section: "شعبة 2",
    status: "closed",
    type: "نظري",
    mode: "حضوري",
    instructor: "د. سارة القحطاني",
    sessions: [
      { id: "s4", day: "الاثنين", startTime: "10:00 ص", endTime: "11:30 ص" },
    ],
  },
]
