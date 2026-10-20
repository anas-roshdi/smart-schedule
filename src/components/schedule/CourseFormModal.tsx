import React, { useState, useRef, useMemo } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
  TouchableOpacity,
} from "react-native";
import { X, Plus, Minus, Trash2, AlertCircle } from "lucide-react-native";
import { COLORS } from "./colors";
import { RegisteredCourse, OfferedSection, Session } from "./data";
import { useSchedule } from "./ScheduleContext";

export interface CourseFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (course: any) => Promise<void>;
  initialData?: RegisteredCourse | OfferedSection;
  target?: "registered" | "offered";
}

export function CourseFormModal({
  visible,
  onClose,
  onSave,
  initialData,
  target = "registered",
}: CourseFormModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      {visible ? (
        <CourseFormContent
          key={initialData ? initialData.id : "new"}
          onClose={onClose}
          onSave={onSave}
          initialData={initialData}
          target={target}
        />
      ) : null}
    </Modal>
  );
}

function parseTimeToMinutes(timeStr: string): number | null {
  if (!timeStr) return null;
  const clean = timeStr.trim();
  const match = clean.match(/^(\d{1,2}):(\d{2})\s*(ص|م)$/);
  if (match) {
    let h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    const period = match[3];
    if (period === "ص" && h === 12) h = 0;
    if (period === "م" && h !== 12) h += 12;
    return h * 60 + m;
  }
  const match24 = clean.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const h = parseInt(match24[1], 10);
    const m = parseInt(match24[2], 10);
    return h * 60 + m;
  }
  return null;
}



function CourseFormContent({
  onClose,
  onSave,
  initialData,
  target,
}: Omit<CourseFormModalProps, "visible"> & { target: "registered" | "offered" }) {
  const { registeredCourses, offeredSections, courseNameOf } = useSchedule();
  const scrollRef = useRef<ScrollView>(null);
  const [name, setName] = useState(initialData?.name || "");
  const [code, setCode] = useState(initialData?.code || "");
  const [credits, setCredits] = useState<number>(initialData?.credits ?? 3);
  const [selectedPrereqs, setSelectedPrereqs] = useState<string[]>(
    () => (initialData?.prerequisites || []).slice(0, 10)
  );
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [nameFieldError, setNameFieldError] = useState<string | null>(null);
  const [section, setSection] = useState(initialData?.section || "");
  const [instructor, setInstructor] = useState(initialData?.instructor || "");
  const [type, setType] = useState<"نظري" | "عملي">(initialData?.type || "نظري");
  const [mode, setMode] = useState<"حضوري" | "عن بعد">(
    initialData?.mode || "حضوري"
  );
  const [sessions, setSessions] = useState<Session[]>(
    initialData?.sessions && initialData.sessions.length > 0
      ? initialData.sessions
      : [{ id: "s-1", day: "الأحد", startTime: "08:00 ص", endTime: "09:30 ص" }]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const availableCourses = useMemo(() => {
    const currentCode = code.trim().toUpperCase();
    const seenCodes = new Set<string>();
    const list: { code: string; name: string }[] = [];

    for (const s of offeredSections) {
      const sCode = s.code.trim().toUpperCase();
      if (!sCode) continue;
      if (currentCode && sCode === currentCode) continue;
      if (!seenCodes.has(sCode)) {
        seenCodes.add(sCode);
        list.push({ code: s.code.trim(), name: s.name });
      }
    }
    return list;
  }, [offeredSections, code]);

  const clearError = () => {
    if (formError) {
      setFormError(null);
    }
    if (nameFieldError) {
      setNameFieldError(null);
    }
  };

  const togglePrereq = (prereqCode: string) => {
    clearError();
    const normalized = prereqCode.trim().toUpperCase();
    const exists = selectedPrereqs.some(
      (c) => c.trim().toUpperCase() === normalized
    );
    if (exists) {
      setSelectedPrereqs((prev) =>
        prev.filter((c) => c.trim().toUpperCase() !== normalized)
      );
    } else {
      if (selectedPrereqs.length >= 10) {
        displayError("الحد الأقصى للمتطلبات السابقة هو 10 مقررات");
        return;
      }
      setSelectedPrereqs((prev) => [...prev, normalized]);
    }
  };

  const removePrereq = (prereqCode: string) => {
    clearError();
    const normalized = prereqCode.trim().toUpperCase();
    setSelectedPrereqs((prev) =>
      prev.filter((c) => c.trim().toUpperCase() !== normalized)
    );
  };

  const addManualPrereq = () => {
    clearError();
    const cleaned = manualCode.replace(/\s+/g, "").toUpperCase();
    if (!cleaned) return;
    if (selectedPrereqs.some((c) => c.trim().toUpperCase() === cleaned)) {
      setManualCode("");
      setShowManualInput(false);
      return;
    }
    if (selectedPrereqs.length >= 10) {
      displayError("الحد الأقصى للمتطلبات السابقة هو 10 مقررات");
      return;
    }
    setSelectedPrereqs((prev) => [...prev, cleaned]);
    setManualCode("");
    setShowManualInput(false);
  };

  const displayError = (msg: string) => {
    Keyboard.dismiss();
    setFormError(msg);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleCodeChange = (text: string) => {
    clearError();
    setCode(text);
    const trimmed = text.trim().toLowerCase();
    if (trimmed) {
      const match = [...registeredCourses, ...offeredSections].find(
        (c) =>
          c.code.trim().toLowerCase() === trimmed &&
          typeof c.credits === "number"
      );
      if (match) {
        setCredits(match.credits);
      }
    }
  };

  const addSession = () => {
    clearError();
    setSessions((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        day: "الأحد",
        startTime: "08:00 ص",
        endTime: "09:30 ص",
      },
    ]);
  };

  const removeSession = (id: string) => {
    clearError();
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const updateSession = (id: string, key: keyof Session, value: string) => {
    clearError();
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [key]: value } : s))
    );
  };

  const validate = (): string | null => {
    if (!name.trim()) return "اسم المقرر مطلوب";
    if (!code.trim()) return "رمز المقرر مطلوب";
    if (!section.trim()) return "رقم الشعبة مطلوب";
    if (!sessions || sessions.length === 0) {
      return "يجب إضافة وقت واحد على الأقل";
    }

    for (let i = 0; i < sessions.length; i++) {
      const sess = sessions[i];
      if (!sess.day.trim()) return `يرجى تحديد اليوم للوقت رقم ${i + 1}`;
      const startMin = parseTimeToMinutes(sess.startTime);
      const endMin = parseTimeToMinutes(sess.endTime);

      if (startMin === null) {
        return `صيغة وقت البداية غير صالحة للوقت رقم ${i + 1} (مثال: 08:00 ص)`;
      }
      if (endMin === null) {
        return `صيغة وقت النهاية غير صالحة للوقت رقم ${i + 1} (مثال: 09:30 ص)`;
      }
      if (endMin <= startMin) {
        return `وقت النهاية للوقت رقم ${i + 1} يجب أن يكون بعد وقت البداية`;
      }
    }

    // Check overlaps within same day
    for (let i = 0; i < sessions.length; i++) {
      for (let j = i + 1; j < sessions.length; j++) {
        const s1 = sessions[i];
        const s2 = sessions[j];
        if (s1.day.trim() === s2.day.trim()) {
          const start1 = parseTimeToMinutes(s1.startTime)!;
          const end1 = parseTimeToMinutes(s1.endTime)!;
          const start2 = parseTimeToMinutes(s2.startTime)!;
          const end2 = parseTimeToMinutes(s2.endTime)!;

          if (start1 < end2 && end1 > start2) {
            return `يوجد تداخل بين الوقت ${i + 1} والوقت ${j + 1} في يوم ${s1.day}`;
          }
        }
      }
    }

    return null;
  };

  const handleSave = async () => {
    clearError();
    const validationError = validate();
    if (validationError) {
      displayError(validationError);
      return;
    }

    const payload =
      target === "offered"
        ? {
            id: initialData ? initialData.id : "",
            name: name.trim(),
            code: code.trim(),
            credits,
            section: section.trim(),
            instructor: instructor.trim(),
            type,
            mode,
            sessions,
            prerequisites: selectedPrereqs.slice(0, 10),
            status: (initialData as OfferedSection)?.status ?? "open",
          }
        : {
            id: initialData ? initialData.id : "",
            name: name.trim(),
            code: code.trim(),
            credits,
            section: section.trim(),
            instructor: instructor.trim(),
            type,
            mode,
            sessions,
            prerequisites: selectedPrereqs.slice(0, 10),
            color: (initialData as RegisteredCourse)?.color || "bg-indigo-500",
            locked: (initialData as RegisteredCourse)?.locked ?? false,
          };

    setIsSubmitting(true);
    try {
      await onSave(payload);
      onClose();
    } catch (err: any) {
      if (
        err?.code === "DUPLICATE_COURSE_NAME" ||
        (err?.status === 409 && err?.code === "DUPLICATE_COURSE_NAME")
      ) {
        const msg = err.message || "اسم المقرر مسجل مسبقاً لمقرر آخر";
        setNameFieldError(msg);
        displayError(msg);
        return;
      }

      if (err?.sectionSaved) {
        displayError(
          `حُفظت الشعبة في قائمة المطروحة لكنها لم تُضف إلى جدولك: ${err.message || ""}. يمكنك إضافتها من تبويب المطروحة`
        );
        return;
      }

      if (
        err?.status === 400 &&
        Array.isArray(err?.errors) &&
        err.errors.length > 0
      ) {
        const msg = err.errors.map((e: any) => e.message).join("، ");
        displayError(msg);
      } else if (err?.message) {
        displayError(err.message);
      } else {
        displayError("حدث خطأ أثناء حفظ البيانات");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const headerTitle = initialData
    ? target === "offered"
      ? "تعديل الشعبة"
      : "تعديل المقرر"
    : target === "offered"
    ? "إضافة شعبة جديدة"
    : "إضافة مقرر جديد";

  const saveBtnText =
    target === "offered"
      ? initialData
        ? "حفظ التعديلات"
        : "إضافة الشعبة"
      : initialData
      ? "حفظ التعديلات"
      : "حفظ المقرر";

  return (
    <View style={s.overlay}>
      <View style={s.sheet}>
        {/* Header */}
        <View className="w-full flex-row justify-between items-center mb-4">
          <Text className="pb-1 leading-relaxed text-lg font-bold text-slate-900">
            {headerTitle}
          </Text>
          <Pressable
            disabled={isSubmitting}
            onPress={onClose}
            className="p-2 bg-slate-100 rounded-full"
          >
            <X size={20} color={COLORS.slate600} />
          </Pressable>
        </View>

        <ScrollView
          ref={scrollRef}
          className="w-full mb-4"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Prominent Error Banner */}
          {formError ? (
            <View className="w-full bg-red-50 border border-red-200 rounded-2xl p-4 mb-4 flex-row items-center gap-3">
              <AlertCircle size={20} color="#dc2626" />
              <Text
                className="flex-1 text-sm font-bold text-red-600 leading-relaxed"
                style={{ textAlign: "right", writingDirection: "rtl" }}
              >
                {formError}
              </Text>
            </View>
          ) : null}

          <View style={{ width: "100%", gap: 16 }}>
            {/* Course name */}
            <View style={{ width: "100%" }}>
              <Text
                className="w-full text-sm font-semibold text-slate-700 mb-1.5 pb-0.5"
                style={{ textAlign: "left", writingDirection: "rtl", width: "100%" }}
              >
                اسم المقرر
              </Text>
              <TextInput
                value={name}
                onChangeText={(val) => {
                  clearError();
                  setName(val);
                }}
                className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-800 ${
                  nameFieldError ? "border-red-400" : "border-slate-200"
                }`}
                style={{
                  textAlign: "right",
                  textAlignVertical: "center",
                  includeFontPadding: false,
                }}
                placeholder="مثال: مقدمة في البرمجة"
                placeholderTextColor={COLORS.slate400}
              />
              {nameFieldError ? (
                <Text
                  className="w-full text-xs text-red-500 mt-1"
                  style={{ textAlign: "left", writingDirection: "rtl" }}
                >
                  {nameFieldError}
                </Text>
              ) : (
                <Text
                  className="w-full text-xs text-slate-400 mt-1"
                  style={{ textAlign: "left", writingDirection: "rtl" }}
                >
                  ميّز المقررات المتشابهة برقم، مثل: قواعد بيانات 1 وقواعد بيانات 2
                </Text>
              )}
            </View>

            {/* Course Code */}
            <View style={{ width: "100%" }}>
              <Text
                className="w-full text-sm font-semibold text-slate-700 mb-1.5 pb-0.5"
                style={{ textAlign: "left", writingDirection: "rtl", width: "100%" }}
              >
                رمز المقرر
              </Text>
              <TextInput
                value={code}
                onChangeText={handleCodeChange}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800"
                style={{
                  textAlign: "right",
                  textAlignVertical: "center",
                  includeFontPadding: false,
                }}
                placeholder="CS101"
                placeholderTextColor={COLORS.slate400}
              />
            </View>

            {/* Credits Counter */}
            <View style={{ width: "100%" }}>
              <Text
                className="w-full text-sm font-semibold text-slate-700 mb-1.5 pb-0.5"
                style={{ textAlign: "left", writingDirection: "rtl", width: "100%" }}
              >
                الساعات المعتمدة
              </Text>
              <View className="w-full flex-row items-center justify-between bg-white border border-indigo-200 rounded-2xl p-2">
                <Pressable
                  disabled={credits <= 1}
                  onPress={() => {
                    clearError();
                    setCredits((prev) => Math.max(1, prev - 1));
                  }}
                  className="p-2 bg-slate-50 rounded-xl"
                >
                  <Minus
                    size={20}
                    color={credits <= 1 ? COLORS.slate300 : COLORS.slate600}
                  />
                </Pressable>
                <Text className="text-sm font-bold text-slate-800 pb-1 leading-relaxed">
                  {credits} {credits === 1 ? "ساعة" : "ساعات"}
                </Text>
                <Pressable
                  disabled={credits >= 6}
                  onPress={() => {
                    clearError();
                    setCredits((prev) => Math.min(6, prev + 1));
                  }}
                  className="p-2 bg-slate-50 rounded-xl"
                >
                  <Plus
                    size={20}
                    color={credits >= 6 ? COLORS.slate300 : COLORS.slate600}
                  />
                </Pressable>
              </View>
            </View>

            {/* Prerequisites */}
            <View style={{ width: "100%" }}>
              <Text
                className="w-full text-sm font-semibold text-slate-700 mb-1.5 pb-0.5"
                style={{ textAlign: "left", writingDirection: "rtl", width: "100%" }}
              >
                المتطلبات السابقة
              </Text>

              {/* Selected Badges */}
              {selectedPrereqs.length > 0 && (
                <View className="mb-2.5 flex-row flex-wrap gap-1.5">
                  {selectedPrereqs.map((prereqCode) => {
                    const displayName = courseNameOf(prereqCode);
                    return (
                      <View
                        key={prereqCode}
                        className="flex-row items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-2.5 py-1"
                      >
                        <Text className="text-xs font-bold text-indigo-800">
                          {displayName}
                        </Text>
                        <Pressable
                          onPress={() => removePrereq(prereqCode)}
                          hitSlop={8}
                          className="rounded-full p-0.5"
                        >
                          <X size={12} color="#4338ca" />
                        </Pressable>
                      </View>
                    );
                  })}
                </View>
              )}

              {/* Available Courses to Choose From */}
              {availableCourses.length > 0 ? (
                <View className="rounded-2xl border border-slate-200 bg-slate-50/50 p-2.5">
                  <Text
                    className="mb-2 text-xs font-medium text-slate-500"
                    style={{ textAlign: "left", writingDirection: "rtl" }}
                  >
                    اختر المقررات المتطلبة:
                  </Text>
                  <View className="flex-row flex-wrap gap-1.5">
                    {availableCourses.map((c) => {
                      const isSelected = selectedPrereqs.some(
                        (p) => p.trim().toUpperCase() === c.code.toUpperCase()
                      );
                      return (
                        <Pressable
                          key={c.code}
                          onPress={() => togglePrereq(c.code)}
                          className={`flex-row items-center gap-1.5 rounded-xl border px-2.5 py-1.5 ${
                            isSelected
                              ? "border-indigo-600 bg-indigo-50"
                              : "border-slate-200 bg-white"
                          }`}
                        >
                          <Text
                            className={`text-xs font-bold ${
                              isSelected ? "text-indigo-700" : "text-slate-800"
                            }`}
                          >
                            {c.name}
                          </Text>
                          <Text className="text-[10px] text-slate-400">
                            ({c.code})
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ) : (
                <View className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                  <Text
                    className="text-xs text-slate-400"
                    style={{ textAlign: "left", writingDirection: "rtl" }}
                  >
                    لا توجد مقررات أخرى مطروحة بالقائمة
                  </Text>
                </View>
              )}

              {/* Link to Add Unlisted Course Code */}
              {!showManualInput ? (
                <TouchableOpacity
                  onPress={() => setShowManualInput(true)}
                  className="mt-2 self-start"
                >
                  <Text className="text-xs font-semibold text-indigo-600 underline">
                    مقرر غير موجود في القائمة؟
                  </Text>
                </TouchableOpacity>
              ) : (
                <View className="mt-2.5 rounded-2xl border border-slate-200 bg-white p-3">
                  <Text
                    className="text-xs font-semibold text-slate-700 mb-1.5"
                    style={{ textAlign: "left", writingDirection: "rtl" }}
                  >
                    إدخال رمز مقرر يدوي:
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <TextInput
                      value={manualCode}
                      onChangeText={(val) => {
                        clearError();
                        setManualCode(val.replace(/\s+/g, "").toUpperCase());
                      }}
                      className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800"
                      style={{
                        textAlign: "right",
                        textAlignVertical: "center",
                        includeFontPadding: false,
                      }}
                      placeholder="مثال: MATH101"
                      placeholderTextColor={COLORS.slate400}
                      autoCapitalize="characters"
                    />
                    <TouchableOpacity
                      onPress={addManualPrereq}
                      className="rounded-xl bg-indigo-600 px-3.5 py-2"
                    >
                      <Text className="text-xs font-bold text-white">إضافة</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setManualCode("");
                        setShowManualInput(false);
                      }}
                      className="rounded-xl bg-slate-100 px-2.5 py-2"
                    >
                      <Text className="text-xs font-bold text-slate-600">إلغاء</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <Text
                className="w-full text-xs text-slate-400 mt-1.5"
                style={{ textAlign: "left", writingDirection: "rtl" }}
              >
                لأغراض التنبيه فقط، لن تمنعك من التسجيل (بحد أقصى 10)
              </Text>
            </View>

            {/* Section */}
            <View style={{ width: "100%" }}>
              <Text
                className="w-full text-sm font-semibold text-slate-700 mb-1.5 pb-0.5"
                style={{ textAlign: "left", writingDirection: "rtl", width: "100%" }}
              >
                الشعبة
              </Text>
              <TextInput
                value={section}
                onChangeText={(val) => {
                  clearError();
                  setSection(val);
                }}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800"
                style={{
                  textAlign: "right",
                  textAlignVertical: "center",
                  includeFontPadding: false,
                }}
                placeholder="شعبة 5"
                placeholderTextColor={COLORS.slate400}
              />
            </View>

            {/* Instructor */}
            <View style={{ width: "100%" }}>
              <Text
                className="w-full text-sm font-semibold text-slate-700 mb-1.5 pb-0.5"
                style={{ textAlign: "left", writingDirection: "rtl", width: "100%" }}
              >
                دكتور المقرر
              </Text>
              <TextInput
                value={instructor}
                onChangeText={(val) => {
                  clearError();
                  setInstructor(val);
                }}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800"
                style={{
                  textAlign: "right",
                  textAlignVertical: "center",
                  includeFontPadding: false,
                }}
                placeholder="دكتور المقرر (مثال: د. أحمد)"
                placeholderTextColor={COLORS.slate400}
              />
            </View>

            {/* Type + Mode toggles */}
            <View style={{ width: "100%", flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text
                  className="w-full text-sm font-semibold text-slate-700 mb-1.5 pb-0.5"
                  style={{ textAlign: "left", writingDirection: "rtl", width: "100%" }}
                >
                  النوع
                </Text>
                <View className="flex-row bg-slate-100 rounded-xl p-1">
                  <Pressable
                    onPress={() => {
                      clearError();
                      setType("نظري");
                    }}
                    className={`flex-1 py-2.5 rounded-lg items-center justify-center ${
                      type === "نظري" ? "bg-white shadow-sm" : ""
                    }`}
                  >
                    <Text
                      className={`pb-1 leading-relaxed text-xs font-bold text-center ${
                        type === "نظري" ? "text-slate-900" : "text-slate-500"
                      }`}
                    >
                      نظري
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      clearError();
                      setType("عملي");
                    }}
                    className={`flex-1 py-2.5 rounded-lg items-center justify-center ${
                      type === "عملي" ? "bg-white shadow-sm" : ""
                    }`}
                  >
                    <Text
                      className={`pb-1 leading-relaxed text-xs font-bold text-center ${
                        type === "عملي" ? "text-slate-900" : "text-slate-500"
                      }`}
                    >
                      عملي
                    </Text>
                  </Pressable>
                </View>
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  className="w-full text-sm font-semibold text-slate-700 mb-1.5 pb-0.5"
                  style={{ textAlign: "left", writingDirection: "rtl", width: "100%" }}
                >
                  النمط
                </Text>
                <View className="flex-row bg-slate-100 rounded-xl p-1">
                  <Pressable
                    onPress={() => {
                      clearError();
                      setMode("حضوري");
                    }}
                    className={`flex-1 py-2.5 rounded-lg items-center justify-center ${
                      mode === "حضوري" ? "bg-white shadow-sm" : ""
                    }`}
                  >
                    <Text
                      className={`pb-1 leading-relaxed text-xs font-bold text-center ${
                        mode === "حضوري" ? "text-slate-900" : "text-slate-500"
                      }`}
                    >
                      حضوري
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      clearError();
                      setMode("عن بعد");
                    }}
                    className={`flex-1 py-2.5 rounded-lg items-center justify-center ${
                      mode === "عن بعد" ? "bg-white shadow-sm" : ""
                    }`}
                  >
                    <Text
                      className={`pb-1 leading-relaxed text-xs font-bold text-center ${
                        mode === "عن بعد" ? "text-slate-900" : "text-slate-500"
                      }`}
                    >
                      عن بعد
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>

            {/* Sessions */}
            <View style={{ width: "100%", marginTop: 8 }}>
              <View
                style={{
                  width: "100%",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <Text
                  className="pb-1 leading-relaxed text-sm font-bold text-slate-800"
                  style={{ textAlign: "left", writingDirection: "rtl" }}
                >
                  الأوقات
                </Text>
                <Pressable
                  onPress={addSession}
                  className="flex-row items-center bg-indigo-50 px-2.5 py-1 rounded-lg gap-1"
                >
                  <Plus size={14} color={COLORS.indigo600} />
                  <Text className="text-xs font-bold text-indigo-600 pb-0.5 leading-relaxed">
                    إضافة وقت
                  </Text>
                </Pressable>
              </View>
              <View className="gap-3 w-full items-stretch">
                {sessions.map((sess, index) => (
                  <View
                    key={sess.id}
                    className="w-full rounded-2xl border border-slate-200 bg-white p-3 gap-3 items-stretch"
                  >
                    <View className="w-full flex-row justify-between items-center">
                      <Text
                        className="pb-1 leading-relaxed text-xs font-semibold text-slate-500"
                        style={{ textAlign: "left", writingDirection: "rtl" }}
                      >
                        وقت {index + 1}
                      </Text>
                      {sessions.length > 1 && (
                        <Pressable onPress={() => removeSession(sess.id)} hitSlop={8}>
                          <Trash2 size={16} color="#ef4444" />
                        </Pressable>
                      )}
                    </View>
                    <TextInput
                      value={sess.day}
                      onChangeText={(v) => updateSession(sess.id, "day", v)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800"
                      style={{
                        textAlign: "right",
                        textAlignVertical: "center",
                        includeFontPadding: false,
                      }}
                      placeholder="اليوم (مثال: الأحد)"
                      placeholderTextColor={COLORS.slate400}
                    />
                    <View className="w-full flex-row gap-2 items-center">
                      <TextInput
                        value={sess.startTime}
                        onChangeText={(v) => updateSession(sess.id, "startTime", v)}
                        className="w-full flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800"
                        style={{
                          textAlign: "right",
                          textAlignVertical: "center",
                          includeFontPadding: false,
                        }}
                        placeholder="08:00 ص"
                        placeholderTextColor={COLORS.slate400}
                      />
                      <TextInput
                        value={sess.endTime}
                        onChangeText={(v) => updateSession(sess.id, "endTime", v)}
                        className="w-full flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800"
                        style={{
                          textAlign: "right",
                          textAlignVertical: "center",
                          includeFontPadding: false,
                        }}
                        placeholder="09:30 ص"
                        placeholderTextColor={COLORS.slate400}
                      />
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>

        <Pressable
          disabled={isSubmitting}
          onPress={handleSave}
          className="w-full py-4 rounded-2xl bg-indigo-600 items-center justify-center active:bg-indigo-700"
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text className="text-base font-bold text-white pb-1 leading-relaxed">
              {saveBtnText}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
  },
});
