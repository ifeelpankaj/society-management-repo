import type { Href } from "expo-router";

export type ResidentEntriesPreset = "today" | "expected" | "recent" | "inside" | "all";

export function residentDashboardRoute(): Href {
  return "/resident/dashboard" as Href;
}

export function residentProfileRoute(): Href {
  return "/resident/profile" as Href;
}

export function residentLogsRoute(): Href {
  return "/resident/logs" as Href;
}

export function residentEntriesRoute(preset?: ResidentEntriesPreset): Href {
  if (!preset || preset === "today") {
    return "/resident/entries" as Href;
  }
  return { pathname: "/resident/entries", params: { preset } } as unknown as Href;
}

export function residentVisitorsRoute(): Href {
  return "/resident/visitors" as Href;
}

export function residentVisitorSettingsRoute(): Href {
  return "/resident/visitors/settings" as Href;
}

export function residentVisitorInviteRoute(): Href {
  return "/resident/visitors/invite" as Href;
}

export function residentMembersRoute(): Href {
  return "/resident/members" as Href;
}

export function residentMembersAddRoute(): Href {
  return "/resident/members/add" as Href;
}

export function parseResidentEntriesPreset(value?: string | string[]): ResidentEntriesPreset {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === "expected" || raw === "recent" || raw === "inside" || raw === "all") {
    return raw;
  }
  return "today";
}
