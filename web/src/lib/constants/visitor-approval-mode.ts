export const VISITOR_APPROVAL_MODE_LABELS = {
  mandatory: "Mandatory",
  optional: "Optional",
  hybrid: "Hybrid",
} as const;

export type VisitorApprovalModeKey = keyof typeof VISITOR_APPROVAL_MODE_LABELS;
