import { useCallback, useRef } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { QrCamera } from "@/components/camera/qr-camera";
import { LoadingState } from "@/components/ui";
import { GuardBackHeader } from "@/features/guard/components/guard-back-header";
import { GuardSocietyGate } from "@/features/guard/components/guard-society-gate";
import { useGuardSociety } from "@/features/guard/guard-context";
import { guardCheckInRoute } from "@/features/guard/guard-routes";
import { extractQrToken } from "@/features/guard/guard-utils";
import { colors } from "@/theme/colors";
import { layout } from "@/theme/layout";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";

export default function GuardScannerScreen() {
  const router = useRouter();
  const { isLoading, memberships, requiresSelection, selectedSocietyId } = useGuardSociety();
  const scanLockedRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      scanLockedRef.current = false;
      return () => {
        scanLockedRef.current = true;
      };
    }, []),
  );

  if (isLoading) {
    return <LoadingState message="Opening scanner" />;
  }

  if (memberships.length === 0 || requiresSelection || !selectedSocietyId) {
    return <GuardSocietyGate />;
  }

  const handleScan = (data: string) => {
    if (scanLockedRef.current) {
      return;
    }

    const token = extractQrToken(data);

    if (!token) {
      Alert.alert("Invalid QR", "The scanned code does not contain a visitor token.");
      return;
    }

    scanLockedRef.current = true;
    router.push(guardCheckInRoute({ source: "qr", token }));
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <GuardBackHeader title="Scan Visitor" />
        <Text style={styles.subtitle}>
          Point the camera at a visitor QR code to continue to check-in.
        </Text>

        <View style={styles.cameraFrame}>
          <QrCamera active onScanned={handleScan} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.guard.screenBg,
    flex: 1,
  },
  content: {
    flex: 1,
    gap: spacing["2xl"],
    paddingBottom: layout.screenPaddingBottom,
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: layout.screenPaddingTop,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  cameraFrame: {
    backgroundColor: colors.text.primary,
    borderRadius: radius["2xl"],
    flex: 1,
    maxHeight: 480,
    minHeight: 320,
    overflow: "hidden",
  },
});
