import { useCallback, useMemo, useState } from "react";

import { getApiMessage } from "@/features/auth/api-error";
import { useGuardFeedback } from "@/features/guard/hooks/use-guard-feedback";
import { useGuardScreen } from "@/features/guard/hooks/use-guard-screen";
import { useAppActivePollingInterval } from "@/features/shared/use-app-active-polling-interval";
import {
  useGetV1SocietiesBySocietyIdGuardDeskBootstrapQuery,
  usePostV1SocietiesBySocietyIdVisitorEntriesAndEntryIdCheckOutMutation,
} from "@/lib/api/generated-api";

const GUARD_POLL_MS = 60_000;

export function useGuardDashboard() {
  const { selectedSocietyId, societyName } = useGuardScreen();
  const { showError, showSuccess } = useGuardFeedback();
  const [checkoutEntryId, setCheckoutEntryId] = useState<number | null>(null);
  const pollingInterval = useAppActivePollingInterval(GUARD_POLL_MS);

  const shouldSkip = !selectedSocietyId;
  const queryOpts = { skip: shouldSkip, pollingInterval };

  const bootstrapQuery = useGetV1SocietiesBySocietyIdGuardDeskBootstrapQuery(
    { societyId: selectedSocietyId ?? 0 },
    queryOpts,
  );
  const [checkOut] =
    usePostV1SocietiesBySocietyIdVisitorEntriesAndEntryIdCheckOutMutation();

  const desk = bootstrapQuery.data?.data?.desk;

  const refetchAll = useCallback(() => {
    void bootstrapQuery.refetch();
  }, [bootstrapQuery]);

  const checkOutEntry = useCallback(
    async (entryId?: number) => {
      if (!entryId || !selectedSocietyId) {
        return;
      }

      setCheckoutEntryId(entryId);

      try {
        await checkOut({ societyId: selectedSocietyId, entryId }).unwrap();
        showSuccess("Checked out", "Visitor has left the society.");
        void bootstrapQuery.refetch();
      } catch (error) {
        showError("Checkout failed", error, "Please try again.");
      } finally {
        setCheckoutEntryId(null);
      }
    },
    [bootstrapQuery, checkOut, selectedSocietyId, showError, showSuccess],
  );

  const stats = desk?.stats;
  const pendingEntries = desk?.pending_preview ?? [];

  const resolvedSocietyName = useMemo(
    () =>
      desk?.society?.name ??
      societyName ??
      `Society #${selectedSocietyId}`,
    [desk?.society?.name, selectedSocietyId, societyName],
  );

  const isInitialLoading = shouldSkip || (bootstrapQuery.isLoading && !bootstrapQuery.data);

  return {
    checkOutEntry,
    checkoutEntryId,
    errorMessage: bootstrapQuery.isError
      ? getApiMessage(bootstrapQuery.error, "Unable to load guard desk data.")
      : null,
    expectedTodayCount: desk?.waiting_at_gate_count ?? desk?.expected_today_count ?? 0,
    waitingAtGateCount: desk?.waiting_at_gate_count ?? desk?.expected_today_count ?? 0,
    hasError: bootstrapQuery.isError,
    isInitialLoading,
    isRefreshing: bootstrapQuery.isFetching && !bootstrapQuery.isLoading,
    pendingEntries,
    refetchAll,
    societyName: resolvedSocietyName,
    stats,
  };
}
