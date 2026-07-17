import { KeyboardAvoidingView, Platform, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LoadingState } from "@/components/ui";
import { useToast } from "@/components/ui/toast";
import { GuardBackHeader } from "@/features/guard/components/guard-back-header";
import { ManualEntryForm } from "@/features/guard/components/manual-entry/manual-entry-form";
import { GuardSocietyGate } from "@/features/guard/components/guard-society-gate";
import { useGuardSociety } from "@/features/guard/guard-context";
import { theme } from "@/lib/theme";

export default function GuardAddEntryScreen() {
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
    <SafeAreaView
      className="flex-1"
      edges={["top", "left", "right"]}
      style={{ backgroundColor: theme.guard.screenBg }}
    >
      <View className="px-5 pt-3">
        <GuardBackHeader title="Add Entry" />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ManualEntryForm
          societyId={selectedSocietyId}
          societyName={
            selectedMembership ? `Society #${selectedMembership.society_id}` : undefined
          }
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
