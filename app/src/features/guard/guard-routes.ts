import type { Href } from "expo-router";

import type { ModelsVisitorStatus } from "@/lib/api/generated-api";

export type GuardEntriesPreset = "all" | "today" | "expected" | "waiting_at_gate" | "inside" | "checked_out";
export type LogsPreset = GuardEntriesPreset;
export type LogsSegment = "today" | "expected" | "inside";
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
    segment: "today" as LogsSegment,
    datePreset: "all" as DateRangePreset,
    sheetStatus: undefined,
  },
} satisfies Record<GuardEntriesPreset, PresetState>;

export function presetToInitialState(preset: GuardEntriesPreset): PresetState {
  return PRESET_CONFIG[preset];
}

export function getTodayRange() {
  return getDateRange("today");
}
