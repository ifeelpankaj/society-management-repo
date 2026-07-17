import { useCallback, useEffect, useMemo, useState } from "react";

type PaginatedPayload<T> = {
  items: T[];
  total: number;
  limit: number;
  offset: number;
};

type UsePaginatedQueryOptions<T> = {
  pageSize?: number;
  skip?: boolean;
  fetchPage: (args: { limit: number; offset: number }) => Promise<PaginatedPayload<T>>;
};

export function usePaginatedQuery<T>({
  pageSize = 20,
  skip = false,
  fetchPage,
}: UsePaginatedQueryOptions<T>) {
  const [offset, setOffset] = useState(0);
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<unknown>();

  const hasMore = items.length < total;

  const loadPage = useCallback(
    async (nextOffset: number, mode: "replace" | "append") => {
      if (skip) {
        return;
      }

      const setLoading = nextOffset === 0 ? setIsLoading : setIsLoadingMore;
      setLoading(true);
      setError(undefined);

      try {
        const page = await fetchPage({ limit: pageSize, offset: nextOffset });
        setTotal(page.total);
        setOffset(nextOffset);
        setItems((current) =>
          mode === "append" ? [...current, ...page.items] : page.items,
        );
      } catch (nextError) {
        setError(nextError);
      } finally {
        setLoading(false);
        setIsLoadingMore(false);
        setIsRefreshing(false);
      }
    },
    [fetchPage, pageSize, skip],
  );

  useEffect(() => {
    if (skip) {
      setItems([]);
      setTotal(0);
      setOffset(0);
      return;
    }

    void loadPage(0, "replace");
  }, [loadPage, skip]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadPage(0, "replace");
  }, [loadPage]);

  const loadMore = useCallback(async () => {
    if (skip || isLoading || isLoadingMore || !hasMore) {
      return;
    }

    await loadPage(offset + pageSize, "append");
  }, [hasMore, isLoading, isLoadingMore, loadPage, offset, pageSize, skip]);

  return useMemo(
    () => ({
      items,
      total,
      offset,
      isLoading,
      isLoadingMore,
      isRefreshing,
      hasMore,
      error,
      refresh,
      loadMore,
    }),
    [
      error,
      hasMore,
      isLoading,
      isLoadingMore,
      isRefreshing,
      items,
      loadMore,
      offset,
      refresh,
      total,
    ],
  );
}
