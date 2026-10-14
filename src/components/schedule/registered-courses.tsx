import {
  CalendarDays,
  Clock,
  Hash,
  Lock,
  MoreVertical,
  Plus,
  Unlock,
  User,
} from "lucide-react-native"
import {
  Text,
  TouchableOpacity,
  View,
  Modal,
  ActivityIndicator,
} from "react-native"
import { COLORS } from "./colors"
import { RegisteredCourse } from "./data"
import { useSchedule } from "./ScheduleContext"
import { CourseFormModal } from "./CourseFormModal"
import { useDialog } from "../ui/dialog-provider"
import { useState, useRef } from "react"

export function RegisteredCourses() {
  const {
    registeredCourses,
    deleteCourse,
    updateCourse,
    addCourse,
    maxCredits,
    totalCredits,
    toggleCourseLock,
  } = useSchedule()
  const { showError } = useDialog()

  const [formVisible, setFormVisible] = useState(false)
  const [editingCourse, setEditingCourse] = useState<RegisteredCourse | undefined>()
  const [menuFor, setMenuFor] = useState<RegisteredCourse | null>(null)
  const [deleteConfirmFor, setDeleteConfirmFor] = useState<RegisteredCourse | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const pendingLocks = useRef<Set<string>>(new Set())

  const isOverLimit = totalCredits > maxCredits

  const handleToggleLock = async (code: string) => {
    const norm = code.trim().toUpperCase()
    if (pendingLocks.current.has(norm)) return
    pendingLocks.current.add(norm)
    try {
      await toggleCourseLock(code)
    } catch (err: any) {
      showError(err, { title: "تعذر تغيير حالة التثبيت" })
    } finally {
      pendingLocks.current.delete(norm)
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirmFor || isDeleting) return
    setIsDeleting(true)
    try {
      await deleteCourse(deleteConfirmFor.id)
      setDeleteConfirmFor(null)
    } catch (err: any) {
      showError(err, { title: "تعذر إلغاء تسجيل المقرر" })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <View className="gap-4">
      <View className="flex-row gap-3">
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => {
            setEditingCourse(undefined)
            setFormVisible(true)
          }}
          className="w-full flex-row items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3.5 active:bg-indigo-700"
          style={{
            shadowColor: "#4f46e5",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.25,
            shadowRadius: 15,
            elevation: 5,
          }}
        >
          <Plus size={20} color={COLORS.white} />
          <Text className="text-sm font-bold text-white leading-relaxed">
            إضافة
          </Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row items-center justify-between px-1">
        <Text className="text-sm font-bold text-slate-800">المقررات المسجلة</Text>
        <View className="flex-row items-center gap-2">
          <View
            className={`rounded-full px-2.5 py-0.5 ${
              isOverLimit ? "bg-rose-50 border border-rose-200" : "bg-indigo-50"
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                isOverLimit ? "text-rose-600" : "text-indigo-600"
              }`}
            >
              {totalCredits} / {maxCredits} ساعة
            </Text>
          </View>
          <View className="rounded-full bg-indigo-50 px-2.5 py-0.5">
            <Text className="text-xs font-semibold text-indigo-600">
              {registeredCourses.length} مقررات
            </Text>
          </View>
        </View>
      </View>

      <Text
        className="px-1 text-xs text-slate-400 -mt-2"
        style={{ textAlign: "left", writingDirection: "rtl" }}
      >
        ثبّت المقررات الأساسية لتبقى في الجداول المقترحة
      </Text>

      {registeredCourses.length === 0 ? (
        <View className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 items-center justify-center">
          <Text className="text-center text-sm text-slate-400 leading-relaxed">
            لم تسجّل أي مقرر بعد، اضغط إضافة أو سجّل من تبويب المطروحة
          </Text>
        </View>
      ) : (
        <View className="gap-3">
          {registeredCourses.map((course) => {
            return (
              <View
                key={course.id}
                className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-4"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 1,
                }}
              >
                {/* الشريط الملوّن عند بداية البطاقة (يمين في RTL) */}
                <View
                  className={`absolute inset-y-0 start-0 w-1.5 ${course.color}`}
                />

                <View className="ps-2">
                  <View className="flex-row items-start justify-between gap-2">
                    <View className="flex-1">
                      <Text className="text-base font-bold text-slate-900">
                        {course.name}
                      </Text>
                      <View className="mt-1 flex-row flex-wrap items-center gap-2">
                        <View className="rounded-lg bg-slate-100 px-2 py-1">
                          <Text className="text-xs font-semibold text-slate-600">
                            {course.section}
                          </Text>
                        </View>
                        <View className="flex-row items-center gap-1">
                          <Hash size={14} color={COLORS.slate400} />
                          <Text className="text-xs font-medium text-slate-400">
                            {course.code}
                          </Text>
                        </View>
                        <View className="rounded bg-sky-100 px-1.5 py-0.5">
                          <Text className="text-[10px] font-bold text-sky-700 leading-relaxed">
                            {course.type}
                          </Text>
                        </View>
                        <View className="rounded bg-indigo-100 px-1.5 py-0.5">
                          <Text className="text-[10px] font-bold text-indigo-700 leading-relaxed">
                            {course.credits} {course.credits === 1 ? "ساعة" : "ساعات"}
                          </Text>
                        </View>
                        {course.locked && (
                          <View className="rounded bg-amber-100 px-1.5 py-0.5">
                            <Text className="text-[10px] font-bold text-amber-800 leading-relaxed">
                              أساسي
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <TouchableOpacity
                        accessibilityRole="button"
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        onPress={() => handleToggleLock(course.code)}
                        className="p-1.5 rounded-lg active:bg-slate-100"
                      >
                        {course.locked ? (
                          <Lock size={18} color={COLORS.indigo600} />
                        ) : (
                          <Unlock size={18} color={COLORS.slate400} />
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        accessibilityRole="button"
                        onPress={() => setMenuFor(course)}
                        className="p-1"
                      >
                        <MoreVertical size={20} color={COLORS.slate400} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View className="mt-3 gap-2 border-t border-slate-100 pt-3">
                    {course.sessions.map((session) => (
                      <View key={session.id} className="flex-row items-center gap-3">
                        <View className="flex-row items-center gap-1.5">
                          <CalendarDays size={14} color={COLORS.indigo500} />
                          <Text className="text-sm font-medium text-slate-700">
                            {session.day}
                          </Text>
                        </View>
                        <View className="flex-row items-center gap-1.5">
                          <Clock size={14} color={COLORS.indigo500} />
                          <View className="flex-row items-center space-x-1 space-x-reverse">
                            <Text className="text-sm text-slate-600">
                              {session.startTime}
                            </Text>
                            <Text className="text-sm text-slate-600 mx-1">-</Text>
                            <Text className="text-sm text-slate-600">
                              {session.endTime}
                            </Text>
                          </View>
                        </View>
                      </View>
                    ))}

                    <View className="flex-row items-center justify-between mt-2">
                      <View className="flex-row items-center gap-1.5">
                        <User size={14} color={COLORS.indigo500} />
                        <Text className="text-xs text-slate-600 leading-relaxed">
                          {course.instructor}
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-1.5">
                        <View
                          className={`rounded px-1.5 py-0.5 ${
                            course.mode === "حضوري" ? "bg-emerald-100" : "bg-purple-100"
                          }`}
                        >
                          <Text
                            className={`text-[10px] font-bold leading-relaxed ${
                              course.mode === "حضوري"
                                ? "text-emerald-700"
                                : "text-purple-700"
                            }`}
                          >
                            {course.mode}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            )
          })}
        </View>
      )}

      {/* Menu Modal */}
      <Modal visible={!!menuFor} transparent animationType="fade">
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setMenuFor(null)}
          className="flex-1 justify-center items-center bg-black/40 px-5"
        >
          <View className="bg-white w-full max-w-sm rounded-2xl overflow-hidden">
            <TouchableOpacity
              onPress={() => {
                if (menuFor) {
                  setEditingCourse(menuFor)
                  setFormVisible(true)
                  setMenuFor(null)
                }
              }}
              className="p-4 border-b border-slate-100 items-center"
            >
              <Text className="text-lg font-bold text-slate-800">تعديل</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                if (menuFor) {
                  setDeleteConfirmFor(menuFor)
                  setMenuFor(null)
                }
              }}
              className="p-4 items-center"
            >
              <Text className="text-lg font-bold text-rose-600">إلغاء التسجيل</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Unregister Confirmation Dialog */}
      <Modal visible={!!deleteConfirmFor} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/40 px-5">
          <View className="bg-white w-full rounded-2xl p-6 items-center">
            <Text className="text-lg font-bold text-slate-800 mb-2">
              إلغاء تسجيل المقرر
            </Text>
            <Text className="text-sm text-slate-500 mb-2 text-center leading-relaxed">
              {deleteConfirmFor?.locked
                ? "هذا المقرر مثبّت كمقرر أساسي. هل تريد إلغاء تسجيله فعلاً؟"
                : "هل أنت متأكد من إلغاء تسجيل هذا المقرر؟"}
            </Text>
            <Text className="text-xs text-slate-400 mb-6 text-center">
              تبقى الشعبة في قائمة المطروحة
            </Text>
            <View className="flex-row gap-3 w-full">
              <TouchableOpacity
                disabled={isDeleting}
                onPress={() => setDeleteConfirmFor(null)}
                className="flex-1 py-3 rounded-xl bg-slate-100 items-center"
              >
                <Text className="text-sm font-bold text-slate-700">إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={isDeleting}
                onPress={handleDelete}
                className="flex-1 py-3 rounded-xl bg-rose-600 items-center justify-center"
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text className="text-sm font-bold text-white">إلغاء التسجيل</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <CourseFormModal
        visible={formVisible}
        target="registered"
        onClose={() => {
          setFormVisible(false)
          setEditingCourse(undefined)
        }}
        initialData={editingCourse}
        onSave={async (c) => {
          if (editingCourse) {
            await updateCourse(c.id, c)
          } else {
            await addCourse(c)
          }
        }}
      />
    </View>
  )
}
