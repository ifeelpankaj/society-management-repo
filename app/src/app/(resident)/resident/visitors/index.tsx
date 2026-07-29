import { useRouter } from "expo-router";
import { useCallback } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
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
import { colors } from "@/theme/colors";
import { layout } from "@/theme/layout";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";

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
    <SafeAreaView style={styles.screen}>
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
            : "You do not have permission to approve or reject visitor entries."
        }
        contentContainerStyle={styles.listContent}
        header={
          <View style={styles.header}>
            <GuardBackHeader title="Approvals" />
            <View style={styles.intro}>
              <Text style={styles.pageTitle}>Pending approvals</Text>
              <Text style={styles.pageSubtitle}>
                {canManageFlatVisitors
                  ? "Review visitors before they can enter the society."
                  : "You do not have permission to approve or reject visitor entries."}
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
        footer={<View style={styles.footerSpacer} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.guard.screenBg,
    flex: 1,
  },
  listContent: {
    paddingBottom: layout.screenPaddingBottom,
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: layout.screenPaddingTop,
  },
  header: {
    gap: spacing.lg,
    paddingBottom: spacing.sm,
  },
  intro: {
    gap: spacing.xs,
  },
  pageTitle: {
    ...typography.title,
    color: colors.text.primary,
  },
  pageSubtitle: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  footerSpacer: {
    height: spacing.lg,
  },
});
