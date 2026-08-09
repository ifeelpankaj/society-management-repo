import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SymbolView } from "expo-symbols";
import { useLocalSearchParams, useRouter } from "expo-router";

import { Card } from "@/components/ui";
import { GuardEntryEditSheet } from "@/features/guard/components/guard-entry-edit-sheet";
import { GuardSubScreen } from "@/features/guard/components/guard-sub-screen";
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
import { VisitorDetailsCard } from "@/features/visitors/components/visitor-details-card";
import type { ModelsVisitorEntry } from "@/lib/api/generated-api";
import { colors } from "@/theme/colors";
import { layout } from "@/theme/layout";
import { radius } from "@/theme/radius";
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

function canEditEntry(entry?: ModelsVisitorEntry | null) {
  return entry?.status === "waiting_approval" || entry?.status === "approved";
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
  const [editVisible, setEditVisible] = useState(false);
  const [editedEntry, setEditedEntry] = useState<{
    entry: ModelsVisitorEntry;
    token: string;
  } | null>(null);
  const checkInToastShownRef = useRef(false);
  const wasCheckingInRef = useRef(false);
  const redirectTriggeredRef = useRef(false);

  const activeToken = checkInInput?.token ?? "";
  const entry =
    editedEntry?.token === activeToken ? editedEntry.entry : checkIn.entry;

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
      feedback.showError("QR not recognized", "", checkIn.entryError.message);
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
              This check-in route is missing a valid QR token. Scan a visitor QR
              to continue.
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
  const showPrimaryCheckIn = scanOutcome === "ready" && entry;
  const showEditDetails = canEditEntry(entry);

  return (
    <GuardSubScreen title="Check In">
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.heroHeader}>
            <View style={styles.heroIconWrap}>
              <SymbolView
                name={{ ios: "shield.fill", android: "security", web: "security" }}
                size={28}
                tintColor={colors.brand.orange}
              />
            </View>
            <Text style={styles.heroTitle}>Visitor Check-In</Text>
            <Text style={styles.subtitle}>{getSubtitle(scanOutcome)}</Text>
          </View>

          {scanOutcome === "loading" ? (
            <View style={styles.inlineLoading}>
              <ActivityIndicator color={colors.guard.teal} />
              <Text style={styles.cardBody}>Validating QR...</Text>
            </View>
          ) : null}

          {scanOutcome === "error" &&
          checkIn.entryError &&
          !checkIn.entryError.redirectToWaitingAtGate ? (
            <Card style={styles.errorCard}>
              <Text style={styles.errorTitle}>Unable to load visitor</Text>
              <Text style={styles.errorBody}>{checkIn.entryError.message}</Text>
            </Card>
          ) : null}

          {entry ? <VisitorDetailsCard entry={entry} /> : null}

          {showPrimaryCheckIn || showEditDetails ? (
            <View style={styles.primaryActions}>
              {showPrimaryCheckIn ? (
                <Pressable
                  accessibilityRole="button"
                  disabled={checkIn.isCheckingIn}
                  style={({ pressed }) => [
                    styles.checkInButton,
                    pressed && styles.buttonPressed,
                    checkIn.isCheckingIn && styles.buttonDisabled,
                  ]}
                  onPress={() => void checkIn.checkIn()}
                >
                  {checkIn.isCheckingIn ? (
                    <ActivityIndicator color={colors.text.inverse} />
                  ) : (
                    <Text style={styles.checkInButtonText}>Check In</Text>
                  )}
                </Pressable>
              ) : null}
              {showEditDetails ? (
                <Pressable
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    styles.editButton,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={() => setEditVisible(true)}
                >
                  <Text style={styles.editButtonText}>Edit Details</Text>
                </Pressable>
              ) : null}
            </View>
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
              <Text style={styles.successBody}>
                The visitor may proceed to entry.
              </Text>
            </Card>
          ) : null}

          {checkIn.entryError &&
          entry &&
          scanOutcome !== "just_checked_in" ? (
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

      <GuardEntryEditSheet
        entry={entry}
        societyId={selectedSocietyId ?? 0}
        visible={editVisible}
        onClose={() => setEditVisible(false)}
        onSaved={(updated) => {
          if (activeToken) {
            setEditedEntry({ token: activeToken, entry: updated });
          }
          feedback.showSuccess("Details updated", "Visitor information saved.");
        }}
      />
    </GuardSubScreen>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: spacing.md,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonPressed: {
    opacity: 0.85,
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
  checkInButton: {
    alignItems: "center",
    backgroundColor: colors.brand.orange,
    borderRadius: radius.xl,
    justifyContent: "center",
    minHeight: layout.buttonHeight,
  },
  checkInButtonText: {
    ...typography.button,
    color: colors.text.inverse,
  },
  content: {
    gap: spacing["2xl"],
    paddingBottom: layout.screenPaddingBottom,
  },
  editButton: {
    alignItems: "center",
    backgroundColor: colors.surface.card,
    borderColor: colors.brand.orange,
    borderRadius: radius.xl,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: layout.buttonHeight,
  },
  editButtonText: {
    ...typography.button,
    color: colors.brand.orange,
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
  heroHeader: {
    alignItems: "center",
    gap: spacing.sm,
  },
  heroIconWrap: {
    alignItems: "center",
    backgroundColor: colors.brand.orangeSoft,
    borderRadius: radius.full,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  heroTitle: {
    ...typography.title,
    color: colors.text.primary,
    fontWeight: "800",
  },
  inlineLoading: {
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing["2xl"],
  },
  primaryActions: {
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
    textAlign: "center",
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
