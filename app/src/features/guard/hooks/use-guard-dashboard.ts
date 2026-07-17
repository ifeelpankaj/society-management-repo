import { useCallback, useMemo, useState } from "react";

import { getApiMessage } from "@/features/auth/api-error";
import { useGuardFeedback } from "@/features/guard/hooks/use-guard-feedback";
import { useGuardScreen } from "@/features/guard/hooks/use-guard-screen";
import {
  useGetV1SocietiesBySocietyIdQuery,
  useGetV1SocietiesBySocietyIdVisitorEntriesPendingQuery,
  useGetV1SocietiesBySocietyIdVisitorEntriesQuery,
  useGetV1SocietiesBySocietyIdVisitorEntriesStatsQuery,
  usePostV1SocietiesBySocietyIdVisitorEntriesAndEntryIdCheckOutMutation,
} from "@/lib/api/generated-api";

const POLL_MS = 30_000;

function isToday(value?: string | null) {
  if (!value) {
    return false;
  }

  const date = new Date(value);
  const now = new Date();

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export function useGuardDashboard() {
  const { selectedSocietyId, societyName } = useGuardScreen();
  const { showError, showSuccess } = useGuardFeedback();
  const [checkoutEntryId, setCheckoutEntryId] = useState<number | null>(null);

  const shouldSkip = !selectedSocietyId;
  const queryOpts = { skip: shouldSkip, pollingInterval: POLL_MS };

  const societyQuery = useGetV1SocietiesBySocietyIdQuery(
    { societyId: selectedSocietyId ?? 0 },
    queryOpts,
  );
  const statsQuery = useGetV1SocietiesBySocietyIdVisitorEntriesStatsQuery(
    { societyId: selectedSocietyId ?? 0 },
    queryOpts,
  );
  const pendingQuery = useGetV1SocietiesBySocietyIdVisitorEntriesPendingQuery(
    { societyId: selectedSocietyId ?? 0, limit: 3, offset: 0 },
    queryOpts,
  );
  const approvedQuery = useGetV1SocietiesBySocietyIdVisitorEntriesQuery(
    {
      societyId: selectedSocietyId ?? 0,
      limit: 50,
      offset: 0,
      status: "approved",
    },
    queryOpts,
  );
  const [checkOut] =
    usePostV1SocietiesBySocietyIdVisitorEntriesAndEntryIdCheckOutMutation();

  const queries = [societyQuery, statsQuery, pendingQuery, approvedQuery];

  const failedQuery = queries.find((query) => query.isError);

  const refetchAll = useCallback(() => {
    void societyQuery.refetch();
    void statsQuery.refetch();
    void pendingQuery.refetch();
    void approvedQuery.refetch();
  }, [approvedQuery, pendingQuery, societyQuery, statsQuery]);

  const checkOutEntry = useCallback(
    async (entryId?: number) => {
      if (!entryId || !selectedSocietyId) {
        return;
      }

      setCheckoutEntryId(entryId);

      try {
        await checkOut({ societyId: selectedSocietyId, entryId }).unwrap();
        showSuccess("Checked out", "Visitor has left the society.");
        void statsQuery.refetch();
      } catch (error) {
        showError("Checkout failed", error, "Please try again.");
      } finally {
        setCheckoutEntryId(null);
      }
    },
    [checkOut, selectedSocietyId, showError, showSuccess, statsQuery],
  );

  const stats = statsQuery.data?.data?.stats;
  const pendingEntries = pendingQuery.data?.data?.entries ?? [];
  const approvedEntries = approvedQuery.data?.data?.entries ?? [];

  const expectedTodayCount = useMemo(
    () =>
      approvedEntries.filter(
        (entry) => isToday(entry.expected_at) || isToday(entry.created_at),
      ).length,
    [approvedEntries],
  );

  const resolvedSocietyName = useMemo(
    () =>
      societyQuery.data?.data?.society?.name ??
      societyName ??
      `Society #${selectedSocietyId}`,
    [selectedSocietyId, societyName, societyQuery.data?.data?.society?.name],
  );

  const isInitialLoading =
    shouldSkip || queries.some((query) => query.isLoading && !query.data);

  return {
    checkOutEntry,
    checkoutEntryId,
    errorMessage: failedQuery
      ? getApiMessage(failedQuery.error, "Unable to load guard desk data.")
      : null,
    expectedTodayCount,
    hasError: !!failedQuery,
    isInitialLoading,
    isRefreshing: queries.some((query) => query.isFetching && !query.isLoading),
    pendingEntries,
    refetchAll,
    societyName: resolvedSocietyName,
    stats,
  };
}
