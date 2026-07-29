import { View, StyleSheet } from "react-native";

import {
  DashboardOverviewStat,
  type DashboardOverviewStatConfig,
} from "@/components/dashboard/dashboard-overview-stat";
import { spacing } from "@/theme/spacing";

type DashboardOverviewGridProps = {
  onStatPress?: (id: string) => void;
  stats: DashboardOverviewStatConfig[];
};

export function DashboardOverviewGrid({ onStatPress, stats }: DashboardOverviewGridProps) {
  return (
    <View style={styles.grid}>
      {stats.map((stat) => (
        <DashboardOverviewStat
          key={stat.id}
          icon={stat.icon}
          label={stat.label}
          tone={stat.tone}
          value={stat.value}
          onPress={onStatPress ? () => onStatPress(stat.id) : undefined}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
});
