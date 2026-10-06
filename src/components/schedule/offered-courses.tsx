import React, { useMemo, useState } from "react"
import { TouchableOpacity, Text, TextInput, View, Modal } from "react-native"
import { CalendarDays, Clock, Hash, MoreVertical, Plus, RefreshCw, Search, User } from "lucide-react-native"
import { COLORS } from "./colors"
import { OfferedSection } from "./data"
import { useSchedule } from "./ScheduleContext"
import { CourseFormModal } from "./CourseFormModal"

export function OfferedCourses() {
  const {
    offeredSections,
    addOfferedSection,
    updateOfferedSection,
    deleteOfferedSection,
  } = useSchedule()

  const [formVisible, setFormVisible] = useState(false)
  const [editingSection, setEditingSection] = useState<OfferedSection | undefined>()
  const [menuFor, setMenuFor] = useState<OfferedSection | null>(null)
  const [deleteConfirmFor, setDeleteConfirmFor] = useState<OfferedSection | null>(null)
  const [query, setQuery] = useState("")

  const results = useMemo(() => {
    const q = query.trim()
    if (!q) return offeredSections
    return offeredSections.filter(
      (s) => s.name.includes(q) || s.code.toLowerCase().includes(q.toLowerCase()),
    )
  }, [query, offeredSections])

  return (
    <View className="gap-4">
      <View className="flex-row gap-3">
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => {
            setEditingSection(undefined)
            setFormVisible(true)
          }}
          className="w-full flex-row items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3.5 active:bg-indigo-700"
          style={{ shadowColor: '#4f46e5', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 15, elevation: 5 }}
        >
          <Plus size={20} color={COLORS.white} />
          <Text className="text-sm font-bold text-white leading-relaxed">
            إضافة
          </Text>
        </TouchableOpacity>
      </View>

      <View className="relative justify-center">
        <View pointerEvents="none" className="absolute start-3.5 z-10">
          <Search size={20} color={COLORS.slate400} />
        </View>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="ابحث عن مقرر أو رمز..."
          placeholderTextColor={COLORS.slate400}
          returnKeyType="search"
          clearButtonMode="while-editing"
          autoCorrect={false}
          className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 ps-11 pe-4 text-sm text-slate-800 text-right focus:border-indigo-400"
          style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1, textAlign: "right", textAlignVertical: "center", includeFontPadding: false }}
        />
      </View>

      <View className="flex-row items-center justify-between px-1">
        <Text className="text-sm font-bold text-slate-800">الشعب المطروحة</Text>
        <View className="rounded-full bg-slate-100 px-2.5 py-0.5">
          <Text className="text-xs font-semibold text-slate-600">
            {results.length} نتيجة
          </Text>
        </View>
      </View>

      <View className="gap-3">
        {results.map((section) => (
          <OfferedSectionCard
            key={section.id}
            section={section}
            onMenuPress={() => setMenuFor(section)}
          />
        ))}

        {results.length === 0 && (
          <View className="rounded-2xl border border-dashed border-slate-200 bg-white p-8">
            <Text className="text-center text-sm text-slate-400">
              لا توجد نتائج مطابقة لبحثك
            </Text>
          </View>
        )}
      </View>

      {/* Three-dots popup menu */}
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
                  setEditingSection(menuFor)
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
              <Text className="text-lg font-bold text-rose-600">حذف</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Delete confirmation dialog */}
      <Modal visible={!!deleteConfirmFor} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/40 px-5">
          <View className="bg-white w-full rounded-2xl p-6 items-center">
            <Text className="text-lg font-bold text-slate-800 mb-2">تأكيد الحذف</Text>
            <Text className="text-sm text-slate-500 mb-6 text-center">هل أنت متأكد من حذف هذا المقرر؟</Text>
            <View className="flex-row gap-3 w-full">
              <TouchableOpacity
                onPress={() => setDeleteConfirmFor(null)}
                className="flex-1 py-3 rounded-xl bg-slate-100 items-center"
              >
                <Text className="text-sm font-bold text-slate-700">إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  if (deleteConfirmFor) {
                    deleteOfferedSection(deleteConfirmFor.id)
                    setDeleteConfirmFor(null)
                  }
                }}
                className="flex-1 py-3 rounded-xl bg-rose-600 items-center"
              >
                <Text className="text-sm font-bold text-white">حذف</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add / Edit Form Modal */}
      <CourseFormModal
        visible={formVisible}
        target="offered"
        initialData={editingSection}
        onClose={() => {
          setFormVisible(false)
          setEditingSection(undefined)
        }}
        onSave={(data) => {
          if (editingSection) {
            updateOfferedSection(data.id, data)
          } else {
            addOfferedSection(data)
          }
        }}
      />
    </View>
  )
}

function OfferedSectionCard({
  section,
  onMenuPress,
}: {
  section: OfferedSection
  onMenuPress: () => void
}) {
  const {
    registeredCourses,
    checkConflict,
    getCourseByCodeAndType,
    addCourse,
    deleteCourse,
    toggleOfferedSectionStatus,
  } = useSchedule()

  const open = section.status === "open"
  const alreadyAdded = registeredCourses.some(
    (c) => c.code === section.code && c.type === section.type && c.section === section.section,
  )

  const [alertModal, setAlertModal] = useState<{
    visible: boolean
    title: string
    message: string
    type: "error" | "confirmSwap"
    oldCourseId?: string
  } | null>(null)

  const handleAdd = () => {
    if (checkConflict(section.sessions)) {
      setAlertModal({
        visible: true,
        title: "تعارض في الوقت",
        message: "يوجد تعارض في الوقت مع مقرر مسجل مسبقاً، لا يمكن الإضافة.",
        type: "error",
      })
      return
    }
    const existing = getCourseByCodeAndType(section.code, section.type)
    if (existing) {
      if (existing.section === section.section) return // already added
      setAlertModal({
        visible: true,
        title: "تغيير الشعبة",
        message: `هذا المقرر مسجل مسبقاً. هل تريد تغيير الشعبة من ${existing.section} إلى ${section.section}؟`,
        type: "confirmSwap",
        oldCourseId: existing.id,
      })
      return
    }

    addCourse({ ...section, color: "bg-indigo-500" } as any)
  }

  const handleConfirmSwap = () => {
    if (alertModal?.oldCourseId) {
      deleteCourse(alertModal.oldCourseId)
      addCourse({ ...section, color: "bg-indigo-500" } as any)
    }
    setAlertModal(null)
  }

  return (
    <View
      className="rounded-2xl border border-slate-100 bg-white p-4"
      style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}
    >
      <View className="flex-row items-start justify-between gap-2">
        <View className="flex-1">
          <Text
            numberOfLines={1}
            className="text-base font-bold text-slate-900"
          >
            {section.name}
          </Text>
          <View className="mt-1 flex-row flex-wrap items-center gap-x-3 gap-y-1">
            <View className="flex-row items-center gap-1">
              <Hash size={14} color={COLORS.slate400} />
              <Text className="text-xs font-medium text-slate-400">
                {section.code}
              </Text>
            </View>
            <Text className="text-xs font-medium text-slate-500">
              {section.section}
            </Text>
            <View className="rounded bg-sky-100 px-1.5 py-0.5">
              <Text className="text-[10px] font-bold text-sky-700 leading-relaxed">{section.type}</Text>
            </View>
          </View>
        </View>
        <View className="flex-row items-center gap-2">
          <StatusBadge
            status={section.status}
            onPress={() => toggleOfferedSectionStatus(section.id)}
          />
          <TouchableOpacity
            accessibilityRole="button"
            onPress={onMenuPress}
            className="p-1 -me-1"
          >
            <MoreVertical size={20} color={COLORS.slate400} />
          </TouchableOpacity>
        </View>
      </View>

      <View className="mt-3 gap-2 border-t border-slate-100 pt-3">
        {section.sessions.map((session) => (
          <View key={session.id} className="flex-row items-center gap-3">
            <View className="flex-row items-center gap-1.5">
              <CalendarDays size={14} color={COLORS.indigo500} />
              <Text className="text-sm font-medium text-slate-700">{session.day}</Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <Clock size={14} color={COLORS.indigo500} />
              <View className="flex-row items-center space-x-1 space-x-reverse">
                <Text className="text-sm text-slate-600">{session.startTime}</Text>
                <Text className="text-sm text-slate-600 mx-1">-</Text>
                <Text className="text-sm text-slate-600">{session.endTime}</Text>
              </View>
            </View>
          </View>
        ))}

        <View className="flex-row items-center justify-between mt-2">
          <View className="flex-row items-center gap-1.5">
            <User size={14} color={COLORS.indigo500} />
            <Text className="text-xs text-slate-600 leading-relaxed">{section.instructor}</Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <View className={`rounded px-1.5 py-0.5 ${section.mode === "حضوري" ? "bg-emerald-100" : "bg-purple-100"}`}>
              <Text className={`text-[10px] font-bold leading-relaxed ${section.mode === "حضوري" ? "text-emerald-700" : "text-purple-700"}`}>{section.mode}</Text>
            </View>
          </View>
        </View>
      </View>

      <TouchableOpacity
        accessibilityRole="button"
        disabled={!open || alreadyAdded}
        onPress={handleAdd}
        className={`mt-3 flex-row items-center justify-center gap-1.5 rounded-xl py-2.5 ${alreadyAdded ? "bg-emerald-50" : open ? "bg-indigo-50 active:bg-indigo-100" : "bg-slate-50"}`}
      >
        {!alreadyAdded && <Plus size={16} color={open ? COLORS.indigo600 : COLORS.slate300} />}
        <Text
          className={`text-sm font-bold ${alreadyAdded ? "text-emerald-600" : open ? "text-indigo-600" : "text-slate-300"}`}
        >
          {alreadyAdded ? "تمت الإضافة إلى الجدول" : open ? "إضافة إلى الجدول" : "الشعبة مغلقة"}
        </Text>
      </TouchableOpacity>

      <Modal visible={!!alertModal?.visible} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/40 px-5">
          <View className="bg-white w-full rounded-2xl p-6 items-center">
            <Text className="text-lg font-bold text-slate-800 mb-2">{alertModal?.title}</Text>
            <Text className="text-sm text-slate-500 mb-6 text-center leading-relaxed">{alertModal?.message}</Text>
            <View className="flex-row gap-3 w-full">
              {alertModal?.type === "error" ? (
                <TouchableOpacity onPress={() => setAlertModal(null)} className="flex-1 py-3 rounded-xl bg-slate-100 items-center">
                  <Text className="text-sm font-bold text-slate-700">حسناً</Text>
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity onPress={() => setAlertModal(null)} className="flex-1 py-3 rounded-xl bg-slate-100 items-center">
                    <Text className="text-sm font-bold text-slate-700">إلغاء</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleConfirmSwap} className="flex-1 py-3 rounded-xl bg-indigo-600 items-center">
                    <Text className="text-sm font-bold text-white">تأكيد التغيير</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

function StatusBadge({ status, onPress }: { status: "open" | "closed", onPress: () => void }) {
  const open = status === "open"
  return (
    <TouchableOpacity
      accessibilityRole="button"
      onPress={onPress}
      className={`flex-row items-center gap-1.5 self-start rounded-xl border px-3 py-1.5 ${
        open ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"
      }`}
      style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}
    >
      <RefreshCw size={14} color={open ? "#059669" : "#e11d48"} />
      <Text
        className={`text-xs font-bold ${
          open ? "text-emerald-700" : "text-rose-600"
        }`}
      >
        {open ? "متاحة" : "مغلقة"}
      </Text>
    </TouchableOpacity>
  )
}
