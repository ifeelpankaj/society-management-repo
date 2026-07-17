export const VISITOR_STATUS_LABELS = {
  waiting_approval: "Waiting approval",
  approved: "Approved",
  rejected: "Rejected",
  checked_in: "Checked in",
  checked_out: "Checked out",
  cancelled: "Cancelled",
  expired: "Expired",
  auto_closed: "Auto closed",
} as const;

export type VisitorStatusKey = keyof typeof VISITOR_STATUS_LABELS;

export const VISITOR_STATUS_STYLES = {
  waiting_approval:
    "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  approved:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  rejected:
    "border-destructive/20 bg-destructive/10 text-destructive dark:text-red-300",
  checked_in:
    "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  checked_out:
    "border-slate-500/20 bg-slate-500/10 text-slate-700 dark:text-slate-300",
  cancelled:
    "border-slate-500/20 bg-slate-500/10 text-slate-700 dark:text-slate-300",
  expired:
    "border-orange-500/20 bg-orange-500/10 text-orange-700 dark:text-orange-300",
  auto_closed:
    "border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300",
} as const satisfies Record<VisitorStatusKey, string>;
