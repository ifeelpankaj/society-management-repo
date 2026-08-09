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

export const PROFILE_GENDER_OPTIONS = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" },
  { label: "Prefer not to say", value: "prefer_not_to_say" },
] as const;

export type ProfileGenderValue = (typeof PROFILE_GENDER_OPTIONS)[number]["value"];

function padDatePart(value: number) {
  return String(value).padStart(2, "0");
}

function toIsoDate(year: number, month: number, day: number) {
  if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900 || year > 2100) {
    return null;
  }

  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return `${year}-${padDatePart(month)}-${padDatePart(day)}`;
}

export function normalizeProfileDateInput(raw?: string | null):
  | { ok: true; value: string }
  | { ok: false; error: string } {
  const trimmed = raw?.trim();
  if (!trimmed) {
    return { ok: true, value: "" };
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [year, month, day] = trimmed.split("-").map(Number);
    const iso = toIsoDate(year, month, day);
    return iso ? { ok: true, value: iso } : { ok: false, error: "Enter a valid date of birth." };
  }

  const slashMatch = trimmed.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
  if (slashMatch) {
    const iso = toIsoDate(Number(slashMatch[1]), Number(slashMatch[2]), Number(slashMatch[3]));
    return iso ? { ok: true, value: iso } : { ok: false, error: "Enter a valid date of birth." };
  }

  const dmyMatch = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmyMatch) {
    const iso = toIsoDate(Number(dmyMatch[3]), Number(dmyMatch[2]), Number(dmyMatch[1]));
    return iso ? { ok: true, value: iso } : { ok: false, error: "Enter a valid date of birth." };
  }

  return { ok: false, error: "Use YYYY-MM-DD format for date of birth." };
}
