import { useCallback, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";

import { QrCamera } from "@/components/camera/qr-camera";
import { GuardSubScreen } from "@/features/guard/components/guard-sub-screen";
import { guardCheckInRoute } from "@/features/guard/guard-routes";
import { extractQrToken } from "@/features/guard/guard-utils";
import { useGuardFeedback } from "@/features/guard/hooks/use-guard-feedback";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";

export default function GuardScannerScreen() {
  const router = useRouter();
  const feedback = useGuardFeedback();
  const scanLockedRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      scanLockedRef.current = false;
      return () => {
        scanLockedRef.current = true;
      };
    }, []),
  );

  const handleScan = (data: string) => {
    if (scanLockedRef.current) {
      return;
    }

    const token = extractQrToken(data);

    if (!token) {
      feedback.showError("Invalid QR", "The scanned code does not contain a visitor token.", "Invalid QR code");
      return;
    }

    scanLockedRef.current = true;
    router.push(guardCheckInRoute({ source: "qr", token }));
  };

  return (
    <GuardSubScreen title="Scan Visitor">
      <View style={styles.content}>
        <Text style={styles.subtitle}>
          Point the camera at a visitor QR code to continue to check-in.
        </Text>

        <View style={styles.cameraFrame}>
          <QrCamera active onScanned={handleScan} />
        </View>
      </View>
    </GuardSubScreen>
  );
}

const styles = StyleSheet.create({
  cameraFrame: {
    backgroundColor: colors.text.primary,
    borderRadius: radius["2xl"],
    flex: 1,
    maxHeight: 480,
    minHeight: 320,
    overflow: "hidden",
  },
  content: {
    flex: 1,
    gap: spacing["2xl"],
    paddingBottom: spacing["2xl"],
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
});
