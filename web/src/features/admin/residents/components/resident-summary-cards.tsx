"use client";

import { Shield, UserCheck, UsersRound, UserX } from "lucide-react";

import { DashboardCard } from "@/components/shared/dashboard-card";
import { StatGrid } from "@/components/shared/stat-grid";
import type { SocietyMemberSummary } from "@/lib/api/society-members-api";
import { formatNumberIN } from "@/lib/format";

export function ResidentSummaryCards({
  summary,
}: {
  summary?: SocietyMemberSummary;
}) {
  return (
    <StatGrid>
      <DashboardCard
        description={`${formatNumberIN(summary?.active_members)} active`}
        icon={<UsersRound className="size-4" />}
        size="sm"
        title="Total members"
        value={formatNumberIN(summary?.total_members)}
      />
      <DashboardCard
        description={`${formatNumberIN(summary?.owners)} owners, ${formatNumberIN(summary?.admins)} admins`}
        icon={<Shield className="size-4" />}
        size="sm"
        title="Management"
        value={formatNumberIN((summary?.owners ?? 0) + (summary?.admins ?? 0))}
      />
      <DashboardCard
        description={`${formatNumberIN(summary?.staff)} staff`}
        icon={<UserCheck className="size-4" />}
        size="sm"
        title="Residents"
        value={formatNumberIN(summary?.residents)}
      />
      <DashboardCard
        description={`${formatNumberIN(summary?.removed_members)} removed`}
        icon={<UserX className="size-4" />}
        size="sm"
        title="Suspended"
        value={formatNumberIN(summary?.suspended_members)}
      />
    </StatGrid>
  );
}
