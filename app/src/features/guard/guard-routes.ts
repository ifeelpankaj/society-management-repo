import type { Href } from "expo-router";

export type LogsPreset = "all" | "today" | "expected" | "inside" | "checked_out";
export type LogsSegment = "today" | "expected" | "pending" | "inside";
export type DateRangePreset =
  | "today"
  | "yesterday"
  | "last_7_days"
  | "this_month"
  | "all";

export function guardLogsRoute(preset: LogsPreset = "all"): Href {
  return {
    pathname: "/guard/logs",
    params: { preset },
  } as Href;
}

export function parseLogsPreset(value?: string | string[]): LogsPreset {
  const raw = Array.isArray(value) ? value[0] : value;

  if (
    raw === "today" ||
    raw === "expected" ||
    raw === "inside" ||
    raw === "checked_out"
  ) {
    return raw;
  }

  return "all";
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

export function presetToInitialState(preset: LogsPreset): {
  datePreset: DateRangePreset;
  segment: LogsSegment;
  sheetStatus?: "approved" | "checked_out";
} {
  switch (preset) {
    case "today":
      return { segment: "today", datePreset: "today" };
    case "expected":
      return { segment: "expected", datePreset: "today" };
    case "inside":
      return { segment: "inside", datePreset: "today" };
    case "checked_out":
      return { segment: "today", datePreset: "today", sheetStatus: "checked_out" };
    default:
      return { segment: "today", datePreset: "all" };
  }
}

export function getTodayRange() {
  return getDateRange("today");
}
