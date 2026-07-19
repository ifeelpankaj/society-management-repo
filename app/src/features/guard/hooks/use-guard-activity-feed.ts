import { useCallback } from "react";

import { getTodayRange } from "@/features/guard/guard-routes";
import { useGuardScreen } from "@/features/guard/hooks/use-guard-screen";
import { usePaginatedQuery } from "@/features/shared/use-paginated-query";
import {
  type ModelsVisitorEntry,
  generatedApi,
} from "@/lib/api/generated-api";

const ACTIVITY_PAGE_SIZE = 5;

export function useGuardActivityFeed() {
  const { selectedSocietyId } = useGuardScreen();
  const [fetchEntries] =
    generatedApi.endpoints.getV1SocietiesBySocietyIdVisitorEntries.useLazyQuery();

  const fetchPage = useCallback(
    async ({ limit, offset }: { limit: number; offset: number }) => {
      if (!selectedSocietyId) {
        return { items: [], total: 0, limit, offset };
      }

      const { createdFrom, createdTo } = getTodayRange();
      const response = await fetchEntries({
        societyId: selectedSocietyId,
        createdFrom,
        createdTo,
        limit,
        offset,
      }).unwrap();

      return {
        items: response.data?.entries ?? [],
        total: response.data?.total ?? 0,
        limit: response.data?.limit ?? limit,
        offset: response.data?.offset ?? offset,
      };
    },
    [fetchEntries, selectedSocietyId],
  );

  return usePaginatedQuery<ModelsVisitorEntry>({
    pageSize: ACTIVITY_PAGE_SIZE,
    skip: !selectedSocietyId,
    fetchPage,
  });
}

export const ACTIVITY_VISIBLE_ROWS = ACTIVITY_PAGE_SIZE;
export const ACTIVITY_ROW_HEIGHT = 64;
export const ACTIVITY_LIST_HEIGHT = ACTIVITY_ROW_HEIGHT * ACTIVITY_VISIBLE_ROWS;
