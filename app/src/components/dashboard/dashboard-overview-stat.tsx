import { Pressable, StyleSheet, Text, View } from "react-native";
import { SymbolView } from "expo-symbols";
import type { SymbolViewProps } from "expo-symbols";

import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";

export type DashboardOverviewTone = "green" | "orange" | "blue" | "purple" | "neutral";

const toneStyles: Record<
  DashboardOverviewTone,
  { backgroundColor: string; iconColor: string; valueColor: string }
> = {
  green: {
    backgroundColor: colors.dashboard.statGreenSoft,
    iconColor: colors.dashboard.statGreen,
    valueColor: colors.dashboard.statGreen,
  },
  orange: {
    backgroundColor: colors.dashboard.statOrangeSoft,
    iconColor: colors.dashboard.statOrange,
    valueColor: colors.dashboard.statOrange,
  },
  blue: {
    backgroundColor: colors.dashboard.statBlueSoft,
    iconColor: colors.dashboard.statBlue,
    valueColor: colors.dashboard.statBlue,
  },
  purple: {
    backgroundColor: colors.dashboard.statPurpleSoft,
    iconColor: colors.dashboard.statPurple,
    valueColor: colors.dashboard.statPurple,
  },
  neutral: {
    backgroundColor: colors.dashboard.statNeutralSoft,
    iconColor: colors.dashboard.statNeutral,
    valueColor: colors.dashboard.statNeutral,
  },
};

export type DashboardOverviewStatConfig = {
  icon: SymbolViewProps["name"];
  id: string;
  label: string;
  tone: DashboardOverviewTone;
  value: number | string;
};

type DashboardOverviewStatProps = Omit<DashboardOverviewStatConfig, "id"> & {
  onPress?: () => void;
};

export function DashboardOverviewStat({
  icon,
  label,
  onPress,
  tone,
  value,
}: DashboardOverviewStatProps) {
  const toneStyle = toneStyles[tone] ?? toneStyles.neutral;

  const content = (
    <View style={[styles.card, { backgroundColor: toneStyle.backgroundColor }]}>
      <SymbolView name={icon} size={18} tintColor={toneStyle.iconColor} />
      <Text style={[styles.value, { color: toneStyle.valueColor }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [{ flex: 1, minWidth: "46%", maxWidth: "48%", opacity: pressed ? 0.88 : 1 }]}
      onPress={onPress}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    borderRadius: radius.xl,
    flex: 1,
    gap: spacing.sm,
    justifyContent: "center",
    minWidth: "46%",
    maxWidth: "48%",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  label: {
    color: colors.guard.textMuted,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
    textAlign: "center",
  },
  value: {
    fontSize: 32,
    fontWeight: "800",
    lineHeight: 36,
    textAlign: "center",
  },
});
