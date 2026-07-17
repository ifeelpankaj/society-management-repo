import type {
  ModelsVisitorEntry,
  ModelsVisitorPendingEntry,
  ModelsVisitorPurpose,
  ModelsVisitorStatus,
} from "@/lib/api/generated-api";

export const GUARD_GATE_NAME = "Main Gate";

export const visitorPurposes: ModelsVisitorPurpose[] = [
  "guest",
  "delivery",
  "cab",
  "service",
  "maintenance",
  "staff",
  "other",
];

export function titleize(value?: string | null) {
  if (!value) {
    return "-";
  }

  return value
    .replace(/_/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

export function getVisitorName(entry?: ModelsVisitorEntry | ModelsVisitorPendingEntry) {
  return entry?.visitor?.full_name || titleize(entry?.purpose) || "Visitor";
}

export function getFlatLabel(entry?: ModelsVisitorEntry | ModelsVisitorPendingEntry) {
  const flat = entry?.flat;

  if (!flat) {
    return entry?.flat_id ? `Flat #${entry.flat_id}` : "Flat pending";
  }

  return `${flat.block ? `${flat.block}-` : ""}${flat.flat_number ?? flat.id ?? "-"}`;
}

export function formatRelativeTime(value?: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) {
    return "Just now";
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);

  if (days === 1) {
    return "Yesterday";
  }

  if (days < 7) {
    return `${days}d ago`;
  }

  return formatDateTime(value);
}

export function formatWaitingDuration(value?: string | null) {
  if (!value) {
    return "Waiting";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Waiting";
  }

  const minutes = Math.max(1, Math.floor((Date.now() - date.getTime()) / 60000));

  if (minutes === 1) {
    return "Waiting 1 minute";
  }

  return `Waiting ${minutes} minutes`;
}

export type ActivityDisplay = {
  flat: string;
  icon: { ios: string; android: string; web: string };
  time: string;
  tint: string;
  title: string;
};

export function getActivityDisplay(entry?: ModelsVisitorEntry): ActivityDisplay {
  const flat = getFlatLabel(entry);
  const time = formatRelativeTime(
    entry?.checked_in_at ?? entry?.checked_out_at ?? entry?.updated_at ?? entry?.created_at,
  );
  const name = getVisitorName(entry);
  const purpose = entry?.purpose;
  const status = entry?.status;

  if (status === "waiting_approval") {
    if (purpose === "delivery") {
      return {
        flat,
        icon: { ios: "shippingbox.fill", android: "local_shipping", web: "local_shipping" },
        time,
        tint: "#d97706",
        title: "Delivery waiting approval",
      };
    }

    if (purpose === "cab") {
      return {
        flat,
        icon: { ios: "car.fill", android: "local_taxi", web: "local_taxi" },
        time,
        tint: "#d97706",
        title: "Cab waiting approval",
      };
    }

    return {
      flat,
      icon: { ios: "clock.fill", android: "schedule", web: "schedule" },
      time,
      tint: "#d97706",
      title: `${name} waiting approval`,
    };
  }

  if (status === "checked_in") {
    if (purpose === "cab") {
      return {
        flat,
        icon: { ios: "car.fill", android: "local_taxi", web: "local_taxi" },
        time,
        tint: "#0f766e",
        title: "Cab arrived",
      };
    }

    if (purpose === "delivery") {
      return {
        flat,
        icon: { ios: "shippingbox.fill", android: "local_shipping", web: "local_shipping" },
        time,
        tint: "#0f766e",
        title: "Delivery checked in",
      };
    }

    return {
      flat,
      icon: { ios: "checkmark.circle.fill", android: "check_circle", web: "check_circle" },
      time,
      tint: "#0f766e",
      title: `${name} checked in`,
    };
  }

  if (status === "checked_out") {
    return {
      flat,
      icon: { ios: "arrow.right.circle.fill", android: "logout", web: "logout" },
      time,
      tint: "#64748b",
      title: `${name} checked out`,
    };
  }

  if (status === "approved") {
    return {
      flat,
      icon: { ios: "qrcode", android: "qr_code", web: "qr_code" },
      time,
      tint: "#059669",
      title: `${name} approved to enter`,
    };
  }

  return {
    flat,
    icon: { ios: "person.fill", android: "person", web: "person" },
    time,
    tint: "#64748b",
    title: name,
  };
}

export function formatTimeOfDay(value?: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatDateTime(value?: string | null) {
  if (!value) {
    return "-";
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

export function statusTone(status?: ModelsVisitorStatus) {
  switch (status) {
    case "approved":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "checked_in":
      return "border-teal-200 bg-teal-50 text-teal-800";
    case "checked_out":
      return "border-slate-200 bg-slate-100 text-slate-700";
    case "waiting_approval":
      return "border-amber-200 bg-amber-50 text-amber-800";
    case "rejected":
    case "cancelled":
    case "expired":
      return "border-rose-200 bg-rose-50 text-rose-700";
    default:
      return "border-stone-200 bg-stone-50 text-stone-700";
  }
}

export function extractQrToken(data: string) {
  const trimmed = data.trim();

  if (!trimmed) {
    return "";
  }

  try {
    const url = new URL(trimmed);
    const token =
      url.searchParams.get("token") ||
      url.searchParams.get("qr_token") ||
      url.searchParams.get("visitor_token");

    if (token) {
      return token;
    }

    const lastSegment = url.pathname.split("/").filter(Boolean).at(-1);
    return lastSegment || trimmed;
  } catch {
    return trimmed;
  }
}

export function isToday(value?: string | null) {
  if (!value) {
    return false;
  }

  const date = new Date(value);
  const now = new Date();

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export function isExpectedTodayEntry(entry?: ModelsVisitorEntry) {
  if (!entry || entry.status !== "approved") {
    return false;
  }

  return isToday(entry.expected_at) || isToday(entry.created_at);
}
