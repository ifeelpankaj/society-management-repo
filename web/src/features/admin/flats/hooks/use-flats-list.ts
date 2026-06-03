"use client";

import { useEffect, useState } from "react";

import type { ModelsFlatStatus } from "@/lib/api/generated-api";
import { useGetV1SocietiesBySocietyIdFlatsStatsQuery } from "@/lib/api/generated-api";
import { useGetV1SocietiesBySocietyIdFlatsPaginatedQuery } from "@/lib/api/society-flats-api";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { useQueryRefetch } from "@/lib/hooks/use-query-refetch";

type UseFlatsListOptions = {
  societyId: number;
};

export function useFlatsList({ societyId }: UseFlatsListOptions) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [status, setStatus] = useState<ModelsFlatStatus | "all">("all");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const statsQuery = useGetV1SocietiesBySocietyIdFlatsStatsQuery({ societyId });

  useEffect(() => {
    setPage(1);
  }, []);

  const stats = statsQuery.data?.data?.stats;
  const offset = (page - 1) * pageSize;

  const flatsQuery = useGetV1SocietiesBySocietyIdFlatsPaginatedQuery({
    societyId,
    search: debouncedSearch.trim() || undefined,
    status: status === "all" ? undefined : status,
    limit: pageSize,
    offset,
  });

  const paginatedFlats = flatsQuery.data?.data?.flats;
  const totalFlats = paginatedFlats?.total ?? stats?.total_flats ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalFlats / pageSize) || 1);
  const pageStart = totalFlats === 0 ? 0 : offset + 1;
  const pageEnd = Math.min(page * pageSize, totalFlats);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const flats = paginatedFlats?.items ?? [];
  const isLoading = statsQuery.isLoading || flatsQuery.isLoading;
  const isError = statsQuery.isError || flatsQuery.isError;
  const isEmpty = !flatsQuery.isLoading && flats.length === 0;

  const { refetch, isFetching } = useQueryRefetch(statsQuery, flatsQuery);

  return {
    flats,
    isEmpty,
    isError,
    isFetching,
    isLoading,
    page,
    pageEnd,
    pageSize,
    pageStart,
    refetch,
    search,
    setPage,
    setPageSize,
    setSearch,
    setStatus,
    stats,
    statsQuery,
    status,
    totalFlats,
    totalPages,
  };
}
