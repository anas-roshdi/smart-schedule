import { request } from "./api";
import {
  ApiSchedule,
  ApiSection,
  ApiSectionBody,
  ApiPreferences,
  ApiSuggestion,
} from "./mappers";

export async function fetchSections(): Promise<{ sections: ApiSection[] }> {
  return request<{ sections: ApiSection[] }>("/api/sections", {
    method: "GET",
    auth: true,
  });
}

export async function createSection(body: ApiSectionBody): Promise<{ section: ApiSection }> {
  return request<{ section: ApiSection }>("/api/sections", {
    method: "POST",
    body,
    auth: true,
  });
}

export async function updateSection(
  id: string,
  body: ApiSectionBody
): Promise<{ section: ApiSection }> {
  return request<{ section: ApiSection }>(`/api/sections/${id}`, {
    method: "PUT",
    body,
    auth: true,
  });
}

export async function patchSectionStatus(id: string): Promise<{ section: ApiSection }> {
  return request<{ section: ApiSection }>(`/api/sections/${id}/status`, {
    method: "PATCH",
    body: {},
    auth: true,
  });
}

export async function removeSection(id: string): Promise<void> {
  return request<void>(`/api/sections/${id}`, {
    method: "DELETE",
    auth: true,
  });
}

export async function fetchOriginal(): Promise<{ schedule: ApiSchedule }> {
  return request<{ schedule: ApiSchedule }>("/api/schedules/original", {
    method: "GET",
    auth: true,
  });
}

export async function registerSectionApi(
  sectionId: string,
  replace?: boolean
): Promise<{ schedule: ApiSchedule }> {
  const body: { sectionId: string; replace?: boolean } = { sectionId };
  if (replace !== undefined) {
    body.replace = replace;
  }
  return request<{ schedule: ApiSchedule }>("/api/schedules/original/sections", {
    method: "POST",
    body,
    auth: true,
  });
}

export async function unregisterSectionApi(
  sectionId: string
): Promise<{ schedule: ApiSchedule }> {
  return request<{ schedule: ApiSchedule }>(
    `/api/schedules/original/sections/${sectionId}`,
    {
      method: "DELETE",
      auth: true,
    }
  );
}

export async function setCourseLockApi(
  code: string,
  locked: boolean
): Promise<{ schedule: ApiSchedule }> {
  return request<{ schedule: ApiSchedule }>(
    `/api/schedules/original/courses/${encodeURIComponent(code)}/lock`,
    {
      method: "PATCH",
      body: { locked },
      auth: true,
    }
  );
}

export async function fetchPreferences(): Promise<{ preferences: ApiPreferences }> {
  return request<{ preferences: ApiPreferences }>("/api/preferences", {
    method: "GET",
    auth: true,
  });
}

export async function savePreferencesApi(
  body: ApiPreferences
): Promise<{ preferences: ApiPreferences }> {
  const payload = {
    ...body,
    blockedTimes: (body.blockedTimes || []).map(({ startTime, endTime }) => ({
      startTime,
      endTime,
    })),
  };
  return request<{ preferences: ApiPreferences }>("/api/preferences", {
    method: "PUT",
    body: payload,
    auth: true,
  });
}

export async function generateApi(): Promise<{
  suggestions: ApiSuggestion[];
  truncated: boolean;
}> {
  return request<{ suggestions: ApiSuggestion[]; truncated: boolean }>(
    "/api/schedules/generate",
    {
      method: "POST",
      body: {},
      auth: true,
      timeoutMs: 60000,
    }
  );
}

export async function fetchSuggestions(): Promise<{ suggestions: ApiSuggestion[] }> {
  return request<{ suggestions: ApiSuggestion[] }>("/api/schedules/suggestions", {
    method: "GET",
    auth: true,
  });
}

export async function applySuggestionApi(
  id: string
): Promise<{ schedule: ApiSchedule }> {
  return request<{ schedule: ApiSchedule }>(`/api/schedules/${id}/apply`, {
    method: "POST",
    body: {},
    auth: true,
  });
}

