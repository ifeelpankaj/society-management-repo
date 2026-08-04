import type { ModelsPublicFlatMemberInviteView } from "@/lib/api/generated-api";

export function splitFullName(fullName?: string | null) {
  const trimmed = fullName?.trim() ?? "";
  if (!trimmed) {
    return { firstName: "", lastName: "" };
  }

  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0] ?? "", lastName: "" };
  }

  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
}

export function formatMemberInviteFlatLabel(invite?: ModelsPublicFlatMemberInviteView | null) {
  if (!invite) {
    return "Flat";
  }

  const parts = [
    invite.block ? `Block ${invite.block}` : null,
    invite.flat_number ? `Flat ${invite.flat_number}` : null,
    invite.floor ? `Floor ${invite.floor}` : null,
  ].filter(Boolean);

  return parts.join(" · ") || "Flat";
}

export function titleizeMemberRole(value?: string | null) {
  if (!value) {
    return "Member";
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function formatMemberInviteExpiry(value?: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
  }).format(date);
}
