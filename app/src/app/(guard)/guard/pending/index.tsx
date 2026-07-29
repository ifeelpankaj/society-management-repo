import { useCallback } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LoadingState, PaginatedList } from "@/components/ui";
import { GuardBackHeader } from "@/features/guard/components/guard-back-header";
import { GuardSocietyGate } from "@/features/guard/components/guard-society-gate";
import { VisitorEntryCard } from "@/features/guard/components/visitor-entry-card";
import { useGuardSociety } from "@/features/guard/guard-context";
import { usePaginatedQuery } from "@/features/shared/use-paginated-query";
import {
  type ModelsVisitorPendingEntry,
  generatedApi,
} from "@/lib/api/generated-api";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

export default function GuardPendingScreen() {
  const { isLoading, memberships, requiresSelection, selectedSocietyId } = useGuardSociety();
  const [fetchPending] =
    generatedApi.endpoints.getV1SocietiesBySocietyIdVisitorEntriesPending.useLazyQuery();

  const shouldSkip = !selectedSocietyId;

  const fetchPage = useCallback(
    async ({ limit, offset }: { limit: number; offset: number }) => {
      if (!selectedSocietyId) {
        return { items: [], total: 0, limit, offset };
      }

      const response = await fetchPending({
        societyId: selectedSocietyId,
        limit,
        offset,
      }).unwrap();

      return {
        items: response.data?.entries ?? [],
        total: response.data?.total ?? 0,
        limit: response.data?.limit ?? limit,
        offset: response.data?.offset ?? offset,
      };
    },
    [fetchPending, selectedSocietyId],
  );

  const pagination = usePaginatedQuery<ModelsVisitorPendingEntry>({
    pageSize: 15,
    skip: shouldSkip,
    fetchPage,
  });

  if (isLoading) {
    return <LoadingState message="Opening pending approvals" />;
  }

  if (memberships.length === 0 || requiresSelection || !selectedSocietyId) {
    return <GuardSocietyGate />;
  }

  return (
    <SafeAreaView style={styles.screen}>
      <PaginatedList
        data={pagination.items}
        keyExtractor={(item) => `pending-${item.id}`}
        renderItem={({ item }) => (
          <VisitorEntryCard
            entry={item}
            primaryActionLabel="Waiting for resident"
            secondaryActionLabel="Notify"
            onSecondaryAction={() =>
              Alert.alert(
                "Resident approval required",
                item.primary_resident_name
                  ? `${item.primary_resident_name} must approve this visitor before check-in.`
                  : "The primary resident must approve this visitor before check-in.",
              )
            }
          />
        )}
        isLoading={pagination.isLoading}
        isRefreshing={pagination.isRefreshing}
        isLoadingMore={pagination.isLoadingMore}
        hasMore={pagination.hasMore}
        onRefresh={pagination.refresh}
        onLoadMore={pagination.loadMore}
        emptyTitle="No pending approvals"
        emptyMessage="Visitors waiting for resident approval will appear here."
        header={
          <View style={styles.header}>
            <GuardBackHeader title="Pending Approvals" />
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
  header: {
    gap: spacing.sm,
  },
  footerSpacer: {
    height: spacing.lg,
  },
});
