export const SOCIETY_STATUS_LABELS = {
  pending: "Pending",
  active: "Active",
  inactive: "Inactive",
  rejected: "Rejected",
  suspended: "Suspended",
} as const;

export type SocietyStatusKey = keyof typeof SOCIETY_STATUS_LABELS;

export const SOCIETY_STATUS_STYLES = {
  pending:
    "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  active:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  inactive: "border-muted-foreground/20 bg-muted text-muted-foreground",
  rejected:
    "border-destructive/20 bg-destructive/10 text-destructive dark:text-red-300",
  suspended:
    "border-orange-500/20 bg-orange-500/10 text-orange-700 dark:text-orange-300",
} as const satisfies Record<SocietyStatusKey, string>;
