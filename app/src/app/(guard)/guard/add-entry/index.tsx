import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { LoadingState } from "@/components/ui";
import { useToast } from "@/components/ui/toast";
import { GuardBackHeader } from "@/features/guard/components/guard-back-header";
import { ManualEntryForm } from "@/features/guard/components/manual-entry/manual-entry-form";
import { GuardSocietyGate } from "@/features/guard/components/guard-society-gate";
import { useGuardSociety } from "@/features/guard/guard-context";
import { guardCheckInRoute } from "@/features/guard/guard-routes";
import { colors } from "@/theme/colors";
import { layout } from "@/theme/layout";

export default function GuardAddEntryScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const { isLoading, memberships, requiresSelection, selectedMembership, selectedSocietyId } =
    useGuardSociety();

  if (isLoading) {
    return <LoadingState message="Opening manual entry" />;
  }

  if (memberships.length === 0 || requiresSelection || !selectedSocietyId) {
    return <GuardSocietyGate />;
  }

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.screen}>
      <View style={styles.header}>
        <GuardBackHeader title="Add Entry" />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ManualEntryForm
          societyId={selectedSocietyId}
          societyName={
            selectedMembership ? `Society #${selectedMembership.society_id}` : undefined
          }
          onEntryCreated={({ qrToken }) => {
            if (qrToken) {
              router.push(guardCheckInRoute({ source: "qr", token: qrToken }));
            }
          }}
          onError={(message) =>
            showToast({ title: "Could not create entry", message, variant: "error" })
          }
          onSuccess={(message) =>
            showToast({ title: "Entry created", message, variant: "success" })
          }
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.guard.screenBg,
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: layout.screenPaddingTop,
  },
});
