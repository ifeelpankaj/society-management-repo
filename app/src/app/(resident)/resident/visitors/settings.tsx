import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  Button,
  Card,
  LoadingState,
  PurposeBadge,
  SettingToggleRow,
} from "@/components/ui";
import { getApiMessage, getVisitorActionErrorMessage } from "@/features/auth/api-error";
import { GuardBackHeader } from "@/features/guard/components/guard-back-header";
import { titleize } from "@/features/guard/guard-utils";
import { ResidentSocietyGate } from "@/features/resident/components/resident-society-gate";
import { useResident } from "@/features/resident/resident-context";
import type { ModelsFlatVisitorSettingsResponse } from "@/lib/api/generated-api";
import {
  useGetV1SocietiesBySocietyIdFlatsAndFlatIdVisitorContextQuery,
  useGetV1SocietiesBySocietyIdFlatsAndFlatIdVisitorSettingsQuery,
  usePatchV1SocietiesBySocietyIdFlatsAndFlatIdVisitorSettingsPurposeMutation,
  usePostV1SocietiesBySocietyIdFlatsAndFlatIdVisitorSettingsResetMutation,
} from "@/lib/api/generated-api";
import { colors } from "@/theme/colors";
import { layout } from "@/theme/layout";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";

function SettingsList({
  editable,
  settings,
  onUpdate,
}: {
  editable: boolean;
  settings: ModelsFlatVisitorSettingsResponse[];
  onUpdate: (
    purpose: NonNullable<ModelsFlatVisitorSettingsResponse["purpose"]>,
    patch: { approval_required?: boolean; is_enabled?: boolean },
  ) => void;
}) {
  return (
    <View style={styles.settingsList}>
      {settings.map((setting) => (
        <Card key={`setting-${setting.purpose}`} style={styles.settingCard}>
          <View style={styles.settingHeader}>
            <PurposeBadge purpose={setting.purpose} />
            <Text style={styles.settingStatus}>
              {setting.approval_required ? "Approval required" : "Auto allowed"}
            </Text>
          </View>
          <SettingToggleRow
            description="When enabled, you must approve visitors for this purpose."
            disabled={!editable}
            title="Require approval"
            value={setting.approval_required === true}
            onValueChange={(value) => {
              if (setting.purpose) {
                void onUpdate(setting.purpose, { approval_required: value });
              }
            }}
          />
          <SettingToggleRow
            description="Disable this purpose if you do not want visitors of this type."
            disabled={!editable}
            title="Purpose enabled"
            value={setting.is_enabled !== false}
            onValueChange={(value) => {
              if (setting.purpose) {
                void onUpdate(setting.purpose, { is_enabled: value });
              }
            }}
          />
        </Card>
      ))}
    </View>
  );
}

function ErrorBanner({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onRetry}
      style={styles.errorBanner}
    >
      <Text style={styles.errorMessage}>{message}</Text>
      <Text style={styles.errorAction}>Retry</Text>
    </Pressable>
  );
}

export default function ResidentVisitorSettingsScreen() {
  const { flatId, canManageFlatVisitors, isLoading, requiresSelection, societyId } = useResident();
  const contextQuery = useGetV1SocietiesBySocietyIdFlatsAndFlatIdVisitorContextQuery(
    { societyId: societyId ?? 0, flatId: flatId ?? 0 },
    { skip: !societyId || !flatId },
  );
  const settingsQuery = useGetV1SocietiesBySocietyIdFlatsAndFlatIdVisitorSettingsQuery(
    { societyId: societyId ?? 0, flatId: flatId ?? 0 },
    { skip: !societyId || !flatId || !canManageFlatVisitors },
  );
  const [patchSetting] =
    usePatchV1SocietiesBySocietyIdFlatsAndFlatIdVisitorSettingsPurposeMutation();
  const [resetSettings, resetState] =
    usePostV1SocietiesBySocietyIdFlatsAndFlatIdVisitorSettingsResetMutation();

  if (isLoading) {
    return <LoadingState message="Opening visitor settings" />;
  }

  if (requiresSelection || !societyId || !flatId) {
    return <ResidentSocietyGate />;
  }

  const context = contextQuery.data?.data?.context;
  const settings =
    settingsQuery.data?.data?.visitor_settings ?? context?.visitor_settings ?? [];
  const approvalMode = context?.society_approval_mode ?? "mandatory";
  const isHybrid = approvalMode === "hybrid";
  const isQueryLoading =
    (contextQuery.isLoading && !contextQuery.data) ||
    (canManageFlatVisitors && settingsQuery.isLoading && !settingsQuery.data);
  const failedQuery = [contextQuery, ...(canManageFlatVisitors ? [settingsQuery] : [])].find(
    (query) => query.isError,
  );

  const refetchAll = () => {
    if (!contextQuery.isUninitialized) {
      void contextQuery.refetch();
    }
    if (canManageFlatVisitors && !settingsQuery.isUninitialized) {
      void settingsQuery.refetch();
    }
  };

  const updateSetting = async (
    purpose: NonNullable<ModelsFlatVisitorSettingsResponse["purpose"]>,
    patch: { approval_required?: boolean; is_enabled?: boolean },
  ) => {
    if (!canManageFlatVisitors) {
      return;
    }

    try {
      await patchSetting({
        societyId,
        flatId,
        purpose,
        modelsUpdateFlatVisitorSettingRequest: patch,
      }).unwrap();
      refetchAll();
    } catch (error) {
      Alert.alert(
        "Update failed",
        getVisitorActionErrorMessage(error, "Please try again."),
      );
    }
  };

  const handleReset = async () => {
    if (!canManageFlatVisitors) {
      return;
    }

    try {
      await resetSettings({ societyId, flatId }).unwrap();
      refetchAll();
      Alert.alert("Settings reset", "Flat visitor settings were restored to defaults.");
    } catch (error) {
      Alert.alert(
        "Reset failed",
        getVisitorActionErrorMessage(error, "Please try again."),
      );
    }
  };

  if (isQueryLoading) {
    return <LoadingState message="Loading visitor settings" />;
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <GuardBackHeader title="Approval Settings" />
          <View style={styles.intro}>
            <Text style={styles.pageTitle}>Approval settings</Text>
            <Text style={styles.pageSubtitle}>
              {isHybrid
                ? "Choose which visitor purposes require your approval on this flat."
                : `Society mode is ${titleize(approvalMode)}. Flat-level hybrid controls are not editable.`}
            </Text>
          </View>

          {failedQuery ? (
            <ErrorBanner
              message={getApiMessage(
                failedQuery.error,
                "Unable to load visitor settings.",
              )}
              onRetry={refetchAll}
            />
          ) : null}

          <Card style={styles.modeCard}>
            <Text style={styles.fieldLabel}>Society mode</Text>
            <Text style={styles.modeValue}>{titleize(approvalMode)}</Text>
            <Text style={styles.modeDescription}>
              {isHybrid
                ? "Hybrid mode lets each flat decide approval rules per visitor purpose."
                : context?.inherits_society_mode
                  ? "This flat inherits the society-wide approval policy."
                  : "Contact your society admin if you need to change the approval policy."}
            </Text>
          </Card>

          {isHybrid && canManageFlatVisitors ? (
            <>
              <SettingsList editable settings={settings} onUpdate={updateSetting} />
              <Button
                title="Reset to defaults"
                variant="secondary"
                loading={resetState.isLoading}
                onPress={handleReset}
              />
            </>
          ) : null}

          {isHybrid && !canManageFlatVisitors ? (
            <>
              <Card>
                <Text style={styles.readOnlyTitle}>Read-only access</Text>
                <Text style={styles.readOnlyBody}>
                  Only the flat owner can change hybrid visitor settings for this flat.
                </Text>
              </Card>
              <SettingsList editable={false} settings={settings} onUpdate={updateSetting} />
            </>
          ) : null}
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
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: layout.screenPaddingTop,
  },
  content: {
    gap: spacing["2xl"],
  },
  intro: {
    gap: spacing.xs,
  },
  pageTitle: {
    ...typography.title,
    color: colors.text.primary,
  },
  pageSubtitle: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  settingsList: {
    gap: spacing.md,
  },
  settingCard: {
    gap: spacing.lg,
  },
  settingHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  settingStatus: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    fontWeight: "600",
  },
  errorBanner: {
    alignItems: "center",
    backgroundColor: colors.status.errorSoft,
    borderRadius: radius.xl,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  errorMessage: {
    color: "#991b1b",
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
    paddingRight: spacing.md,
  },
  errorAction: {
    color: "#b91c1c",
    fontSize: 13,
    fontWeight: "600",
  },
  modeCard: {
    gap: spacing.md,
  },
  fieldLabel: {
    ...typography.eyebrow,
    color: colors.text.muted,
  },
  modeValue: {
    ...typography.title,
    color: colors.text.primary,
    textTransform: "capitalize",
  },
  modeDescription: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  readOnlyTitle: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: "700",
  },
  readOnlyBody: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
});
