import type { RoleKey } from "@/lib/constants/roles";

const roleKeys = [
  "developer",
  "super_admin",
  "admin",
  "staff",
  "resident",
  "user",
] as const satisfies readonly RoleKey[];

export function isRoleKey(role: string | undefined): role is RoleKey {
  return roleKeys.includes(role as RoleKey);
}

export function getDashboardActionLabel(route: string | null) {
  return route === "/profile" ? "Open profile" : "Open dashboard";
}

export function getInitials(name?: string) {
  if (!name?.trim()) return "U";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
