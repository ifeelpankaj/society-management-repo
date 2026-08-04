"use client";

import {
  Building2,
  CheckCircle2,
  CreditCard,
  Layers3,
  UsersRound,
} from "lucide-react";
import Link from "next/link";

import { ChartPanel } from "@/components/charts/chart-panel";
import { DonutChart } from "@/components/charts/donut-chart";
import { VerticalBarChart } from "@/components/charts/vertical-bar-chart";
import { AsyncPanel } from "@/components/shared/async-panel";
import { DashboardCard } from "@/components/shared/dashboard-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { RefreshButton } from "@/components/shared/refresh-button";
import { StatGrid } from "@/components/shared/stat-grid";
import { WorkspacePage } from "@/components/shared/workspace-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useDeveloperDashboard } from "@/features/developer/dashboard/hooks";
import {
  formatNumberIN,
  formatShortDateIN,
  titleCaseFromSnake,
} from "@/lib/format";
import { paths } from "@/lib/routes/paths";

export function DeveloperDashboardClient() {
  const { dashboard, isError, isFetching, isLoading, refetch } =
    useDeveloperDashboard();

  const subscriptionMix = [
    {
      key: "pending",
      label: "Pending",
      value: dashboard?.subscription_stats?.pending_subscriptions ?? 0,
      color: "var(--chart-3)",
    },
    {
      key: "trial",
      label: "Trial",
      value: dashboard?.subscription_stats?.trial_subscriptions ?? 0,
      color: "var(--chart-2)",
    },
    {
      key: "active",
      label: "Active",
      value: dashboard?.subscription_stats?.active_subscriptions ?? 0,
      color: "var(--chart-1)",
    },
    {
      key: "expired",
      label: "Expired",
      value: dashboard?.subscription_stats?.expired_subscriptions ?? 0,
      color: "var(--chart-4)",
    },
    {
      key: "cancelled",
      label: "Cancelled",
      value: dashboard?.subscription_stats?.cancelled_subscriptions ?? 0,
      color: "var(--chart-5)",
    },
  ];

  const societyStatusData = [
    {
      key: "pending",
      label: "Pending",
      value: dashboard?.society_stats?.pending ?? 0,
    },
    {
      key: "active",
      label: "Active",
      value: dashboard?.society_stats?.active ?? 0,
    },
    {
      key: "suspended",
      label: "Suspended",
      value: dashboard?.society_stats?.suspended ?? 0,
    },
    {
      key: "rejected",
      label: "Rejected",
      value: dashboard?.society_stats?.rejected ?? 0,
    },
  ];

  const subscriptionTotal = subscriptionMix.reduce(
    (sum, item) => sum + item.value,
    0,
  );

  return (
    <WorkspacePage>
      <PageHeader
        actions={
          <RefreshButton loading={isFetching} onClick={() => refetch()} />
        }
        description="Monitor societies, plans, subscriptions, and resident activity from one guarded workspace."
        eyebrow="Developer workspace"
        title="Platform operations"
      />

      <AsyncPanel
        error={isError ? "Refresh the workspace and try again." : null}
        loading={isLoading && !dashboard}
        loadingDescription="Syncing platform metrics across societies and subscriptions."
        loadingLabel="Loading platform data"
        onRetry={() => refetch()}
      >
        {dashboard ? (
          <div className="space-y-6">
            <StatGrid>
              <DashboardCard
                description={`${formatNumberIN(dashboard.society_stats?.active)} active`}
                icon={<Building2 className="size-4" />}
                size="sm"
                title="Societies"
                value={formatNumberIN(dashboard.society_stats?.total)}
              />
              <DashboardCard
                description={`${formatNumberIN(dashboard.plan_stats?.active)} active`}
                icon={<Layers3 className="size-4" />}
                size="sm"
                title="Plans"
                value={formatNumberIN(dashboard.plan_stats?.total)}
              />
              <DashboardCard
                description={`${formatNumberIN(dashboard.subscription_stats?.expired_subscriptions)} expired`}
                icon={<CreditCard className="size-4" />}
                size="sm"
                title="Active subscriptions"
                value={formatNumberIN(
                  dashboard.subscription_stats?.active_subscriptions,
                )}
              />
              <DashboardCard
                description={`${formatNumberIN(dashboard.residence_stats?.active_residents)} active`}
                icon={<UsersRound className="size-4" />}
                size="sm"
                title="Residents"
                value={formatNumberIN(
                  dashboard.residence_stats?.total_residents,
                )}
              />
            </StatGrid>

            <section className="grid gap-4 lg:grid-cols-2">
              <ChartPanel
                description="Distribution across subscription lifecycle states"
                title="Subscription mix"
              >
                <DonutChart
                  centerLabel="Total"
                  centerValue={subscriptionTotal}
                  data={subscriptionMix}
                />
                <div className="mt-4 flex justify-center">
                  <Button asChild size="sm" variant="outline">
                    <Link href={paths.developerSubscriptionsExpiring()}>
                      View expiring in 14 days
                    </Link>
                  </Button>
                </div>
              </ChartPanel>

              <ChartPanel
                description="Societies by approval and operational status"
                title="Society status"
              >
                <VerticalBarChart data={societyStatusData} />
              </ChartPanel>
            </section>

            <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
              <Card>
                <CardHeader>
                  <CardTitle>Society requests</CardTitle>
                  <CardDescription>
                    {formatNumberIN(dashboard.society_stats?.pending)} pending
                    approvals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {(dashboard.recent_pending_societies ?? []).length > 0 ? (
                    <div className="divide-y divide-border">
                      {(dashboard.recent_pending_societies ?? []).map(
                        (society) => (
                          <div
                            className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                            key={society.id}
                          >
                            <div className="min-w-0">
                              <p className="truncate font-medium">
                                {society.name ?? "Unnamed society"}
                              </p>
                              <p className="text-muted-foreground text-xs">
                                {society.city ?? "City not set"} -{" "}
                                {formatNumberIN(society.total_flats)} flats
                              </p>
                            </div>
                            <Badge variant="secondary">
                              {titleCaseFromSnake(society.status)}
                            </Badge>
                          </div>
                        ),
                      )}
                    </div>
                  ) : (
                    <EmptyState
                      className="border-0"
                      description="New society requests will appear here."
                      icon={<CheckCircle2 className="size-5" />}
                      title="No pending societies"
                    />
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent subscriptions</CardTitle>
                  <CardDescription>
                    Latest subscription activity across the platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {(dashboard.recent_subscriptions ?? []).length > 0 ? (
                    <div className="divide-y divide-border">
                      {(dashboard.recent_subscriptions ?? []).map((sub) => (
                        <div
                          className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                          key={sub.id}
                        >
                          <div className="min-w-0">
                            <p className="truncate font-medium text-sm">
                              {sub.society_name ?? sub.society_code ?? "Society"}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {sub.plan_name ?? "Plan"} -{" "}
                              {formatShortDateIN(sub.ends_at, "No end date")}
                            </p>
                          </div>
                          <Badge variant="secondary">
                            {titleCaseFromSnake(sub.status)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      className="border-0"
                      description="Recent subscription changes will appear here."
                      title="No recent subscriptions"
                    />
                  )}
                  <Button
                    asChild
                    className="mt-4 w-full sm:w-auto"
                    variant="outline"
                  >
                    <Link href={paths.developerSubscriptions()}>
                      View all subscriptions
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </section>
          </div>
        ) : null}
      </AsyncPanel>
    </WorkspacePage>
  );
}
