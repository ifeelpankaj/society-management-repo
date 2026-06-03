"use client";

import { useEffect, useState } from "react";

import type {
  ModelsSocietyMemberRole,
  ModelsSocietyMemberStatus,
} from "@/lib/api/generated-api";
import {
  useGetV1SocietiesBySocietyIdMembersPaginatedQuery,
  useGetV1SocietiesBySocietyIdMembersSummaryQuery,
} from "@/lib/api/society-members-api";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { usePagination } from "@/lib/hooks/use-pagination";
import { useQueryRefetch } from "@/lib/hooks/use-query-refetch";

type UseResidentsListOptions = {
  societyId: number;
};

export function useResidentsList({ societyId }: UseResidentsListOptions) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [role, setRole] = useState<ModelsSocietyMemberRole | "all">("all");
  const [status, setStatus] = useState<ModelsSocietyMemberStatus | "all">(
    "all",
  );

  const summaryQuery = useGetV1SocietiesBySocietyIdMembersSummaryQuery({
    societyId,
  });

  const { page, pageSize, offset, setPage, setPageSize } = usePagination({
    totalItems: 0,
    resetDeps: [debouncedSearch, role, status],
  });

  const membersQuery = useGetV1SocietiesBySocietyIdMembersPaginatedQuery({
    societyId,
    search: debouncedSearch.trim() || undefined,
    role: role === "all" ? undefined : role,
    status: status === "all" ? undefined : status,
    limit: pageSize,
    offset,
  });

  const members = membersQuery.data?.data?.members?.items ?? [];
  const total = membersQuery.data?.data?.members?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageStart = total === 0 ? 0 : offset + 1;
  const pageEnd = Math.min(page * pageSize, total);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages, setPage]);

  const { refetch, isFetching } = useQueryRefetch(summaryQuery, membersQuery);

  const isLoading = summaryQuery.isLoading || membersQuery.isLoading;
  const isError = summaryQuery.isError || membersQuery.isError;
  const isEmpty = !membersQuery.isLoading && members.length === 0;

  return {
    isEmpty,
    isError,
    isFetching,
    isLoading,
    members,
    page,
    pageEnd,
    pageSize,
    pageStart,
    refetch,
    role,
    search,
    setPage,
    setPageSize,
    setRole,
    setSearch,
    setStatus,
    status,
    summary: summaryQuery.data?.data?.summary,
    total,
    totalPages,
  };
}
