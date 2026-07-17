import { Pressable, Text } from "react-native";
import { SymbolView } from "expo-symbols";

import { theme } from "@/lib/theme";

type ScanFabProps = {
  onPress: () => void;
};

export function ScanFab({ onPress }: ScanFabProps) {
  return (
    <Pressable
      accessibilityLabel="Scan now"
      accessibilityRole="button"
      className="flex-row items-center justify-center gap-2.5 rounded-full"
      style={({ pressed }) => ({
        backgroundColor: theme.guard.teal,
        boxShadow: "0 14px 36px rgba(13, 148, 136, 0.35)",
        elevation: 16,
        height: 56,
        opacity: pressed ? 0.92 : 1,
        transform: [{ scale: pressed ? 0.985 : 1 }],
      })}
      onPress={onPress}
    >
      <SymbolView
        name={{ ios: "qrcode.viewfinder", android: "qr_code_scanner", web: "qr_code_scanner" }}
        size={22}
        tintColor="#ffffff"
      />
      <Text className="text-[16px] font-semibold text-white" style={{ letterSpacing: 0.3 }}>
        Scan Now
      </Text>
    </Pressable>
  );
}
