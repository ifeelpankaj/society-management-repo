"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type {
  ModelsSocietyMemberRole,
  ModelsSocietyMemberStatus,
} from "@/lib/api/generated-api";
import {
  useGetV1SocietiesBySocietyIdMembersPaginatedQuery,
  useGetV1SocietiesBySocietyIdMembersSummaryQuery,
} from "@/lib/api/society-members-api";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { useQueryRefetch } from "@/lib/hooks/use-query-refetch";

type UseResidentsListOptions = {
  societyId: number;
};

export function useResidentsList({ societyId }: UseResidentsListOptions) {
  const [search, setSearch] = useState("");
  const [searchMode, setSearchMode] = useState("all");
  const debouncedSearch = useDebouncedValue(search, 350);
  const [role, setRole] = useState<ModelsSocietyMemberRole | "all">("all");
  const [status, setStatus] = useState<ModelsSocietyMemberStatus | "all">(
    "all",
  );
  const [joinedFrom, setJoinedFrom] = useState("");
  const [joinedTo, setJoinedTo] = useState("");
  const [sortBy, setSortBy] = useState<"all" | "joined_at" | "role" | "status">(
    "all",
  );
  const [sortOrder, setSortOrder] = useState<"all" | "asc" | "desc">("all");
  const [page, setPageState] = useState(1);
  const [pageSize, setPageSizeState] = useState(10);
  const resetKey = [
    debouncedSearch,
    searchMode,
    role,
    status,
    joinedFrom,
    joinedTo,
    sortBy,
    sortOrder,
  ].join("\u0000");
  const previousResetKeyRef = useRef(resetKey);

  const summaryQuery = useGetV1SocietiesBySocietyIdMembersSummaryQuery({
    societyId,
  });

  useEffect(() => {
    if (previousResetKeyRef.current !== resetKey) {
      previousResetKeyRef.current = resetKey;
      setPageState(1);
    }
  }, [resetKey]);

  const offset = (page - 1) * pageSize;

  const membersQuery = useGetV1SocietiesBySocietyIdMembersPaginatedQuery({
    societyId,
    search: debouncedSearch.trim() || undefined,
    searchMode,
    role: role === "all" ? undefined : role,
    status: status === "all" ? undefined : status,
    joinedFrom: joinedFrom.trim() || undefined,
    joinedTo: joinedTo.trim() || undefined,
    sortBy: sortBy === "all" ? undefined : sortBy,
    sortOrder: sortOrder === "all" ? undefined : sortOrder,
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
      setPageState(totalPages);
    }
  }, [page, totalPages]);

  const setPage = useCallback(
    (nextPage: number) => {
      setPageState(Math.max(1, Math.min(nextPage, totalPages)));
    },
    [totalPages],
  );

  const setPageSize = useCallback((nextPageSize: number) => {
    setPageSizeState(nextPageSize);
    setPageState(1);
  }, []);

  const { refetch, isFetching } = useQueryRefetch(summaryQuery, membersQuery);

  const isLoading = summaryQuery.isLoading || membersQuery.isLoading;
  const isError = summaryQuery.isError || membersQuery.isError;
  const isEmpty = !membersQuery.isLoading && members.length === 0;

  return {
    isEmpty,
    isError,
    isFetching,
    isLoading,
    joinedFrom,
    joinedTo,
    members,
    page,
    pageEnd,
    pageSize,
    pageStart,
    refetch,
    role,
    search,
    searchMode,
    setJoinedFrom,
    setJoinedTo,
    setPage,
    setPageSize,
    setRole,
    setSearch,
    setSearchMode,
    setSortBy,
    setSortOrder,
    setStatus,
    sortBy,
    sortOrder,
    status,
    summary: summaryQuery.data?.data?.summary,
    total,
    totalPages,
  };
}
