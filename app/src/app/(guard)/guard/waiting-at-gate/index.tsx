import { useCallback, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";

import { PaginatedList } from "@/components/ui";
import { GuardSubScreen } from "@/features/guard/components/guard-sub-screen";
import { VisitorDetailSheet } from "@/features/guard/components/visitor-detail-sheet";
import { VisitorEntryCard } from "@/features/guard/components/visitor-entry-card";
import { getWaitingDuration } from "@/features/guard/guard-utils";
import { useGuardActions } from "@/features/guard/hooks/use-guard-actions";
import { useGuardFeedback } from "@/features/guard/hooks/use-guard-feedback";
import { useGuardScreen } from "@/features/guard/hooks/use-guard-screen";
import { useGuardWaitingAtGate } from "@/features/guard/hooks/use-guard-waiting-at-gate";
import type { ModelsVisitorEntry } from "@/lib/api/generated-api";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

export default function GuardWaitingAtGateScreen() {
  const { selectedSocietyId } = useGuardScreen();
  const feedback = useGuardFeedback();
  const [search, setSearch] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<ModelsVisitorEntry | null>(null);
  const queue = useGuardWaitingAtGate(selectedSocietyId, search);
  const actions = useGuardActions(selectedSocietyId ?? 0);

  const handleCheckIn = useCallback(
    async (entry: ModelsVisitorEntry) => {
      if (!entry.id) {
        return;
      }

      const result = await actions.checkInEntry(entry.id);
      feedback.showActionResult(result, {
        successTitle: "Checked in",
        errorTitle: "Check-in failed",
      });

      if (result.success) {
        setSelectedEntry(null);
      }
    },
    [actions, feedback],
  );

  return (
    <GuardSubScreen
      headerExtra={
        <TextInput
          placeholder="Search name, phone, flat, vehicle..."
          placeholderTextColor={colors.guard.textMuted}
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />
      }
      title="Waiting at Gate"
    >
      <PaginatedList
        data={queue.items}
        emptyMessage={
          search
            ? "Try a different name, phone, flat, or vehicle."
            : "Approved visitors will appear here when ready for check-in."
        }
        emptyTitle={search ? "No matching visitors" : "No visitors waiting"}
        footer={<View style={styles.footerSpacer} />}
        hasMore={queue.hasMore}
        isLoading={queue.isLoading}
        isLoadingMore={queue.isLoadingMore}
        isRefreshing={queue.isRefreshing}
        keyExtractor={(item) => `waiting-${item.id}`}
        renderItem={({ item }) => {
          const waiting = getWaitingDuration(item.approved_at);
          return (
            <VisitorEntryCard
              entry={item}
              loading={actions.activeEntryId === item.id}
              primaryActionLabel="Check In"
              waitingLabel={waiting.label}
              waitingTone={waiting.tone}
              onPress={() => setSelectedEntry(item)}
              onPrimaryAction={() => void handleCheckIn(item)}
            />
          );
        }}
        onLoadMore={queue.loadMore}
        onRefresh={() => {
          void queue.refresh();
        }}
      />

      <VisitorDetailSheet
        entry={selectedEntry}
        loading={actions.activeEntryId === selectedEntry?.id}
        primaryActionLabel="Check In"
        visible={Boolean(selectedEntry)}
        onClose={() => setSelectedEntry(null)}
        onPrimaryAction={() => selectedEntry && void handleCheckIn(selectedEntry)}
      />
    </GuardSubScreen>
  );
}

const styles = StyleSheet.create({
  footerSpacer: {
    height: spacing.lg,
  },
  searchInput: {
    backgroundColor: colors.surface.input,
    borderColor: colors.border.input,
    borderRadius: 14,
    borderWidth: 1,
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: "600",
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
  },
});
