import type { Href } from "expo-router";

export function residentLogsRoute(): Href {
  return "/resident/logs" as Href;
}

export function residentProfileRoute(): Href {
  return "/resident/profile" as Href;
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

export function residentMembersAddRoute(): Href {
  return "/resident/members/add" as Href;
}
