export const FLAT_STATUS_LABELS = {
  active: "Active",
  vacant: "Vacant",
  occupied: "Occupied",
  blocked: "Blocked",
  inactive: "Inactive",
} as const;

export type FlatStatusKey = keyof typeof FLAT_STATUS_LABELS;

export const FLAT_STATUS_STYLES = {
  active:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  vacant: "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  occupied:
    "border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  blocked:
    "border-destructive/20 bg-destructive/10 text-destructive dark:text-red-300",
  inactive: "border-muted-foreground/20 bg-muted text-muted-foreground",
} as const satisfies Record<FlatStatusKey, string>;
