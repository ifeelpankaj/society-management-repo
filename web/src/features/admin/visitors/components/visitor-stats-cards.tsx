import {
  Ban,
  Clock,
  DoorOpen,
  LogOut,
  UserCheck,
  Users,
} from "lucide-react";

import { DashboardCard } from "@/components/shared/dashboard-card";
import { StatGrid } from "@/components/shared/stat-grid";
import type { VisitorEntryStats } from "@/lib/api/visitor-types";
import { formatNumberIN } from "@/lib/format";

type VisitorStatsCardsProps = {
  loading?: boolean;
  stats?: VisitorEntryStats;
};

export function VisitorStatsCards({ loading, stats }: VisitorStatsCardsProps) {
  return (
    <StatGrid columns={6}>
      <DashboardCard
        description="Registered today"
        icon={<Users className="size-4" />}
        loading={loading}
        size="sm"
        title="Today"
        value={formatNumberIN(stats?.today_visitors)}
      />
      <DashboardCard
        description="Currently on premises"
        icon={<DoorOpen className="size-4" />}
        loading={loading}
        size="sm"
        title="Inside"
        value={formatNumberIN(stats?.visitors_inside)}
      />
      <DashboardCard
        description="Awaiting resident decision"
        icon={<Clock className="size-4" />}
        loading={loading}
        size="sm"
        title="Pending"
        value={formatNumberIN(stats?.pending_approvals)}
      />
      <DashboardCard
        description="Departed today"
        icon={<LogOut className="size-4" />}
        loading={loading}
        size="sm"
        title="Checked out"
        value={formatNumberIN(stats?.checked_out_today)}
      />
      <DashboardCard
        description="Declined today"
        icon={<Ban className="size-4" />}
        loading={loading}
        size="sm"
        title="Rejected"
        value={formatNumberIN(stats?.rejected_today)}
      />
      <DashboardCard
        description="Closed without checkout"
        icon={<UserCheck className="size-4" />}
        loading={loading}
        size="sm"
        title="Auto closed"
        value={formatNumberIN(stats?.auto_closed_today)}
      />
    </StatGrid>
  );
}
