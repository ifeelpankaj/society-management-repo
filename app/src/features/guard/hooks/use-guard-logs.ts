import { useCallback, useEffect, useMemo, useState } from "react";

import { useGuardScreen } from "@/features/guard/hooks/use-guard-screen";
import {
  buildVisitorEntryQueryFilters,
  getHalfOpenRangeIST,
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
} from "@/lib/api/generated-api";
import { useLazyGetV1SocietiesBySocietyIdVisitorEntriesExtendedQuery } from "@/lib/api/guard-api-extensions";

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

  const isSearchActive = debouncedSearch.length > 0;
  const queryFilters = useMemo(
    () =>
      buildVisitorEntryQueryFilters({
        segment,
        sheetStatus,
        purpose,
        datePreset,
        isSearchActive,
      }),
    [datePreset, isSearchActive, purpose, segment, sheetStatus],
  );

  const statsRange = useMemo(() => {
    if (isSearchActive) {
      return undefined;
    }

    const preset = datePreset === "all" && !sheetStatus ? "today" : datePreset;
    return getHalfOpenRangeIST(preset === "all" ? "today" : preset);
  }, [datePreset, isSearchActive, sheetStatus]);

  const [fetchEntries] = useLazyGetV1SocietiesBySocietyIdVisitorEntriesExtendedQuery();

  const fetchPage = useCallback(
    async ({ limit, offset }: { limit: number; offset: number }) => {
      if (!selectedSocietyId) {
        return { items: [], total: 0, limit, offset };
      }

      const response = await fetchEntries({
        societyId: selectedSocietyId,
        limit,
        offset,
        search: debouncedSearch || undefined,
        status: isSearchActive ? undefined : queryFilters.status,
        purpose: isSearchActive ? undefined : queryFilters.purpose,
        event: isSearchActive ? undefined : queryFilters.event,
        eventFrom: isSearchActive ? undefined : queryFilters.eventFrom,
        eventTo: isSearchActive ? undefined : queryFilters.eventTo,
      }).unwrap();

      return {
        items: response.data?.entries ?? [],
        total: response.data?.total ?? 0,
        limit: response.data?.limit ?? limit,
        offset: response.data?.offset ?? offset,
      };
    },
    [
      debouncedSearch,
      fetchEntries,
      isSearchActive,
      queryFilters.event,
      queryFilters.eventFrom,
      queryFilters.eventTo,
      queryFilters.purpose,
      queryFilters.status,
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
    if (datePreset !== "today" && segment !== "all") count += 1;
    return count;
  }, [datePreset, purpose, segment, sheetStatus]);

  const selectSegment = useCallback((next: LogsSegment) => {
    setSegment(next);
    setSheetStatus(undefined);

    if (next === "expected") {
      setDatePreset("today");
    } else if (next === "all") {
      setDatePreset("all");
    } else if (next === "today") {
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
        setSegment("all");
      } else if (next.status === "checked_in") {
        setSegment("all");
      } else if (next.status === "checked_out") {
        setSegment("all");
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

  const activeStatus = sheetStatus ?? segmentStatus(segment);

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
    statsRange,
  };
}

export function useGuardLogsFromParams(presetParam?: string | string[]) {
  return useGuardLogs(parseGuardEntriesPreset(presetParam));
}
