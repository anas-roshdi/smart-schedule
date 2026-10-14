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
} from "../../lib/mappers";
import {
  fetchSections,
  createSection,
  updateSection,
  patchSectionStatus,
  removeSection,
  fetchOriginal,
  registerSectionApi,
  unregisterSectionApi,
  setCourseLockApi,
} from "../../lib/schedule-api";

interface ScheduleContextType {
  registeredCourses: RegisteredCourse[];
  offeredSections: OfferedSection[];
  maxCredits: number;
  setMaxCredits: (n: number) => void;
  totalCredits: number;
  isLoading: boolean;
  loadError: string | null;
  reload: () => Promise<void>;
  addCourse: (course: any) => Promise<void>;
  updateCourse: (id: string, course: any) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  addOfferedSection: (section: any) => Promise<void>;
  updateOfferedSection: (id: string, section: any) => Promise<void>;
  deleteOfferedSection: (id: string) => Promise<void>;
  toggleOfferedSectionStatus: (id: string) => Promise<void>;
  registerSection: (
    sectionId: string,
    opts?: { replace?: boolean }
  ) => Promise<void>;
  toggleCourseLock: (code: string) => Promise<void>;
  isCourseLocked: (code: string) => boolean;
  checkConflict: (sessions: Session[]) => boolean;
  getCourseByCodeAndType: (
    code: string,
    type: string
  ) => RegisteredCourse | undefined;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(
  undefined
);

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [courses, setCourses] = useState<RegisteredCourse[]>([]);
  const [offered, setOffered] = useState<OfferedSection[]>([]);
  const [maxCredits, setMaxCredits] = useState<number>(18);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const initialLoadDoneRef = useRef<boolean>(false);

  const reload = useCallback(async () => {
    const isFirstLoad = !initialLoadDoneRef.current;
    if (isFirstLoad) {
      setIsLoading(true);
      setLoadError(null);
    }
    try {
      const [sectionsRes, scheduleRes] = await Promise.all([
        fetchSections(),
        fetchOriginal(),
      ]);
      setOffered(sectionsRes.sections.map(toOfferedSection));
      setCourses(scheduleRes.schedule.sections.map(toRegisteredCourse));
      if (typeof scheduleRes.schedule.maxCredits === "number") {
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
      if (newlyCreated) {
        fetchSections()
          .then((secRes) => setOffered(secRes.sections.map(toOfferedSection)))
          .catch(() => {});
      }
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
  };

  const deleteCourse = async (id: string) => {
    const res = await unregisterSectionApi(id);
    setCourses(res.schedule.sections.map(toRegisteredCourse));
    if (typeof res.schedule.maxCredits === "number") {
      setMaxCredits(res.schedule.maxCredits);
    }
  };

  const addOfferedSection = async (data: any) => {
    await createSection(toApiSectionBody(data));
    await reload();
  };

  const updateOfferedSection = async (id: string, updatedData: any) => {
    await updateSection(id, toApiSectionBody(updatedData));
    await reload();
  };

  const deleteOfferedSection = async (id: string) => {
    await removeSection(id);
    setOffered((prev) => prev.filter((s) => s.id !== id));
  };

  const toggleOfferedSectionStatus = async (id: string) => {
    const res = await patchSectionStatus(id);
    const updated = toOfferedSection(res.section);
    setOffered((prev) => prev.map((s) => (s.id === id ? updated : s)));
  };

  const registerSection = async (
    sectionId: string,
    opts?: { replace?: boolean }
  ) => {
    const res = await registerSectionApi(sectionId, opts?.replace);
    setCourses(res.schedule.sections.map(toRegisteredCourse));
    if (typeof res.schedule.maxCredits === "number") {
      setMaxCredits(res.schedule.maxCredits);
    }
  };

  const toggleCourseLock = async (code: string) => {
    const normalizedCode = code.trim().toUpperCase();
    const hasAnyUnlocked = courses.some(
      (c) => c.code.trim().toUpperCase() === normalizedCode && !c.locked
    );
    const newLocked = hasAnyUnlocked;
    const res = await setCourseLockApi(code, newLocked);
    setCourses(res.schedule.sections.map(toRegisteredCourse));
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
        maxCredits,
        setMaxCredits,
        totalCredits,
        isLoading,
        loadError,
        reload,
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
