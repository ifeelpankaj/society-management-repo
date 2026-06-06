export const VISITOR_SOURCE_LABELS = {
  resident_link: "Resident link",
  public_qr: "Public QR",
  guard_entry: "Guard entry",
  quick_link: "Quick link",
} as const;

export type VisitorSourceKey = keyof typeof VISITOR_SOURCE_LABELS;

export const VISITOR_SOURCE_STYLES = {
  resident_link:
    "border-indigo-500/20 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
  public_qr:
    "border-cyan-500/20 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
  guard_entry:
    "border-teal-500/20 bg-teal-500/10 text-teal-700 dark:text-teal-300",
  quick_link:
    "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-300",
} as const satisfies Record<VisitorSourceKey, string>;
