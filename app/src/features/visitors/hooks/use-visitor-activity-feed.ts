import { useCallback } from "react";

import { ACTIVITY_PAGE_SIZE } from "@/features/shared/activity-feed-config";
import { usePaginatedQuery } from "@/features/shared/use-paginated-query";
import type { ModelsVisitorEntry } from "@/lib/api/generated-api";

type PaginatedPageResult = {
  items: ModelsVisitorEntry[];
  limit: number;
  offset: number;
  total: number;
};

type UseVisitorActivityFeedOptions = {
  fetchPage: (args: { limit: number; offset: number }) => Promise<PaginatedPageResult>;
  pageSize?: number;
  skip?: boolean;
};

export function useVisitorActivityFeed({
  fetchPage,
  pageSize = ACTIVITY_PAGE_SIZE,
  skip = false,
}: UseVisitorActivityFeedOptions) {
  const stableFetchPage = useCallback(fetchPage, [fetchPage]);

  return usePaginatedQuery<ModelsVisitorEntry>({
    pageSize,
    skip,
    fetchPage: stableFetchPage,
  });
}

export {
  ACTIVITY_LIST_HEIGHT,
  ACTIVITY_ROW_HEIGHT,
  ACTIVITY_VISIBLE_ROWS,
} from "@/features/shared/activity-feed-config";
