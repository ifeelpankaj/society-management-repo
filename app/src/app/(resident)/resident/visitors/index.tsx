import { useRouter } from "expo-router";
import { useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";

import { DashboardHeroCard } from "@/components/dashboard";
import { PaginatedList } from "@/components/ui";
import { getVisitorActionErrorMessage } from "@/features/auth/api-error";
import { ResidentSubScreen } from "@/features/resident/components/resident-sub-screen";
import { useResidentFeedback } from "@/features/resident/hooks/use-resident-feedback";
import { useResident } from "@/features/resident/resident-context";
import { residentVisitorInviteRoute } from "@/features/resident/resident-routes";
import { usePaginatedQuery } from "@/features/shared/use-paginated-query";
import { VisitorEntryCard } from "@/features/visitors/components/visitor-entry-card";
import { VisitorQueueEmptyState } from "@/features/visitors/components/visitor-queue-empty-state";
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
  const feedback = useResidentFeedback();
  const { flatId, canManageFlatVisitors, societyId } = useResident();
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

  const handleApprove = async (entryId?: number) => {
    if (!entryId || !canManageFlatVisitors || !societyId) {
      return;
    }

    try {
      await approveEntry({ societyId, entryId }).unwrap();
      feedback.showSuccess("Approved", "Visitor can now enter the society.");
      pagination.refresh();
    } catch (error) {
      feedback.showError(
        "Approval failed",
        error,
        getVisitorActionErrorMessage(error, "Please try again."),
      );
    }
  };

  const handleReject = async (entryId?: number) => {
    if (!entryId || !canManageFlatVisitors || !societyId) {
      return;
    }

    try {
      await rejectEntry({
        societyId,
        entryId,
        modelsRejectVisitorEntryRequest: { reason: "Declined by resident" },
      }).unwrap();
      feedback.showSuccess("Rejected", "Visitor entry was declined.");
      pagination.refresh();
    } catch (error) {
      feedback.showError(
        "Rejection failed",
        error,
        getVisitorActionErrorMessage(error, "Please try again."),
      );
    }
  };

  const emptyTitle = canManageFlatVisitors ? "No pending visitors" : "Nothing to review";
  const emptyMessage = canManageFlatVisitors
    ? "Visitors waiting for your approval will appear here."
    : "You do not have permission to approve or reject visitor entries.";

  return (
    <ResidentSubScreen title="Approvals">
      <PaginatedList
        contentContainerStyle={styles.listContent}
        data={pagination.items}
        emptyComponent={
          <VisitorQueueEmptyState
            message={emptyMessage}
            refreshing={pagination.isRefreshing}
            title={emptyTitle}
            onRefresh={() => {
              void pagination.refresh();
            }}
          />
        }
        footer={<View style={styles.footerSpacer} />}
        hasMore={pagination.hasMore}
        header={
          <View style={styles.header}>
            <View style={styles.intro}>
              <Text style={styles.pageTitle}>Pending approvals</Text>
              <Text style={styles.pageSubtitle}>
                {canManageFlatVisitors
                  ? "Review visitors before they can enter the society."
                  : "You do not have permission to approve or reject visitor entries."}
              </Text>
            </View>
            {canManageFlatVisitors ? (
              <DashboardHeroCard
                icon={{
                  ios: "person.badge.plus",
                  android: "person_add",
                  web: "person_add",
                }}
                subtitle="Invite a guest or share a visit link"
                title="Create visitor invite"
                onPress={() => router.push(residentVisitorInviteRoute())}
              />
            ) : null}
          </View>
        }
        isLoading={pagination.isLoading}
        isLoadingMore={pagination.isLoadingMore}
        isRefreshing={pagination.isRefreshing}
        keyExtractor={(item) => `resident-pending-${item.id}`}
        renderItem={({ item }) => (
          <View style={styles.itemWrap}>
            <VisitorEntryCard
              entry={item}
              loading={approveState.isLoading || rejectState.isLoading}
              primaryActionLabel={canManageFlatVisitors ? "Approve" : undefined}
              secondaryActionLabel={canManageFlatVisitors ? "Reject" : undefined}
              onPrimaryAction={canManageFlatVisitors ? () => void handleApprove(item.id) : undefined}
              onSecondaryAction={canManageFlatVisitors ? () => void handleReject(item.id) : undefined}
            />
          </View>
        )}
        onLoadMore={pagination.loadMore}
        onRefresh={pagination.refresh}
      />
    </ResidentSubScreen>
  );
}

const styles = StyleSheet.create({
  footerSpacer: {
    height: spacing.lg,
  },
  header: {
    gap: spacing.lg,
    paddingBottom: spacing.sm,
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  intro: {
    gap: spacing.xs,
  },
  itemWrap: {
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  listContent: {
    gap: spacing.lg,
    paddingBottom: layout.screenPaddingBottom,
    paddingHorizontal: 0,
    paddingTop: spacing.md,
  },
  pageSubtitle: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  pageTitle: {
    ...typography.title,
    color: colors.text.primary,
  },
});
