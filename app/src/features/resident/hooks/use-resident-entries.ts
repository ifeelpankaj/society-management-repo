import { useCallback, useEffect, useMemo, useState } from "react";

import { isExpectedTodayEntry } from "@/features/visitors/visitor-utils";
import {
  getDateRange,
  type DateRangePreset,
} from "@/features/visitors/visitor-date-ranges";
import { useResident } from "@/features/resident/resident-context";
import {
  parseResidentEntriesPreset,
  type ResidentEntriesPreset,
} from "@/features/resident/resident-routes";
import { usePaginatedQuery } from "@/features/shared/use-paginated-query";
import {
  type ModelsVisitorEntry,
  type ModelsVisitorPurpose,
  type ModelsVisitorStatus,
} from "@/lib/api/generated-api";
import { useLazyGetV1SocietiesBySocietyIdFlatsAndFlatIdVisitorEntriesQuery } from "@/lib/api/resident-api-extensions";

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 400;

export type ResidentEntriesSegment = "today" | "expected" | "inside" | "all";

function segmentStatus(segment: ResidentEntriesSegment): ModelsVisitorStatus | undefined {
  if (segment === "inside") {
    return "checked_in";
  }

  if (segment === "expected") {
    return "approved";
  }

  return undefined;
}

function segmentUsesExpectedFilter(segment: ResidentEntriesSegment) {
  return segment === "expected";
}

type PresetState = {
  datePreset: DateRangePreset;
  segment: ResidentEntriesSegment;
  sheetStatus?: ModelsVisitorStatus;
};

const PRESET_CONFIG: Record<ResidentEntriesPreset, PresetState> = {
  today: { segment: "today", datePreset: "today" },
  expected: { segment: "expected", datePreset: "today" },
  recent: { segment: "all", datePreset: "last_7_days" },
  inside: { segment: "inside", datePreset: "today" },
  all: { segment: "all", datePreset: "all" },
};

export function useResidentEntries(initialPreset: ResidentEntriesPreset = "today") {
  const initial = PRESET_CONFIG[initialPreset];
  const { flatId, societyId } = useResident();
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [segment, setSegment] = useState<ResidentEntriesSegment>(initial.segment);
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
    const next = PRESET_CONFIG[initialPreset];
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
  const shouldSkip = !societyId || !flatId;

  const [fetchEntries] = useLazyGetV1SocietiesBySocietyIdFlatsAndFlatIdVisitorEntriesQuery();

  const fetchPage = useCallback(
    async ({ limit, offset }: { limit: number; offset: number }) => {
      if (!societyId || !flatId) {
        return { items: [], total: 0, limit, offset };
      }

      const response = await fetchEntries({
        societyId,
        flatId,
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
      flatId,
      isExpectedSegment,
      isSearchActive,
      purpose,
      societyId,
    ],
  );

  const pagination = usePaginatedQuery<ModelsVisitorEntry>({
    pageSize: PAGE_SIZE,
    skip: shouldSkip,
    fetchPage,
  });

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (purpose) count += 1;
    if (sheetStatus) count += 1;
    if (datePreset !== "today") count += 1;
    return count;
  }, [datePreset, purpose, sheetStatus]);

  const selectSegment = useCallback((next: ResidentEntriesSegment) => {
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

      if (next.status === "checked_in") {
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
    isSearchActive,
    purpose,
    searchInput,
    segment,
    selectSegment,
    setDatePreset,
    setSearchInput,
    sheetStatus,
  };
}

export function useResidentEntriesFromParams(presetParam?: string | string[]) {
  return useResidentEntries(parseResidentEntriesPreset(presetParam));
}
