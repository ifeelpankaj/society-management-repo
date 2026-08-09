import { useLocalSearchParams } from "expo-router";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SymbolView } from "expo-symbols";

import { EmptyState, LoadingState } from "@/components/ui";
import { GuardSubScreen } from "@/features/guard/components/guard-sub-screen";
import { GuardVisitorDetailView } from "@/features/guard/components/guard-visitor-detail-view";
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
  const { entryId: entryIdParam } = useLocalSearchParams<{ entryId?: string | string[] }>();
  const entryId = Number(firstParam(entryIdParam));
  const { selectedSocietyId } = useGuardScreen();
  const actions = useGuardActions(selectedSocietyId ?? 0);
  const feedback = useGuardFeedback();

  const query = useGetV1SocietiesBySocietyIdVisitorEntriesAndEntryIdQuery(
    { societyId: selectedSocietyId ?? 0, entryId },
    { skip: !selectedSocietyId || !Number.isFinite(entryId) || entryId <= 0 },
  );

  const entry = query.data?.data?.entry;

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

  const handleMenuPress = () => {
    if (entry?.status !== "checked_in") {
      Alert.alert("Visitor Actions", "No actions are available for this visitor.");
      return;
    }

    Alert.alert("Visitor Actions", undefined, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Check Out",
        onPress: () => void handleCheckOut(),
      },
    ]);
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
        </ScrollView>
      )}
    </GuardSubScreen>
  );
}

const styles = StyleSheet.create({
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
