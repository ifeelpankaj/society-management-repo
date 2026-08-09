import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";

type VisitorLogSummaryStripProps = {
  checkedIn: number;
  checkedOut: number;
  pending: number;
};

function SummaryCard({
  label,
  tone,
  value,
}: {
  label: string;
  tone: "orange" | "green" | "neutral";
  value: number;
}) {
  const toneStyle =
    tone === "green"
      ? { bg: colors.dashboard.statGreenSoft, color: colors.dashboard.statGreen }
      : tone === "orange"
        ? { bg: colors.dashboard.statOrangeSoft, color: colors.dashboard.statOrange }
        : { bg: colors.dashboard.statNeutralSoft, color: colors.dashboard.statNeutral };

  return (
    <View style={[styles.card, { backgroundColor: toneStyle.bg }]}>
      <Text style={[styles.label, { color: toneStyle.color }]}>{label}</Text>
      <Text style={[styles.value, { color: toneStyle.color }]}>{value}</Text>
    </View>
  );
}

export function VisitorLogSummaryStrip({ checkedIn, checkedOut, pending }: VisitorLogSummaryStripProps) {
  return (
    <View style={styles.row}>
      <SummaryCard label="Pending" tone="orange" value={pending} />
      <SummaryCard label="Checked In" tone="green" value={checkedIn} />
      <SummaryCard label="Checked Out" tone="neutral" value={checkedOut} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    borderRadius: radius.lg,
    flex: 1,
    gap: 4,
    paddingVertical: spacing.md,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  value: {
    fontSize: 24,
    fontWeight: "800",
  },
});
