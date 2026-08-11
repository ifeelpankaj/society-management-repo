import { useEffect, useState } from "react";
import {
  Modal,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SymbolView } from "expo-symbols";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { AppStatusBar } from "@/components/layout/app-status-bar";
import { Row, Stack } from "@/components/layout";
import { FlatPicker } from "@/features/guard/components/flat-picker";
import { getApiMessage } from "@/features/auth/api-error";
import { titleize } from "@/features/guard/guard-utils";
import {
  canEditVisitorFlat,
  selectedFlatFromEntry,
} from "@/features/guard/guard-entry-edit";
import {
  formatSelectedFlatLabel,
  type SelectedFlat,
} from "@/features/guard/hooks/use-guard-manual-entry";
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

const VEHICLE_TYPES = ["cab", "auto", "car", "bike"] as const;

function buildInitialValues(
  entry?: ModelsVisitorEntry | null,
  selectedFlat?: SelectedFlat | null,
): UpdateGuardVisitorEntryBody & { selectedFlat: SelectedFlat | null } {
  return {
    full_name: entry?.visitor?.full_name ?? "",
    phone_number: entry?.visitor?.phone_number ?? "",
    email: entry?.visitor?.email ?? "",
    vehicle_number: entry?.vehicle_number ?? "",
    vehicle_type: entry?.vehicle_type,
    notes: entry?.notes ?? "",
    companions_count: entry?.companions_count ?? 0,
    flat_id: selectedFlat?.id,
    selectedFlat: selectedFlat ?? null,
  };
}

export function GuardEntryEditSheet({
  entry,
  onClose,
  onSaved,
  societyId,
  visible,
}: GuardEntryEditSheetProps) {
  const insets = useSafeAreaInsets();
  const [values, setValues] = useState(() =>
    buildInitialValues(entry, selectedFlatFromEntry(entry)),
  );
  const [error, setError] = useState<string | null>(null);
  const [patchEntry, patchState] =
    usePatchV1SocietiesBySocietyIdVisitorEntriesAndEntryIdMutation();
  const allowFlatEdit = canEditVisitorFlat(entry);

  useEffect(() => {
    if (visible) {
      setValues(buildInitialValues(entry, selectedFlatFromEntry(entry)));
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

    if (allowFlatEdit && !values.selectedFlat?.id) {
      setError("Select a visiting flat.");
      return;
    }

    setError(null);

    const body: UpdateGuardVisitorEntryBody = {
      full_name: fullName,
      phone_number: values.phone_number?.trim() || undefined,
      email: values.email?.trim() || undefined,
      vehicle_number: values.vehicle_number?.trim() || undefined,
      notes: values.notes?.trim() || undefined,
    };

    if (entry.purpose === "guest") {
      body.companions_count = values.companions_count ?? 0;
    }

    if (entry.purpose === "cab" && values.vehicle_type) {
      body.vehicle_type = values.vehicle_type;
    }

    if (allowFlatEdit && values.selectedFlat?.id) {
      body.flat_id = values.selectedFlat.id;
    }

    try {
      const response = await patchEntry({
        societyId,
        entryId: entry.id,
        body,
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
    <Modal
      animationType="slide"
      presentationStyle="pageSheet"
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView edges={["top", "left", "right"]} style={styles.screen}>
        <AppStatusBar />
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.header}>
            <View style={styles.headerSide} />
            <Text style={styles.headerTitle}>Edit Details</Text>
            <Pressable
              accessibilityLabel="Close"
              hitSlop={12}
              style={styles.headerSide}
              onPress={onClose}
            >
              <SymbolView
                name={{ ios: "xmark", android: "close", web: "close" }}
                size={18}
                tintColor={colors.text.secondary}
              />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            <Stack gap="md">
              <View style={styles.contextCard}>
                <Text style={styles.contextLabel}>Purpose</Text>
                <Text style={styles.contextValue}>
                  {titleize(entry?.purpose ?? "guest")}
                </Text>
                {entry?.flat || entry?.flat_id ? (
                  <>
                    <Text
                      style={[styles.contextLabel, styles.contextLabelSpaced]}
                    >
                      Current flat
                    </Text>
                    <Text style={styles.contextValue}>
                      {formatSelectedFlatLabel(selectedFlatFromEntry(entry)) ||
                        (entry.flat_id ? `Flat #${entry.flat_id}` : "—")}
                    </Text>
                  </>
                ) : null}
                {entry?.delivery_partner ? (
                  <>
                    <Text
                      style={[styles.contextLabel, styles.contextLabelSpaced]}
                    >
                      Delivery partner
                    </Text>
                    <Text style={styles.contextValue}>
                      {entry.delivery_partner}
                    </Text>
                  </>
                ) : null}
                {entry?.service_provider ? (
                  <>
                    <Text
                      style={[styles.contextLabel, styles.contextLabelSpaced]}
                    >
                      Service provider
                    </Text>
                    <Text style={styles.contextValue}>
                      {entry.service_provider}
                    </Text>
                  </>
                ) : null}
              </View>

              {allowFlatEdit ? (
                <FlatPicker
                  label="Visiting flat"
                  selected={values.selectedFlat ?? null}
                  societyId={societyId}
                  onSelect={(flat) =>
                    setValues((current) => ({
                      ...current,
                      selectedFlat: flat,
                      flat_id: flat.id,
                    }))
                  }
                />
              ) : null}

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Full name</Text>
                <TextInput
                  autoCapitalize="words"
                  style={styles.fieldInput}
                  value={values.full_name ?? ""}
                  onChangeText={(full_name) =>
                    setValues((current) => ({ ...current, full_name }))
                  }
                />
              </View>
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Phone number</Text>
                <TextInput
                  autoComplete="tel"
                  keyboardType="phone-pad"
                  style={styles.fieldInput}
                  value={values.phone_number ?? ""}
                  onChangeText={(phone_number) =>
                    setValues((current) => ({ ...current, phone_number }))
                  }
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
                  onChangeText={(email) =>
                    setValues((current) => ({ ...current, email }))
                  }
                />
              </View>
              {entry?.purpose === "guest" ? (
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Companion count</Text>
                  <TextInput
                    keyboardType="number-pad"
                    style={styles.fieldInput}
                    value={String(values.companions_count ?? 0)}
                    onChangeText={(text) =>
                      setValues((current) => ({
                        ...current,
                        companions_count: Number(text.replace(/\D/g, "") || 0),
                      }))
                    }
                  />
                </View>
              ) : null}
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
              {entry?.purpose === "cab" ? (
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Vehicle type</Text>
                  <Row align="center" gap={8} style={styles.chipRow}>
                    {VEHICLE_TYPES.map((type) => {
                      const active = values.vehicle_type === type;
                      return (
                        <Pressable
                          key={type}
                          style={[styles.chip, active && styles.chipActive]}
                          onPress={() =>
                            setValues((current) => ({
                              ...current,
                              vehicle_type: type,
                            }))
                          }
                        >
                          <Text
                            style={[
                              styles.chipText,
                              active && styles.chipTextActive,
                            ]}
                          >
                            {titleize(type)}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </Row>
                </View>
              ) : null}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Notes</Text>
                <TextInput
                  multiline
                  numberOfLines={3}
                  style={[styles.fieldInput, styles.fieldInputMultiline]}
                  value={values.notes ?? ""}
                  onChangeText={(notes) =>
                    setValues((current) => ({ ...current, notes }))
                  }
                />
              </View>
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </Stack>
          </ScrollView>

          <View
            style={[
              styles.footer,
              { paddingBottom: spacing.lg + Math.max(insets.bottom, 0) },
            ]}
          >
            <Pressable
              disabled={patchState.isLoading}
              style={[
                styles.saveButton,
                patchState.isLoading && styles.saveButtonDisabled,
              ]}
              onPress={() => void handleSave()}
            >
              <Text style={styles.saveButtonText}>
                {patchState.isLoading ? "Saving..." : "Save changes"}
              </Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: colors.dashboard.actionNeutralSoft,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  chipActive: {
    backgroundColor: colors.brand.orangeSoft,
  },
  chipRow: {
    flexWrap: "wrap",
  },
  chipText: {
    color: colors.text.secondary,
    fontSize: 13,
    fontWeight: "600",
  },
  chipTextActive: {
    color: colors.brand.orange,
  },
  content: {
    paddingBottom: spacing["3xl"],
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: spacing.lg,
  },
  contextCard: {
    backgroundColor: colors.surface.secondary,
    borderColor: colors.border.default,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
  },
  contextLabel: {
    color: colors.text.secondary,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  contextLabelSpaced: {
    marginTop: spacing.sm,
  },
  contextValue: {
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: "600",
    marginTop: 2,
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
    paddingTop: spacing.lg,
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
