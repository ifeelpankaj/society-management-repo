import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SymbolView } from "expo-symbols";
import { useLocalSearchParams, useRouter } from "expo-router";

import { Button, EmptyState, LoadingState } from "@/components/ui";
import { GuardEntryEditSheet } from "@/features/guard/components/guard-entry-edit-sheet";
import { GuardSubScreen } from "@/features/guard/components/guard-sub-screen";
import { GuardVisitorDetailView } from "@/features/guard/components/guard-visitor-detail-view";
import { canEditVisitorEntry } from "@/features/guard/guard-entry-edit";
import { guardCheckInRoute } from "@/features/guard/guard-routes";
import { useGuardActions } from "@/features/guard/hooks/use-guard-actions";
import { useGuardFeedback } from "@/features/guard/hooks/use-guard-feedback";
import { useGuardScreen } from "@/features/guard/hooks/use-guard-screen";
import { useGetV1SocietiesBySocietyIdVisitorEntriesAndEntryIdQuery } from "@/lib/api/generated-api";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default function GuardEntryDetailRoute() {
  const router = useRouter();
  const { entryId: entryIdParam } = useLocalSearchParams<{ entryId?: string | string[] }>();
  const entryId = Number(firstParam(entryIdParam));
  const { selectedSocietyId } = useGuardScreen();
  const actions = useGuardActions(selectedSocietyId ?? 0);
  const feedback = useGuardFeedback();
  const [editVisible, setEditVisible] = useState(false);

  const query = useGetV1SocietiesBySocietyIdVisitorEntriesAndEntryIdQuery(
    { societyId: selectedSocietyId ?? 0, entryId },
    { skip: !selectedSocietyId || !Number.isFinite(entryId) || entryId <= 0 },
  );

  const entry = query.data?.data?.entry;
  const editable = canEditVisitorEntry(entry);
  const canCheckIn = entry?.status === "approved";

  const handleCheckOut = async () => {
    if (!entry?.id) {
      return;
    }

    const result = await actions.checkOutEntry(entry.id);
    feedback.showActionResult(result, {
      successTitle: "Checked out",
      errorTitle: "Checkout failed",
    });

    if (result.success) {
      void query.refetch();
    }
  };

  const handleCheckIn = async () => {
    if (!entry?.id) {
      return;
    }

    router.push(guardCheckInRoute({ source: "entry", entryId: entry.id }));
  };

  const handleMenuPress = () => {
    const menuOptions: { text: string; onPress?: () => void; style?: "cancel" | "destructive" }[] = [
      { text: "Cancel", style: "cancel" },
    ];

    if (editable) {
      menuOptions.unshift({
        text: "Edit Details",
        onPress: () => setEditVisible(true),
      });
    }

    if (canCheckIn) {
      menuOptions.unshift({
        text: "Review & Check In",
        onPress: () => void handleCheckIn(),
      });
    }

    if (entry?.status === "checked_in") {
      menuOptions.unshift({
        text: "Check Out",
        onPress: () => void handleCheckOut(),
      });
    }

    if (menuOptions.length === 1) {
      Alert.alert("Visitor Actions", "No actions are available for this visitor.");
      return;
    }

    Alert.alert("Visitor Actions", undefined, menuOptions);
  };

  const headerTrailing = (
    <Pressable
      accessibilityLabel="More actions"
      accessibilityRole="button"
      hitSlop={8}
      style={({ pressed }) => [styles.menuButton, pressed && styles.menuButtonPressed]}
      onPress={handleMenuPress}
    >
      <SymbolView
        name={{ ios: "ellipsis", android: "more_vert", web: "more_vert" }}
        size={18}
        tintColor={colors.guard.text}
      />
    </Pressable>
  );

  return (
    <GuardSubScreen headerTrailing={headerTrailing} title="Visitor Details">
      {query.isLoading ? (
        <LoadingState message="Loading visitor details" />
      ) : !entry ? (
        <View style={styles.emptyWrap}>
          <EmptyState
            actionLabel="Retry"
            message="This visitor entry could not be loaded."
            title="Entry not found"
            onAction={() => void query.refetch()}
          />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <GuardVisitorDetailView
            checkOutLoading={actions.activeEntryId === entry.id}
            entry={entry}
            onCheckOut={() => void handleCheckOut()}
          />

          {editable || canCheckIn ? (
            <View style={styles.actionRow}>
              {editable ? (
                <Button
                  title="Edit Details"
                  variant="secondary"
                  onPress={() => setEditVisible(true)}
                />
              ) : null}
              {canCheckIn ? (
                <Button title="Review & Check In" onPress={() => void handleCheckIn()} />
              ) : null}
            </View>
          ) : null}
        </ScrollView>
      )}

      <GuardEntryEditSheet
        entry={entry}
        societyId={selectedSocietyId ?? 0}
        visible={editVisible}
        onClose={() => setEditVisible(false)}
        onSaved={() => {
          setEditVisible(false);
          void query.refetch();
          feedback.showSuccess("Details updated", "Visitor information saved.");
        }}
      />
    </GuardSubScreen>
  );
}

const styles = StyleSheet.create({
  actionRow: {
    gap: spacing.sm,
    paddingBottom: spacing["2xl"],
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  emptyWrap: {
    padding: spacing.lg,
  },
  menuButton: {
    alignItems: "center",
    backgroundColor: colors.surface.card,
    borderColor: colors.border.default,
    borderRadius: radius["2xl"],
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  menuButtonPressed: {
    opacity: 0.85,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
