const shortDateFormatIN = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function formatShortDateIN(value?: string, fallback = "Not set") {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return shortDateFormatIN.format(date);
}
