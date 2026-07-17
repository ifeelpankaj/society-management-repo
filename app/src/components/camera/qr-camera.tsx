import { CameraView, useCameraPermissions } from "expo-camera";
import { useRef } from "react";
import { Pressable, Text, View } from "react-native";

type QrCameraProps = {
  active?: boolean;
  onScanned?: (data: string) => void;
};

export function QrCamera({ active = true, onScanned }: QrCameraProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const hasScannedRef = useRef(false);

  if (!permission) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-950 px-6">
        <Text className="text-center text-base text-white">
          Checking camera permission
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-neutral-950 px-6">
        <Text className="text-center text-base text-white">
          Camera access is required to scan QR codes.
        </Text>
        <Pressable
          className="rounded-md bg-sky-500 px-5 py-3"
          onPress={requestPermission}
        >
          <Text className="font-semibold text-white">Allow camera</Text>
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
      className="flex-1"
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
