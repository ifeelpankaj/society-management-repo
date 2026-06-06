"use client";

import { useEffect, useRef, useState } from "react";

import {
  useGetV1SocietyVisitorEntriesQuery,
  useGetV1SocietyVisitorEntryStatsQuery,
} from "@/lib/api/society-visitor-entries-api";
import type {
  VisitorPurpose,
  VisitorSource,
  VisitorStatus,
} from "@/lib/api/visitor-types";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { useQueryRefetch } from "@/lib/hooks/use-query-refetch";

type UseVisitorsListOptions = {
  societyId: number;
};

export function useVisitorsList({ societyId }: UseVisitorsListOptions) {
  const [status, setStatus] = useState<VisitorStatus | "all">("all");
  const [purpose, setPurpose] = useState<VisitorPurpose | "all">("all");
  const [source, setSource] = useState<VisitorSource | "all">("all");
  const [block, setBlock] = useState("");
  const [createdFrom, setCreatedFrom] = useState("");
  const [createdTo, setCreatedTo] = useState("");
  const debouncedBlock = useDebouncedValue(block, 2000);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const resetKey = [
    status,
    purpose,
    source,
    debouncedBlock,
    createdFrom,
    createdTo,
  ].join("\u0000");
  const previousResetKeyRef = useRef(resetKey);

  useEffect(() => {
    if (previousResetKeyRef.current !== resetKey) {
      previousResetKeyRef.current = resetKey;
      setPage(1);
    }
  }, [resetKey]);

  const offset = (page - 1) * pageSize;

  const toRFC3339Start = (value: string) =>
    value.trim() ? `${value.trim()}T00:00:00Z` : undefined;
  const toRFC3339End = (value: string) =>
    value.trim() ? `${value.trim()}T23:59:59Z` : undefined;

  const statsQuery = useGetV1SocietyVisitorEntryStatsQuery({ societyId });
  const entriesQuery = useGetV1SocietyVisitorEntriesQuery({
    societyId,
    status: status === "all" ? undefined : status,
    purpose: purpose === "all" ? undefined : purpose,
    source: source === "all" ? undefined : source,
    block: debouncedBlock.trim() || undefined,
    createdFrom: toRFC3339Start(createdFrom),
    createdTo: toRFC3339End(createdTo),
    limit: pageSize,
    offset,
  });

  const stats = statsQuery.data?.data?.stats;
  const entries = entriesQuery.data?.data?.entries ?? [];
  const total = entriesQuery.data?.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageStart = total === 0 ? 0 : offset + 1;
  const pageEnd = Math.min(page * pageSize, total);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const isLoading = statsQuery.isLoading || entriesQuery.isLoading;
  const isError = statsQuery.isError || entriesQuery.isError;
  const isEmpty = !entriesQuery.isLoading && entries.length === 0;

  const { refetch, isFetching } = useQueryRefetch(statsQuery, entriesQuery);

  return {
    block,
    createdFrom,
    createdTo,
    entries,
    entriesQuery,
    isEmpty,
    isError,
    isFetching,
    isLoading,
    page,
    pageEnd,
    pageSize,
    pageStart,
    purpose,
    refetch,
    setBlock,
    setCreatedFrom,
    setCreatedTo,
    setPage,
    setPageSize,
    setPurpose,
    setSource,
    setStatus,
    source,
    stats,
    statsQuery,
    status,
    total,
    totalPages,
  };
}
