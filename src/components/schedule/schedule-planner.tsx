import { router } from "expo-router"
import { logout } from "../../lib/auth"
import { StatusBar } from "expo-status-bar"
import {
  BookMarked,
  CalendarRange,
  LayoutGrid,
  SlidersHorizontal,
  User,
  type LucideIcon,
} from "lucide-react-native"
import { useState } from "react"
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { EditProfileModal } from "../profile/edit-profile"
import { COLORS } from "./colors"
import { OfferedCourses } from "./offered-courses"
import { Preferences } from "./preferences"
import { RegisteredCourses } from "./registered-courses"
import { ScheduleProvider } from "./ScheduleContext"
import { SchedulesView } from "./schedules-view"

type Tab = "registered" | "offered" | "preferences" | "schedules"

const navItems: { key: string; label: string; icon: LucideIcon }[] = [
  { key: "registered", label: "المسجلة", icon: BookMarked },
  { key: "offered", label: "المطروحة", icon: LayoutGrid },
  { key: "preferences", label: "التفضيلات", icon: SlidersHorizontal },
  { key: "schedules", label: "الجداول", icon: CalendarRange },
]

export function SchedulePlanner() {
  const [tab, setTab] = useState<Tab>("registered")
  const [activeNav, setActiveNav] = useState<string>("registered")
  const [isProfileMenuVisible, setIsProfileMenuVisible] = useState(false)
  const [isEditProfileVisible, setIsEditProfileVisible] = useState(false)

  return (
    <ScheduleProvider>
      <SafeAreaView className="flex-1 bg-slate-50" edges={["top", "bottom"]}>
        <StatusBar style="dark" />

        {/* Header */}
        <View className="flex-row items-center justify-between border-b border-slate-100 px-5 pb-4 pt-2" style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
          <View>
            <Text className="text-xs font-medium text-slate-400 leading-relaxed">
              الفصل الأول ١٤٤٧هـ
            </Text>
            <Text className="text-xl font-extrabold tracking-tight text-slate-900 leading-relaxed">
              جدولي الذكي
            </Text>
          </View>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="الملف الشخصي"
            className="size-11 items-center justify-center rounded-full bg-indigo-50 active:bg-indigo-100"
            onPress={() => setIsProfileMenuVisible(true)}
          >
            <User size={20} color={COLORS.indigo600} />
          </TouchableOpacity>
        </View>

        {/* Profile Menu Modal */}
        <Modal animationType="fade" transparent visible={isProfileMenuVisible}>
          {/* Full screen invisible overlay with explicit LTR layout direction */}
          <TouchableOpacity
            activeOpacity={1}
            className="flex-1"
            style={{ direction: 'ltr' }}
            onPress={() => setIsProfileMenuVisible(false)}
          >
            {/* Dropdown Container: Positioned absolutely from physical left */}
            <View
              className="bg-white rounded-2xl shadow-xl border border-slate-100 w-56 overflow-hidden z-50"
              style={{
                position: 'absolute',
                top: 55, // Adjusted to clear header in SafeArea
                left: 20,
                right: 'auto', // Explicitly cancels Yoga's automatic right-side mirroring in RTL
              }}
            >
              {/* Inner wrapper to restore RTL for Arabic text */}
              <View className="py-2" style={{ direction: 'rtl' }}>
                <TouchableOpacity
                  className="flex-row items-center px-4 py-3 border-b border-slate-50"
                  onPress={() => {
                    setIsProfileMenuVisible(false)
                    setIsEditProfileVisible(true)
                  }}
                >
                  <Text
                    className="text-slate-700 font-bold text-base"
                    style={{ width: '100%', textAlign: 'center' }}
                  >
                    تعديل معلومات الحساب
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-row items-center px-4 py-3"
                  onPress={async () => {
                    setIsProfileMenuVisible(false)
                    await logout()
                    router.replace('/')
                  }}
                >
                  <Text
                    className="text-red-500 font-bold text-base"
                    style={{ width: '100%', textAlign: 'center' }}
                  >
                    تسجيل الخروج
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Edit Profile Modal */}
        <EditProfileModal visible={isEditProfileVisible} onClose={() => setIsEditProfileVisible(false)} />

        {/* Content */}
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-5 py-4"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {tab === "registered" ? <RegisteredCourses /> : tab === "offered" ? <OfferedCourses /> : tab === "preferences" ? <Preferences /> : <SchedulesView />}
        </ScrollView>

        {/* Bottom navigation */}
        <View className="border-t border-slate-100 bg-white px-2 pb-2 pt-2">
          <View className="flex-row items-center justify-around">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = activeNav === item.key
              return (
                <TouchableOpacity
                  key={item.key}
                  accessibilityRole="button"
                  onPress={() => {
                    setActiveNav(item.key)
                    if (item.key === "registered") setTab("registered")
                    if (item.key === "offered") setTab("offered")
                    if (item.key === "preferences") setTab("preferences")
                    if (item.key === "schedules") setTab("schedules")
                  }}
                  className="w-16 items-center gap-1 rounded-xl py-1.5"
                >
                  <View
                    className={`size-9 items-center justify-center rounded-xl ${active ? "bg-indigo-50" : "bg-transparent"
                      }`}
                  >
                    <Icon
                      size={20}
                      color={active ? COLORS.indigo600 : COLORS.slate400}
                    />
                  </View>
                  <Text
                    className={`text-[11px] font-bold ${active ? "text-indigo-600" : "text-slate-400"
                      }`}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>
      </SafeAreaView>
    </ScheduleProvider>
  )
}

