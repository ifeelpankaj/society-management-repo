import { Pressable, StyleSheet, Text, View } from "react-native";
import { SymbolView } from "expo-symbols";
import type { SymbolViewProps } from "expo-symbols";

import { Row } from "@/components/layout";
import { colors } from "@/theme/colors";
import { layout } from "@/theme/layout";
import { radius } from "@/theme/radius";
import { shadows } from "@/theme/shadows";
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
    <Row align="center" gap="md" justify="flex-start" style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: toneStyle.backgroundColor }]}>
        <SymbolView name={icon} size={20} tintColor={toneStyle.iconColor} />
      </View>
      <View style={styles.copy}>
        <Text style={[styles.value, { color: toneStyle.valueColor }]}>{value}</Text>
        <Text numberOfLines={2} style={styles.label}>
          {label}
        </Text>
      </View>
    </Row>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [{ flex: 1, minWidth: "46%", opacity: pressed ? 0.88 : 1 }]}
      onPress={onPress}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface.card,
    borderRadius: radius.xl,
    flex: 1,
    minHeight: layout.overviewStatMinHeight,
    minWidth: "46%",
    padding: spacing.lg,
    ...shadows.sm,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  iconWrap: {
    alignItems: "center",
    borderRadius: 999,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  label: {
    color: colors.guard.textMuted,
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 16,
  },
  value: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
    lineHeight: 32,
  },
});
