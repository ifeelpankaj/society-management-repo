import { useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppStatusBar } from "@/components/layout/app-status-bar";
import { Stack } from "@/components/layout";
import { LoadingState, PaginatedList, ScreenHeader } from "@/components/ui";
import { GuardBackHeader } from "@/features/guard/components/guard-back-header";
import { LogEntryDivider, LogEntryRow } from "@/features/guard/components/logs/log-entry-row";
import { ResidentSocietyGate } from "@/features/resident/components/resident-society-gate";
import { useResident } from "@/features/resident/resident-context";
import { usePaginatedQuery } from "@/features/shared/use-paginated-query";
import {
  type ModelsVisitorEntry,
  generatedApi,
} from "@/lib/api/generated-api";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

export function ResidentLogsScreen() {
  const { flatId, isLoading, requiresSelection, selectedResidence, societyId } = useResident();
  const [fetchEntries] =
    generatedApi.endpoints.getV1SocietiesBySocietyIdFlatsAndFlatIdVisitorEntries.useLazyQuery();

  const shouldSkip = !societyId || !flatId;

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
      }).unwrap();

      return {
        items: response.data?.entries ?? [],
        total: response.data?.total ?? 0,
        limit: response.data?.limit ?? limit,
        offset: response.data?.offset ?? offset,
      };
    },
    [fetchEntries, flatId, societyId],
  );

  const pagination = usePaginatedQuery<ModelsVisitorEntry>({
    pageSize: 20,
    skip: shouldSkip,
    fetchPage,
  });

  if (isLoading) {
    return <LoadingState message="Opening visitor logs" />;
  }

  if (requiresSelection || !selectedResidence) {
    return <ResidentSocietyGate />;
  }

  return (
    <SafeAreaView style={styles.screen}>
      <AppStatusBar />
      <PaginatedList
        ItemSeparatorComponent={LogEntryDivider}
        data={pagination.items}
        emptyMessage="Visitor movement for your flat will appear here."
        emptyTitle="No visitor logs yet"
        footer={<View style={styles.footerSpacer} />}
        hasMore={pagination.hasMore}
        header={
          <Stack gap="lg" style={styles.header}>
            <GuardBackHeader title="Visitor Logs" />
            <ScreenHeader
              subtitle={`Flat ${selectedResidence.flat_number ?? "-"} visitor history`}
              title="Logs"
            />
          </Stack>
        }
        isLoading={pagination.isLoading}
        isLoadingMore={pagination.isLoadingMore}
        isRefreshing={pagination.isRefreshing}
        keyExtractor={(item) => `resident-log-${item.id}`}
        renderItem={({ item }) => <LogEntryRow entry={item} />}
        onLoadMore={pagination.loadMore}
        onRefresh={pagination.refresh}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  footerSpacer: {
    height: spacing.lg,
  },
  header: {
    paddingBottom: spacing.sm,
  },
  screen: {
    backgroundColor: colors.guard.screenBg,
    flex: 1,
  },
});
