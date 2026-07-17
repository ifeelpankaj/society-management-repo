"use client";

import { useMemo } from "react";

import { useGetV1SocietiesBySocietyIdDashboardBootstrapQuery } from "@/lib/api/society-dashboard-api";

type UseSocietyDashboardOptions = {
  societyId: number;
};

export function useSocietyDashboard({ societyId }: UseSocietyDashboardOptions) {
  const query = useGetV1SocietiesBySocietyIdDashboardBootstrapQuery(
    { societyId },
    { refetchOnMountOrArgChange: false },
  );

  const dashboard = query.data?.data?.dashboard;
  const society = dashboard?.society;
  const flatStats = dashboard?.flat_stats;
  const claimStats = dashboard?.claim_stats;
  const memberStats = dashboard?.member_stats;
  const subscription = dashboard?.current_subscription;
  const usage = dashboard?.subscription_usage;
  const planAds = dashboard?.plan_ads ?? [];
  const recentPendingClaims = dashboard?.recent_pending_claims ?? [];

  const declaredFlats = society?.total_flats ?? 0;
  const configuredPercent = useMemo(
    () =>
      declaredFlats > 0
        ? Math.min(
            100,
            Math.round(((flatStats?.active_flats ?? 0) / declaredFlats) * 100),
          )
        : 0,
    [declaredFlats, flatStats?.active_flats],
  );

  return {
    claimStats,
    configuredPercent,
    dashboard,
    declaredFlats,
    flatStats,
    isFetching: query.isFetching,
    isLoading: query.isLoading,
    memberStats,
    planAds,
    recentPendingClaims,
    refetch: query.refetch,
    society,
    subscription,
    usage,
  };
}
