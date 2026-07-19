import type { ModelsPublicVisitorInviteView } from "@/lib/api/generated-api";

export type VisitorInviteDisplay = ModelsPublicVisitorInviteView;

export function titleizePurpose(value?: string | null) {
  if (!value) {
    return "Visitor";
  }

  return value
    .replace(/_/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

export function formatInviteFlatLabel(invite?: VisitorInviteDisplay | null) {
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

export function buildVisitorQrImageUrl(token: string, size = 280) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=12&data=${encodeURIComponent(token)}`;
}

export function formatInviteExpiry(value?: string | null) {
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
