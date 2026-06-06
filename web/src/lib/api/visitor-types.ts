export type VisitorStatus =
  | "waiting_approval"
  | "approved"
  | "rejected"
  | "checked_in"
  | "checked_out"
  | "cancelled"
  | "expired"
  | "auto_closed";

export type VisitorSource =
  | "resident_link"
  | "public_qr"
  | "guard_entry"
  | "quick_link";

export type VisitorPurpose =
  | "guest"
  | "delivery"
  | "cab"
  | "service"
  | "maintenance"
  | "staff"
  | "other";

export type VisitorApprovalMode = "mandatory" | "optional" | "hybrid";

export type VisitorVehicleType =
  | "bike"
  | "car"
  | "auto"
  | "cab"
  | "truck"
  | "other";

export type VisitorEventType =
  | "created"
  | "approved"
  | "rejected"
  | "checked_in"
  | "checked_out"
  | "cancelled"
  | "expired"
  | "auto_closed"
  | "qr_generated"
  | "qr_used";

export type VisitorSummary = {
  full_name?: string;
  phone_number?: string | null;
  email?: string | null;
  photo_url?: string | null;
};

export type VisitorFlatSummary = {
  id?: number;
  flat_number?: string;
  block?: string | null;
  floor?: string | null;
};

export type VisitorEntry = {
  id?: number;
  society_id?: number;
  flat_id?: number;
  visitor_id?: number;
  source?: VisitorSource;
  purpose?: VisitorPurpose;
  status?: VisitorStatus;
  vehicle_number?: string | null;
  vehicle_type?: VisitorVehicleType | null;
  companions_count?: number;
  expected_at?: string | null;
  expected_checkout_at?: string | null;
  checked_in_at?: string | null;
  checked_out_at?: string | null;
  auto_closed_at?: string | null;
  rejection_reason?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
  visitor?: VisitorSummary | null;
  flat?: VisitorFlatSummary | null;
};

export type VisitorEntryEvent = {
  id?: number;
  visitor_entry_id?: number;
  event_type?: VisitorEventType;
  message?: string | null;
  created_at?: string;
};

export type VisitorEntryStats = {
  today_visitors?: number;
  visitors_inside?: number;
  pending_approvals?: number;
  checked_out_today?: number;
  rejected_today?: number;
  auto_closed_today?: number;
};

export type VisitorPendingEntry = VisitorEntry & {
  waiting_since?: string;
  primary_resident_name?: string | null;
  primary_resident_id?: number | null;
};

export type SocietyVisitorSettings = {
  approval_mode?: VisitorApprovalMode;
  default_visit_duration_minutes?: number;
  grace_period_minutes?: number;
  qr_expiry_minutes?: number;
  allow_resident_pre_approval?: boolean;
  allow_public_qr_entry?: boolean;
  allow_guard_entry?: boolean;
  is_active?: boolean;
};

export type FlatVisitorSetting = {
  flat_id?: number;
  purpose?: VisitorPurpose;
  approval_required?: boolean;
  default_visit_duration_minutes?: number | null;
  is_enabled?: boolean;
};

export type SocietyFlatVisitorSettingRow = {
  flat_id?: number;
  flat_number?: string;
  block?: string | null;
  purpose?: VisitorPurpose;
  approval_required?: boolean;
  is_enabled?: boolean;
  default_visit_duration_minutes?: number | null;
};

export type FlatVisitorContext = {
  occupancy_status?: string;
  primary_resident?: {
    id?: number;
    user_id?: number;
    full_name?: string;
  } | null;
  total_residents?: number;
  inherits_society_mode?: boolean;
  society_approval_mode?: VisitorApprovalMode;
  visitor_settings?: FlatVisitorSetting[];
  recent_visitors?: Array<{
    entry_id?: number;
    full_name?: string;
    purpose?: VisitorPurpose;
    status?: VisitorStatus;
    visited_on?: string;
  }>;
};

export type MemberVisitorApprovalStats = {
  approved_count?: number;
  rejected_count?: number;
};
