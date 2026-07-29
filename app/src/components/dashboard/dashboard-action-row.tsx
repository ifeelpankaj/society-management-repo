import { View, StyleSheet } from "react-native";

import {
  DashboardActionTile,
  type DashboardActionTileConfig,
} from "@/components/dashboard/dashboard-action-tile";
import { spacing } from "@/theme/spacing";

type DashboardActionRowProps = {
  actions: DashboardActionTileConfig[];
};

export function DashboardActionRow({ actions }: DashboardActionRowProps) {
  return (
    <View style={styles.row}>
      {actions.map((action) => (
        <View key={action.id} style={styles.tileSlot}>
          <DashboardActionTile
            icon={action.icon}
            subtitle={action.subtitle}
            title={action.title}
            tone={action.tone}
            onPress={action.onPress}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.md,
  },
  tileSlot: {
    flex: 1,
    minWidth: 0,
  },
});
