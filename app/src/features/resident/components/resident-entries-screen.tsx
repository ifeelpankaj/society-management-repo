import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Stack } from "@/components/layout";
import { PaginatedList } from "@/components/ui";
import { LogEntryDivider, LogEntryRow } from "@/features/guard/components/logs/log-entry-row";
import { LogsDateSheet } from "@/features/guard/components/logs/logs-date-sheet";
import { LogsFilterSheet } from "@/features/guard/components/logs/logs-filter-sheet";
import { LogsSearchHeader } from "@/features/guard/components/logs/logs-search-header";
import { VisitorDetailSheet } from "@/features/guard/components/visitor-detail-sheet";
import { ResidentSocietyGate } from "@/features/resident/components/resident-society-gate";
import {
  type ResidentEntriesSegment,
  useResidentEntriesFromParams,
} from "@/features/resident/hooks/use-resident-entries";
import { useResidentDashboard } from "@/features/resident/hooks/use-resident-dashboard";
import { useResident } from "@/features/resident/resident-context";
import { residentDashboardRoute } from "@/features/resident/resident-routes";
import type { ModelsVisitorEntry } from "@/lib/api/generated-api";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

const RESIDENT_SEGMENT_OPTIONS: { label: string; value: ResidentEntriesSegment }[] = [
  { label: "Today", value: "today" },
  { label: "Expected", value: "expected" },
  { label: "Inside", value: "inside" },
  { label: "All", value: "all" },
];

export function ResidentEntriesScreen() {
  const { preset: presetParam } = useLocalSearchParams<{ preset?: string | string[] }>();
  const { flatId, isLoading, requiresSelection, residences, societyId } = useResident();
  const dashboard = useResidentDashboard();
  const [filterOpen, setFilterOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [detailEntry, setDetailEntry] = useState<ModelsVisitorEntry | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const logs = useResidentEntriesFromParams(presetParam);

  const handleApprove = async (entryId?: number) => {
    if (!entryId) {
      return;
    }

    await dashboard.handleApprove(entryId);
    setDetailVisible(false);
    void logs.refresh();
  };

  const handleReject = async (entryId?: number) => {
    if (!entryId) {
      return;
    }

    await dashboard.handleReject(entryId);
    setDetailVisible(false);
    void logs.refresh();
  };

  if (!isLoading && (residences.length === 0 || requiresSelection || !flatId || !societyId)) {
    return <ResidentSocietyGate />;
  }

  const listLoading = logs.isLoading || (isLoading && !societyId);
  const emptyTitle = logs.isSearchActive ? "No matching visitors" : "No visitor entries yet";
  const emptyMessage = logs.isSearchActive
    ? "Try a different name or phone number."
    : "Visitor movement for your flat will appear here.";

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
            <LogsSearchHeader<ResidentEntriesSegment>
              activeFilterCount={logs.activeFilterCount}
              datePreset={logs.datePreset}
              fallbackHomeRoute={residentDashboardRoute()}
              isSearchActive={logs.isSearchActive}
              searchValue={logs.searchInput}
              segment={logs.segment}
              segmentOptions={RESIDENT_SEGMENT_OPTIONS}
              title="Visitor Entries"
              onClearSearch={() => logs.setSearchInput("")}
              onDatePress={() => setDateOpen(true)}
              onFilterPress={() => setFilterOpen(true)}
              onSearchChange={logs.setSearchInput}
              onSegmentChange={logs.selectSegment}
            />
          </Stack>
        }
        isLoading={listLoading}
        isLoadingMore={logs.isLoadingMore}
        isRefreshing={logs.isRefreshing}
        keyExtractor={(item) => `resident-entry-${item.id}`}
        renderItem={({ item }) => (
          <LogEntryRow
            entry={item}
            onPress={() => {
              setDetailEntry(item);
              setDetailVisible(true);
            }}
          />
        )}
        onLoadMore={logs.loadMore}
        onRefresh={logs.refresh}
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

      <VisitorDetailSheet
        entry={detailEntry}
        loading={dashboard.isActionLoading}
        primaryActionLabel={
          detailEntry?.status === "waiting_approval" && dashboard.canManageFlatVisitors
            ? "Approve"
            : undefined
        }
        secondaryActionLabel={
          detailEntry?.status === "waiting_approval" && dashboard.canManageFlatVisitors
            ? "Reject"
            : undefined
        }
        visible={detailVisible}
        onClose={() => {
          setDetailVisible(false);
          setDetailEntry(null);
        }}
        onPrimaryAction={
          detailEntry?.status === "waiting_approval"
            ? () => void handleApprove(detailEntry.id)
            : undefined
        }
        onSecondaryAction={
          detailEntry?.status === "waiting_approval"
            ? () => void handleReject(detailEntry.id)
            : undefined
        }
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
