"use client";

import { useEffect, useRef, useState } from "react";

import type { ModelsFlatStatus } from "@/lib/api/generated-api";
import { useGetV1SocietiesBySocietyIdFlatsStatsQuery } from "@/lib/api/generated-api";
import { useGetV1SocietiesBySocietyIdFlatsPaginatedQuery } from "@/lib/api/society-flats-api";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { useQueryRefetch } from "@/lib/hooks/use-query-refetch";

type UseFlatsListOptions = {
  societyId: number;
};

export function useFlatsList({ societyId }: UseFlatsListOptions) {
  const [block, setBlock] = useState("");
  const [floor, setFloor] = useState("");
  const [flatNumber, setFlatNumber] = useState("");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 2000);
  const debouncedBlock = useDebouncedValue(block, 2000);
  const debouncedFloor = useDebouncedValue(floor, 2000);
  const debouncedFlatNumber = useDebouncedValue(flatNumber, 2000);
  const [status, setStatus] = useState<ModelsFlatStatus | "all">("all");
  const [isActive, setIsActive] = useState<"all" | "true" | "false">("all");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const resetKey = [
    debouncedBlock,
    debouncedFloor,
    debouncedFlatNumber,
    debouncedSearch,
    status,
    isActive,
  ].join("\u0000");
  const previousResetKeyRef = useRef(resetKey);

  const statsQuery = useGetV1SocietiesBySocietyIdFlatsStatsQuery({ societyId });

  const stats = statsQuery.data?.data?.stats;
  const offset = (page - 1) * pageSize;

  useEffect(() => {
    if (previousResetKeyRef.current !== resetKey) {
      previousResetKeyRef.current = resetKey;
      setPage(1);
    }
  }, [resetKey]);

  const flatsQuery = useGetV1SocietiesBySocietyIdFlatsPaginatedQuery({
    societyId,
    block: debouncedBlock.trim() || undefined,
    floor: debouncedFloor.trim() || undefined,
    flatNumber: debouncedFlatNumber.trim() || undefined,
    search: debouncedSearch.trim() || undefined,
    status: status === "all" ? undefined : status,
    isActive: isActive === "all" ? undefined : isActive === "true",
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
    isActive,
    page,
    pageEnd,
    pageSize,
    pageStart,
    refetch,
    setBlock,
    setFloor,
    setFlatNumber,
    setIsActive,
    search,
    setPage,
    setPageSize,
    setSearch,
    setStatus,
    stats,
    statsQuery,
    status,
    block,
    floor,
    flatNumber,
    totalFlats,
    totalPages,
  };
}
