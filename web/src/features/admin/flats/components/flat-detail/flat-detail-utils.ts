import type {
  ModelsFlatResidentResponse,
  ModelsFlatResponse,
  ModelsFlatStatus,
  ModelsSocietyMemberResponse,
} from "@/lib/api/generated-api";

export const flatStatuses: ModelsFlatStatus[] = [
  "vacant",
  "occupied",
  "blocked",
];

export const residentRoles = ["owner", "tenant", "family"] as const;

export const selectClassName =
  "h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const dateFormat = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function formatDate(value?: string) {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";
  return dateFormat.format(date);
}

export function titleCase(value?: string) {
  if (!value) return "None";
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function flatLabel(flat?: ModelsFlatResponse) {
  return flat?.flat_number ?? "Flat";
}

export function residentName(resident: ModelsFlatResidentResponse) {
  return (
    resident.user_name || resident.user_email || `User #${resident.user_id}`
  );
}

export function memberName(member: ModelsSocietyMemberResponse) {
  return (
    member.user_full_name || member.user_email || `User #${member.user_id}`
  );
}
