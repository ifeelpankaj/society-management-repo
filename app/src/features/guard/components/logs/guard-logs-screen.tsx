import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Stack } from "@/components/layout";
import { PaginatedList } from "@/components/ui";
import { GuardSocietyGate } from "@/features/guard/components/guard-society-gate";
import { LogEntryDivider, LogEntryRow } from "@/features/guard/components/logs/log-entry-row";
import { LogsDateSheet } from "@/features/guard/components/logs/logs-date-sheet";
import { LogsFilterSheet } from "@/features/guard/components/logs/logs-filter-sheet";
import { LogsSearchHeader } from "@/features/guard/components/logs/logs-search-header";
import { LogsStatsSummary } from "@/features/guard/components/logs/logs-stats-summary";
import { useGuardActions } from "@/features/guard/hooks/use-guard-actions";
import { useGuardFeedback } from "@/features/guard/hooks/use-guard-feedback";
import { useGuardLogsFromParams } from "@/features/guard/hooks/use-guard-logs";
import { useGuardScreen } from "@/features/guard/hooks/use-guard-screen";
import {
  type ModelsVisitorEntry,
  useGetV1SocietiesBySocietyIdVisitorEntriesStatsQuery,
} from "@/lib/api/generated-api";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

export function GuardLogsScreen() {
  const { preset: presetParam } = useLocalSearchParams<{ preset?: string | string[] }>();
  const { isLoading, isReady, memberships, requiresSelection, selectedSocietyId } = useGuardScreen();
  const feedback = useGuardFeedback();
  const actions = useGuardActions(selectedSocietyId ?? 0);
  const [filterOpen, setFilterOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const logs = useGuardLogsFromParams(presetParam);
  const statsQuery = useGetV1SocietiesBySocietyIdVisitorEntriesStatsQuery(
    { societyId: selectedSocietyId ?? 0 },
    { skip: !selectedSocietyId },
  );

  if (!isLoading && (memberships.length === 0 || requiresSelection || !selectedSocietyId)) {
    return <GuardSocietyGate />;
  }

  const stats = statsQuery.data?.data?.stats;
  const listLoading = logs.isLoading || (isLoading && !isReady);

  const handleCheckOut = async (entryId?: number) => {
    if (!entryId || !selectedSocietyId) {
      feedback.showActionResult(
        { success: false, message: "This visitor entry cannot be checked out." },
        { errorTitle: "Missing entry", successTitle: "Checked out" },
      );
      return;
    }

    const result = await actions.checkOutEntry(entryId);
    feedback.showActionResult(result, {
      successTitle: "Checked out",
      errorTitle: "Checkout failed",
    });

    if (result.success) {
      void logs.refresh();
      void statsQuery.refetch();
    }
  };

  const emptyTitle = logs.isSearchActive ? "No matching visitors" : "No visitor logs yet";
  const emptyMessage = logs.isSearchActive
    ? "Try a different name, phone, flat, or block."
    : "Visitor movement will appear here as entries are created.";

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.screen}>
      <PaginatedList<ModelsVisitorEntry>
        ItemSeparatorComponent={LogEntryDivider}
        data={logs.items}
        emptyMessage={emptyMessage}
        emptyTitle={emptyTitle}
        footer={<View style={styles.footerSpacer} />}
        hasMore={logs.hasMore}
        header={
          <Stack gap="md" style={styles.header}>
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
          </Stack>
        }
        isLoading={listLoading}
        isLoadingMore={logs.isLoadingMore}
        isRefreshing={logs.isRefreshing}
        keyExtractor={(item) => `log-${item.id}`}
        renderItem={({ item }) => (
          <LogEntryRow
            entry={item}
            isCheckingOut={actions.activeEntryId === item.id}
            onCheckOut={
              item.status === "checked_in" ? () => void handleCheckOut(item.id) : undefined
            }
          />
        )}
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

const styles = StyleSheet.create({
  footerSpacer: {
    height: spacing.sm,
  },
  header: {
    paddingBottom: spacing.sm,
  },
  screen: {
    backgroundColor: colors.guard.screenBg,
    flex: 1,
  },
});
