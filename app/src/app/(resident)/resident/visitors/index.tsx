import { useRouter } from "expo-router";
import { useCallback } from "react";
import { Alert, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, LoadingState, PaginatedList } from "@/components/ui";
import { getVisitorActionErrorMessage } from "@/features/auth/api-error";
import { GuardBackHeader } from "@/features/guard/components/guard-back-header";
import { VisitorEntryCard } from "@/features/guard/components/visitor-entry-card";
import { ResidentSocietyGate } from "@/features/resident/components/resident-society-gate";
import { useResident } from "@/features/resident/resident-context";
import { residentVisitorInviteRoute } from "@/features/resident/resident-routes";
import { usePaginatedQuery } from "@/features/shared/use-paginated-query";
import {
  type ModelsVisitorEntry,
  generatedApi,
  usePostV1SocietiesBySocietyIdVisitorEntriesAndEntryIdApproveMutation,
  usePostV1SocietiesBySocietyIdVisitorEntriesAndEntryIdRejectMutation,
} from "@/lib/api/generated-api";
import { theme } from "@/lib/theme";

export default function ResidentVisitorsScreen() {
  const router = useRouter();
  const { flatId, canManageFlatVisitors, isLoading, requiresSelection, societyId } = useResident();
  const [fetchPending] =
    generatedApi.endpoints.getV1SocietiesBySocietyIdFlatsAndFlatIdVisitorEntriesPending.useLazyQuery();
  const [approveEntry, approveState] =
    usePostV1SocietiesBySocietyIdVisitorEntriesAndEntryIdApproveMutation();
  const [rejectEntry, rejectState] =
    usePostV1SocietiesBySocietyIdVisitorEntriesAndEntryIdRejectMutation();

  const shouldSkip = !societyId || !flatId;

  const fetchPage = useCallback(
    async ({ limit, offset }: { limit: number; offset: number }) => {
      if (!societyId || !flatId) {
        return { items: [], total: 0, limit, offset };
      }

      const response = await fetchPending({ societyId, flatId }).unwrap();
      const entries = response.data?.entries ?? [];

      return {
        items: entries.slice(offset, offset + limit),
        total: response.data?.total ?? entries.length,
        limit,
        offset,
      };
    },
    [fetchPending, flatId, societyId],
  );

  const pagination = usePaginatedQuery<ModelsVisitorEntry>({
    pageSize: 15,
    skip: shouldSkip,
    fetchPage,
  });

  if (isLoading) {
    return <LoadingState message="Opening visitors" />;
  }

  if (requiresSelection || !societyId || !flatId) {
    return <ResidentSocietyGate />;
  }

  const handleApprove = async (entryId?: number) => {
    if (!entryId || !canManageFlatVisitors) {
      return;
    }

    try {
      await approveEntry({ societyId, entryId }).unwrap();
      pagination.refresh();
    } catch (error) {
      Alert.alert(
        "Approval failed",
        getVisitorActionErrorMessage(error, "Please try again."),
      );
    }
  };

  const handleReject = async (entryId?: number) => {
    if (!entryId || !canManageFlatVisitors) {
      return;
    }

    Alert.alert("Reject visitor", "Decline this visitor entry?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reject",
        style: "destructive",
        onPress: async () => {
          try {
            await rejectEntry({
              societyId,
              entryId,
              modelsRejectVisitorEntryRequest: { reason: "Declined by resident" },
            }).unwrap();
            pagination.refresh();
          } catch (error) {
            Alert.alert(
              "Rejection failed",
              getVisitorActionErrorMessage(error, "Please try again."),
            );
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.guard.screenBg }}>
      <PaginatedList
        data={pagination.items}
        keyExtractor={(item) => `resident-pending-${item.id}`}
        renderItem={({ item }) => (
          <VisitorEntryCard
            entry={item}
            loading={approveState.isLoading || rejectState.isLoading}
            primaryActionLabel={canManageFlatVisitors ? "Approve" : undefined}
            secondaryActionLabel={canManageFlatVisitors ? "Reject" : undefined}
            onPrimaryAction={canManageFlatVisitors ? () => handleApprove(item.id) : undefined}
            onSecondaryAction={canManageFlatVisitors ? () => handleReject(item.id) : undefined}
          />
        )}
        isLoading={pagination.isLoading}
        isRefreshing={pagination.isRefreshing}
        isLoadingMore={pagination.isLoadingMore}
        hasMore={pagination.hasMore}
        onRefresh={pagination.refresh}
        onLoadMore={pagination.loadMore}
        emptyTitle={canManageFlatVisitors ? "No pending visitors" : "Nothing to review"}
        emptyMessage={
          canManageFlatVisitors
            ? "Visitors waiting for your approval will appear here."
            : "Only the flat owner can approve or reject visitor entries."
        }
        contentContainerClassName="px-5 pb-8 pt-3"
        header={
          <View className="gap-4 pb-2">
            <GuardBackHeader title="Approvals" />
            <View className="gap-1">
              <Text className="text-2xl font-bold" style={{ color: theme.text.primary }}>
                Pending approvals
              </Text>
              <Text className="text-sm" style={{ color: theme.text.secondary }}>
                {canManageFlatVisitors
                  ? "Review visitors before they can enter the society."
                  : "Only the flat owner can approve or reject visitor entries."}
              </Text>
            </View>
            {canManageFlatVisitors ? (
              <Button
                title="Create visitor invite"
                onPress={() => router.push(residentVisitorInviteRoute())}
              />
            ) : null}
          </View>
        }
        footer={<View className="h-4" />}
      />
    </SafeAreaView>
  );
}
