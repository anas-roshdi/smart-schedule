import React, { useState } from "react";
import { View, Text, TouchableOpacity, Switch, TextInput, Alert } from "react-native";
import { Minus, Plus, Trash2 } from "lucide-react-native";
import { COLORS } from "./colors";
import { useSchedule } from "./ScheduleContext";

type PreferredTime = "صباحي" | "مسائي" | "مرن";
type ScheduleDensity = "مضغوط" | "مريح";
type DayOff = "الأحد" | "الإثنين" | "الثلاثاء" | "الأربعاء" | "الخميس";

export function Preferences() {
  const { maxCredits, setMaxCredits } = useSchedule();
  const [preferredTime, setPreferredTime] = useState<PreferredTime>("صباحي");
  const [daysOff, setDaysOff] = useState<DayOff[]>([]);
  const [density, setDensity] = useState<ScheduleDensity>("مريح");
  const [maxBreakHours, setMaxBreakHours] = useState<number>(1.5);
  const [noMaxBreak, setNoMaxBreak] = useState(false);
  const [hasBlockedTime, setHasBlockedTime] = useState(false);
  const [blockedTimes, setBlockedTimes] = useState<{ id: string; startTime: string; endTime: string }[]>([]);

  const addBlockedTime = () => {
    setBlockedTimes([...blockedTimes, { id: Math.random().toString(), startTime: "", endTime: "" }]);
  };

  const removeBlockedTime = (id: string) => {
    setBlockedTimes(blockedTimes.filter((b) => b.id !== id));
  };

  const updateBlockedTime = (id: string, field: "startTime" | "endTime", value: string) => {
    setBlockedTimes(blockedTimes.map((b) => (b.id === id ? { ...b, [field]: value } : b)));
  };

  const toggleDayOff = (day: DayOff) => {
    if (daysOff.includes(day)) {
      setDaysOff(daysOff.filter((d) => d !== day));
    } else {
      setDaysOff([...daysOff, day]);
    }
  };

  const handleSearch = () => {
    console.log("Search with preferences:", {
      preferredTime,
      daysOff,
      density,
      maxBreakHours: noMaxBreak ? null : maxBreakHours,
      maxCredits,
      hasBlockedTime,
      blockedTimes,
    });
    Alert.alert("تم", "البحث عن أفضل الجداول جاري...");
  };

  return (
    <View className="flex-1 w-full pb-20">
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
              onPress={() => setPreferredTime(opt)}
              className={`flex-1 py-2.5 rounded-lg items-center justify-center ${
                preferredTime === opt ? "bg-white" : ""
              }`}
              style={preferredTime === opt ? { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 } : undefined}
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
        <View className="flex-row flex-wrap justify-start gap-2 w-full" style={{ direction: 'rtl' }}>
          {(["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس"] as DayOff[]).map(
            (day) => {
              const selected = daysOff.includes(day);
              return (
                <TouchableOpacity
                  key={day}
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
            }
          )}
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
              onPress={() => setDensity(opt)}
              className={`flex-1 py-2.5 rounded-lg items-center justify-center ${
                density === opt ? "bg-white" : ""
              }`}
              style={density === opt ? { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 } : undefined}
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
          <View className={`flex-1 flex-row items-center justify-between bg-white border rounded-2xl p-2 ${noMaxBreak ? "border-slate-200 opacity-50" : "border-indigo-200"}`}>
            <TouchableOpacity
              disabled={noMaxBreak}
              onPress={() => setMaxBreakHours(Math.max(0.5, maxBreakHours - 0.5))}
              className="p-2 bg-slate-50 rounded-xl"
            >
              <Minus size={20} color={COLORS.slate600} />
            </TouchableOpacity>
            <Text className="text-sm font-bold text-slate-800 pb-1 leading-relaxed">
              {maxBreakHours} ساعة
            </Text>
            <TouchableOpacity
              disabled={noMaxBreak}
              onPress={() => setMaxBreakHours(maxBreakHours + 0.5)}
              className="p-2 bg-slate-50 rounded-xl"
            >
              <Plus size={20} color={COLORS.slate600} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() => setNoMaxBreak(!noMaxBreak)}
            className={`py-3.5 px-4 rounded-2xl border ${
              noMaxBreak ? "border-indigo-600 bg-indigo-50" : "border-slate-200 bg-white"
            }`}
          >
            <Text className={`text-sm font-bold pb-1 leading-relaxed ${noMaxBreak ? "text-indigo-600" : "text-slate-600"}`}>
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
              disabled={maxCredits <= 1}
              onPress={() => setMaxCredits(Math.max(1, maxCredits - 1))}
              className="p-2 bg-slate-50 rounded-xl"
            >
              <Minus size={20} color={maxCredits <= 1 ? COLORS.slate300 : COLORS.slate600} />
            </TouchableOpacity>
            <Text className="text-sm font-bold text-slate-800 pb-1 leading-relaxed">
              {maxCredits} {maxCredits === 1 ? "ساعة" : "ساعات"}
            </Text>
            <TouchableOpacity
              disabled={maxCredits >= 30}
              onPress={() => setMaxCredits(Math.min(30, maxCredits + 1))}
              className="p-2 bg-slate-50 rounded-xl"
            >
              <Plus size={20} color={maxCredits >= 30 ? COLORS.slate300 : COLORS.slate600} />
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
              <TouchableOpacity onPress={addBlockedTime} className="flex-row items-center bg-indigo-50 px-2.5 py-1 rounded-lg gap-1">
                <Plus size={14} color={COLORS.indigo600} />
                <Text className="text-xs font-bold text-indigo-600 pb-0.5 leading-relaxed">إضافة وقت</Text>
              </TouchableOpacity>
            )}
          </View>
          <Switch
            value={hasBlockedTime}
            onValueChange={(val) => {
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
              <View key={block.id} className="w-full flex-row gap-3 items-end">
                <View style={{ flex: 1 }}>
                  <Text
                    className="w-full text-xs font-semibold text-slate-500 mb-1.5 pb-0.5"
                    style={{ textAlign: "left", writingDirection: "rtl" }}
                  >
                    من
                  </Text>
                  <TextInput
                    value={block.startTime}
                    onChangeText={(val) => updateBlockedTime(block.id, "startTime", val)}
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
                    value={block.endTime}
                    onChangeText={(val) => updateBlockedTime(block.id, "endTime", val)}
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
                <TouchableOpacity onPress={() => removeBlockedTime(block.id)} className="p-3 bg-red-50 rounded-2xl items-center justify-center border border-red-100">
                  <Trash2 size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Bottom Action Button */}
      <TouchableOpacity
        onPress={handleSearch}
        className="w-full py-4 rounded-2xl bg-indigo-600 items-center justify-center"
        style={{ shadowColor: '#4f46e5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3 }}
      >
        <Text className="text-base font-bold text-white pb-1 leading-relaxed">
          البحث عن أفضل الجداول
        </Text>
      </TouchableOpacity>
    </View>
  );
}
