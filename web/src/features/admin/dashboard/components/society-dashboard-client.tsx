"use client";

import Link from "next/link";

import { AsyncPanel } from "@/components/shared/async-panel";
import { PageHeader } from "@/components/shared/page-header";
import { RefreshButton } from "@/components/shared/refresh-button";
import { WorkspacePage } from "@/components/shared/workspace-page";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSocietyDashboard } from "@/features/admin/dashboard/hooks";
import { titleCaseFromSnake } from "@/lib/format";
import type { SocietyDashboardBootstrap } from "@/lib/api/society-dashboard-api";
import { paths } from "@/lib/routes/paths";

import { DashboardActionCenter } from "./dashboard-action-center";
import { DashboardAnalyticsGrid } from "./dashboard-analytics-grid";
import { DashboardKpiRow } from "./dashboard-kpi-row";
import { DashboardPendingClaimsTable } from "./dashboard-pending-claims-table";
import { DashboardSocietyHeader } from "./dashboard-society-header";
import { DashboardSubscriptionAlert } from "./dashboard-subscription-alert";
import { DashboardUpgradePlans } from "./dashboard-upgrade-plans";
import { societyAddressLine } from "../utils/dashboard-action-items";

type SocietyDashboardClientProps = {
  societyId: number;
  initialDashboard?: SocietyDashboardBootstrap | null;
};

export function SocietyDashboardClient({
  societyId,
  initialDashboard,
}: SocietyDashboardClientProps) {
  const {
    claimStats,
    dashboard,
    flatStats,
    isFetching,
    isLoading,
    memberStats,
    planAds,
    recentPendingClaims,
    refetch,
    society,
    subscription,
    subscriptionHealth,
    usage,
    visitorDaily,
    visitorStats,
  } = useSocietyDashboard({ societyId, initialDashboard });

  return (
    <WorkspacePage size="wide">
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
            ? `${society?.society_code} · ${society?.city ?? "City not set"}`
            : undefined
        }
        eyebrow="Society workspace"
        title={
          dashboard ? (
            <span className="flex flex-wrap items-center gap-3">
              {society?.name ?? "Society dashboard"}
              <Badge variant="outline">{titleCaseFromSnake(society?.status)}</Badge>
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
          <div className="space-y-4">
            <DashboardSubscriptionAlert
              hasSubscription={Boolean(subscription)}
              subscriptionHealth={subscriptionHealth}
            />

            <DashboardSocietyHeader
              address={societyAddressLine(dashboard)}
              society={society}
              subscription={subscription}
              subscriptionHealth={subscriptionHealth}
            />

            <DashboardActionCenter dashboard={dashboard} societyId={societyId} />

            <DashboardKpiRow
              claimStats={claimStats}
              flatTotal={flatStats?.total_flats}
              loading={isLoading}
              memberStats={memberStats}
              subscriptionHealth={subscriptionHealth}
              visitorStats={visitorStats}
            />

            <DashboardAnalyticsGrid
              flatStats={flatStats}
              memberStats={memberStats}
              usage={usage}
              visitorDaily={visitorDaily}
            />

            <DashboardPendingClaimsTable
              claims={recentPendingClaims}
              societyId={societyId}
            />

            <DashboardUpgradePlans
              planAds={planAds}
              subscriptionHealth={subscriptionHealth}
            />

            <div className="flex justify-end pt-1">
              <Button asChild variant="outline">
                <Link href={paths.onboardingSociety(societyId)}>Open setup</Link>
              </Button>
            </div>
          </div>
        ) : null}
      </AsyncPanel>
    </WorkspacePage>
  );
}
