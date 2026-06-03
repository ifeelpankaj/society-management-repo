"use client";

import {
  Building2,
  CheckCircle2,
  CreditCard,
  Layers3,
  UsersRound,
} from "lucide-react";

import { AsyncPanel } from "@/components/shared/async-panel";

import { DashboardCard } from "@/components/shared/dashboard-card";

import { EmptyState } from "@/components/shared/empty-state";

import { PageHeader } from "@/components/shared/page-header";

import { PageShell } from "@/components/shared/page-shell";

import { RefreshButton } from "@/components/shared/refresh-button";

import { StatGrid } from "@/components/shared/stat-grid";

import { Badge } from "@/components/ui/badge";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useDeveloperDashboard } from "@/features/developer/dashboard/hooks";

import { formatNumberIN, titleCaseFromSnake } from "@/lib/format";

export function DeveloperDashboardClient() {
  const { dashboard, isError, isFetching, isLoading, refetch } =
    useDeveloperDashboard();

  return (
    <PageShell background="tinted" className="min-h-full py-8">
      <main className="mx-auto w-full max-w-6xl space-y-6">
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
            <>
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

              <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                <Card>
                  <CardHeader>
                    <CardTitle>Society Requests</CardTitle>
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
                    <CardTitle>Subscription Status</CardTitle>
                    <CardDescription>Current platform mix</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-3 sm:grid-cols-2">
                    {[
                      [
                        "Pending",

                        dashboard.subscription_stats?.pending_subscriptions,
                      ],

                      [
                        "Trial",
                        dashboard.subscription_stats?.trial_subscriptions,
                      ],

                      [
                        "Active",

                        dashboard.subscription_stats?.active_subscriptions,
                      ],

                      [
                        "Expired",

                        dashboard.subscription_stats?.expired_subscriptions,
                      ],

                      [
                        "Cancelled",

                        dashboard.subscription_stats?.cancelled_subscriptions,
                      ],
                    ].map(([label, value]) => (
                      <div
                        className="rounded-lg border border-border p-3"
                        key={label}
                      >
                        <div className="font-semibold text-lg">
                          {formatNumberIN(Number(value ?? 0))}
                        </div>
                        <p className="text-muted-foreground text-xs">{label}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </section>
            </>
          ) : null}
        </AsyncPanel>
      </main>
    </PageShell>
  );
}
