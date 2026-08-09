import { Platform, type ViewStyle } from "react-native";

import { colors } from "./colors";

type ShadowStyle = Pick<ViewStyle, "shadowColor" | "shadowOffset" | "shadowOpacity" | "shadowRadius" | "elevation" | "boxShadow">;

function nativeShadow(
  color: string,
  offsetY: number,
  opacity: number,
  radius: number,
  elevation: number,
): ShadowStyle {
  if (Platform.OS === "web") {
    return {
      boxShadow: `0 ${offsetY}px ${radius}px rgba(0, 0, 0, ${opacity})`,
    };
  }

  return {
    shadowColor: color,
    shadowOffset: { width: 0, height: offsetY },
    shadowOpacity: opacity,
    shadowRadius: radius,
    elevation,
  };
}

export const shadows = {
  sm: nativeShadow("#000000", 1, 0.05, 2, 1),
  card: Platform.select<ShadowStyle>({
    web: { boxShadow: "0 2px 12px rgba(15, 23, 42, 0.06)" },
    default: {
      shadowColor: "#0f172a",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 2,
    },
  })!,
  hero: Platform.select<ShadowStyle>({
    web: { boxShadow: "0 8px 28px rgba(255, 106, 26, 0.22)" },
    default: {
      shadowColor: colors.brand.orange,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.22,
      shadowRadius: 28,
      elevation: 6,
    },
  })!,
  cta: Platform.select<ShadowStyle>({
    web: { boxShadow: "0 10px 28px rgba(255, 106, 26, 0.32)" },
    default: {
      shadowColor: colors.brand.orange,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.32,
      shadowRadius: 28,
      elevation: 8,
    },
  })!,
  brand: Platform.select<ShadowStyle>({
    web: { boxShadow: `0 10px 20px ${colors.brand.primaryShadow}` },
    default: {
      shadowColor: colors.brand.orange,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.18,
      shadowRadius: 20,
      elevation: 4,
    },
  })!,
} as const;
