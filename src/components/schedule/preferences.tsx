import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Minus, Plus, Trash2, AlertCircle } from "lucide-react-native";
import { COLORS } from "./colors";
import { useSchedule } from "./ScheduleContext";
import { useDialog } from "../ui/dialog-provider";
import {
  ApiPreferences,
  PREFERRED_TIME_UI_TO_API,
  PREFERRED_TIME_API_TO_UI,
  DENSITY_UI_TO_API,
  DENSITY_API_TO_UI,
  apiDayToUiDay,
  uiDayToApiDay,
  toApiTimeLoose,
  toUiTimeFrom24,
} from "../../lib/mappers";

type PreferredTime = "صباحي" | "مسائي" | "مرن";
type ScheduleDensity = "مضغوط" | "مريح";
type DayOff = "الأحد" | "الإثنين" | "الثلاثاء" | "الأربعاء" | "الخميس";

export interface PreferencesProps {
  onGenerated?: () => void;
  onScrollToTop?: () => void;
}

export function Preferences({ onGenerated, onScrollToTop }: PreferencesProps) {
  const { preferences, savePreferences, generateSuggestions, isGenerating } =
    useSchedule();
  const { showDialog, showError } = useDialog();

  const [preferredTime, setPreferredTime] = useState<PreferredTime>("مرن");
  const [daysOff, setDaysOff] = useState<DayOff[]>([]);
  const [density, setDensity] = useState<ScheduleDensity>("مريح");
  const [maxBreakHours, setMaxBreakHours] = useState<number>(1.5);
  const [noMaxBreak, setNoMaxBreak] = useState(true);
  const [maxCredits, setMaxCredits] = useState<number>(18);
  const [hasBlockedTime, setHasBlockedTime] = useState(false);
  const [blockedTimes, setBlockedTimes] = useState<
    { id: string; startTime: string; endTime: string }[]
  >([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [isLocalSearching, setIsLocalSearching] = useState<boolean>(false);

  const busy = isGenerating || isLocalSearching;

  const initializedRef = useRef(false);
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (preferences && !initializedRef.current) {
      initializedRef.current = true;
      if (preferences.preferredTime) {
        setPreferredTime(
          PREFERRED_TIME_API_TO_UI[preferences.preferredTime] ?? "مرن"
        );
      }
      if (Array.isArray(preferences.offDays)) {
        setDaysOff(preferences.offDays.map((d) => apiDayToUiDay(d) as DayOff));
      }
      if (preferences.density) {
        setDensity(DENSITY_API_TO_UI[preferences.density] ?? "مريح");
      }
      if (preferences.maxBreakMinutes === null) {
        setNoMaxBreak(true);
        setMaxBreakHours(1.5);
      } else if (typeof preferences.maxBreakMinutes === "number") {
        setNoMaxBreak(false);
        const hours = preferences.maxBreakMinutes / 60;
        setMaxBreakHours(Math.min(10, Math.max(0.5, hours)));
      }
      if (typeof preferences.maxCredits === "number") {
        setMaxCredits(Math.min(30, Math.max(1, preferences.maxCredits)));
      }
      if (
        Array.isArray(preferences.blockedTimes) &&
        preferences.blockedTimes.length > 0
      ) {
        setHasBlockedTime(true);
        setBlockedTimes(
          preferences.blockedTimes.map((b) => ({
            id: b.id || Math.random().toString(),
            startTime: toUiTimeFrom24(b.startTime),
            endTime: toUiTimeFrom24(b.endTime),
          }))
        );
      } else {
        setHasBlockedTime(false);
        setBlockedTimes([]);
      }
    }
  }, [preferences]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const addBlockedTime = () => {
    setBlockedTimes([
      ...blockedTimes,
      { id: Math.random().toString(), startTime: "", endTime: "" },
    ]);
  };

  const removeBlockedTime = (id: string) => {
    setBlockedTimes(blockedTimes.filter((b) => b.id !== id));
  };

  const updateBlockedTime = (
    id: string,
    field: "startTime" | "endTime",
    value: string
  ) => {
    setFormError(null);
    setBlockedTimes(
      blockedTimes.map((b) => (b.id === id ? { ...b, [field]: value } : b))
    );
  };

  const toggleDayOff = (day: DayOff) => {
    if (daysOff.includes(day)) {
      setDaysOff(daysOff.filter((d) => d !== day));
    } else {
      setDaysOff([...daysOff, day]);
    }
  };

  const handleSearch = async () => {
    setFormError(null);

    // 1) Validate blocked times if enabled
    const validBlockedTimes: { startTime: string; endTime: string }[] = [];
    if (hasBlockedTime) {
      for (const block of blockedTimes) {
        const sTrim = block.startTime.trim();
        const eTrim = block.endTime.trim();
        // Ignore items where both start and end are empty
        if (!sTrim && !eTrim) continue;

        const startParsed = toApiTimeLoose(sTrim);
        const endParsed = toApiTimeLoose(eTrim);

        if (!startParsed || !endParsed) {
          const errMsg =
            "يرجى إدخال وقت صحيح لجميع الأوقات المحجوبة (مثال: 12:00 م أو 14:00)";
          setFormError(errMsg);
          onScrollToTop?.();
          return;
        }

        const [sH, sM] = startParsed.split(":").map(Number);
        const [eH, eM] = endParsed.split(":").map(Number);
        if (eH * 60 + eM <= sH * 60 + sM) {
          const errMsg = "يجب أن يكون وقت نهاية الحجب بعد وقت البداية";
          setFormError(errMsg);
          onScrollToTop?.();
          return;
        }

        validBlockedTimes.push({
          startTime: startParsed,
          endTime: endParsed,
        });
      }
    }

    // 2) Build ApiPreferences
    const body: ApiPreferences = {
      preferredTime: PREFERRED_TIME_UI_TO_API[preferredTime] || "ANY",
      offDays: daysOff.map((d) => uiDayToApiDay(d)),
      density: DENSITY_UI_TO_API[density] || "RELAXED",
      maxBreakMinutes: noMaxBreak ? null : Math.round(maxBreakHours * 60),
      maxCredits: Number(maxCredits),
      blockedTimes: hasBlockedTime ? validBlockedTimes : [],
    };

    setIsLocalSearching(true);
    let saveSucceeded = false;
    try {
      await savePreferences(body);
      saveSucceeded = true;
      await generateSuggestions();
      onGenerated?.();
    } catch (err: any) {
      if (err?.code === "EMPTY_SCHEDULE") {
        await showDialog({
          variant: "info",
          title: "لا توجد مقررات",
          message:
            "سجّل مقرراً واحداً على الأقل في جدولك قبل البحث عن مقترحات",
        });
      } else if (err?.code === "LOCKED_COURSE_UNAVAILABLE") {
        const courseCode = err?.details?.courseCode || "";
        await showDialog({
          variant: "warning",
          title: "مقرر مثبّت لا يمكن جدولته",
          message: `المقرر ${courseCode} ليس له شعبة تناسب قيودك (مثل الأوقات المحجوبة). فُكّ تثبيته من تبويب المسجلة أو عدّل تفضيلاتك`,
        });
      } else if (err?.code === "NO_VALID_SCHEDULE") {
        await showDialog({
          variant: "warning",
          title: "لا يوجد جدول مناسب",
          message: err.message || "لا يوجد جدول مناسب للقيود المحددة",
        });
      } else {
        if (saveSucceeded) {
          await showDialog({
            variant: "warning",
            title: "تنبيه",
            message: `حُفظت تفضيلاتك لكن تعذر البحث: ${
              err?.message || "حدث خطأ أثناء البحث عن الجداول"
            }`,
          });
        } else {
          await showError(err);
        }
      }
    } finally {
      setIsLocalSearching(false);
    }
  };

  return (
    <View className="flex-1 w-full pb-20">
      {/* Prominent Error Banner */}
      {formError ? (
        <View className="w-full bg-red-50 border border-red-200 rounded-2xl p-4 mb-5 flex-row items-center gap-3">
          <AlertCircle size={20} color="#dc2626" />
          <Text
            className="flex-1 text-sm font-bold text-red-600 leading-relaxed"
            style={{ textAlign: "right", writingDirection: "rtl" }}
          >
            {formError}
          </Text>
        </View>
      ) : null}

      {/* Section 1: Preferred Time */}
      <View className="mb-6 w-full">
        <Text
          className="text-sm font-bold text-slate-800 mb-3"
          style={{ textAlign: "left", writingDirection: "rtl" }}
        >
          وقت الدوام المفضل
        </Text>
        <View className="flex-row bg-slate-100 rounded-xl p-1 w-full">
          {(["صباحي", "مسائي", "مرن"] as PreferredTime[]).map((opt) => (
            <TouchableOpacity
              key={opt}
              disabled={busy}
              onPress={() => setPreferredTime(opt)}
              className={`flex-1 py-2.5 rounded-lg items-center justify-center ${
                preferredTime === opt ? "bg-white" : ""
              }`}
              style={
                preferredTime === opt
                  ? {
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 1,
                    }
                  : undefined
              }
            >
              <Text
                className={`text-xs font-bold pb-1 leading-relaxed ${
                  preferredTime === opt ? "text-slate-900" : "text-slate-500"
                }`}
              >
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Section 2: Days Off */}
      <View className="mb-6 w-full">
        <Text
          className="text-sm font-bold text-slate-800 mb-3"
          style={{ textAlign: "left", writingDirection: "rtl" }}
        >
          أيام الإجازة (الأوف)
        </Text>
        <View
          className="flex-row flex-wrap justify-start gap-2 w-full"
          style={{ direction: "rtl" }}
        >
          {(
            ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس"] as DayOff[]
          ).map((day) => {
            const selected = daysOff.includes(day);
            return (
              <TouchableOpacity
                key={day}
                disabled={busy}
                onPress={() => toggleDayOff(day)}
                className={`py-2 px-4 rounded-full border ${
                  selected
                    ? "border-indigo-600 bg-indigo-600"
                    : "border-slate-200 bg-white"
                }`}
              >
                <Text
                  className={`text-xs font-semibold pb-1 leading-relaxed ${
                    selected ? "text-white" : "text-slate-600"
                  }`}
                >
                  {day}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Section 3: Schedule Density */}
      <View className="mb-6 w-full">
        <Text
          className="text-sm font-bold text-slate-800 mb-3"
          style={{ textAlign: "left", writingDirection: "rtl" }}
        >
          نمط الجدول
        </Text>
        <View className="flex-row bg-slate-100 rounded-xl p-1 w-full">
          {(["مضغوط", "مريح"] as ScheduleDensity[]).map((opt) => (
            <TouchableOpacity
              key={opt}
              disabled={busy}
              onPress={() => setDensity(opt)}
              className={`flex-1 py-2.5 rounded-lg items-center justify-center ${
                density === opt ? "bg-white" : ""
              }`}
              style={
                density === opt
                  ? {
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 1,
                    }
                  : undefined
              }
            >
              <Text
                className={`text-xs font-bold pb-1 leading-relaxed ${
                  density === opt ? "text-slate-900" : "text-slate-500"
                }`}
              >
                {opt === "مضغوط" ? "مضغوط (متتالية)" : "مريح (فترات راحة)"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Section 4: Max Break Time */}
      <View className="mb-6 w-full">
        <Text
          className="text-sm font-bold text-slate-800 mb-3"
          style={{ textAlign: "left", writingDirection: "rtl" }}
        >
          الحد الأقصى للبريك
        </Text>
        <View className="flex-row items-center justify-between w-full gap-4">
          <View
            className={`flex-1 flex-row items-center justify-between bg-white border rounded-2xl p-2 ${
              noMaxBreak ? "border-slate-200 opacity-50" : "border-indigo-200"
            }`}
          >
            <TouchableOpacity
              disabled={noMaxBreak || busy || maxBreakHours <= 0.5}
              onPress={() =>
                setMaxBreakHours(Math.max(0.5, maxBreakHours - 0.5))
              }
              className="p-2 bg-slate-50 rounded-xl"
            >
              <Minus
                size={20}
                color={
                  noMaxBreak || maxBreakHours <= 0.5
                    ? COLORS.slate300
                    : COLORS.slate600
                }
              />
            </TouchableOpacity>
            <Text className="text-sm font-bold text-slate-800 pb-1 leading-relaxed">
              {maxBreakHours} ساعة
            </Text>
            <TouchableOpacity
              disabled={noMaxBreak || busy || maxBreakHours >= 10}
              onPress={() => setMaxBreakHours(Math.min(10, maxBreakHours + 0.5))}
              className="p-2 bg-slate-50 rounded-xl"
            >
              <Plus
                size={20}
                color={
                  noMaxBreak || maxBreakHours >= 10
                    ? COLORS.slate300
                    : COLORS.slate600
                }
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            disabled={busy}
            onPress={() => setNoMaxBreak(!noMaxBreak)}
            className={`py-3.5 px-4 rounded-2xl border ${
              noMaxBreak
                ? "border-indigo-600 bg-indigo-50"
                : "border-slate-200 bg-white"
            }`}
          >
            <Text
              className={`text-sm font-bold pb-1 leading-relaxed ${
                noMaxBreak ? "text-indigo-600" : "text-slate-600"
              }`}
            >
              بدون حد
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Section 5: Max Credits */}
      <View className="mb-6 w-full">
        <Text
          className="text-sm font-bold text-slate-800 mb-3"
          style={{ textAlign: "left", writingDirection: "rtl" }}
        >
          الحد الأقصى للساعات المعتمدة
        </Text>
        <View className="flex-row items-center justify-between w-full">
          <View className="flex-1 flex-row items-center justify-between bg-white border border-indigo-200 rounded-2xl p-2">
            <TouchableOpacity
              disabled={busy || maxCredits <= 1}
              onPress={() => setMaxCredits(Math.max(1, maxCredits - 1))}
              className="p-2 bg-slate-50 rounded-xl"
            >
              <Minus
                size={20}
                color={
                  busy || maxCredits <= 1 ? COLORS.slate300 : COLORS.slate600
                }
              />
            </TouchableOpacity>
            <Text className="text-sm font-bold text-slate-800 pb-1 leading-relaxed">
              {maxCredits} {maxCredits === 1 ? "ساعة" : "ساعات"}
            </Text>
            <TouchableOpacity
              disabled={busy || maxCredits >= 30}
              onPress={() => setMaxCredits(Math.min(30, maxCredits + 1))}
              className="p-2 bg-slate-50 rounded-xl"
            >
              <Plus
                size={20}
                color={
                  busy || maxCredits >= 30 ? COLORS.slate300 : COLORS.slate600
                }
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Section 6: Blocked Times */}
      <View className="mb-8 w-full bg-white p-4 rounded-2xl border border-slate-200">
        <View className="flex-row justify-between items-center mb-1">
          <View className="flex-row items-center gap-2">
            <Text
              className="text-sm font-bold text-slate-800"
              style={{ textAlign: "left", writingDirection: "rtl" }}
            >
              تحديد وقت للراحة/الصلاة
            </Text>
            {hasBlockedTime && (
              <TouchableOpacity
                disabled={busy}
                onPress={addBlockedTime}
                className="flex-row items-center bg-indigo-50 px-2.5 py-1 rounded-lg gap-1"
              >
                <Plus size={14} color={COLORS.indigo600} />
                <Text className="text-xs font-bold text-indigo-600 pb-0.5 leading-relaxed">
                  إضافة وقت
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <Switch
            disabled={busy}
            value={hasBlockedTime}
            onValueChange={(val) => {
              setFormError(null);
              setHasBlockedTime(val);
              if (val && blockedTimes.length === 0) {
                addBlockedTime();
              }
            }}
            trackColor={{ false: COLORS.slate200, true: COLORS.indigo600 }}
            thumbColor={"#ffffff"}
          />
        </View>

        {hasBlockedTime && (
          <View className="gap-3 w-full items-stretch mt-4">
            {blockedTimes.map((block) => (
              <View
                key={block.id}
                className="w-full flex-row gap-3 items-end"
              >
                <View style={{ flex: 1 }}>
                  <Text
                    className="w-full text-xs font-semibold text-slate-500 mb-1.5 pb-0.5"
                    style={{ textAlign: "left", writingDirection: "rtl" }}
                  >
                    من
                  </Text>
                  <TextInput
                    editable={!busy}
                    value={block.startTime}
                    onChangeText={(val) =>
                      updateBlockedTime(block.id, "startTime", val)
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800"
                    style={{
                      textAlign: "right",
                      textAlignVertical: "center",
                      includeFontPadding: false,
                    }}
                    placeholder="12:00 م"
                    placeholderTextColor={COLORS.slate400}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    className="w-full text-xs font-semibold text-slate-500 mb-1.5 pb-0.5"
                    style={{ textAlign: "left", writingDirection: "rtl" }}
                  >
                    إلى
                  </Text>
                  <TextInput
                    editable={!busy}
                    value={block.endTime}
                    onChangeText={(val) =>
                      updateBlockedTime(block.id, "endTime", val)
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800"
                    style={{
                      textAlign: "right",
                      textAlignVertical: "center",
                      includeFontPadding: false,
                    }}
                    placeholder="01:00 م"
                    placeholderTextColor={COLORS.slate400}
                  />
                </View>
                <TouchableOpacity
                  disabled={busy}
                  onPress={() => removeBlockedTime(block.id)}
                  className="p-3 bg-red-50 rounded-2xl items-center justify-center border border-red-100"
                >
                  <Trash2 size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Bottom Action Button */}
      <TouchableOpacity
        disabled={busy}
        onPress={handleSearch}
        className={`w-full py-4 rounded-2xl flex-row items-center justify-center ${
          busy ? "bg-indigo-400" : "bg-indigo-600"
        }`}
        style={{
          shadowColor: "#4f46e5",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        {busy ? (
          <View className="flex-row items-center justify-center gap-2">
            <ActivityIndicator size="small" color="#ffffff" />
            <Text className="text-base font-bold text-white pb-1 leading-relaxed">
              جاري البحث عن أفضل الجداول...
            </Text>
          </View>
        ) : (
          <Text className="text-base font-bold text-white pb-1 leading-relaxed">
            البحث عن أفضل الجداول
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
