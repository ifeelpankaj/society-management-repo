"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type UsePaginationOptions = {
  totalItems: number;
  initialPage?: number;
  initialPageSize?: number;
  resetDeps?: readonly unknown[];
};

function usePagination({
  totalItems,
  initialPage = 1,
  initialPageSize = 10,
  resetDeps = [],
}: UsePaginationOptions) {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  useEffect(() => {
    setPage(initialPage);
  }, [initialPage, ...resetDeps]);

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize) || 1);
  const offset = (page - 1) * pageSize;
  const pageStart = totalItems === 0 ? 0 : offset + 1;
  const pageEnd = Math.min(page * pageSize, totalItems);

  const goToPage = useCallback(
    (nextPage: number) => {
      setPage(Math.max(1, Math.min(nextPage, totalPages)));
    },
    [totalPages],
  );

  const changePageSize = useCallback((nextPageSize: number) => {
    setPageSize(nextPageSize);
    setPage(1);
  }, []);

  const reset = useCallback(() => {
    setPage(initialPage);
    setPageSize(initialPageSize);
  }, [initialPage, initialPageSize]);

  return useMemo(
    () => ({
      page,
      pageSize,
      offset,
      totalPages,
      pageStart,
      pageEnd,
      setPage: goToPage,
      setPageSize: changePageSize,
      reset,
    }),
    [
      page,
      pageSize,
      offset,
      totalPages,
      pageStart,
      pageEnd,
      goToPage,
      changePageSize,
      reset,
    ],
  );
}

export { usePagination, type UsePaginationOptions };
