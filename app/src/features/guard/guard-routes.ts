import type { Href } from "expo-router";

import type { ModelsVisitorStatus } from "@/lib/api/generated-api";

export type GuardEntriesPreset = "all" | "today" | "expected" | "waiting_at_gate" | "inside" | "checked_out";
export type LogsPreset = GuardEntriesPreset;
export type LogsSegment = "today" | "expected" | "inside" | "all";
export type DateRangePreset =
  | "today"
  | "yesterday"
  | "last_7_days"
  | "this_month"
  | "all";

export type GuardCheckInInput = {
  source: "qr";
  token: string;
};

export function firstParam(value?: string | string[]): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parseCheckInParams(params: {
  source?: string | string[];
  token?: string | string[];
}): GuardCheckInInput | null {
  const source = firstParam(params.source);
  const token = firstParam(params.token)?.trim();

  if (source === "qr" && token) {
    return { source: "qr", token };
  }

  return null;
}

export const guardHomeRoute = (): Href =>
  ({
    pathname: "/guard/home",
  }) as unknown as Href;

export const guardProfileRoute = (): Href =>
  ({
    pathname: "/guard/profile",
  }) as unknown as Href;

export const guardScannerRoute = (): Href =>
  ({
    pathname: "/guard/scanner",
  }) as unknown as Href;

export const guardAddEntryRoute = (): Href =>
  ({
    pathname: "/guard/add-entry",
  }) as unknown as Href;

export const guardPendingRoute = (): Href =>
  ({
    pathname: "/guard/pending",
  }) as unknown as Href;

export const guardWaitingAtGateRoute = (): Href =>
  ({
    pathname: "/guard/waiting-at-gate",
  }) as unknown as Href;

export const guardCheckInRoute = (params: GuardCheckInInput): Href =>
  ({
    pathname: "/guard/check-in",
    params,
  }) as unknown as Href;

export const guardEntriesRoute = (preset: GuardEntriesPreset = "today"): Href =>
  ({
    pathname: "/guard/entries",
    params: { preset },
  }) as unknown as Href;

export const guardEntryDetailRoute = (entryId: number): Href =>
  ({
    pathname: "/guard/entries/[entryId]",
    params: { entryId: String(entryId) },
  }) as unknown as Href;

/** @deprecated Use guardEntriesRoute instead */
export function guardLogsRoute(preset: GuardEntriesPreset = "today"): Href {
  return guardEntriesRoute(preset);
}

const VALID_PRESETS = new Set<GuardEntriesPreset>([
  "today",
  "all",
  "expected",
  "waiting_at_gate",
  "inside",
  "checked_out",
]);

export function parseGuardEntriesPreset(value?: string | string[]): GuardEntriesPreset {
  const preset = firstParam(value);

  if (preset && VALID_PRESETS.has(preset as GuardEntriesPreset)) {
    return preset as GuardEntriesPreset;
  }

  return "today";
}

/** @deprecated Use parseGuardEntriesPreset instead */
export function parseLogsPreset(value?: string | string[]): GuardEntriesPreset {
  return parseGuardEntriesPreset(value);
}

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const IST_DAY_MS = 24 * 60 * 60 * 1000;

function getTodayPartsIST(now = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const [year, month, day] = formatter.format(now).split("-").map(Number);
  return { year, month, day };
}

function istDayStartUtc(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0) - IST_OFFSET_MS);
}

function addIstDays(year: number, month: number, day: number, delta: number) {
  const start = istDayStartUtc(year, month, day);
  return new Date(start.getTime() + delta * IST_DAY_MS);
}

export type HalfOpenRange = {
  eventFrom: string;
  eventTo: string;
};

export type VisitorEntryEvent = "activity" | "checked_in" | "checked_out" | "created" | "expected";

/** Half-open [from, to) range aligned to Asia/Kolkata day boundaries. */
export function getHalfOpenRangeIST(preset: DateRangePreset): HalfOpenRange | undefined {
  if (preset === "all") {
    return undefined;
  }

  const { year, month, day } = getTodayPartsIST();
  const todayStart = istDayStartUtc(year, month, day);
  const tomorrowStart = addIstDays(year, month, day, 1);

  switch (preset) {
    case "today":
      return {
        eventFrom: todayStart.toISOString(),
        eventTo: tomorrowStart.toISOString(),
      };
    case "yesterday": {
      const yesterdayStart = addIstDays(year, month, day, -1);
      return {
        eventFrom: yesterdayStart.toISOString(),
        eventTo: todayStart.toISOString(),
      };
    }
    case "last_7_days": {
      const weekStart = addIstDays(year, month, day, -6);
      return {
        eventFrom: weekStart.toISOString(),
        eventTo: tomorrowStart.toISOString(),
      };
    }
    case "this_month": {
      const monthStart = istDayStartUtc(year, month, 1);
      return {
        eventFrom: monthStart.toISOString(),
        eventTo: tomorrowStart.toISOString(),
      };
    }
    default:
      return undefined;
  }
}

export type VisitorEntryQueryFilters = {
  event?: VisitorEntryEvent;
  eventFrom?: string;
  eventTo?: string;
  purpose?: import("@/lib/api/generated-api").ModelsVisitorPurpose;
  status?: import("@/lib/api/generated-api").ModelsVisitorStatus;
};

export function buildVisitorEntryQueryFilters(input: {
  datePreset: DateRangePreset;
  isSearchActive: boolean;
  purpose?: import("@/lib/api/generated-api").ModelsVisitorPurpose;
  segment: LogsSegment;
  sheetStatus?: import("@/lib/api/generated-api").ModelsVisitorStatus;
}): VisitorEntryQueryFilters {
  const { datePreset, isSearchActive, purpose, segment, sheetStatus } = input;

  if (isSearchActive) {
    return {};
  }

  const range = getHalfOpenRangeIST(datePreset);
  const todayRange = getHalfOpenRangeIST("today");

  if (sheetStatus === "checked_out") {
    const effectiveRange = range ?? todayRange;
    return {
      purpose,
      status: "checked_out",
      event: effectiveRange ? "checked_out" : undefined,
      eventFrom: effectiveRange?.eventFrom,
      eventTo: effectiveRange?.eventTo,
    };
  }

  if (sheetStatus === "checked_in") {
    if (!range) {
      return { purpose };
    }

    return {
      purpose,
      event: "checked_in",
      eventFrom: range.eventFrom,
      eventTo: range.eventTo,
    };
  }

  if (sheetStatus === "approved") {
    const effectiveRange = range ?? todayRange;
    return {
      purpose,
      status: "approved",
      event: effectiveRange ? "expected" : undefined,
      eventFrom: effectiveRange?.eventFrom,
      eventTo: effectiveRange?.eventTo,
    };
  }

  if (sheetStatus === "waiting_approval") {
    const effectiveRange = range ?? todayRange;
    return {
      purpose,
      status: "waiting_approval",
      event: effectiveRange ? "created" : undefined,
      eventFrom: effectiveRange?.eventFrom,
      eventTo: effectiveRange?.eventTo,
    };
  }

  if (sheetStatus === "rejected") {
    if (!range) {
      return { purpose, status: "rejected" };
    }

    return {
      purpose,
      status: "rejected",
      event: "created",
      eventFrom: range.eventFrom,
      eventTo: range.eventTo,
    };
  }

  switch (segment) {
    case "today":
      return {
        purpose,
        event: "activity",
        eventFrom: todayRange?.eventFrom,
        eventTo: todayRange?.eventTo,
      };
    case "expected":
      return {
        purpose,
        status: "approved",
        event: "expected",
        eventFrom: todayRange?.eventFrom,
        eventTo: todayRange?.eventTo,
      };
    case "inside":
      return { purpose, status: "checked_in" };
    case "all":
    default:
      return { purpose };
  }
}

function endOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

export function getDateRange(preset: DateRangePreset) {
  const now = new Date();

  switch (preset) {
    case "today":
      return {
        createdFrom: startOfDay(now).toISOString(),
        createdTo: endOfDay(now).toISOString(),
      };
    case "yesterday": {
      const day = new Date(now);
      day.setDate(day.getDate() - 1);
      return {
        createdFrom: startOfDay(day).toISOString(),
        createdTo: endOfDay(day).toISOString(),
      };
    }
    case "last_7_days": {
      const start = new Date(now);
      start.setDate(start.getDate() - 6);
      return {
        createdFrom: startOfDay(start).toISOString(),
        createdTo: endOfDay(now).toISOString(),
      };
    }
    case "this_month": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return {
        createdFrom: startOfDay(start).toISOString(),
        createdTo: endOfDay(now).toISOString(),
      };
    }
    default:
      return { createdFrom: undefined, createdTo: undefined };
  }
}

export function getDateRangeLabel(preset: DateRangePreset) {
  switch (preset) {
    case "today":
      return "Today";
    case "yesterday":
      return "Yesterday";
    case "last_7_days":
      return "Last 7 Days";
    case "this_month":
      return "This Month";
    default:
      return "All Time";
  }
}

export const DATE_RANGE_OPTIONS: { label: string; value: DateRangePreset }[] = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "Last 7 Days", value: "last_7_days" },
  { label: "This Month", value: "this_month" },
  { label: "All Time", value: "all" },
];

export type PresetState = {
  datePreset: DateRangePreset;
  segment: LogsSegment;
  sheetStatus?: ModelsVisitorStatus;
};

export const PRESET_CONFIG = {
  today: {
    segment: "today" as LogsSegment,
    datePreset: "today" as DateRangePreset,
    sheetStatus: undefined,
  },
  expected: {
    segment: "expected" as LogsSegment,
    datePreset: "today" as DateRangePreset,
    sheetStatus: undefined,
  },
  waiting_at_gate: {
    segment: "expected" as LogsSegment,
    datePreset: "today" as DateRangePreset,
    sheetStatus: "approved" as ModelsVisitorStatus,
  },
  inside: {
    segment: "inside" as LogsSegment,
    datePreset: "today" as DateRangePreset,
    sheetStatus: undefined,
  },
  checked_out: {
    segment: "today" as LogsSegment,
    datePreset: "today" as DateRangePreset,
    sheetStatus: "checked_out" as ModelsVisitorStatus,
  },
  all: {
    segment: "all" as LogsSegment,
    datePreset: "all" as DateRangePreset,
    sheetStatus: undefined,
  },
} satisfies Record<GuardEntriesPreset, PresetState>;

export function presetToInitialState(preset: GuardEntriesPreset): PresetState {
  return PRESET_CONFIG[preset];
}

export function getTodayRange() {
  return getHalfOpenRangeIST("today");
}
