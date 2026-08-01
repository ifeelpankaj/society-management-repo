import { KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

import { GuardSubScreen } from "@/features/guard/components/guard-sub-screen";
import { ManualEntryForm } from "@/features/guard/components/manual-entry/manual-entry-form";
import { guardCheckInRoute } from "@/features/guard/guard-routes";
import { useGuardFeedback } from "@/features/guard/hooks/use-guard-feedback";
import { useGuardScreen } from "@/features/guard/hooks/use-guard-screen";

export default function GuardAddEntryScreen() {
  const router = useRouter();
  const feedback = useGuardFeedback();
  const { selectedMembership, selectedSocietyId } = useGuardScreen();

  return (
    <GuardSubScreen title="Add Entry">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ManualEntryForm
          societyId={selectedSocietyId ?? 0}
          societyName={
            selectedMembership ? `Society #${selectedMembership.society_id}` : undefined
          }
          onEntryCreated={({ qrToken }) => {
            if (qrToken) {
              router.push(guardCheckInRoute({ source: "qr", token: qrToken }));
            }
          }}
          onError={(message) =>
            feedback.showActionResult(
              { success: false, message },
              { errorTitle: "Could not create entry", successTitle: "Entry created" },
            )
          }
          onSuccess={(message) => feedback.showSuccess("Entry created", message)}
        />
      </KeyboardAvoidingView>
    </GuardSubScreen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
