import { CameraView, useCameraPermissions } from "expo-camera";
import { useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/theme/colors";
import { layout } from "@/theme/layout";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";

type QrCameraProps = {
  active?: boolean;
  onScanned?: (data: string) => void;
};

export function QrCamera({ active = true, onScanned }: QrCameraProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const hasScannedRef = useRef(false);

  if (!permission) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Checking camera permission</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.permissionContainer, styles.permissionDenied]}>
        <Text style={styles.permissionText}>Camera access is required to scan QR codes.</Text>
        <Pressable style={styles.allowButton} onPress={requestPermission}>
          <Text style={styles.allowButtonText}>Allow camera</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <CameraView
      active={active}
      barcodeScannerSettings={{
        barcodeTypes: ["qr"],
      }}
      style={styles.camera}
      facing="back"
      onBarcodeScanned={({ data }) => {
        if (hasScannedRef.current || !active) {
          return;
        }

        hasScannedRef.current = true;
        onScanned?.(data);
        setTimeout(() => {
          hasScannedRef.current = false;
        }, 1800);
      }}
    />
  );
}

const styles = StyleSheet.create({
  allowButton: {
    backgroundColor: colors.status.info,
    borderRadius: radius.md,
    paddingHorizontal: layout.footerPaddingHorizontal,
    paddingVertical: spacing.md,
  },
  allowButtonText: {
    ...typography.button,
    color: colors.text.inverse,
  },
  camera: {
    flex: 1,
  },
  permissionContainer: {
    alignItems: "center",
    backgroundColor: "#0a0a0a",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing["2xl"],
  },
  permissionDenied: {
    gap: spacing.lg,
  },
  permissionText: {
    ...typography.body,
    color: colors.text.inverse,
    textAlign: "center",
  },
});
