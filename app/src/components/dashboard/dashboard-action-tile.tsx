import { Pressable, StyleSheet, Text, View } from "react-native";
import { SymbolView } from "expo-symbols";
import type { SymbolViewProps } from "expo-symbols";

import { colors } from "@/theme/colors";
import { layout } from "@/theme/layout";
import { radius } from "@/theme/radius";
import { shadows } from "@/theme/shadows";
import { spacing } from "@/theme/spacing";

export type DashboardActionTone = "orange" | "blue" | "purple" | "neutral";

const toneStyles: Record<
  DashboardActionTone,
  { backgroundColor: string; iconColor: string }
> = {
  orange: {
    backgroundColor: colors.dashboard.actionOrangeSoft,
    iconColor: colors.dashboard.actionOrange,
  },
  blue: {
    backgroundColor: colors.dashboard.actionBlueSoft,
    iconColor: colors.dashboard.actionBlue,
  },
  purple: {
    backgroundColor: colors.dashboard.actionPurpleSoft,
    iconColor: colors.dashboard.actionPurple,
  },
  neutral: {
    backgroundColor: colors.dashboard.actionNeutralSoft,
    iconColor: colors.dashboard.actionNeutral,
  },
};

export type DashboardActionTileConfig = {
  icon: SymbolViewProps["name"];
  id: string;
  onPress: () => void;
  subtitle: string;
  title: string;
  tone: DashboardActionTone;
};

type DashboardActionTileProps = Omit<DashboardActionTileConfig, "id">;

export function DashboardActionTile({
  icon,
  onPress,
  subtitle,
  // title,
  tone,
}: DashboardActionTileProps) {
  const toneStyle = toneStyles[tone];

  return (
    <Pressable
      // accessibilityLabel={title}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.tile,
        {
          opacity: pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.97 : 1 }],
        },
      ]}
      onPress={onPress}
    >
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: toneStyle.backgroundColor },
        ]}
      >
        <SymbolView name={icon} size={24} tintColor={toneStyle.iconColor} />
      </View>
      {/* <Text numberOfLines={2} style={styles.title}>
        {title}
      </Text> */}
      <Text numberOfLines={2} style={styles.subtitle}>
        {subtitle}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    alignItems: "center",
    borderRadius: radius.lg,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  subtitle: {
    color: colors.guard.textMuted,
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  tile: {
    alignItems: "center",

    flex: 1,
    gap: spacing.sm,
    justifyContent: "center",
    // ...shadows.sm,
  },
  title: {
    color: colors.guard.text,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
});
