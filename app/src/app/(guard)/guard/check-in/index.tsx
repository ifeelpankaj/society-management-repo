import { Pressable, ScrollView, StyleSheet, Text, View, ActivityIndicator } from "react-native";
import { useEffect, useRef } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";

import { Card } from "@/components/ui";
import { GuardSubScreen } from "@/features/guard/components/guard-sub-screen";
import { VisitorEntryCard } from "@/features/guard/components/visitor-entry-card";
import {
  guardHomeRoute,
  guardScannerRoute,
  guardWaitingAtGateRoute,
  parseCheckInParams,
} from "@/features/guard/guard-routes";
import {
  type GuardScanOutcome,
  useGuardCheckIn,
} from "@/features/guard/hooks/use-guard-check-in";
import { useGuardFeedback } from "@/features/guard/hooks/use-guard-feedback";
import { useGuardScreen } from "@/features/guard/hooks/use-guard-screen";
import { colors } from "@/theme/colors";
import { layout } from "@/theme/layout";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";

function getSubtitle(outcome: GuardScanOutcome) {
  switch (outcome) {
    case "already_inside":
      return "This visitor is already inside the society.";
    case "just_checked_in":
      return "Check-in complete. The visitor may proceed to entry.";
    case "pending_approval":
      return "This visitor is waiting for resident approval.";
    case "loading":
      return "Review visitor details before allowing entry.";
    default:
      return "Review visitor details before allowing entry.";
  }
}

export default function GuardCheckInScreen() {
  const router = useRouter();
  const feedback = useGuardFeedback();
  const params = useLocalSearchParams<{
    source?: string | string[];
    token?: string | string[];
  }>();
  const { selectedSocietyId } = useGuardScreen();

  const checkInInput = parseCheckInParams(params);
  const checkIn = useGuardCheckIn(checkInInput, selectedSocietyId);
  const checkInToastShownRef = useRef(false);
  const wasCheckingInRef = useRef(false);
  const redirectTriggeredRef = useRef(false);

  useEffect(() => {
    checkInToastShownRef.current = false;
    wasCheckingInRef.current = false;
    redirectTriggeredRef.current = false;
  }, [checkInInput?.token]);

  useEffect(() => {
    if (checkIn.isCheckingIn) {
      wasCheckingInRef.current = true;
      return;
    }

    if (
      wasCheckingInRef.current &&
      checkIn.scanOutcome === "just_checked_in" &&
      !checkInToastShownRef.current
    ) {
      checkInToastShownRef.current = true;
      wasCheckingInRef.current = false;
      feedback.showSuccess("Checked in", "The visitor may proceed to entry.");
    }
  }, [checkIn.isCheckingIn, checkIn.scanOutcome, feedback]);

  useEffect(() => {
    if (
      checkIn.entryError?.redirectToWaitingAtGate &&
      !checkIn.entry &&
      !checkIn.isLoadingEntry &&
      !redirectTriggeredRef.current
    ) {
      redirectTriggeredRef.current = true;
      feedback.showError("QR not recognized", checkIn.entryError.message);
      router.replace(guardWaitingAtGateRoute());
    }
  }, [
    checkIn.entry,
    checkIn.entryError,
    checkIn.isLoadingEntry,
    feedback,
    router,
  ]);

  useEffect(() => {
    if (
      checkIn.entryError &&
      checkIn.entry &&
      !checkIn.isCheckingIn &&
      checkIn.entryError.kind !== "invalid_params" &&
      checkIn.entryError.kind !== "validation_failed"
    ) {
      feedback.showActionResult(
        { success: false, message: checkIn.entryError.message },
        { errorTitle: "Check-in failed", successTitle: "Checked in" },
      );
    }
  }, [checkIn.entry, checkIn.entryError, checkIn.isCheckingIn, feedback]);

  if (!checkInInput) {
    return (
      <GuardSubScreen title="Check In">
        <View style={styles.content}>
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
      </GuardSubScreen>
    );
  }

  const { scanOutcome } = checkIn;

  return (
    <GuardSubScreen title="Check In">
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.subtitle}>{getSubtitle(scanOutcome)}</Text>

          {scanOutcome === "loading" ? (
            <View style={styles.inlineLoading}>
              <ActivityIndicator color={colors.guard.teal} />
              <Text style={styles.cardBody}>Validating QR...</Text>
            </View>
          ) : null}

          {scanOutcome === "error" && checkIn.entryError && !checkIn.entryError.redirectToWaitingAtGate ? (
            <Card style={styles.errorCard}>
              <Text style={styles.errorTitle}>Unable to load visitor</Text>
              <Text style={styles.errorBody}>{checkIn.entryError.message}</Text>
            </Card>
          ) : null}

          {checkIn.entry ? (
            <VisitorEntryCard
              entry={checkIn.entry}
              loading={checkIn.isCheckingIn}
              primaryActionLabel={scanOutcome === "ready" ? "Check In" : undefined}
              onPrimaryAction={() => {
                void checkIn.checkIn();
              }}
            />
          ) : null}

          {scanOutcome === "pending_approval" ? (
            <Card style={styles.warningCard}>
              <Text style={styles.warningTitle}>Waiting for approval</Text>
              <Text style={styles.warningBody}>
                {checkIn.disabledReason ??
                  "This visitor is not approved for check-in yet."}
              </Text>
            </Card>
          ) : null}

          {scanOutcome === "blocked" && checkIn.disabledReason ? (
            <Card style={styles.warningCard}>
              <Text style={styles.warningTitle}>Check-in unavailable</Text>
              <Text style={styles.warningBody}>{checkIn.disabledReason}</Text>
            </Card>
          ) : null}

          {scanOutcome === "already_inside" ? (
            <Card style={styles.successCard}>
              <Text style={styles.successTitle}>Already checked in</Text>
              <Text style={styles.successBody}>
                This visitor is already inside. No further action is needed.
              </Text>
            </Card>
          ) : null}

          {scanOutcome === "just_checked_in" ? (
            <Card style={styles.successCard}>
              <Text style={styles.successTitle}>Checked in successfully</Text>
              <Text style={styles.successBody}>The visitor may proceed to entry.</Text>
            </Card>
          ) : null}

          {checkIn.entryError && checkIn.entry && scanOutcome !== "just_checked_in" ? (
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
    </GuardSubScreen>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: spacing.md,
  },
  cardBody: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  cardTitle: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: "700",
  },
  content: {
    gap: spacing["2xl"],
    paddingBottom: layout.screenPaddingBottom,
  },
  errorBody: {
    ...typography.bodySmall,
    color: colors.status.error,
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
  inlineLoading: {
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing["2xl"],
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
  scrollContent: {
    flexGrow: 1,
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
  subtitle: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  successBody: {
    ...typography.bodySmall,
    color: "#166534",
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
  warningBody: {
    ...typography.bodySmall,
    color: "#92400e",
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
});
