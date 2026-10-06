import * as ScreenOrientation from "expo-screen-orientation"
import {
  ArrowLeftRight,
  CheckCircle2,
  LayoutGrid,
  List,
  Maximize,
  Minimize,
  MinusCircle,
  X,
  XCircle,
} from "lucide-react-native"
import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Modal,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { COLORS } from "./colors"

// ─── Types ───────────────────────────────────────────────────────────────────

type ViewMode = "agenda" | "grid"
type ScheduleId = "original" | "prop1" | "prop2"
type ActionType = "keep" | "add" | "delete" | "change"

interface CourseEntry {
  id: string
  /** e.g. "CS101" — used for matching across schedules */
  code: string
  time: string
  name: string
  section: string
  /** "نظري" | "عملي" */
  type: string
}

interface DaySchedule {
  day: string
  courses: CourseEntry[]
}

interface Schedule {
  id: string
  title: string
  perk: string
  days: DaySchedule[]
}

interface ActionStep {
  type: ActionType
  message: string
}

// ─── Dummy Data ──────────────────────────────────────────────────────────────

const ALL_DAYS = ["يوم الأحد", "يوم الإثنين", "يوم الثلاثاء", "يوم الأربعاء", "يوم الخميس"]

const ORIGINAL_SCHEDULE: Schedule = {
  id: "original",
  title: "الجدول الأصلي",
  perk: "📋 الجدول الحالي بدون تعديل",
  days: [
    {
      day: "يوم الأحد",
      courses: [
        { id: "o1", code: "CS101", time: "08:00 - 08:50", name: "مقدمة في البرمجة", section: "شعبة 3", type: "نظري" },
        { id: "o2", code: "MATH201", time: "10:00 - 10:50", name: "تفاضل وتكامل 1", section: "شعبة 1", type: "نظري" },
        { id: "o3", code: "PHYS101", time: "12:00 - 12:50", name: "فيزياء عامة", section: "شعبة 2", type: "نظري" },
      ],
    },
    {
      day: "يوم الإثنين",
      courses: [
        { id: "o4", code: "CS101", time: "09:00 - 11:50", name: "مقدمة في البرمجة", section: "شعبة 3", type: "عملي" },
        { id: "o5", code: "IC102", time: "12:00 - 12:50", name: "الثقافة الإسلامية", section: "شعبة 4", type: "نظري" },
      ],
    },
    {
      day: "يوم الثلاثاء",
      courses: [
        { id: "o6", code: "CS101", time: "08:00 - 08:50", name: "مقدمة في البرمجة", section: "شعبة 3", type: "نظري" },
        { id: "o7", code: "MATH201", time: "10:00 - 10:50", name: "تفاضل وتكامل 1", section: "شعبة 1", type: "نظري" },
        { id: "o8", code: "ENG101", time: "13:00 - 13:50", name: "لغة إنجليزية", section: "شعبة 6", type: "نظري" },
      ],
    },
    {
      day: "يوم الأربعاء",
      courses: [
        { id: "o9", code: "PHYS101", time: "09:00 - 11:50", name: "فيزياء عامة", section: "شعبة 2", type: "عملي" },
        { id: "o10", code: "MATH201", time: "12:00 - 12:50", name: "تفاضل وتكامل 1", section: "شعبة 1", type: "نظري" },
      ],
    },
    {
      day: "يوم الخميس",
      courses: [
        { id: "o11", code: "ENG101", time: "08:00 - 08:50", name: "لغة إنجليزية", section: "شعبة 6", type: "نظري" },
        { id: "o12", code: "IC102", time: "10:00 - 10:50", name: "الثقافة الإسلامية", section: "شعبة 4", type: "نظري" },
      ],
    },
  ],
}

const PROP1_SCHEDULE: Schedule = {
  id: "prop1",
  title: "مقترح 1 (95%)",
  perk: "✨ أوف يوم الخميس",
  days: [
    {
      day: "يوم الأحد",
      courses: [
        // CS101 changed from شعبة 3 → شعبة 5 (trigger blue "change")
        { id: "p1", code: "CS101", time: "08:00 - 08:50", name: "مقدمة في البرمجة", section: "شعبة 5", type: "نظري" },
        // MATH201 changed from شعبة 1 → شعبة 7 (trigger blue "change")
        { id: "p2", code: "MATH201", time: "09:00 - 09:50", name: "تفاضل وتكامل 1", section: "شعبة 7", type: "نظري" },
        { id: "p3", code: "PHYS101", time: "11:00 - 11:50", name: "فيزياء عامة", section: "شعبة 2", type: "نظري" },
      ],
    },
    {
      day: "يوم الإثنين",
      courses: [
        { id: "p4", code: "CS101", time: "09:00 - 11:50", name: "مقدمة في البرمجة", section: "شعبة 5", type: "عملي" },
        { id: "p5", code: "IC102", time: "12:00 - 12:50", name: "الثقافة الإسلامية", section: "شعبة 4", type: "نظري" },
      ],
    },
    {
      day: "يوم الثلاثاء",
      courses: [
        { id: "p6", code: "CS101", time: "08:00 - 08:50", name: "مقدمة في البرمجة", section: "شعبة 5", type: "نظري" },
        { id: "p7", code: "MATH201", time: "09:00 - 09:50", name: "تفاضل وتكامل 1", section: "شعبة 7", type: "نظري" },
        // New course added (trigger green "add")
        { id: "p8", code: "STAT201", time: "12:00 - 12:50", name: "مبادئ الإحصاء", section: "شعبة 1", type: "نظري" },
      ],
    },
    {
      day: "يوم الأربعاء",
      courses: [
        { id: "p9", code: "PHYS101", time: "09:00 - 11:50", name: "فيزياء عامة", section: "شعبة 2", type: "عملي" },
        { id: "p10", code: "MATH201", time: "12:00 - 12:50", name: "تفاضل وتكامل 1", section: "شعبة 7", type: "نظري" },
      ],
    },
    // Thursday is FREE — hence the perk "أوف يوم الخميس"
    // ENG101 dropped entirely (trigger red "delete")
  ],
}

const PROP2_SCHEDULE: Schedule = {
  id: "prop2",
  title: "مقترح 2 (80%)",
  perk: "⚡ بدون بريكات طويلة",
  days: [
    {
      day: "يوم الأحد",
      courses: [
        { id: "q1", code: "CS101", time: "08:00 - 08:50", name: "مقدمة في البرمجة", section: "شعبة 3", type: "نظري" },
        { id: "q2", code: "MATH201", time: "09:00 - 09:50", name: "تفاضل وتكامل 1", section: "شعبة 1", type: "نظري" },
        { id: "q3", code: "PHYS101", time: "10:00 - 10:50", name: "فيزياء عامة", section: "شعبة 2", type: "نظري" },
      ],
    },
    {
      day: "يوم الإثنين",
      courses: [
        { id: "q4", code: "CS101", time: "08:00 - 10:50", name: "مقدمة في البرمجة", section: "شعبة 3", type: "عملي" },
        { id: "q5", code: "IC102", time: "11:00 - 11:50", name: "الثقافة الإسلامية", section: "شعبة 4", type: "نظري" },
        { id: "q6", code: "ENG101", time: "12:00 - 12:50", name: "لغة إنجليزية", section: "شعبة 6", type: "نظري" },
      ],
    },
    {
      day: "يوم الثلاثاء",
      courses: [
        { id: "q7", code: "CS101", time: "08:00 - 08:50", name: "مقدمة في البرمجة", section: "شعبة 3", type: "نظري" },
        { id: "q8", code: "MATH201", time: "09:00 - 09:50", name: "تفاضل وتكامل 1", section: "شعبة 1", type: "نظري" },
        // ENG101 changed from شعبة 6 → شعبة 2 (trigger blue "change")
        { id: "q9", code: "ENG101", time: "10:00 - 10:50", name: "لغة إنجليزية", section: "شعبة 2", type: "نظري" },
      ],
    },
    {
      day: "يوم الأربعاء",
      courses: [
        { id: "q10", code: "PHYS101", time: "08:00 - 10:50", name: "فيزياء عامة", section: "شعبة 2", type: "عملي" },
        { id: "q11", code: "MATH201", time: "11:00 - 11:50", name: "تفاضل وتكامل 1", section: "شعبة 1", type: "نظري" },
      ],
    },
    {
      day: "يوم الخميس",
      courses: [
        { id: "q12", code: "IC102", time: "08:00 - 08:50", name: "الثقافة الإسلامية", section: "شعبة 4", type: "نظري" },
      ],
    },
  ],
}

const SCHEDULES: Schedule[] = [ORIGINAL_SCHEDULE, PROP1_SCHEDULE, PROP2_SCHEDULE]

// ─── Action Plan Diffing ─────────────────────────────────────────────────────

/** Build a unique key per course occurrence: code + type */
function courseKey(c: CourseEntry) {
  return `${c.code}::${c.type}`
}

function buildActionPlan(original: Schedule, proposed: Schedule): ActionStep[] {
  // Flatten all courses from all days, deduplicate by courseKey (take first occurrence)
  const flatten = (s: Schedule) => {
    const map = new Map<string, CourseEntry>()
    for (const day of s.days) {
      for (const c of day.courses) {
        const k = courseKey(c)
        if (!map.has(k)) map.set(k, c)
      }
    }
    return map
  }

  const origMap = flatten(original)
  const propMap = flatten(proposed)

  const steps: ActionStep[] = []

  // Walk original courses
  for (const [key, origCourse] of origMap) {
    const propCourse = propMap.get(key)
    if (!propCourse) {
      // RED — deleted
      steps.push({
        type: "delete",
        message: `حذف: ${origCourse.name} (${origCourse.type}) - ${origCourse.section}`,
      })
    } else if (origCourse.section !== propCourse.section) {
      // BLUE — changed section
      steps.push({
        type: "change",
        message: `تغيير: ${origCourse.name} (${origCourse.type}) من ${origCourse.section} إلى ${propCourse.section}`,
      })
    } else {
      // GRAY — kept
      steps.push({
        type: "keep",
        message: `الاحتفاظ: ${origCourse.name} (${origCourse.type}) - ${origCourse.section}`,
      })
    }
  }

  // Walk proposed courses for additions
  for (const [key, propCourse] of propMap) {
    if (!origMap.has(key)) {
      // GREEN — added
      steps.push({
        type: "add",
        message: `إضافة: ${propCourse.name} (${propCourse.type}) - ${propCourse.section}`,
      })
    }
  }

  // Sort: delete → change → add → keep
  const order: Record<ActionType, number> = { delete: 0, change: 1, add: 2, keep: 3 }
  steps.sort((a, b) => order[a.type] - order[b.type])

  return steps
}

// ─── Grid Constants ──────────────────────────────────────────────────────────

const GRID_COL_MIN_W = 140
const HOUR_HEIGHT = 80
const TIME_AXIS_WIDTH = 50

// ─── Time helpers ────────────────────────────────────────────────────────────

/** Parse a time string to fractional hours, e.g. "08:30" → 8.5 */
function parseTime(t: string): number {
  const [h, m] = t.trim().split(":").map(Number)
  return h + m / 60
}

/** Parse "08:00 - 08:50" → { startH (fractional), endH (fractional) } */
function parseTimeRange(timeStr: string): { startH: number; endH: number } {
  const parts = timeStr.split("-").map((s) => s.trim())
  return { startH: parseTime(parts[0]), endH: parseTime(parts[1]) }
}

/**
 * Dynamic grid bounds: scan *all* courses in the schedule,
 * find earliest start (floor to hour) and latest end (ceil to hour).
 * Falls back to 8–16 if no courses exist.
 */
function getScheduleBounds(schedule: Schedule): { startHour: number; endHour: number } {
  let earliest = 24
  let latest = 0

  for (const day of schedule.days) {
    for (const course of day.courses) {
      const { startH, endH } = parseTimeRange(course.time)
      if (startH < earliest) earliest = startH
      if (endH > latest) latest = endH
    }
  }

  if (earliest >= latest) {
    // No courses at all — fallback
    return { startHour: 8, endHour: 16 }
  }

  return {
    startHour: Math.floor(earliest),
    endHour: Math.ceil(latest),
  }
}

/** Calculate { top, height } for a course block given dynamic grid start */
function calculateBlockLayout(
  timeStr: string,
  gridStartHour: number,
): { top: number; height: number } {
  const { startH, endH } = parseTimeRange(timeStr)

  const startOffset = startH - gridStartHour
  const endOffset = endH - gridStartHour

  return {
    top: startOffset * HOUR_HEIGHT,
    height: Math.max((endOffset - startOffset) * HOUR_HEIGHT, 28), // min 28px
  }
}

/** Build time labels for the axis from startHour to endHour (inclusive) */
function buildTimeLabels(startHour: number, endHour: number): string[] {
  const labels: string[] = []
  for (let h = startHour; h <= endHour; h++) {
    labels.push(`${h.toString().padStart(2, "0")}:00`)
  }
  return labels
}

/**
 * Find gaps ("breaks") between sorted courses in a single day.
 * Returns array of { top, height } for each gap.
 */
function findBreaks(
  courses: CourseEntry[],
  gridStartHour: number,
): { top: number; height: number }[] {
  if (courses.length < 2) return []

  // Sort by start time
  const sorted = [...courses].sort((a, b) => {
    return parseTimeRange(a.time).startH - parseTimeRange(b.time).startH
  })

  const breaks: { top: number; height: number }[] = []

  for (let i = 0; i < sorted.length - 1; i++) {
    const currentEnd = parseTimeRange(sorted[i].time).endH
    const nextStart = parseTimeRange(sorted[i + 1].time).startH
    const gapHours = nextStart - currentEnd

    // Only render break cards for gaps >= 30 minutes (0.5 hours)
    if (gapHours >= 0.5) {
      const gapStartOffset = currentEnd - gridStartHour
      const gapEndOffset = nextStart - gridStartHour
      const top = gapStartOffset * HOUR_HEIGHT
      const height = (gapEndOffset - gapStartOffset) * HOUR_HEIGHT
      if (height > 0) {
        breaks.push({ top, height })
      }
    }
  }

  return breaks
}

// ─── Color mapping for grid course blocks ────────────────────────────────────

const COURSE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  CS101: { bg: "#eef2ff", border: "#c7d2fe", text: "#4338ca" },
  MATH201: { bg: "#fef3c7", border: "#fde68a", text: "#92400e" },
  PHYS101: { bg: "#dbeafe", border: "#93c5fd", text: "#1e40af" },
  IC102: { bg: "#d1fae5", border: "#6ee7b7", text: "#065f46" },
  ENG101: { bg: "#fce7f3", border: "#f9a8d4", text: "#9d174d" },
  STAT201: { bg: "#f3e8ff", border: "#d8b4fe", text: "#6b21a8" },
}

const DEFAULT_COURSE_COLOR = { bg: "#f1f5f9", border: "#cbd5e1", text: "#334155" }

// ─── Component ───────────────────────────────────────────────────────────────

export function SchedulesView() {
  const [activeTab, setActiveTab] = useState<ScheduleId>("original")
  const [viewMode, setViewMode] = useState<ViewMode>("agenda")
  const [modalVisible, setModalVisible] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)

  const currentSchedule = SCHEDULES.find((s) => s.id === activeTab)!

  const actionPlan = useMemo(() => {
    if (activeTab === "original") {
      // For original, show all as "keep"
      return buildActionPlan(ORIGINAL_SCHEDULE, ORIGINAL_SCHEDULE)
    }
    const proposed = SCHEDULES.find((s) => s.id === activeTab)!
    return buildActionPlan(ORIGINAL_SCHEDULE, proposed)
  }, [activeTab])

  // ── Full-screen orientation handling ──
  const toggleFullScreen = useCallback(async () => {
    if (isFullScreen) {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP)
      setIsFullScreen(false)
    } else {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE)
      setIsFullScreen(true)
    }
  }, [isFullScreen])

  // Cleanup: restore portrait on unmount
  useEffect(() => {
    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP)
    }
  }, [])

  return (
    <View className="flex-1">
      {/* ── Top Navigation – Pill Tabs ── */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
        {SCHEDULES.map((schedule) => {
          const isActive = activeTab === schedule.id
          return (
            <TouchableOpacity
              key={schedule.id}
              onPress={() => setActiveTab(schedule.id as ScheduleId)}
              className={`mr-3 rounded-full px-5 py-2 ${isActive ? "bg-indigo-600" : "bg-white border border-slate-200"
                }`}
            >
              <Text
                style={{ textAlign: "left" }}
                className={`pb-1 font-bold ${isActive ? "text-white" : "text-slate-600"}`}
              >
                {schedule.title}
              </Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>

      {/* ── Highlight Badge ── */}
      <View className="mb-4 self-start rounded-lg bg-amber-100 px-3 py-1.5 flex-row items-center">
        <Text style={{ textAlign: "left" }} className="pb-1 text-sm font-bold text-amber-800">
          {currentSchedule.perk}
        </Text>
      </View>

      {/* ── View Toggle + Full Screen ── */}
      <View className="mb-4 flex-row items-center justify-end">
        {/* Full-screen button (only when grid mode is active) */}
        {viewMode === "grid" && (
          <TouchableOpacity
            onPress={toggleFullScreen}
            className="mr-3 flex-row items-center rounded-lg bg-slate-100 px-3 py-2"
          >
            <Maximize size={16} color={COLORS.slate700} />
            <Text style={{ textAlign: "left" }} className="mr-1.5 pb-0.5 text-xs font-bold text-slate-700">
              تكبير الشاشة
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => setViewMode("agenda")}
          className={`mr-2 rounded-lg p-2 ${viewMode === "agenda" ? "bg-indigo-100" : "bg-white border border-slate-200"
            }`}
        >
          <List size={20} color={viewMode === "agenda" ? COLORS.indigo600 : COLORS.slate400} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setViewMode("grid")}
          className={`rounded-lg p-2 ${viewMode === "grid" ? "bg-indigo-100" : "bg-white border border-slate-200"
            }`}
        >
          <LayoutGrid size={20} color={viewMode === "grid" ? COLORS.indigo600 : COLORS.slate400} />
        </TouchableOpacity>
      </View>

      {/* ── Schedule Content ── */}
      {viewMode === "agenda" ? (
        <AgendaView schedule={currentSchedule} />
      ) : (
        <GridView schedule={currentSchedule} />
      )}

      {/* ── Action Plan Button (hidden for original schedule) ── */}
      {activeTab !== "original" && (
        <View className="mt-4 pb-4">
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            className="rounded-2xl bg-slate-900 py-4 items-center justify-center shadow-sm"
          >
            <Text style={{ textAlign: "left" }} className="pb-1 text-base font-bold text-white">
              أرني خريطة التنفيذ
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Action Plan Modal ── */}
      <ActionPlanModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        steps={actionPlan}
        scheduleTitle={currentSchedule.title}
      />

      {/* ── Full-Screen Grid Modal ── */}
      <Modal
        visible={isFullScreen}
        animationType="fade"
        supportedOrientations={["landscape"]}
        onRequestClose={toggleFullScreen}
      >
        <View className="flex-1 bg-white">
          <StatusBar hidden />
          {/* Compact header bar */}
          <View
            className="flex-row items-center justify-between px-4 py-2"
            style={{ backgroundColor: "#f8fafc" }}
          >
            <Text style={{ textAlign: "left" }} className="pb-1 text-base font-extrabold text-slate-800">
              {currentSchedule.title}
            </Text>
            <TouchableOpacity
              onPress={toggleFullScreen}
              className="flex-row items-center rounded-xl bg-slate-900 px-4 py-2"
            >
              <Minimize size={16} color="#fff" />
              <Text style={{ textAlign: "left" }} className="mr-2 pb-1 text-sm font-bold text-white">
                تصغير
              </Text>
            </TouchableOpacity>
          </View>
          <GridView schedule={currentSchedule} />
        </View>
      </Modal>
    </View>
  )
}

// ─── Agenda View ─────────────────────────────────────────────────────────────

function AgendaView({ schedule }: { schedule: Schedule }) {
  return (
    <View className="flex-1">
      {schedule.days.map((dayData, index) => (
        <View key={index} className="mb-6">
          {/* Day Header */}
          <View className="mb-3 flex-row items-center">
            <View className="mr-3 h-8 w-1 rounded-full bg-indigo-500" />
            <Text style={{ textAlign: "left" }} className="pb-1 text-lg font-extrabold text-slate-800">
              {dayData.day}
            </Text>
            <View className="ml-3 rounded-full bg-slate-100 px-2 py-0.5">
              <Text className="text-xs font-bold text-slate-400">{dayData.courses.length}</Text>
            </View>
          </View>

          {/* Course Cards */}
          {dayData.courses.map((course) => {
            const colors = COURSE_COLORS[course.code] ?? DEFAULT_COURSE_COLOR
            return (
              <View
                key={course.id}
                className="mb-3 flex-row items-center rounded-2xl bg-white p-4"
                style={{ borderLeftWidth: 3, borderLeftColor: colors.border }}
              >
                {/* Time column */}
                <View className="ml-4 items-center justify-center" style={{ minWidth: 80 }}>
                  <Text
                    style={{ textAlign: "left", writingDirection: "ltr" }}
                    className="text-xs font-bold text-indigo-600"
                  >
                    {course.time}
                  </Text>
                </View>
                {/* Info column */}
                <View className="flex-1">
                  <Text style={{ textAlign: "left" }} className="pb-1 text-base font-bold text-slate-900">
                    {course.name}
                  </Text>
                  <View className="mt-1 flex-row items-center">
                    <Text style={{ textAlign: "left" }} className="pb-1 text-sm text-slate-500 mr-2">
                      {course.section}
                    </Text>
                    <View
                      className="rounded px-1.5 py-0.5"
                      style={{ backgroundColor: colors.bg }}
                    >
                      {/* ✅ Arabic clipping fix: pb-1 + explicit lineHeight */}
                      <Text
                        style={{ textAlign: "left", color: colors.text, lineHeight: 18 }}
                        className="pb-1 text-[10px] font-bold"
                      >
                        {course.type}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )
          })}
        </View>
      ))}
    </View>
  )
}

// ─── Grid View (True 2D Time Grid with Dynamic Bounds) ───────────────────────

function GridView({ schedule }: { schedule: Schedule }) {
  // Dynamic bounds — no dead space
  const { startHour, endHour } = useMemo(() => getScheduleBounds(schedule), [schedule])
  const totalHours = endHour - startHour
  const gridContentHeight = totalHours * HOUR_HEIGHT
  const timeLabels = useMemo(() => buildTimeLabels(startHour, endHour), [startHour, endHour])

  // Build a map: dayName → courses[]
  const dayMap = useMemo(() => {
    const map = new Map<string, CourseEntry[]>()
    for (const d of ALL_DAYS) map.set(d, [])
    for (const d of schedule.days) {
      map.set(d.day, d.courses)
    }
    return map
  }, [schedule])

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={true} className="flex-1">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-row">
          {/* ── Time Axis FIRST (appears on far-right in RTL) ── */}
          <View style={{ width: TIME_AXIS_WIDTH }}>
            {/* Header aligned with day column headers */}
            <View className="items-center border-b border-slate-100 bg-slate-50 px-1 py-3">
              <Text className="text-center text-[10px] font-bold text-slate-400">الوقت</Text>
            </View>

            {/* Time labels */}
            <View style={{ position: "relative", height: gridContentHeight }}>
              {timeLabels.map((label, idx) => (
                <View
                  key={label}
                  style={{
                    position: "absolute",
                    top: idx * HOUR_HEIGHT - 7,
                    left: 0,
                    right: 0,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{ writingDirection: "ltr", fontSize: 10, color: "#94a3b8", fontWeight: "600" }}
                  >
                    {label}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* ── Day Columns (الأحد → الخميس) ── */}
          {ALL_DAYS.map((dayName) => {
            const courses = dayMap.get(dayName) ?? []
            const breaks = findBreaks(courses, startHour)
            const isDayOff = courses.length === 0

            return (
              <View
                key={dayName}
                className="border-r border-slate-100"
                style={{ minWidth: GRID_COL_MIN_W }}
              >
                {/* Column header */}
                <View className="items-center border-b border-slate-100 bg-indigo-50 px-2 py-3">
                  <Text style={{ textAlign: "left" }} className="pb-1 text-sm font-extrabold text-indigo-700">
                    {dayName.replace("يوم ", "")}
                  </Text>
                </View>

                {/* Course blocks container – relative for absolute children */}
                <View style={{ position: "relative", height: gridContentHeight }}>
                  {/* Hour grid lines */}
                  {Array.from({ length: totalHours }).map((_, idx) => (
                    <View
                      key={`line-${idx}`}
                      style={{
                        position: "absolute",
                        top: idx * HOUR_HEIGHT,
                        left: 0,
                        right: 0,
                        height: HOUR_HEIGHT,
                        borderBottomWidth: 1,
                        borderBottomColor: "#f1f5f9",
                      }}
                    />
                  ))}

                  {/* ── Day Off card ── */}
                  {isDayOff && (
                    <View
                      style={{
                        position: "absolute",
                        top: 4,
                        left: 4,
                        right: 4,
                        bottom: 4,
                        backgroundColor: "#f0fdfa",
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: "#99f6e4",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ fontSize: 24, marginBottom: 6 }}>🌴</Text>
                      <Text
                        style={{ color: "#0f766e", fontWeight: "700", fontSize: 13, textAlign: "center" }}
                      >
                        يوم أوف
                      </Text>
                    </View>
                  )}

                  {/* ── Break cards (بريك ☕) ── */}
                  {breaks.map((brk, idx) => (
                    <View
                      key={`break-${idx}`}
                      style={{
                        position: "absolute",
                        top: brk.top,
                        left: 4,
                        right: 4,
                        height: brk.height,
                        backgroundColor: "#f8fafc",
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: "#e2e8f0",
                        borderStyle: "dashed",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ fontSize: 14, color: "#94a3b8", fontWeight: "600" }}>
                        بريك ☕
                      </Text>
                    </View>
                  ))}

                  {/* ── Absolutely-positioned course blocks ── */}
                  {courses.map((course) => {
                    const colors = COURSE_COLORS[course.code] ?? DEFAULT_COURSE_COLOR
                    const layout = calculateBlockLayout(course.time, startHour)
                    return (
                      <View
                        key={course.id}
                        style={{
                          position: "absolute",
                          top: layout.top,
                          left: 4,
                          right: 4,
                          height: layout.height,
                          backgroundColor: colors.bg,
                          borderWidth: 1,
                          borderColor: colors.border,
                          borderRadius: 10,
                          paddingHorizontal: 6,
                          paddingVertical: 4,
                          overflow: "hidden",
                          justifyContent: "center",
                          alignItems: "stretch",
                        }}
                      >
                        <Text
                          style={{ textAlign: "left", color: colors.text }}
                          className="text-xs font-extrabold"
                          numberOfLines={2}
                        >
                          {course.name}
                        </Text>
                        {/* Restored time inside block */}
                        <Text
                          style={{ textAlign: "left", writingDirection: "ltr", color: colors.text, opacity: 0.7 }}
                          className="mt-0.5 text-[10px] font-bold"
                        >
                          {course.time}
                        </Text>
                        <View className="mt-0.5 flex-row items-center justify-between">
                          <Text
                            style={{ textAlign: "left" }}
                            className="text-[10px] text-slate-500"
                          >
                            {course.section}
                          </Text>
                          <View className="rounded bg-white/60 px-1 py-0.5">
                            {/* ✅ Arabic clipping fix: pb-1 + explicit lineHeight */}
                            <Text
                              style={{ textAlign: "left", color: colors.text, lineHeight: 18 }}
                              className="pb-1 text-[9px] font-bold"
                            >
                              {course.type}
                            </Text>
                          </View>
                        </View>
                      </View>
                    )
                  })}
                </View>
              </View>
            )
          })}
        </View>
      </ScrollView>
    </ScrollView>
  )
}

// ─── Action Plan Modal (Multi-step Confirmation) ─────────────────────────────

type ConfirmStep = "plan" | "confirm" | "success"

function ActionPlanModal({
  visible,
  onClose,
  steps,
  scheduleTitle,
}: {
  visible: boolean
  onClose: () => void
  steps: ActionStep[]
  scheduleTitle: string
}) {
  const [confirmStep, setConfirmStep] = useState<ConfirmStep>("plan")

  // Reset to 'plan' whenever the modal opens
  useEffect(() => {
    if (visible) setConfirmStep("plan")
  }, [visible])

  const handleClose = () => {
    setConfirmStep("plan")
    onClose()
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View className="flex-1 justify-end bg-black/40">
        <View className="rounded-t-3xl bg-white p-6 pb-10 shadow-xl" style={{ maxHeight: "85%" }}>

          {/* ── Step 1: Plan ── */}
          {confirmStep === "plan" && (
            <>
              {/* Header */}
              <View className="mb-2 flex-row items-center justify-between">
                <Text style={{ textAlign: "left" }} className="pb-1 text-xl font-extrabold text-slate-900">
                  خريطة التنفيذ
                </Text>
                <TouchableOpacity onPress={handleClose} className="rounded-full bg-slate-100 p-2">
                  <X size={20} color={COLORS.slate600} />
                </TouchableOpacity>
              </View>
              <Text style={{ textAlign: "left" }} className="pb-1 mb-5 text-sm text-slate-400">
                الانتقال من الجدول الأصلي ← {scheduleTitle}
              </Text>

              {/* Legend */}
              <View className="mb-5 flex-row flex-wrap items-center gap-3">
                <LegendDot color="#ef4444" label="حذف" />
                <LegendDot color="#3b82f6" label="تغيير شعبة" />
                <LegendDot color="#22c55e" label="إضافة" />
                <LegendDot color="#94a3b8" label="ثابت" />
              </View>

              {/* Steps */}
              <ScrollView showsVerticalScrollIndicator={false}>
                {steps.map((action, idx) => {
                  const theme = ACTION_THEMES[action.type]
                  const Icon = theme.icon
                  return (
                    <View key={idx} className={`mb-3 flex-row items-center rounded-xl p-4 ${theme.bg}`}>
                      <View className="ml-3">
                        <Icon size={20} color={theme.iconColor} />
                      </View>
                      <Text
                        style={{ textAlign: "left" }}
                        className={`flex-1 pb-1 text-sm font-bold ${theme.text}`}
                      >
                        {action.message}
                      </Text>
                    </View>
                  )
                })}
              </ScrollView>

              {/* Confirm button */}
              <TouchableOpacity
                onPress={() => setConfirmStep("confirm")}
                className="mt-6 rounded-2xl bg-indigo-600 py-4 items-center justify-center shadow-sm"
              >
                <Text style={{ textAlign: "left" }} className="pb-1 text-base font-bold text-white">
                  اعتماد هذا الجدول
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* ── Step 2: Confirm ── */}
          {confirmStep === "confirm" && (
            <View className="items-center py-6">
              <View className="mb-6 size-16 items-center justify-center rounded-full bg-amber-100">
                <Text style={{ fontSize: 28 }}>⚠️</Text>
              </View>
              <Text
                style={{ textAlign: "center", lineHeight: 26 }}
                className="pb-1 text-base font-bold text-slate-800 px-2 mb-6"
              >
                هل أنت متأكد أنك قمت بتنفيذ جميع الخطوات في بوابة الجامعة لاعتماد هذا الجدول؟
              </Text>

              <TouchableOpacity
                onPress={() => setConfirmStep("success")}
                className="mb-3 w-full rounded-2xl bg-indigo-600 py-4 items-center justify-center shadow-sm"
              >
                <Text style={{ textAlign: "left" }} className="pb-1 text-base font-bold text-white">
                  نعم، متأكد
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setConfirmStep("plan")}
                className="w-full rounded-2xl bg-slate-100 py-4 items-center justify-center"
              >
                <Text style={{ textAlign: "left" }} className="pb-1 text-base font-bold text-slate-600">
                  تراجع
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── Step 3: Success ── */}
          {confirmStep === "success" && (
            <View className="items-center py-6">
              <View className="mb-6 size-20 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 size={40} color={COLORS.emerald600} />
              </View>
              <Text
                style={{ textAlign: "center" }}
                className="pb-1 text-xl font-extrabold text-slate-900 mb-2"
              >
                تم اعتماد الجدول بنجاح!
              </Text>
              <Text
                style={{ textAlign: "center" }}
                className="pb-1 text-sm text-slate-400 mb-8"
              >
                {scheduleTitle}
              </Text>

              <TouchableOpacity
                onPress={handleClose}
                className="w-full rounded-2xl bg-indigo-600 py-4 items-center justify-center shadow-sm"
              >
                <Text style={{ textAlign: "left" }} className="pb-1 text-base font-bold text-white">
                  حسناً
                </Text>
              </TouchableOpacity>
            </View>
          )}

        </View>
      </View>
    </Modal>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ACTION_THEMES: Record<
  ActionType,
  { bg: string; text: string; icon: typeof CheckCircle2; iconColor: string }
> = {
  delete: { bg: "bg-red-50", text: "text-red-700", icon: XCircle, iconColor: COLORS.rose600 },
  change: { bg: "bg-blue-50", text: "text-blue-700", icon: ArrowLeftRight, iconColor: COLORS.blue600 },
  add: { bg: "bg-green-50", text: "text-green-700", icon: CheckCircle2, iconColor: COLORS.emerald600 },
  keep: { bg: "bg-slate-50", text: "text-slate-500", icon: MinusCircle, iconColor: COLORS.slate400 },
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View className="flex-row items-center">
      <View className="mr-1 size-2.5 rounded-full" style={{ backgroundColor: color }} />
      <Text className="text-xs text-slate-500">{label}</Text>
    </View>
  )
}
