import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SymbolView } from "expo-symbols";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppStatusBar } from "@/components/layout/app-status-bar";
import { Stack } from "@/components/layout";
import { getApiMessage } from "@/features/auth/api-error";
import type { ModelsVisitorEntry } from "@/lib/api/generated-api";
import {
  type UpdateGuardVisitorEntryBody,
  usePatchV1SocietiesBySocietyIdVisitorEntriesAndEntryIdMutation,
} from "@/lib/api/guard-api-extensions";
import { colors } from "@/theme/colors";
import { layout } from "@/theme/layout";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";

type GuardEntryEditSheetProps = {
  entry?: ModelsVisitorEntry | null;
  onClose: () => void;
  onSaved?: (entry: ModelsVisitorEntry) => void;
  societyId: number;
  visible: boolean;
};

function buildInitialValues(entry?: ModelsVisitorEntry | null): UpdateGuardVisitorEntryBody {
  return {
    full_name: entry?.visitor?.full_name ?? "",
    phone_number: entry?.visitor?.phone_number ?? "",
    email: entry?.visitor?.email ?? "",
    vehicle_number: entry?.vehicle_number ?? "",
    notes: entry?.notes ?? "",
    companions_count: entry?.companions_count ?? 0,
  };
}

export function GuardEntryEditSheet({
  entry,
  onClose,
  onSaved,
  societyId,
  visible,
}: GuardEntryEditSheetProps) {
  const [values, setValues] = useState<UpdateGuardVisitorEntryBody>(() => buildInitialValues(entry));
  const [error, setError] = useState<string | null>(null);
  const [patchEntry, patchState] = usePatchV1SocietiesBySocietyIdVisitorEntriesAndEntryIdMutation();

  useEffect(() => {
    if (visible) {
      setValues(buildInitialValues(entry));
      setError(null);
    }
  }, [entry, visible]);

  const handleSave = async () => {
    if (!entry?.id) {
      return;
    }

    const fullName = values.full_name?.trim();
    if (!fullName) {
      setError("Visitor name is required.");
      return;
    }

    setError(null);

    try {
      const response = await patchEntry({
        societyId,
        entryId: entry.id,
        body: {
          ...values,
          full_name: fullName,
          phone_number: values.phone_number?.trim() || undefined,
          email: values.email?.trim() || undefined,
          vehicle_number: values.vehicle_number?.trim() || undefined,
          notes: values.notes?.trim() || undefined,
        },
      }).unwrap();

      const updated = response.data?.entry;
      if (updated) {
        onSaved?.(updated);
      }
      onClose();
    } catch (saveError) {
      setError(getApiMessage(saveError, "Could not update visitor details."));
    }
  };

  return (
    <Modal animationType="slide" presentationStyle="pageSheet" visible={visible} onRequestClose={onClose}>
      <SafeAreaView style={styles.screen}>
        <AppStatusBar />
        <View style={styles.header}>
          <View style={styles.headerSide} />
          <Text style={styles.headerTitle}>Edit Details</Text>
          <Pressable accessibilityLabel="Close" hitSlop={12} style={styles.headerSide} onPress={onClose}>
            <SymbolView name={{ ios: "xmark", android: "close", web: "close" }} size={18} tintColor={colors.text.secondary} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Stack gap="md">
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Full name</Text>
              <TextInput
                autoCapitalize="words"
                style={styles.fieldInput}
                value={values.full_name ?? ""}
                onChangeText={(full_name) => setValues((current) => ({ ...current, full_name }))}
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Phone number</Text>
              <TextInput
                autoComplete="tel"
                keyboardType="phone-pad"
                style={styles.fieldInput}
                value={values.phone_number ?? ""}
                onChangeText={(phone_number) => setValues((current) => ({ ...current, phone_number }))}
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Email</Text>
              <TextInput
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                style={styles.fieldInput}
                value={values.email ?? ""}
                onChangeText={(email) => setValues((current) => ({ ...current, email }))}
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Vehicle number</Text>
              <TextInput
                autoCapitalize="characters"
                style={styles.fieldInput}
                value={values.vehicle_number ?? ""}
                onChangeText={(vehicle_number) =>
                  setValues((current) => ({ ...current, vehicle_number }))
                }
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Notes</Text>
              <TextInput
                multiline
                numberOfLines={3}
                style={[styles.fieldInput, styles.fieldInputMultiline]}
                value={values.notes ?? ""}
                onChangeText={(notes) => setValues((current) => ({ ...current, notes }))}
              />
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </Stack>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            disabled={patchState.isLoading}
            style={[styles.saveButton, patchState.isLoading && styles.saveButtonDisabled]}
            onPress={() => void handleSave()}
          >
            <Text style={styles.saveButtonText}>{patchState.isLoading ? "Saving..." : "Save changes"}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing["3xl"],
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: spacing.lg,
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.status.error,
  },
  fieldGroup: {
    gap: spacing.xs,
  },
  fieldInput: {
    backgroundColor: colors.surface.card,
    borderColor: colors.border.default,
    borderRadius: radius.lg,
    borderWidth: 1,
    color: colors.text.primary,
    fontSize: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  fieldInputMultiline: {
    minHeight: 96,
    textAlignVertical: "top",
  },
  fieldLabel: {
    color: colors.text.secondary,
    fontSize: 13,
    fontWeight: "600",
  },
  footer: {
    borderTopColor: colors.border.default,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: spacing.lg,
  },
  header: {
    alignItems: "center",
    borderBottomColor: colors.border.default,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerSide: {
    alignItems: "center",
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  headerTitle: {
    ...typography.subtitle,
    color: colors.text.primary,
    fontWeight: "700",
  },
  saveButton: {
    alignItems: "center",
    backgroundColor: colors.brand.orange,
    borderRadius: radius.xl,
    paddingVertical: spacing.md,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    ...typography.button,
    color: colors.text.inverse,
  },
  screen: {
    backgroundColor: colors.guard.screenBg,
    flex: 1,
  },
});
