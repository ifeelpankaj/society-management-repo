"use client";

import { ChartPanel } from "@/components/charts/chart-panel";
import { DailyBarChart } from "@/components/charts/daily-bar-chart";
import { DonutChart } from "@/components/charts/donut-chart";
import { HorizontalBarChart } from "@/components/charts/horizontal-bar-chart";
import { MembersDonut } from "@/components/charts/members-donut";
import type {
  SocietyDashboardMemberStats,
  SocietyDashboardSubscriptionUsage,
  VisitorDailyCount,
} from "@/lib/api/society-dashboard-api";
import type { ModelsFlatStatsResponse } from "@/lib/api/generated-api";

type DashboardAnalyticsGridProps = {
  flatStats?: ModelsFlatStatsResponse;
  memberStats?: SocietyDashboardMemberStats;
  usage?: SocietyDashboardSubscriptionUsage;
  visitorDaily?: VisitorDailyCount[];
};

export function DashboardAnalyticsGrid({
  flatStats,
  memberStats,
  usage,
  visitorDaily = [],
}: DashboardAnalyticsGridProps) {
  const flatData = [
    {
      key: "occupied",
      label: "Occupied",
      value: flatStats?.occupied_flats ?? 0,
      color: "var(--chart-1)",
    },
    {
      key: "vacant",
      label: "Vacant",
      value: flatStats?.vacant_flats ?? 0,
      color: "var(--chart-2)",
    },
    {
      key: "blocked",
      label: "Blocked",
      value: flatStats?.blocked_flats ?? 0,
      color: "var(--chart-4)",
    },
    {
      key: "inactive",
      label: "Inactive",
      value: flatStats?.inactive_flats ?? 0,
      color: "var(--chart-5)",
    },
  ];

  const quotaData = [
    {
      key: "flats",
      label: "Flats",
      used: usage?.flats?.used ?? 0,
      limit: usage?.flats?.limit,
    },
    {
      key: "admins",
      label: "Admins",
      used: usage?.admins?.used ?? 0,
      limit: usage?.admins?.limit,
    },
    {
      key: "staff",
      label: "Staff",
      used: usage?.staff?.used ?? 0,
      limit: usage?.staff?.limit,
    },
    {
      key: "residents",
      label: "Residents",
      used: usage?.residents?.used ?? 0,
      limit: usage?.residents?.limit,
    },
  ];

  const flatTotal =
    (flatStats?.occupied_flats ?? 0) +
    (flatStats?.vacant_flats ?? 0) +
    (flatStats?.blocked_flats ?? 0) +
    (flatStats?.inactive_flats ?? 0);

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <ChartPanel description="Occupancy mix across configured flats" title="Flat occupancy">
        <DonutChart centerLabel="Flats" centerValue={flatTotal} data={flatData} />
      </ChartPanel>

      <ChartPanel description="Active members by role" title="Members">
        <MembersDonut
          admins={memberStats?.admins}
          owners={memberStats?.owners}
          residents={memberStats?.residents}
          staff={memberStats?.staff}
        />
      </ChartPanel>

      <ChartPanel description="Visitors registered per day (last 7 days)" title="Visitor trend">
        <DailyBarChart
          data={visitorDaily.map((item) => ({
            date: item.date ?? "",
            count: item.count ?? 0,
          }))}
        />
      </ChartPanel>

      <ChartPanel description="Resource usage against plan limits" title="Quota usage">
        <HorizontalBarChart data={quotaData} />
      </ChartPanel>
    </div>
  );
}
