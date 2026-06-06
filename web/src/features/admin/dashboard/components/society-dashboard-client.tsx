"use client";

import {
  BadgeCheck,
  Building2,
  Crown,
  Home,
  Shield,
  Sparkles,
  UserCheck,
} from "lucide-react";
import Link from "next/link";

import { AsyncPanel } from "@/components/shared/async-panel";
import { DashboardCard } from "@/components/shared/dashboard-card";
import { PageHeader } from "@/components/shared/page-header";
import { RefreshButton } from "@/components/shared/refresh-button";
import { StatGrid } from "@/components/shared/stat-grid";
import { UsageBar } from "@/components/shared/usage-bar";
import { WorkspacePage } from "@/components/shared/workspace-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSocietyDashboard } from "@/features/admin/dashboard/hooks";
import {
  formatMoneyINR,
  formatNumberIN,
  formatShortDateIN,
  titleCaseFromSnake,
} from "@/lib/format";
import { paths } from "@/lib/routes/paths";

type SocietyDashboardClientProps = {
  societyId: number;
};

function featureLabels(features: unknown) {
  if (!features || typeof features !== "object") return [];
  return Object.entries(features as Record<string, unknown>)
    .filter(([, value]) => value === true || typeof value === "string")
    .slice(0, 3)
    .map(([key, value]) =>
      typeof value === "string"
        ? value
        : titleCaseFromSnake(key.replaceAll("_", " ")),
    );
}

export function SocietyDashboardClient({
  societyId,
}: SocietyDashboardClientProps) {
  const {
    claimStats,
    configuredPercent,
    dashboard,
    declaredFlats,
    flatStats,
    isFetching,
    isLoading,
    memberStats,
    planAds,
    recentPendingClaims,
    refetch,
    society,
    subscription,
    usage,
  } = useSocietyDashboard({ societyId });

  return (
    <WorkspacePage>
      <PageHeader
        actions={
          <>
            <RefreshButton loading={isFetching} onClick={() => refetch()} />
            <Button asChild variant="outline">
              <Link href={paths.selectSociety()}>Switch society</Link>
            </Button>
          </>
        }
        description={
          dashboard
            ? `${society?.society_code} - ${society?.city ?? "City not set"}`
            : undefined
        }
        eyebrow="Society workspace"
        title={
          dashboard ? (
            <span className="flex flex-wrap items-center gap-3">
              {society?.name ?? "Society dashboard"}
              <Badge variant="outline">
                {titleCaseFromSnake(society?.status)}
              </Badge>
            </span>
          ) : (
            "Society dashboard"
          )
        }
      />

      <AsyncPanel
        error={
          !isLoading && !dashboard
            ? "Refresh the workspace or switch society."
            : null
        }
        loading={isLoading && !dashboard}
        loadingDescription="Syncing society metrics and preparing your workspace."
        loadingLabel="Loading dashboard"
        onRetry={() => refetch()}
      >
        {dashboard ? (
          <div className="space-y-6">
            <StatGrid>
              <DashboardCard
                description={`${formatNumberIN(flatStats?.active_flats)} active`}
                icon={<Building2 className="size-4" />}
                size="sm"
                title="Total flats"
                value={formatNumberIN(flatStats?.total_flats)}
              />
              <DashboardCard
                description={`${formatNumberIN(flatStats?.occupied_flats)} occupied`}
                icon={<Home className="size-4" />}
                size="sm"
                title="Vacant flats"
                value={formatNumberIN(flatStats?.vacant_flats)}
              />
              <DashboardCard
                description={`${formatNumberIN(claimStats?.total_claims)} total claims`}
                icon={<UserCheck className="size-4" />}
                size="sm"
                title="Pending claims"
                value={formatNumberIN(claimStats?.pending_claims)}
              />
              <DashboardCard
                description={`${formatNumberIN(memberStats?.admins)} admins`}
                icon={<Shield className="size-4" />}
                size="sm"
                title="Staff"
                value={formatNumberIN(memberStats?.staff)}
              />
            </StatGrid>

            <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
              <Card>
                <CardHeader>
                  <CardTitle>Flat Health</CardTitle>
                  <CardDescription>
                    {formatNumberIN(flatStats?.active_flats)} configured of{" "}
                    {formatNumberIN(declaredFlats)} declared flats
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${configuredPercent}%` }}
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-lg border border-border p-3">
                      <div className="font-semibold">
                        {formatNumberIN(flatStats?.vacant_flats)}
                      </div>
                      <p className="text-muted-foreground text-xs">Vacant</p>
                    </div>
                    <div className="rounded-lg border border-border p-3">
                      <div className="font-semibold">
                        {formatNumberIN(flatStats?.blocked_flats)}
                      </div>
                      <p className="text-muted-foreground text-xs">Blocked</p>
                    </div>
                    <div className="rounded-lg border border-border p-3">
                      <div className="font-semibold">
                        {formatNumberIN(flatStats?.inactive_flats)}
                      </div>
                      <p className="text-muted-foreground text-xs">Inactive</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Pending Claims</CardTitle>
                  <CardDescription>
                    {formatNumberIN(claimStats?.pending_claims)} awaiting review
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {recentPendingClaims.length > 0 ? (
                    <div className="divide-y divide-border">
                      {recentPendingClaims.map((claim) => (
                        <div
                          className="grid grid-cols-[1fr_auto] items-center gap-3 py-3 first:pt-0 last:pb-0"
                          key={claim.id}
                        >
                          <div className="min-w-0">
                            <p className="truncate font-medium text-sm">
                              {claim.user_name ?? "Resident"}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {claim.flat_number ?? "Flat"} -{" "}
                              {titleCaseFromSnake(claim.requested_role)}
                            </p>
                          </div>
                          <Badge variant="secondary">
                            {formatShortDateIN(claim.created_at, "Not set")}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex min-h-40 flex-col items-center justify-center rounded-lg border border-dashed border-border px-4 text-center">
                      <p className="font-medium text-sm">No pending claims</p>
                      <p className="mt-1 text-muted-foreground text-xs">
                        Resident claim requests will appear here.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>

            <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
              <Card>
                <CardHeader>
                  <CardTitle>Subscription</CardTitle>
                  <CardAction>
                    <Badge variant={subscription ? "default" : "destructive"}>
                      {titleCaseFromSnake(subscription?.status ?? "inactive")}
                    </Badge>
                  </CardAction>
                  <CardDescription>
                    {subscription
                      ? `${subscription.plan_name} - ${titleCaseFromSnake(subscription.billing_cycle)}`
                      : "No active plan"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {subscription ? (
                    <>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <p className="text-muted-foreground text-xs">
                            Starts
                          </p>
                          <p className="font-medium text-sm">
                            {formatShortDateIN(
                              subscription.starts_at,
                              "Not set",
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Ends</p>
                          <p className="font-medium text-sm">
                            {formatShortDateIN(subscription.ends_at, "Not set")}
                          </p>
                        </div>
                      </div>
                      <UsageBar
                        label="Flats"
                        limit={usage?.flats?.limit}
                        percent={usage?.flats?.percent}
                        remaining={usage?.flats?.remaining}
                        used={usage?.flats?.used}
                      />
                      <UsageBar
                        label="Admins"
                        limit={usage?.admins?.limit}
                        percent={usage?.admins?.percent}
                        remaining={usage?.admins?.remaining}
                        used={usage?.admins?.used}
                      />
                      <UsageBar
                        label="Staff"
                        limit={usage?.staff?.limit}
                        percent={usage?.staff?.percent}
                        remaining={usage?.staff?.remaining}
                        used={usage?.staff?.used}
                      />
                    </>
                  ) : (
                    <div className="flex min-h-44 flex-col items-center justify-center rounded-lg border border-dashed border-border px-4 text-center">
                      <Crown className="mb-3 size-5 text-muted-foreground" />
                      <p className="font-medium text-sm">
                        No active subscription
                      </p>
                      <p className="mt-1 text-muted-foreground text-xs">
                        Choose a plan to unlock operational tools.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Upgrade Plans</CardTitle>
                  <CardDescription>
                    {formatNumberIN(planAds.length)} active upgrade options
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {planAds.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {planAds.slice(0, 4).map((plan) => {
                        const features = featureLabels(plan.features);
                        return (
                          <div
                            className="rounded-lg border border-border bg-background p-4"
                            key={plan.id}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-semibold">{plan.name}</p>
                                <p className="text-muted-foreground text-sm">
                                  {formatMoneyINR(
                                    plan.price_amount_paise,
                                    plan.currency,
                                  )}{" "}
                                  / {titleCaseFromSnake(plan.billing_cycle)}
                                </p>
                              </div>
                              <Sparkles className="size-4 text-primary" />
                            </div>
                            <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                              <span>
                                {formatNumberIN(plan.max_flats)} flats
                              </span>
                              <span>
                                {formatNumberIN(plan.max_admins)} admins
                              </span>
                              <span>
                                {formatNumberIN(plan.max_staff)} staff
                              </span>
                            </div>
                            {features.length > 0 ? (
                              <div className="mt-4 flex flex-wrap gap-2">
                                {features.map((feature, index) => (
                                  <Badge
                                    key={`${plan.id}-${feature}-${index}`}
                                    variant="outline"
                                  >
                                    <BadgeCheck className="size-3" />
                                    {feature}
                                  </Badge>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex min-h-44 flex-col items-center justify-center rounded-lg border border-dashed border-border px-4 text-center">
                      <Sparkles className="mb-3 size-5 text-muted-foreground" />
                      <p className="font-medium text-sm">No upgrade plans</p>
                      <p className="mt-1 text-muted-foreground text-xs">
                        Active upgrade plans will appear here.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>

            <div className="flex justify-end">
              <Button asChild variant="outline">
                <Link href={paths.onboardingSociety(societyId)}>
                  Open setup
                </Link>
              </Button>
            </div>
          </div>
        ) : null}
      </AsyncPanel>
    </WorkspacePage>
  );
}
