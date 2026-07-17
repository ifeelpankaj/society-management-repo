import { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { QrCamera } from "@/components/camera/qr-camera";
import { Card, LoadingState } from "@/components/ui";
import { GuardBackHeader } from "@/features/guard/components/guard-back-header";
import { GuardSocietyGate } from "@/features/guard/components/guard-society-gate";
import { VisitorEntryCard } from "@/features/guard/components/visitor-entry-card";
import { useGuardSociety } from "@/features/guard/guard-context";
import { extractQrToken } from "@/features/guard/guard-utils";
import { getApiMessage } from "@/features/auth/api-error";
import {
  type ModelsVisitorEntry,
  usePostV1PublicVisitorEntriesQrValidateMutation,
  usePostV1SocietiesBySocietyIdVisitorEntriesCheckInMutation,
} from "@/lib/api/generated-api";
import { theme } from "@/lib/theme";

export default function GuardScanScreen() {
  const { isLoading, memberships, requiresSelection, selectedSocietyId } = useGuardSociety();
  const [isFocused, setIsFocused] = useState(false);
  const [token, setToken] = useState("");
  const [entry, setEntry] = useState<ModelsVisitorEntry>();

  const [validateQr, validateQrState] = usePostV1PublicVisitorEntriesQrValidateMutation();
  const [checkIn, checkInState] = usePostV1SocietiesBySocietyIdVisitorEntriesCheckInMutation();

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => setIsFocused(false);
    }, []),
  );

  if (isLoading) {
    return <LoadingState message="Opening scanner" />;
  }

  if (memberships.length === 0 || requiresSelection || !selectedSocietyId) {
    return <GuardSocietyGate />;
  }

  const handleScan = async (data: string) => {
    const qrToken = extractQrToken(data);

    if (!qrToken) {
      Alert.alert("Invalid QR", "The scanned code does not contain a visitor token.");
      return;
    }

    setToken(qrToken);

    try {
      const response = await validateQr({
        modelsQrTokenRequest: { token: qrToken },
      }).unwrap();
      setEntry(response.data?.entry);
    } catch (error) {
      setEntry(undefined);
      Alert.alert("QR validation failed", getApiMessage(error, "This QR cannot be used for entry."));
    }
  };

  const handleCheckIn = async () => {
    if (!token) {
      Alert.alert("Missing QR token", "Scan a visitor QR before check-in.");
      return;
    }

    try {
      const response = await checkIn({
        societyId: selectedSocietyId,
        modelsQrTokenRequest: { token },
      }).unwrap();
      setEntry(response.data?.entry);
      Alert.alert("Checked in", response.message ?? "Visitor checked in successfully.");
    } catch (error) {
      Alert.alert("Check-in failed", getApiMessage(error, "Please try again."));
    }
  };

  const resetScan = () => {
    setToken("");
    setEntry(undefined);
  };

  const cameraActive = isFocused && !entry && !validateQrState.isLoading;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.guard.screenBg }}>
      <ScrollView contentContainerClassName="px-5 pb-8 pt-3">
        <View className="gap-6">
          <GuardBackHeader title="Scan Visitor" />
          <Text className="text-sm text-slate-600">
            Validate the QR first, then confirm check-in.
          </Text>

          <View className="h-96 overflow-hidden rounded-3xl bg-slate-950">
            {entry ? (
              <View className="flex-1 items-center justify-center gap-3 px-6">
                <Text className="text-center text-2xl font-black text-white">QR validated</Text>
                <Text className="text-center text-sm text-slate-300">
                  Review the visitor details below before allowing entry.
                </Text>
                <Pressable accessibilityRole="button" onPress={resetScan}>
                  <Text className="text-sm font-bold text-amber-200">Scan another QR</Text>
                </Pressable>
              </View>
            ) : (
              <QrCamera active={cameraActive} onScanned={handleScan} />
            )}
          </View>

          {validateQrState.isLoading ? (
            <Card>
              <Text className="text-base font-bold text-slate-950">Validating QR...</Text>
              <Text className="mt-1 text-sm text-slate-600">Hold on while we check this visitor.</Text>
            </Card>
          ) : null}

          {entry ? (
            <VisitorEntryCard
              entry={entry}
              loading={checkInState.isLoading}
              primaryActionLabel={entry.status === "approved" ? "Check In" : undefined}
              onPrimaryAction={handleCheckIn}
            />
          ) : (
            <Card>
              <Text className="text-base font-bold text-slate-950">Ready for scan</Text>
              <Text className="mt-1 text-sm text-slate-600">
                Point the camera at a visitor QR. The app will pause after a successful scan.
              </Text>
            </Card>
          )}

          {entry && entry.status !== "approved" ? (
            <Card className="border-amber-200 bg-amber-50">
              <Text className="text-base font-bold text-amber-900">Check-in unavailable</Text>
              <Text className="mt-1 text-sm text-amber-800">
                This visitor is not in approved status yet.
              </Text>
            </Card>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
