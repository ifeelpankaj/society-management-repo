import { Alert, Pressable, ScrollView, Text, View } from "react-native";
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
import { theme } from "@/lib/theme";

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
    <View className="gap-3">
      {settings.map((setting) => (
        <Card key={`setting-${setting.purpose}`} className="gap-4">
          <View className="flex-row items-center justify-between gap-3">
            <PurposeBadge purpose={setting.purpose} />
            <Text className="text-sm font-semibold text-slate-600">
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
      className="flex-row items-center justify-between rounded-[14px] px-4 py-3"
      style={{ backgroundColor: theme.status.errorSoft }}
      onPress={onRetry}
    >
      <Text className="flex-1 pr-3 text-[13px] font-medium" style={{ color: "#991b1b" }}>
        {message}
      </Text>
      <Text className="text-[13px] font-semibold" style={{ color: "#b91c1c" }}>
        Retry
      </Text>
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
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.guard.screenBg }}>
      <ScrollView contentContainerClassName="px-5 pb-8 pt-3">
        <View className="gap-6">
          <GuardBackHeader title="Approval Settings" />
          <View className="gap-1">
            <Text className="text-2xl font-bold" style={{ color: theme.text.primary }}>
              Approval settings
            </Text>
            <Text className="text-sm" style={{ color: theme.text.secondary }}>
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

          <Card className="gap-3">
            <Text className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Society mode
            </Text>
            <Text className="text-2xl font-bold capitalize text-slate-950">
              {titleize(approvalMode)}
            </Text>
            <Text className="text-sm text-slate-600">
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
                <Text className="text-base font-bold text-slate-950">Read-only access</Text>
                <Text className="mt-1 text-sm text-slate-600">
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
