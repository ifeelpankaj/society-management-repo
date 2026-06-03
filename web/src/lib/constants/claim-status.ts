export const CLAIM_STATUS_LABELS = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  cancelled: "Cancelled",
} as const;

export type ClaimStatusKey = keyof typeof CLAIM_STATUS_LABELS;

export const CLAIM_STATUS_STYLES = {
  pending:
    "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  approved:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  rejected:
    "border-destructive/20 bg-destructive/10 text-destructive dark:text-red-300",
  cancelled:
    "border-slate-500/20 bg-slate-500/10 text-slate-700 dark:text-slate-300",
} as const satisfies Record<ClaimStatusKey, string>;
