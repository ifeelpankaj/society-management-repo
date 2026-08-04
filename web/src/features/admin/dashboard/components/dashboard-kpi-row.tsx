"use client";

import {
  CalendarClock,
  DoorOpen,
  Home,
  UserCheck,
  UsersRound,
} from "lucide-react";

import { KpiStatCard } from "@/components/metrics/kpi-stat-card";
import type {
  FlatClaimStatsResponse,
  SocietyDashboardMemberStats,
} from "@/lib/api/society-dashboard-api";
import type { VisitorEntryStats } from "@/lib/api/visitor-types";
import { formatNumberIN } from "@/lib/format";
import type { ResolvedSubscriptionHealth } from "@/lib/subscription-health";

type DashboardKpiRowProps = {
  claimStats?: FlatClaimStatsResponse;
  flatTotal?: number;
  loading?: boolean;
  memberStats?: SocietyDashboardMemberStats;
  subscriptionHealth?: ResolvedSubscriptionHealth | null;
  visitorStats?: VisitorEntryStats;
};

export function DashboardKpiRow({
  claimStats,
  flatTotal,
  loading,
  memberStats,
  subscriptionHealth,
  visitorStats,
}: DashboardKpiRowProps) {
  const daysLeft = subscriptionHealth?.days_until_expiry;

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      <KpiStatCard
        accent="sky"
        hint="Registered today"
        icon={<UsersRound className="size-4" />}
        label="Visitors today"
        loading={loading}
        value={formatNumberIN(visitorStats?.today_visitors)}
      />
      <KpiStatCard
        accent="emerald"
        hint="Currently on premises"
        icon={<DoorOpen className="size-4" />}
        label="Visitors inside"
        loading={loading}
        value={formatNumberIN(visitorStats?.visitors_inside)}
      />
      <KpiStatCard
        accent="amber"
        hint="Awaiting review"
        icon={<UserCheck className="size-4" />}
        label="Pending claims"
        loading={loading}
        value={formatNumberIN(claimStats?.pending_claims)}
      />
      <KpiStatCard
        accent="default"
        hint="Active residents"
        icon={<UsersRound className="size-4" />}
        label="Residents"
        loading={loading}
        value={formatNumberIN(memberStats?.residents)}
      />
      <KpiStatCard
        accent="default"
        hint="Configured inventory"
        icon={<Home className="size-4" />}
        label="Total flats"
        loading={loading}
        value={formatNumberIN(flatTotal)}
      />
      <KpiStatCard
        accent={
          subscriptionHealth?.is_expiring_soon
            ? "amber"
            : subscriptionHealth?.is_active
              ? "emerald"
              : "rose"
        }
        hint="On current plan"
        icon={<CalendarClock className="size-4" />}
        label="Days left"
        loading={loading}
        value={daysLeft != null ? formatNumberIN(daysLeft) : "—"}
      />
    </div>
  );
}
