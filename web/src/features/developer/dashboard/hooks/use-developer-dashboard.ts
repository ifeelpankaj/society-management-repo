"use client";

import { useGetV1DeveloperDashboardBootstrapQuery } from "@/lib/api/generated-api";

export function useDeveloperDashboard() {
  const query = useGetV1DeveloperDashboardBootstrapQuery();
  const dashboard = query.data?.data?.dashboard;

  return {
    dashboard,
    isError: query.isError,
    isFetching: query.isFetching,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
