import { Ban, Building2, CheckCircle2, CircleSlash, Home } from "lucide-react";

import { MetricTile } from "@/components/metrics/metric-tile";
import { MetricTileGrid } from "@/components/metrics/metric-tile-grid";
import type { ModelsFlatStatsResponse } from "@/lib/api/generated-api";
import { formatNumberIN } from "@/lib/format";

type FlatsStatsCardsProps = {
  loading?: boolean;
  stats?: ModelsFlatStatsResponse;
};

export function FlatsStatsCards({ loading, stats }: FlatsStatsCardsProps) {
  return (
    <MetricTileGrid columns={6}>
      <MetricTile
        icon={<Building2 className="size-3.5" />}
        label="Total"
        loading={loading}
        value={formatNumberIN(stats?.total_flats)}
      />
      <MetricTile
        icon={<CheckCircle2 className="size-3.5" />}
        label="Active"
        loading={loading}
        value={formatNumberIN(stats?.active_flats)}
      />
      <MetricTile
        icon={<Home className="size-3.5" />}
        label="Occupied"
        loading={loading}
        value={formatNumberIN(stats?.occupied_flats)}
      />
      <MetricTile
        icon={<Home className="size-3.5" />}
        label="Vacant"
        loading={loading}
        tone="success"
        value={formatNumberIN(stats?.vacant_flats)}
      />
      <MetricTile
        icon={<Ban className="size-3.5" />}
        label="Blocked"
        loading={loading}
        tone="warning"
        value={formatNumberIN(stats?.blocked_flats)}
      />
      <MetricTile
        icon={<CircleSlash className="size-3.5" />}
        label="Inactive"
        loading={loading}
        value={formatNumberIN(stats?.inactive_flats)}
      />
    </MetricTileGrid>
  );
}
