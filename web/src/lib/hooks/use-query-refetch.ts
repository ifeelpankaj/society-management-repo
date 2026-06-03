"use client";

import { useCallback, useMemo } from "react";

type RefetchableQuery = {
  refetch: () => unknown;
  isFetching?: boolean;
};

function useQueryRefetch(...queries: RefetchableQuery[]) {
  const refetch = useCallback(() => {
    for (const query of queries) {
      void query.refetch();
    }
  }, [queries]);

  const isFetching = useMemo(
    () => queries.some((query) => query.isFetching),
    [queries],
  );

  return { refetch, isFetching };
}

export { useQueryRefetch, type RefetchableQuery };
