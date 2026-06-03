export const STATUS_LABELS = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  cancelled: "Cancelled",
  active: "Active",
  inactive: "Inactive",
  expired: "Expired",
  checked_in: "Checked in",
  checked_out: "Checked out",
  waiting_approval: "Waiting approval",
} as const;

export type StatusKey = keyof typeof STATUS_LABELS;

export const STATUS_STYLES = {
  pending:
    "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  approved:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  rejected:
    "border-destructive/20 bg-destructive/10 text-destructive dark:text-red-300",
  cancelled:
    "border-slate-500/20 bg-slate-500/10 text-slate-700 dark:text-slate-300",
  active:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  inactive: "border-muted-foreground/20 bg-muted text-muted-foreground",
  expired:
    "border-slate-500/20 bg-slate-500/10 text-slate-700 dark:text-slate-300",
  checked_in: "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  checked_out:
    "border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  waiting_approval:
    "border-orange-500/20 bg-orange-500/10 text-orange-700 dark:text-orange-300",
} as const satisfies Record<StatusKey, string>;
