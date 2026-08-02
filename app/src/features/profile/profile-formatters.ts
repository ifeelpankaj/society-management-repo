const EMPTY = "—";

export function formatPhoneDisplay(phone?: string | null) {
  if (!phone?.trim()) {
    return EMPTY;
  }

  const digits = phone.replace(/\D/g, "");

  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }

  if (digits.length === 12 && digits.startsWith("91")) {
    const local = digits.slice(2);
    return `+91 ${local.slice(0, 5)} ${local.slice(5)}`;
  }

  if (digits.length === 11 && digits.startsWith("0")) {
    const local = digits.slice(1);
    return `+91 ${local.slice(0, 5)} ${local.slice(5)}`;
  }

  return phone.trim();
}

export function formatDateOfBirth(dob?: string | null) {
  if (!dob?.trim()) {
    return EMPTY;
  }

  const date = new Date(dob);

  if (Number.isNaN(date.getTime())) {
    return dob;
  }

  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatGender(gender?: string | null) {
  if (!gender?.trim()) {
    return EMPTY;
  }

  return gender
    .replace(/_/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`)
    .join(" ");
}

const TIMEZONE_LABELS: Record<string, string> = {
  "Asia/Kolkata": "India Standard Time (IST)",
  "Asia/Calcutta": "India Standard Time (IST)",
  UTC: "Coordinated Universal Time (UTC)",
};

export function formatTimezone(timezone?: string | null) {
  if (!timezone?.trim()) {
    return EMPTY;
  }

  return TIMEZONE_LABELS[timezone] ?? timezone.replace(/_/g, " ");
}

export function formatLanguage(language?: string | null) {
  if (!language?.trim()) {
    return EMPTY;
  }

  try {
    const display = new Intl.DisplayNames(undefined, { type: "language" }).of(language);
    return display ? `${display} (${language})` : language.toUpperCase();
  } catch {
    return language.toUpperCase();
  }
}

export function formatDisplayValue(value?: string | null) {
  if (!value?.trim()) {
    return EMPTY;
  }

  return value.trim();
}
