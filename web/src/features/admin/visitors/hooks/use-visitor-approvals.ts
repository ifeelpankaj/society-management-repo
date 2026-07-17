"use client";

import { useEffect, useRef, useState } from "react";

import { useGetV1SocietyVisitorPendingApprovalsQuery } from "@/lib/api/society-visitor-entries-api";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { useQueryRefetch } from "@/lib/hooks/use-query-refetch";

type UseVisitorApprovalsOptions = {
  societyId: number;
};

export function useVisitorApprovals({ societyId }: UseVisitorApprovalsOptions) {
  const [block, setBlock] = useState("");
  const debouncedBlock = useDebouncedValue(block, 2000);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const resetKey = debouncedBlock;
  const previousResetKeyRef = useRef(resetKey);

  useEffect(() => {
    if (previousResetKeyRef.current !== resetKey) {
      previousResetKeyRef.current = resetKey;
      setPage(1);
    }
  }, [resetKey]);

  const offset = (page - 1) * pageSize;

  const pendingQuery = useGetV1SocietyVisitorPendingApprovalsQuery({
    societyId,
    block: debouncedBlock.trim() || undefined,
    limit: pageSize,
    offset,
  });

  const entries = pendingQuery.data?.data?.entries ?? [];
  const total = pendingQuery.data?.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageStart = total === 0 ? 0 : offset + 1;
  const pageEnd = Math.min(page * pageSize, total);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const isLoading = pendingQuery.isLoading;
  const isError = pendingQuery.isError;
  const isEmpty = !pendingQuery.isLoading && entries.length === 0;

  const { refetch, isFetching } = useQueryRefetch(pendingQuery);

  return {
    block,
    entries,
    isEmpty,
    isError,
    isFetching,
    isLoading,
    page,
    pageEnd,
    pageSize,
    pageStart,
    pendingQuery,
    refetch,
    setBlock,
    setPage,
    setPageSize,
    total,
    totalPages,
  };
}
