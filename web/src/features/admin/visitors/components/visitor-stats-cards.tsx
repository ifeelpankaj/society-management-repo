import {
  Ban,
  Clock,
  DoorOpen,
  LogOut,
  UserCheck,
  Users,
} from "lucide-react";

import { MetricTile } from "@/components/metrics/metric-tile";
import { MetricTileGrid } from "@/components/metrics/metric-tile-grid";
import type { VisitorEntryStats } from "@/lib/api/visitor-types";
import { formatNumberIN } from "@/lib/format";

type VisitorStatsCardsProps = {
  loading?: boolean;
  stats?: VisitorEntryStats;
};

export function VisitorStatsCards({ loading, stats }: VisitorStatsCardsProps) {
  return (
    <MetricTileGrid columns={6}>
      <MetricTile
        icon={<Users className="size-3.5" />}
        label="Today"
        loading={loading}
        value={formatNumberIN(stats?.today_visitors)}
      />
      <MetricTile
        icon={<DoorOpen className="size-3.5" />}
        label="Inside"
        loading={loading}
        tone="success"
        value={formatNumberIN(stats?.visitors_inside)}
      />
      <MetricTile
        icon={<Clock className="size-3.5" />}
        label="Pending"
        loading={loading}
        tone="warning"
        value={formatNumberIN(stats?.pending_approvals)}
      />
      <MetricTile
        icon={<LogOut className="size-3.5" />}
        label="Checked out"
        loading={loading}
        value={formatNumberIN(stats?.checked_out_today)}
      />
      <MetricTile
        icon={<Ban className="size-3.5" />}
        label="Rejected"
        loading={loading}
        tone="danger"
        value={formatNumberIN(stats?.rejected_today)}
      />
      <MetricTile
        icon={<UserCheck className="size-3.5" />}
        label="Auto closed"
        loading={loading}
        value={formatNumberIN(stats?.auto_closed_today)}
      />
    </MetricTileGrid>
  );
}
