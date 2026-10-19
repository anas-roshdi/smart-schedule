import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
  ReactNode,
} from "react";
import { RegisteredCourse, OfferedSection, Session } from "./data";
import {
  toOfferedSection,
  toRegisteredCourse,
  toApiSectionBody,
  ApiPreferences,
  ApiSuggestion,
} from "../../lib/mappers";
import {
  fetchSections,
  PrerequisiteWarning,
  createSection,
  updateSection,
  patchSectionStatus,
  removeSection,
  fetchOriginal,
  registerSectionApi,
  unregisterSectionApi,
  setCourseLockApi,
  fetchPreferences,
  savePreferencesApi,
  generateApi,
  fetchSuggestions,
  applySuggestionApi,
} from "../../lib/schedule-api";

interface ScheduleContextType {
  registeredCourses: RegisteredCourse[];
  offeredSections: OfferedSection[];
  preferences: ApiPreferences | null;
  suggestions: ApiSuggestion[];
  originalScore: number | null;
  originalBlockedCourses: string[];
  hasSearched: boolean;
  isGenerating: boolean;
  minCredits: number;
  maxCredits: number;
  totalCredits: number;
  isLoading: boolean;
  loadError: string | null;
  reload: () => Promise<void>;
  savePreferences: (body: ApiPreferences) => Promise<void>;
  generateSuggestions: () => Promise<{
    suggestions: ApiSuggestion[];
    truncated: boolean;
    originalScore: number;
    originalBlockedCourses: string[];
  }>;
  applySuggestion: (id: string) => Promise<void>;
  clearSuggestionsLocally: () => void;
  addCourse: (course: any) => Promise<PrerequisiteWarning | null>;
  updateCourse: (id: string, course: any) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  addOfferedSection: (section: any) => Promise<void>;
  updateOfferedSection: (id: string, section: any) => Promise<void>;
  deleteOfferedSection: (id: string) => Promise<void>;
  toggleOfferedSectionStatus: (id: string) => Promise<void>;
  registerSection: (
    sectionId: string,
    opts?: { replace?: boolean }
  ) => Promise<PrerequisiteWarning | null>;
  toggleCourseLock: (code: string) => Promise<void>;
  isCourseLocked: (code: string) => boolean;
  checkConflict: (sessions: Session[]) => boolean;
  getCourseByCodeAndType: (
    code: string,
    type: string
  ) => RegisteredCourse | undefined;
}

export const DEFAULT_PREFERENCES: ApiPreferences = {
  preferredTime: "ANY",
  offDays: [],
  density: "MEDIUM",
  maxBreakMinutes: null,
  minCredits: 12,
  maxCredits: 18,
  blockedTimes: [],
};

const ScheduleContext = createContext<ScheduleContextType | undefined>(
  undefined
);

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [courses, setCourses] = useState<RegisteredCourse[]>([]);
  const [offered, setOffered] = useState<OfferedSection[]>([]);
  const [preferences, setPreferences] = useState<ApiPreferences | null>(
    DEFAULT_PREFERENCES
  );
  const [suggestions, setSuggestions] = useState<ApiSuggestion[]>([]);
  const [originalScore, setOriginalScore] = useState<number | null>(null);
  const [originalBlockedCourses, setOriginalBlockedCourses] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [minCredits, setMinCredits] = useState<number>(12);
  const [maxCredits, setMaxCredits] = useState<number>(18);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const initialLoadDoneRef = useRef<boolean>(false);

  const clearSuggestionsLocally = useCallback(() => {
    setSuggestions([]);
    setHasSearched(false);
    setOriginalScore(null);
    setOriginalBlockedCourses([]);
  }, []);

  const reload = useCallback(async () => {
    const isFirstLoad = !initialLoadDoneRef.current;
    if (isFirstLoad) {
      setIsLoading(true);
      setLoadError(null);
    }
    try {
      const [sectionsRes, scheduleRes, prefsRes, suggsRes] = await Promise.all([
        fetchSections(),
        fetchOriginal(),
        fetchPreferences(),
        fetchSuggestions(),
      ]);
      setOffered(sectionsRes.sections.map(toOfferedSection));
      setCourses(scheduleRes.schedule.sections.map(toRegisteredCourse));
      setPreferences(prefsRes.preferences);
      setSuggestions(suggsRes.suggestions);
      setOriginalScore(suggsRes.originalScore ?? null);
      setOriginalBlockedCourses(suggsRes.originalBlockedCourses || []);
      setHasSearched(false);
      if (typeof prefsRes.preferences?.minCredits === "number") {
        setMinCredits(prefsRes.preferences.minCredits);
      }
      if (typeof prefsRes.preferences?.maxCredits === "number") {
        setMaxCredits(prefsRes.preferences.maxCredits);
      } else if (typeof scheduleRes.schedule.maxCredits === "number") {
        setMaxCredits(scheduleRes.schedule.maxCredits);
      }
      initialLoadDoneRef.current = true;
      setLoadError(null);
    } catch (err: any) {
      if (isFirstLoad) {
        setLoadError(
          err?.message || "تعذر تحميل البيانات، تأكد من الاتصال بالخادم"
        );
      }
      throw err;
    } finally {
      if (isFirstLoad) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload().catch(() => {});
  }, [reload]);

  const totalCredits = useMemo(() => {
    const seenCodes = new Set<string>();
    let total = 0;
    for (const c of courses) {
      const codeKey = c.code.trim().toUpperCase();
      if (!seenCodes.has(codeKey)) {
        seenCodes.add(codeKey);
        total += c.credits || 0;
      }
    }
    return total;
  }, [courses]);

  const addCourse = async (data: any) => {
    const body = toApiSectionBody(data);
    let sectionId: string;
    let newlyCreated = false;

    try {
      const res = await createSection(body);
      sectionId = res.section.id;
      newlyCreated = true;
    } catch (err: any) {
      if (err?.code === "DUPLICATE_SECTION") {
        let existing = offered.find(
          (s) =>
            s.code.trim().toUpperCase() === data.code.trim().toUpperCase() &&
            s.type === data.type &&
            s.section.trim() === data.section.trim()
        );
        if (!existing) {
          try {
            const secRes = await fetchSections();
            const freshOffered = secRes.sections.map(toOfferedSection);
            setOffered(freshOffered);
            existing = freshOffered.find(
              (s) =>
                s.code.trim().toUpperCase() === data.code.trim().toUpperCase() &&
                s.type === data.type &&
                s.section.trim() === data.section.trim()
            );
          } catch {}
        }
        if (existing) {
          sectionId = existing.id;
        } else {
          throw err;
        }
      } else {
        throw err;
      }
    }

    try {
      const regRes = await registerSectionApi(sectionId);
      setCourses(regRes.schedule.sections.map(toRegisteredCourse));
      if (typeof regRes.schedule.maxCredits === "number") {
        setMaxCredits(regRes.schedule.maxCredits);
      }
      clearSuggestionsLocally();
      if (newlyCreated) {
        fetchSections()
          .then((secRes) => setOffered(secRes.sections.map(toOfferedSection)))
          .catch(() => {});
      }
      return regRes.prerequisiteWarning ?? null;
    } catch (err: any) {
      if (newlyCreated) {
        try {
          await reload();
        } catch {}
        err.sectionSaved = true;
      }
      throw err;
    }
  };

  const updateCourse = async (id: string, updatedData: any) => {
    await updateSection(id, toApiSectionBody(updatedData));
    await reload();
    clearSuggestionsLocally();
  };

  const deleteCourse = async (id: string) => {
    const res = await unregisterSectionApi(id);
    setCourses(res.schedule.sections.map(toRegisteredCourse));
    if (typeof res.schedule.maxCredits === "number") {
      setMaxCredits(res.schedule.maxCredits);
    }
    clearSuggestionsLocally();
  };

  const addOfferedSection = async (data: any) => {
    await createSection(toApiSectionBody(data));
    await reload();
    clearSuggestionsLocally();
  };

  const updateOfferedSection = async (id: string, updatedData: any) => {
    await updateSection(id, toApiSectionBody(updatedData));
    await reload();
    clearSuggestionsLocally();
  };

  const deleteOfferedSection = async (id: string) => {
    await removeSection(id);
    setOffered((prev) => prev.filter((s) => s.id !== id));
    clearSuggestionsLocally();
  };

  const sectionStatusReqSeq = useRef<Map<string, number>>(new Map());
  const courseLockReqSeq = useRef<Map<string, number>>(new Map());

  const toggleOfferedSectionStatus = async (id: string) => {
    const nextSeq = (sectionStatusReqSeq.current.get(id) || 0) + 1;
    sectionStatusReqSeq.current.set(id, nextSeq);

    const previousOffered = offered;

    setOffered((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status: s.status === "open" ? "closed" : "open" }
          : s
      )
    );

    try {
      const res = await patchSectionStatus(id);
      if (sectionStatusReqSeq.current.get(id) === nextSeq) {
        const updated = toOfferedSection(res.section);
        setOffered((prev) => prev.map((s) => (s.id === id ? updated : s)));
        clearSuggestionsLocally();
      }
    } catch (err) {
      if (sectionStatusReqSeq.current.get(id) === nextSeq) {
        setOffered(previousOffered);
      }
      throw err;
    }
  };

  const registerSection = async (
    sectionId: string,
    opts?: { replace?: boolean }
  ): Promise<PrerequisiteWarning | null> => {
    const res = await registerSectionApi(sectionId, opts?.replace);
    setCourses(res.schedule.sections.map(toRegisteredCourse));
    if (typeof res.schedule.maxCredits === "number") {
      setMaxCredits(res.schedule.maxCredits);
    }
    clearSuggestionsLocally();
    return res.prerequisiteWarning ?? null;
  };

  const toggleCourseLock = async (code: string) => {
    const normalizedCode = code.trim().toUpperCase();
    const nextSeq = (courseLockReqSeq.current.get(normalizedCode) || 0) + 1;
    courseLockReqSeq.current.set(normalizedCode, nextSeq);

    const previousCourses = courses;

    const hasAnyUnlocked = courses.some(
      (c) => c.code.trim().toUpperCase() === normalizedCode && !c.locked
    );
    const newLocked = hasAnyUnlocked;

    setCourses((prev) =>
      prev.map((c) =>
        c.code.trim().toUpperCase() === normalizedCode
          ? { ...c, locked: newLocked }
          : c
      )
    );

    try {
      const res = await setCourseLockApi(code, newLocked);
      if (courseLockReqSeq.current.get(normalizedCode) === nextSeq) {
        setCourses(res.schedule.sections.map(toRegisteredCourse));
        clearSuggestionsLocally();
      }
    } catch (err) {
      if (courseLockReqSeq.current.get(normalizedCode) === nextSeq) {
        setCourses(previousCourses);
      }
      throw err;
    }
  };

  const savePreferences = async (body: ApiPreferences) => {
    const res = await savePreferencesApi(body);
    setPreferences(res.preferences);
    if (typeof res.preferences?.minCredits === "number") {
      setMinCredits(res.preferences.minCredits);
    }
    if (typeof res.preferences?.maxCredits === "number") {
      setMaxCredits(res.preferences.maxCredits);
    }
    clearSuggestionsLocally();
  };

  const generateSuggestions = async () => {
    setIsGenerating(true);
    try {
      const res = await generateApi();
      setSuggestions(res.suggestions);
      setOriginalScore(res.originalScore);
      setOriginalBlockedCourses(res.originalBlockedCourses || []);
      setHasSearched(true);
      return res;
    } finally {
      setIsGenerating(false);
    }
  };

  const applySuggestion = async (id: string) => {
    const res = await applySuggestionApi(id);
    setCourses(res.schedule.sections.map(toRegisteredCourse));
    if (typeof res.schedule.maxCredits === "number") {
      setMaxCredits(res.schedule.maxCredits);
    }
    clearSuggestionsLocally();
  };

  const isCourseLocked = (code: string) => {
    const normalizedCode = code.trim().toUpperCase();
    return courses.some(
      (c) => c.code.trim().toUpperCase() === normalizedCode && c.locked
    );
  };

  const parseTime = (timeStr: string) => {
    try {
      const [time, period] = timeStr.trim().split(" ");
      if (!time || !period) return 0;
      let [hours, minutes] = time.split(":").map(Number);
      if (period === "م" && hours !== 12) hours += 12;
      if (period === "ص" && hours === 12) hours = 0;
      return hours * 60 + (minutes || 0);
    } catch {
      return 0;
    }
  };

  const checkConflict = (sessions: Session[]) => {
    for (const a of sessions) {
      for (const c of courses) {
        for (const b of c.sessions) {
          if (a.day === b.day) {
            const aStart = parseTime(a.startTime);
            const aEnd = parseTime(a.endTime);
            const bStart = parseTime(b.startTime);
            const bEnd = parseTime(b.endTime);
            if (aStart < bEnd && aEnd > bStart) return true;
          }
        }
      }
    }
    return false;
  };

  const getCourseByCodeAndType = (code: string, type: string) => {
    const normalizedCode = code.trim().toUpperCase();
    return courses.find(
      (c) => c.code.trim().toUpperCase() === normalizedCode && c.type === type
    );
  };

  return (
    <ScheduleContext.Provider
      value={{
        registeredCourses: courses,
        offeredSections: offered,
        preferences,
        suggestions,
        originalScore,
        originalBlockedCourses,
        hasSearched,
        isGenerating,
        minCredits,
        maxCredits,
        totalCredits,
        isLoading,
        loadError,
        reload,
        savePreferences,
        generateSuggestions,
        applySuggestion,
        clearSuggestionsLocally,
        addCourse,
        updateCourse,
        deleteCourse,
        addOfferedSection,
        updateOfferedSection,
        deleteOfferedSection,
        toggleOfferedSectionStatus,
        registerSection,
        toggleCourseLock,
        isCourseLocked,
        checkConflict,
        getCourseByCodeAndType,
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule() {
  const context = useContext(ScheduleContext);
  if (!context)
    throw new Error("useSchedule must be used within ScheduleProvider");
  return context;
}
