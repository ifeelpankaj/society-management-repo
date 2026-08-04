import { CheckCircle2, Clock3, UserCheck, XCircle } from "lucide-react";

import { MetricTile } from "@/components/metrics/metric-tile";
import { MetricTileGrid } from "@/components/metrics/metric-tile-grid";
import type { FlatClaimStatsResponse } from "@/lib/api/society-dashboard-api";
import { formatNumberIN } from "@/lib/format";

type ClaimsStatsTilesProps = {
  loading?: boolean;
  stats?: FlatClaimStatsResponse;
};

export function ClaimsStatsTiles({ loading, stats }: ClaimsStatsTilesProps) {
  return (
    <MetricTileGrid columns={5}>
      <MetricTile
        icon={<UserCheck className="size-3.5" />}
        label="Total"
        loading={loading}
        value={formatNumberIN(stats?.total_claims)}
      />
      <MetricTile
        icon={<Clock3 className="size-3.5" />}
        label="Pending"
        loading={loading}
        tone="warning"
        value={formatNumberIN(stats?.pending_claims)}
      />
      <MetricTile
        icon={<CheckCircle2 className="size-3.5" />}
        label="Approved"
        loading={loading}
        tone="success"
        value={formatNumberIN(stats?.approved_claims)}
      />
      <MetricTile
        icon={<XCircle className="size-3.5" />}
        label="Rejected"
        loading={loading}
        tone="danger"
        value={formatNumberIN(stats?.rejected_claims)}
      />
      <MetricTile
        icon={<XCircle className="size-3.5" />}
        label="Cancelled"
        loading={loading}
        value={formatNumberIN(stats?.cancelled_claims)}
      />
    </MetricTileGrid>
  );
}
