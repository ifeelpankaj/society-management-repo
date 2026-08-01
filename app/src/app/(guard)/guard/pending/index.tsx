import { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";

import { PaginatedList } from "@/components/ui";
import { GuardConfirmDialog } from "@/features/guard/components/guard-confirm-dialog";
import { GuardSubScreen } from "@/features/guard/components/guard-sub-screen";
import { VisitorDetailSheet } from "@/features/guard/components/visitor-detail-sheet";
import { VisitorEntryCard } from "@/features/guard/components/visitor-entry-card";
import { useGuardActions } from "@/features/guard/hooks/use-guard-actions";
import { useGuardFeedback } from "@/features/guard/hooks/use-guard-feedback";
import { useGuardPending } from "@/features/guard/hooks/use-guard-pending";
import { useGuardScreen } from "@/features/guard/hooks/use-guard-screen";
import type { ModelsVisitorPendingEntry } from "@/lib/api/generated-api";
import { spacing } from "@/theme/spacing";

export default function GuardPendingScreen() {
  const { selectedSocietyId } = useGuardScreen();
  const feedback = useGuardFeedback();
  const pending = useGuardPending(selectedSocietyId);
  const actions = useGuardActions(selectedSocietyId ?? 0);
  const [selectedEntry, setSelectedEntry] = useState<ModelsVisitorPendingEntry | null>(null);
  const [forceEntry, setForceEntry] = useState<ModelsVisitorPendingEntry | null>(null);

  const handleNotify = useCallback(
    async (entry: ModelsVisitorPendingEntry) => {
      if (!entry.id) {
        return;
      }

      const result = await actions.notifyResident(entry.id);
      feedback.showActionResult(result, {
        successTitle: "Resident notified",
        errorTitle: "Notify failed",
      });
    },
    [actions, feedback],
  );

  const handleApproveAndCheckIn = useCallback(
    async (entry: ModelsVisitorPendingEntry, onBehalf: boolean) => {
      if (!entry.id) {
        return;
      }

      const result = await actions.approveAndCheckInEntry(entry.id, { onBehalf });
      feedback.showActionResult(result, {
        successTitle: "Checked in",
        errorTitle: "Action failed",
      });

      if (result.success) {
        setSelectedEntry(null);
        setForceEntry(null);
      }
    },
    [actions, feedback],
  );

  return (
    <GuardSubScreen title="Pending Approvals">
      <PaginatedList
        data={pending.items}
        emptyMessage="Visitors waiting for resident approval will appear here."
        emptyTitle="No pending approvals"
        footer={<View style={styles.footerSpacer} />}
        hasMore={false}
        isLoading={pending.isLoading}
        isLoadingMore={false}
        isRefreshing={pending.isRefreshing}
        keyExtractor={(item) => `pending-${item.id}`}
        renderItem={({ item }) => {
          const isGuardEntry = item.source === "guard_entry";
          return (
            <VisitorEntryCard
              entry={item}
              loading={actions.activeEntryId === item.id}
              primaryActionLabel={isGuardEntry ? "Approve & Check In" : "Force Check In"}
              secondaryActionLabel="Notify"
              onPress={() => setSelectedEntry(item)}
              onPrimaryAction={() => {
                if (isGuardEntry) {
                  void handleApproveAndCheckIn(item, false);
                  return;
                }
                setForceEntry(item);
              }}
              onSecondaryAction={() => void handleNotify(item)}
            />
          );
        }}
        onLoadMore={() => undefined}
        onRefresh={() => {
          void pending.refresh();
        }}
      />

      <VisitorDetailSheet
        entry={selectedEntry}
        loading={actions.activeEntryId === selectedEntry?.id}
        primaryActionLabel={
          selectedEntry?.source === "guard_entry" ? "Approve & Check In" : "Force Check In"
        }
        secondaryActionLabel="Notify"
        visible={Boolean(selectedEntry)}
        onClose={() => setSelectedEntry(null)}
        onPrimaryAction={() => {
          if (!selectedEntry) {
            return;
          }
          if (selectedEntry.source === "guard_entry") {
            void handleApproveAndCheckIn(selectedEntry, false);
            return;
          }
          setForceEntry(selectedEntry);
          setSelectedEntry(null);
        }}
        onSecondaryAction={() => selectedEntry && void handleNotify(selectedEntry)}
      />

      <GuardConfirmDialog
        confirmLabel="Allow Visitor"
        loading={actions.isLoading}
        message={`You are allowing this visitor on behalf of ${
          forceEntry?.primary_resident_name ?? "the flat owner"
        }. This action will be recorded.`}
        title="Allow on behalf of resident"
        visible={Boolean(forceEntry)}
        onCancel={() => setForceEntry(null)}
        onConfirm={() => forceEntry && void handleApproveAndCheckIn(forceEntry, true)}
      />
    </GuardSubScreen>
  );
}

const styles = StyleSheet.create({
  footerSpacer: {
    height: spacing.lg,
  },
});
