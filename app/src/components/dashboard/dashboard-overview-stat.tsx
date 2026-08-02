import { Pressable, StyleSheet, Text, View } from "react-native";
import type { SymbolViewProps } from "expo-symbols";

import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

export type DashboardOverviewTone = "green" | "orange" | "blue" | "neutral";

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
  const toneStyle = toneStyles[tone];

  const content = (
    <View style={styles.card}>
      <View style={styles.container}>
        <Text style={[styles.value, { color: toneStyle.valueColor }]}>{value}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [styles.card, { opacity: pressed ? 0.88 : 1 }]}
      onPress={onPress}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: "46%",
  },
  container: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingVertical: spacing.sm,
    width: "100%",
  },

  value: {
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 34,
    textAlign: "center",
  },

  label: {
    color: colors.guard.textMuted,
    fontSize: 13,
    fontWeight: "500",
    marginTop: 2,
    textAlign: "center",
  },
});
