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
