import { useCallback, useEffect, useMemo, useState } from "react";

import { useGuardScreen } from "@/features/guard/hooks/use-guard-screen";
import { isExpectedTodayEntry } from "@/features/guard/guard-utils";
import {
  getDateRange,
  type DateRangePreset,
  type LogsPreset,
  type LogsSegment,
  parseGuardEntriesPreset,
  presetToInitialState,
} from "@/features/guard/guard-routes";
import { usePaginatedQuery } from "@/features/shared/use-paginated-query";
import {
  type ModelsVisitorEntry,
  type ModelsVisitorPurpose,
  type ModelsVisitorStatus,
  generatedApi,
} from "@/lib/api/generated-api";

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 400;

function segmentStatus(segment: LogsSegment): ModelsVisitorStatus | undefined {
  if (segment === "inside") {
    return "checked_in";
  }

  if (segment === "expected") {
    return "approved";
  }

  return undefined;
}

function segmentUsesExpectedFilter(segment: LogsSegment) {
  return segment === "expected";
}

export function useGuardLogs(initialPreset: LogsPreset = "today") {
  const initial = presetToInitialState(initialPreset);
  const { selectedSocietyId } = useGuardScreen();
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [segment, setSegment] = useState<LogsSegment>(initial.segment);
  const [datePreset, setDatePreset] = useState<DateRangePreset>(initial.datePreset);
  const [purpose, setPurpose] = useState<ModelsVisitorPurpose | undefined>();
  const [sheetStatus, setSheetStatus] = useState<ModelsVisitorStatus | undefined>(
    initial.sheetStatus,
  );

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const next = presetToInitialState(initialPreset);
    setSegment(next.segment);
    setDatePreset(next.datePreset);
    setSheetStatus(next.sheetStatus);
    setPurpose(undefined);
    setSearchInput("");
    setDebouncedSearch("");
  }, [initialPreset]);

  const activeStatus = sheetStatus ?? segmentStatus(segment);
  const dateRange = getDateRange(datePreset);
  const isSearchActive = debouncedSearch.length > 0;
  const isExpectedSegment = segmentUsesExpectedFilter(segment) && !sheetStatus;

  const [fetchEntries] =
    generatedApi.endpoints.getV1SocietiesBySocietyIdVisitorEntries.useLazyQuery();

  const fetchPage = useCallback(
    async ({ limit, offset }: { limit: number; offset: number }) => {
      if (!selectedSocietyId) {
        return { items: [], total: 0, limit, offset };
      }

      const response = await fetchEntries({
        societyId: selectedSocietyId,
        limit,
        offset,
        status: isSearchActive ? undefined : activeStatus,
        purpose: isSearchActive ? undefined : purpose,
        createdFrom:
          isSearchActive || isExpectedSegment ? undefined : dateRange.createdFrom,
        createdTo: isSearchActive || isExpectedSegment ? undefined : dateRange.createdTo,
        search: debouncedSearch || undefined,
      }).unwrap();

      let items = response.data?.entries ?? [];
      let total = response.data?.total ?? 0;

      if (isExpectedSegment && !isSearchActive) {
        items = items.filter(isExpectedTodayEntry);
        total = items.length;
      }

      return {
        items,
        total,
        limit: response.data?.limit ?? limit,
        offset: response.data?.offset ?? offset,
      };
    },
    [
      activeStatus,
      dateRange.createdFrom,
      dateRange.createdTo,
      debouncedSearch,
      fetchEntries,
      isExpectedSegment,
      isSearchActive,
      purpose,
      selectedSocietyId,
    ],
  );

  const pagination = usePaginatedQuery<ModelsVisitorEntry>({
    pageSize: PAGE_SIZE,
    skip: !selectedSocietyId,
    fetchPage,
  });

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (purpose) count += 1;
    if (sheetStatus) count += 1;
    if (datePreset !== "today") count += 1;
    return count;
  }, [datePreset, purpose, sheetStatus]);

  const selectSegment = useCallback((next: LogsSegment) => {
    setSegment(next);
    setSheetStatus(undefined);

    if (next === "expected") {
      setDatePreset("today");
    }
  }, []);

  const applySheetFilters = useCallback(
    (next: {
      datePreset?: DateRangePreset;
      purpose?: ModelsVisitorPurpose;
      status?: ModelsVisitorStatus;
    }) => {
      if (next.datePreset !== undefined) {
        setDatePreset(next.datePreset);
      }
      setPurpose(next.purpose);
      setSheetStatus(next.status);

      if (next.status === "waiting_approval") {
        setSegment("today");
        setSheetStatus("waiting_approval");
      } else if (next.status === "checked_in") {
        setSegment("inside");
      } else if (next.status === "approved") {
        setSegment("expected");
        setDatePreset("today");
      } else if (!next.status) {
        setSegment("today");
      }
    },
    [],
  );

  const clearSheetFilters = useCallback(() => {
    setPurpose(undefined);
    setSheetStatus(undefined);
    setDatePreset("today");
    setSegment("today");
  }, []);

  return {
    ...pagination,
    activeFilterCount,
    activeStatus,
    applySheetFilters,
    clearSheetFilters,
    datePreset,
    isSearchActive: searchInput.trim().length > 0,
    purpose,
    searchInput,
    segment,
    selectSegment,
    setDatePreset,
    setSearchInput,
    sheetStatus,
  };
}

export function useGuardLogsFromParams(presetParam?: string | string[]) {
  return useGuardLogs(parseGuardEntriesPreset(presetParam));
}
