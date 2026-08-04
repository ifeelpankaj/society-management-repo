"use client";

import { Shield, UserCheck, UsersRound, UserX } from "lucide-react";

import { MetricTile } from "@/components/metrics/metric-tile";
import { MetricTileGrid } from "@/components/metrics/metric-tile-grid";
import type { SocietyMemberSummary } from "@/lib/api/society-members-api";
import { formatNumberIN } from "@/lib/format";

export function ResidentSummaryCards({
  summary,
  loading,
}: {
  summary?: SocietyMemberSummary;
  loading?: boolean;
}) {
  return (
    <MetricTileGrid columns={4}>
      <MetricTile
        icon={<UsersRound className="size-3.5" />}
        label="Total members"
        loading={loading}
        value={formatNumberIN(summary?.total_members)}
      />
      <MetricTile
        icon={<Shield className="size-3.5" />}
        label="Management"
        loading={loading}
        value={formatNumberIN((summary?.owners ?? 0) + (summary?.admins ?? 0))}
      />
      <MetricTile
        icon={<UserCheck className="size-3.5" />}
        label="Residents"
        loading={loading}
        value={formatNumberIN(summary?.residents)}
      />
      <MetricTile
        icon={<UserX className="size-3.5" />}
        label="Suspended"
        loading={loading}
        tone="warning"
        value={formatNumberIN(summary?.suspended_members)}
      />
    </MetricTileGrid>
  );
}
