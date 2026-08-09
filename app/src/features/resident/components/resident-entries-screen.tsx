import { useLocalSearchParams } from "expo-router";
import { useState } from "react";

import { ResidentSocietyGate } from "@/features/resident/components/resident-society-gate";
import {
  type ResidentEntriesSegment,
  useResidentEntriesFromParams,
} from "@/features/resident/hooks/use-resident-entries";
import { useResidentDashboard } from "@/features/resident/hooks/use-resident-dashboard";
import { useResident } from "@/features/resident/resident-context";
import { residentDashboardRoute } from "@/features/resident/resident-routes";
import { LogEntryRow } from "@/features/visitors/components/log-entry-row";
import { VisitorDetailSheet } from "@/features/visitors/components/visitor-detail-sheet";
import { VisitorEntriesListScreen } from "@/features/visitors/components/visitor-entries-list-screen";
import type { ModelsVisitorEntry } from "@/lib/api/generated-api";
import { colors } from "@/theme/colors";

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
    <VisitorEntriesListScreen<ResidentEntriesSegment>
      backgroundColor={colors.guard.screenBg}
      controls={{
        ...logs,
        isLoading: listLoading,
      }}
      emptyMessage={emptyMessage}
      emptyTitle={emptyTitle}
      fallbackHomeRoute={residentDashboardRoute()}
      keyPrefix="resident-entry"
      searchTitle="Visitor Entries"
      segmentOptions={RESIDENT_SEGMENT_OPTIONS}
      renderRow={(item) => (
        <LogEntryRow
          entry={item}
          onPress={() => {
            setDetailEntry(item);
            setDetailVisible(true);
          }}
        />
      )}
      sheetFooter={
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
      }
    />
  );
}
