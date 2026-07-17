import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LoadingState, PaginatedList } from "@/components/ui";
import { getApiMessage } from "@/features/auth/api-error";
import { GuardSocietyGate } from "@/features/guard/components/guard-society-gate";
import { LogEntryDivider, LogEntryRow } from "@/features/guard/components/logs/log-entry-row";
import { LogsDateSheet } from "@/features/guard/components/logs/logs-date-sheet";
import { LogsFilterSheet } from "@/features/guard/components/logs/logs-filter-sheet";
import { LogsSearchHeader } from "@/features/guard/components/logs/logs-search-header";
import { LogsStatsSummary } from "@/features/guard/components/logs/logs-stats-summary";
import { useGuardSociety } from "@/features/guard/guard-context";
import { useGuardLogsFromParams } from "@/features/guard/hooks/use-guard-logs";
import {
  type ModelsVisitorEntry,
  useGetV1SocietiesBySocietyIdVisitorEntriesStatsQuery,
  usePostV1SocietiesBySocietyIdVisitorEntriesAndEntryIdCheckOutMutation,
} from "@/lib/api/generated-api";
import { theme } from "@/lib/theme";

export function GuardLogsScreen() {
  const { preset: presetParam } = useLocalSearchParams<{ preset?: string }>();
  const { isLoading, memberships, requiresSelection, selectedSocietyId } = useGuardSociety();
  const [filterOpen, setFilterOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [checkoutEntryId, setCheckoutEntryId] = useState<number | null>(null);
  const logs = useGuardLogsFromParams(presetParam);
  const statsQuery = useGetV1SocietiesBySocietyIdVisitorEntriesStatsQuery(
    { societyId: selectedSocietyId ?? 0 },
    { skip: !selectedSocietyId },
  );
  const [checkOut] =
    usePostV1SocietiesBySocietyIdVisitorEntriesAndEntryIdCheckOutMutation();

  if (isLoading) {
    return <LoadingState message="Opening visitor logs" />;
  }

  if (memberships.length === 0 || requiresSelection || !selectedSocietyId) {
    return <GuardSocietyGate />;
  }

  const stats = statsQuery.data?.data?.stats;

  const handleCheckOut = async (entryId?: number) => {
    if (!entryId) {
      Alert.alert("Missing entry", "This visitor entry cannot be checked out.");
      return;
    }

    setCheckoutEntryId(entryId);

    try {
      await checkOut({ societyId: selectedSocietyId, entryId }).unwrap();
      void logs.refresh();
      void statsQuery.refetch();
    } catch (error) {
      Alert.alert("Checkout failed", getApiMessage(error, "Please try again."));
    } finally {
      setCheckoutEntryId(null);
    }
  };

  const emptyTitle = logs.isSearchActive ? "No matching visitors" : "No visitor logs yet";
  const emptyMessage = logs.isSearchActive
    ? "Try a different name, phone, flat, or block."
    : "Visitor movement will appear here as entries are created.";

  return (
    <SafeAreaView
      className="flex-1"
      edges={["top", "left", "right"]}
      style={{ backgroundColor: theme.guard.screenBg }}
    >
      <PaginatedList<ModelsVisitorEntry>
        ItemSeparatorComponent={LogEntryDivider}
        contentContainerClassName="px-5 pb-8 pt-3"
        data={logs.items}
        emptyMessage={emptyMessage}
        emptyTitle={emptyTitle}
        hasMore={logs.hasMore}
        isLoading={logs.isLoading}
        isLoadingMore={logs.isLoadingMore}
        isRefreshing={logs.isRefreshing}
        keyExtractor={(item) => `log-${item.id}`}
        renderItem={({ item }) => (
          <LogEntryRow
            entry={item}
            isCheckingOut={checkoutEntryId === item.id}
            onCheckOut={
              item.status === "checked_in" ? () => handleCheckOut(item.id) : undefined
            }
          />
        )}
        header={
          <View className="gap-3 pb-2">
            <LogsSearchHeader
              activeFilterCount={logs.activeFilterCount}
              datePreset={logs.datePreset}
              isSearchActive={logs.isSearchActive}
              searchValue={logs.searchInput}
              segment={logs.segment}
              onClearSearch={() => logs.setSearchInput("")}
              onDatePress={() => setDateOpen(true)}
              onFilterPress={() => setFilterOpen(true)}
              onSearchChange={logs.setSearchInput}
              onSegmentChange={logs.selectSegment}
            />
            {!logs.isSearchActive ? (
              <LogsStatsSummary
                checkedOutToday={stats?.checked_out_today ?? 0}
                pendingCount={stats?.pending_approvals ?? 0}
                visitorsInside={stats?.visitors_inside ?? 0}
              />
            ) : null}
          </View>
        }
        footer={<View className="h-2" />}
        onLoadMore={logs.loadMore}
        onRefresh={() => {
          void logs.refresh();
          void statsQuery.refetch();
        }}
      />

      <LogsFilterSheet
        datePreset={logs.datePreset}
        purpose={logs.purpose}
        status={logs.sheetStatus}
        visible={filterOpen}
        onApply={logs.applySheetFilters}
        onClear={logs.clearSheetFilters}
        onClose={() => setFilterOpen(false)}
      />

      <LogsDateSheet
        selected={logs.datePreset}
        visible={dateOpen}
        onApply={logs.setDatePreset}
        onClose={() => setDateOpen(false)}
      />
    </SafeAreaView>
  );
}
