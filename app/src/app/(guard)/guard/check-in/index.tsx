import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card, LoadingState } from "@/components/ui";
import { GuardBackHeader } from "@/features/guard/components/guard-back-header";
import { GuardSocietyGate } from "@/features/guard/components/guard-society-gate";
import { VisitorEntryCard } from "@/features/guard/components/visitor-entry-card";
import { useGuardSociety } from "@/features/guard/guard-context";
import {
  guardHomeRoute,
  guardScannerRoute,
  parseCheckInParams,
} from "@/features/guard/guard-routes";
import { useGuardCheckIn } from "@/features/guard/hooks/use-guard-check-in";
import { colors } from "@/theme/colors";
import { layout } from "@/theme/layout";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";

export default function GuardCheckInScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    source?: string | string[];
    token?: string | string[];
  }>();
  const { isLoading, memberships, requiresSelection, selectedSocietyId } = useGuardSociety();

  const checkInInput = parseCheckInParams(params);
  const checkIn = useGuardCheckIn(checkInInput, selectedSocietyId);

  if (isLoading) {
    return <LoadingState message="Opening check-in" />;
  }

  if (memberships.length === 0 || requiresSelection || !selectedSocietyId) {
    return <GuardSocietyGate />;
  }

  if (!checkInInput) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.content}>
          <GuardBackHeader title="Check In" />
          <Card>
            <Text style={styles.cardTitle}>Invalid check-in link</Text>
            <Text style={styles.cardBody}>
              This check-in route is missing a valid QR token. Scan a visitor QR to continue.
            </Text>
          </Card>
          <Pressable
            accessibilityRole="button"
            style={styles.primaryButton}
            onPress={() => router.replace(guardScannerRoute())}
          >
            <Text style={styles.primaryButtonText}>Go to scanner</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <GuardBackHeader title="Check In" />
          <Text style={styles.subtitle}>Review visitor details before allowing entry.</Text>

          {checkIn.isLoadingEntry ? (
            <Card>
              <Text style={styles.cardTitle}>Validating QR...</Text>
              <Text style={styles.cardBody}>Hold on while we verify this visitor.</Text>
            </Card>
          ) : null}

          {checkIn.entryError && !checkIn.entry ? (
            <Card style={styles.errorCard}>
              <Text style={styles.errorTitle}>Unable to load visitor</Text>
              <Text style={styles.errorBody}>{checkIn.entryError.message}</Text>
            </Card>
          ) : null}

          {checkIn.entry ? (
            <VisitorEntryCard
              entry={checkIn.entry}
              loading={checkIn.isCheckingIn}
              primaryActionLabel={
                checkIn.isCheckedIn
                  ? undefined
                  : checkIn.canCheckIn
                    ? "Check In"
                    : undefined
              }
              onPrimaryAction={() => {
                void checkIn.checkIn();
              }}
            />
          ) : null}

          {checkIn.entry && !checkIn.canCheckIn && checkIn.disabledReason ? (
            <Card style={styles.warningCard}>
              <Text style={styles.warningTitle}>Check-in unavailable</Text>
              <Text style={styles.warningBody}>{checkIn.disabledReason}</Text>
            </Card>
          ) : null}

          {checkIn.isCheckedIn ? (
            <Card style={styles.successCard}>
              <Text style={styles.successTitle}>Checked in successfully</Text>
              <Text style={styles.successBody}>The visitor may proceed to entry.</Text>
            </Card>
          ) : null}

          {checkIn.entryError && checkIn.entry ? (
            <Card style={styles.errorCard}>
              <Text style={styles.errorTitle}>Check-in failed</Text>
              <Text style={styles.errorBody}>{checkIn.entryError.message}</Text>
            </Card>
          ) : null}

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              style={styles.secondaryButton}
              onPress={() => router.replace(guardScannerRoute())}
            >
              <Text style={styles.secondaryButtonText}>Scan another</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              style={styles.primaryButton}
              onPress={() => router.replace(guardHomeRoute())}
            >
              <Text style={styles.primaryButtonText}>Back to home</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.guard.screenBg,
    flex: 1,
  },
  scrollContent: {
    paddingBottom: layout.screenPaddingBottom,
  },
  content: {
    gap: spacing["2xl"],
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: layout.screenPaddingTop,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  cardTitle: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: "700",
  },
  cardBody: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  warningCard: {
    backgroundColor: colors.status.warningSoft,
    borderColor: "#fde68a",
  },
  warningTitle: {
    ...typography.body,
    color: "#78350f",
    fontWeight: "700",
  },
  warningBody: {
    ...typography.bodySmall,
    color: "#92400e",
    marginTop: spacing.xs,
  },
  errorCard: {
    backgroundColor: colors.status.errorSoft,
    borderColor: "#fecaca",
  },
  errorTitle: {
    ...typography.body,
    color: colors.status.error,
    fontWeight: "700",
  },
  errorBody: {
    ...typography.bodySmall,
    color: colors.status.error,
    marginTop: spacing.xs,
  },
  successCard: {
    backgroundColor: colors.status.successSoft,
    borderColor: "#bbf7d0",
  },
  successTitle: {
    ...typography.body,
    color: "#166534",
    fontWeight: "700",
  },
  successBody: {
    ...typography.bodySmall,
    color: "#166534",
    marginTop: spacing.xs,
  },
  actions: {
    gap: spacing.md,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: colors.brand.orange,
    borderRadius: 14,
    paddingVertical: spacing.md,
  },
  primaryButtonText: {
    ...typography.button,
    color: colors.text.inverse,
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: colors.surface.card,
    borderColor: colors.border.default,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: spacing.md,
  },
  secondaryButtonText: {
    ...typography.button,
    color: colors.guard.text,
  },
});
