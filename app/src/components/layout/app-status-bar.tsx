import { Platform } from "react-native";
import { StatusBar } from "expo-status-bar";

import { colors } from "@/theme/colors";

type AppStatusBarProps = {
  style?: "auto" | "dark" | "light";
};

export function AppStatusBar({ style = "dark" }: AppStatusBarProps) {
  return (
    <StatusBar
      style={style}
      backgroundColor={Platform.OS === "android" ? colors.surface.card : undefined}
      translucent={false}
    />
  );
}
