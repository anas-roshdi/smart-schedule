import React, { createContext, useContext, useState, ReactNode } from "react";
import {
  RegisteredCourse,
  registeredCourses as initialRegisteredCourses,
  OfferedSection,
  offeredSections as initialOfferedSections,
  Session,
} from "./data";

interface ScheduleContextType {
  registeredCourses: RegisteredCourse[];
  addCourse: (course: RegisteredCourse) => void;
  updateCourse: (id: string, course: RegisteredCourse) => void;
  deleteCourse: (id: string) => void;
  offeredSections: OfferedSection[];
  addOfferedSection: (section: OfferedSection) => void;
  updateOfferedSection: (id: string, section: OfferedSection) => void;
  deleteOfferedSection: (id: string) => void;
  toggleOfferedSectionStatus: (id: string) => void;
  checkConflict: (sessions: Session[]) => boolean;
  getCourseByCodeAndType: (code: string, type: string) => RegisteredCourse | undefined;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [courses, setCourses] = useState<RegisteredCourse[]>(initialRegisteredCourses);
  const [offered, setOffered] = useState<OfferedSection[]>(initialOfferedSections);

  const addCourse = (course: RegisteredCourse) => {
    setCourses((prev) => [...prev, course]);
  };

  const updateCourse = (id: string, updatedCourse: RegisteredCourse) => {
    setCourses((prev) => prev.map((c) => (c.id === id ? updatedCourse : c)));
  };

  const deleteCourse = (id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  const addOfferedSection = (section: OfferedSection) => {
    const newSection: OfferedSection = {
      ...section,
      status: section.status || "open",
    };
    setOffered((prev) => [...prev, newSection]);
  };

  const updateOfferedSection = (id: string, updatedSection: OfferedSection) => {
    setOffered((prev) => prev.map((s) => (s.id === id ? updatedSection : s)));
  };

  const deleteOfferedSection = (id: string) => {
    setOffered((prev) => prev.filter((s) => s.id !== id));
  };

  const toggleOfferedSectionStatus = (id: string) => {
    setOffered((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, status: s.status === "open" ? "closed" : "open" } : s
      )
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
            // Overlap condition
            if (aStart < bEnd && aEnd > bStart) return true;
          }
        }
      }
    }
    return false;
  };

  const getCourseByCodeAndType = (code: string, type: string) => {
    return courses.find((c) => c.code === code && c.type === type);
  };

  return (
    <ScheduleContext.Provider
      value={{
        registeredCourses: courses,
        addCourse,
        updateCourse,
        deleteCourse,
        offeredSections: offered,
        addOfferedSection,
        updateOfferedSection,
        deleteOfferedSection,
        toggleOfferedSectionStatus,
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
  if (!context) throw new Error("useSchedule must be used within ScheduleProvider");
  return context;
}
