import { useCallback } from "react";

import { getTodayRange } from "@/features/guard/guard-routes";
import { useResident } from "@/features/resident/resident-context";
import { usePaginatedQuery } from "@/features/shared/use-paginated-query";
import type { ModelsVisitorEntry } from "@/lib/api/generated-api";
import { useLazyGetV1SocietiesBySocietyIdFlatsAndFlatIdVisitorEntriesQuery } from "@/lib/api/resident-api-extensions";

const ACTIVITY_PAGE_SIZE = 5;

export function useResidentActivityFeed() {
  const { flatId, societyId } = useResident();
  const [fetchEntries] = useLazyGetV1SocietiesBySocietyIdFlatsAndFlatIdVisitorEntriesQuery();

  const fetchPage = useCallback(
    async ({ limit, offset }: { limit: number; offset: number }) => {
      if (!societyId || !flatId) {
        return { items: [], total: 0, limit, offset };
      }

      const todayRange = getTodayRange();
      const response = await fetchEntries({
        societyId,
        flatId,
        event: todayRange ? "activity" : undefined,
        eventFrom: todayRange?.eventFrom,
        eventTo: todayRange?.eventTo,
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
    [fetchEntries, flatId, societyId],
  );

  return usePaginatedQuery<ModelsVisitorEntry>({
    pageSize: ACTIVITY_PAGE_SIZE,
    skip: !societyId || !flatId,
    fetchPage,
  });
}

export const RESIDENT_ACTIVITY_ROW_HEIGHT = 64;
export const RESIDENT_ACTIVITY_VISIBLE_ROWS = ACTIVITY_PAGE_SIZE;
export const RESIDENT_ACTIVITY_LIST_HEIGHT =
  RESIDENT_ACTIVITY_ROW_HEIGHT * RESIDENT_ACTIVITY_VISIBLE_ROWS;
