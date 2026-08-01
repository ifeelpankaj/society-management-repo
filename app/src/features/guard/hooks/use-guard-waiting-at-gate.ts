import { useMemo } from "react";

import { useDebouncedValue } from "@/features/shared/use-debounced-value";
import { useGetV1SocietiesBySocietyIdVisitorEntriesWaitingAtGateQuery } from "@/lib/api/guard-api-extensions";

const SEARCH_DEBOUNCE_MS = 400;
const PAGE_LIMIT = 50;

export function useGuardWaitingAtGate(societyId?: number, searchInput = "") {
  const debouncedSearch = useDebouncedValue(searchInput.trim(), SEARCH_DEBOUNCE_MS);
  const skip = !societyId;

  const query = useGetV1SocietiesBySocietyIdVisitorEntriesWaitingAtGateQuery(
    {
      societyId: societyId ?? 0,
      search: debouncedSearch || undefined,
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
