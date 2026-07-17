import { useCallback } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
import { theme } from "@/lib/theme";

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
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.guard.screenBg }}>
      <PaginatedList
        ItemSeparatorComponent={LogEntryDivider}
        contentContainerClassName="px-5 pb-8 pt-3"
        data={pagination.items}
        emptyMessage="Visitor movement for your flat will appear here."
        emptyTitle="No visitor logs yet"
        footer={<View className="h-4" />}
        hasMore={pagination.hasMore}
        header={
          <View className="gap-4 pb-2">
            <GuardBackHeader title="Visitor Logs" />
            <ScreenHeader
              subtitle={`Flat ${selectedResidence.flat_number ?? "-"} visitor history`}
              title="Logs"
            />
          </View>
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
