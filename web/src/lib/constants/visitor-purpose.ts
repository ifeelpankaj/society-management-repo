export const VISITOR_PURPOSE_LABELS = {
  guest: "Guest",
  delivery: "Delivery",
  cab: "Cab",
  service: "Service",
  maintenance: "Maintenance",
  staff: "Staff",
  other: "Other",
} as const;

export type VisitorPurposeKey = keyof typeof VISITOR_PURPOSE_LABELS;
