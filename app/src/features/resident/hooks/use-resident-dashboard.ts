import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";

import { getApiMessage } from "@/features/auth/api-error";
import { useGuardFeedback } from "@/features/guard/hooks/use-guard-feedback";
import { titleize } from "@/features/guard/guard-utils";
import { useResident } from "@/features/resident/resident-context";
import {
  useGetV1SocietiesBySocietyIdFlatsAndFlatIdVisitorContextQuery,
  useGetV1SocietiesBySocietyIdFlatsAndFlatIdVisitorEntriesPendingQuery,
  useGetV1SocietiesBySocietyIdFlatsAndFlatIdVisitorEntriesQuery,
  usePostV1SocietiesBySocietyIdVisitorEntriesAndEntryIdApproveMutation,
  usePostV1SocietiesBySocietyIdVisitorEntriesAndEntryIdRejectMutation,
} from "@/lib/api/generated-api";

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

export function useResidentDashboard() {
  const {
    canManageFlatMembers,
    canManageFlatVisitors,
    flatId,
    refetch: refetchBootstrap,
    selectedResidence,
    societyId,
    user,
  } = useResident();
  const { showError, showSuccess } = useGuardFeedback();
  const [actionEntryId, setActionEntryId] = useState<number | null>(null);

  const shouldSkip = !societyId || !flatId;
  const queryOpts = { skip: shouldSkip };

  const contextQuery = useGetV1SocietiesBySocietyIdFlatsAndFlatIdVisitorContextQuery(
    { societyId: societyId ?? 0, flatId: flatId ?? 0 },
    queryOpts,
  );
  const pendingQuery = useGetV1SocietiesBySocietyIdFlatsAndFlatIdVisitorEntriesPendingQuery(
    { societyId: societyId ?? 0, flatId: flatId ?? 0 },
    queryOpts,
  );
  const approvedQuery = useGetV1SocietiesBySocietyIdFlatsAndFlatIdVisitorEntriesQuery(
    {
      societyId: societyId ?? 0,
      flatId: flatId ?? 0,
      limit: 50,
      offset: 0,
      status: "approved",
    },
    queryOpts,
  );

  const [approveEntry, approveState] =
    usePostV1SocietiesBySocietyIdVisitorEntriesAndEntryIdApproveMutation();
  const [rejectEntry, rejectState] =
    usePostV1SocietiesBySocietyIdVisitorEntriesAndEntryIdRejectMutation();

  const queries = [contextQuery, pendingQuery, approvedQuery];
  const failedQuery = queries.find((query) => query.isError);

  const { refetch: refetchContext } = contextQuery;
  const { refetch: refetchPending } = pendingQuery;
  const { refetch: refetchApproved } = approvedQuery;

  const refetchAll = useCallback(() => {
    refetchBootstrap();

    if (shouldSkip) {
      return;
    }

    if (!contextQuery.isUninitialized) {
      void refetchContext();
    }
    if (!pendingQuery.isUninitialized) {
      void refetchPending();
    }
    if (!approvedQuery.isUninitialized) {
      void refetchApproved();
    }
  }, [
    approvedQuery.isUninitialized,
    contextQuery.isUninitialized,
    pendingQuery.isUninitialized,
    refetchApproved,
    refetchBootstrap,
    refetchContext,
    refetchPending,
    shouldSkip,
  ]);

  const context = contextQuery.data?.data?.context;
  const pendingEntries = pendingQuery.data?.data?.entries ?? [];
  const pendingCount =
    pendingQuery.data?.data?.total ?? pendingEntries.length;
  const approvedEntries = approvedQuery.data?.data?.entries ?? [];

  const expectedCount = useMemo(
    () =>
      approvedEntries.filter(
        (entry) => isToday(entry.expected_at) || isToday(entry.created_at),
      ).length,
    [approvedEntries],
  );

  const flatLabel = useMemo(() => {
    const parts = [
      selectedResidence?.flat_number ? `Flat ${selectedResidence.flat_number}` : null,
      selectedResidence?.role ? titleize(selectedResidence.role) : null,
    ].filter(Boolean);

    return parts.join(" • ") || "Your flat";
  }, [selectedResidence?.flat_number, selectedResidence?.role]);

  const displayName = user?.full_name ?? user?.first_name ?? "Resident";
  const membersCount = context?.total_residents ?? 0;
  const visitorsCount = context?.recent_visitors?.length ?? 0;

  const handleApprove = useCallback(
    async (entryId?: number) => {
      if (!entryId || !societyId || !canManageFlatVisitors) {
        return;
      }

      setActionEntryId(entryId);

      try {
        await approveEntry({ societyId, entryId }).unwrap();
        showSuccess("Approved", "Visitor can now enter the society.");
        refetchAll();
      } catch (error) {
        showError("Approval failed", error, "Please try again.");
      } finally {
        setActionEntryId(null);
      }
    },
    [approveEntry, canManageFlatVisitors, refetchAll, showError, showSuccess, societyId],
  );

  const handleReject = useCallback(
    (entryId?: number) => {
      if (!entryId || !societyId || !canManageFlatVisitors) {
        return;
      }

      Alert.alert("Reject visitor", "Decline this visitor entry?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          style: "destructive",
          onPress: async () => {
            setActionEntryId(entryId);

            try {
              await rejectEntry({
                societyId,
                entryId,
                modelsRejectVisitorEntryRequest: { reason: "Declined by resident" },
              }).unwrap();
              showSuccess("Rejected", "Visitor entry was declined.");
              refetchAll();
            } catch (error) {
              showError("Rejection failed", error, "Please try again.");
            } finally {
              setActionEntryId(null);
            }
          },
        },
      ]);
    },
    [canManageFlatVisitors, refetchAll, rejectEntry, showError, showSuccess, societyId],
  );

  const isInitialLoading =
    shouldSkip || queries.some((query) => query.isLoading && !query.data);

  const approvalMode = context?.society_approval_mode ?? "mandatory";
  const isHybrid = approvalMode === "hybrid";

  return {
    actionEntryId,
    approvalMode,
    displayName,
    errorMessage: failedQuery
      ? getApiMessage(failedQuery.error, "Unable to load resident home data.")
      : null,
    expectedCount,
    flatLabel,
    handleApprove,
    handleReject,
    hasError: !!failedQuery,
    isActionLoading: approveState.isLoading || rejectState.isLoading,
    isHybrid,
    isInitialLoading,
    isReady: !shouldSkip,
    canManageFlatMembers,
    canManageFlatVisitors,
    isRefreshing: queries.some((query) => query.isFetching && !query.isLoading),
    membersCount,
    pendingCount,
    pendingEntries,
    primaryResidentName: context?.primary_resident?.full_name,
    refetchAll,
    selectedResidence,
    visitorsCount,
  };
}
