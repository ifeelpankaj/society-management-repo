import { useMemo } from "react";

import { useGetV1SocietiesBySocietyIdVisitorEntriesPendingQuery } from "@/lib/api/generated-api";

const PAGE_LIMIT = 50;

export function useGuardPending(societyId?: number) {
  const skip = !societyId;

  const query = useGetV1SocietiesBySocietyIdVisitorEntriesPendingQuery(
    {
      societyId: societyId ?? 0,
      limit: PAGE_LIMIT,
      offset: 0,
    },
    {
      skip,
      refetchOnFocus: true,
      refetchOnMountOrArgChange: 30,
    },
  );

  const items = query.data?.data?.entries ?? [];
  const total = query.data?.data?.total ?? 0;

  return useMemo(
    () => ({
      items,
      total,
      isLoading: !skip && query.isLoading && !query.data,
      isRefreshing: !skip && query.isFetching && Boolean(query.data),
      refresh: query.refetch,
      error: query.error,
    }),
    [items, query.data, query.error, query.isFetching, query.isLoading, query.refetch, skip, total],
  );
}
