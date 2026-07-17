import { Ban, Building2, CheckCircle2, CircleSlash, Home } from "lucide-react";

import { DashboardCard } from "@/components/shared/dashboard-card";
import { StatGrid } from "@/components/shared/stat-grid";
import type { ModelsFlatStatsResponse } from "@/lib/api/generated-api";
import { formatNumberIN } from "@/lib/format";

type FlatsStatsCardsProps = {
  loading?: boolean;
  stats?: ModelsFlatStatsResponse;
};

export function FlatsStatsCards({ loading, stats }: FlatsStatsCardsProps) {
  return (
    <StatGrid columns={6}>
      <DashboardCard
        description={`${formatNumberIN(stats?.active_flats)} active`}
        icon={<Building2 className="size-4" />}
        loading={loading}
        size="sm"
        title="Total"
        value={formatNumberIN(stats?.total_flats)}
      />
      <DashboardCard
        description="Ready for residents"
        icon={<CheckCircle2 className="size-4" />}
        loading={loading}
        size="sm"
        title="Active"
        value={formatNumberIN(stats?.active_flats)}
      />
      <DashboardCard
        description="Currently assigned"
        icon={<Home className="size-4" />}
        loading={loading}
        size="sm"
        title="Occupied"
        value={formatNumberIN(stats?.occupied_flats)}
      />
      <DashboardCard
        description="Available inventory"
        icon={<Home className="size-4" />}
        loading={loading}
        size="sm"
        title="Vacant"
        value={formatNumberIN(stats?.vacant_flats)}
      />
      <DashboardCard
        description="Temporarily locked"
        icon={<Ban className="size-4" />}
        loading={loading}
        size="sm"
        title="Blocked"
        value={formatNumberIN(stats?.blocked_flats)}
      />
      <DashboardCard
        description="Not in service"
        icon={<CircleSlash className="size-4" />}
        loading={loading}
        size="sm"
        title="Inactive"
        value={formatNumberIN(stats?.inactive_flats)}
      />
    </StatGrid>
  );
}
