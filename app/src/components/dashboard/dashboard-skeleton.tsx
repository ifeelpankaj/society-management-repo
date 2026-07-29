import { StyleSheet, View, type ViewStyle } from "react-native";

import { Row, Stack } from "@/components/layout";
import { colors } from "@/theme/colors";
import { layout } from "@/theme/layout";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";

type DashboardSkeletonSection = "header" | "actions" | "stats" | "activity";

type DashboardSkeletonProps = {
  sections?: DashboardSkeletonSection[];
};

function Skeleton({ style }: { style?: ViewStyle }) {
  return <View style={[styles.skeleton, style]} />;
}

export function DashboardSkeleton({
  sections = ["header", "actions", "stats", "activity"],
}: DashboardSkeletonProps) {
  return (
    <Stack gap="2xl">
      {sections.includes("header") ? (
        <Stack gap="lg">
          <Row justify="space-between">
            <Skeleton style={styles.skeletonBrand} />
            <Row gap="md">
              <Skeleton style={styles.skeletonIconButton} />
              <Skeleton style={styles.skeletonIconButton} />
            </Row>
          </Row>
          <Skeleton style={styles.skeletonGreeting} />
          <Skeleton style={styles.skeletonTitle} />
          <Skeleton style={styles.skeletonHero} />
        </Stack>
      ) : null}

      {sections.includes("actions") ? (
        <Stack gap="lg">
          <Skeleton style={styles.skeletonSectionTitle} />
          <Row gap="md" wrap>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} style={styles.skeletonActionTile} />
            ))}
          </Row>
        </Stack>
      ) : null}

      {sections.includes("stats") ? (
        <Stack gap="lg">
          <Skeleton style={styles.skeletonSectionTitle} />
          <Row gap="md" wrap>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} style={styles.skeletonStatTile} />
            ))}
          </Row>
        </Stack>
      ) : null}

      {sections.includes("activity") ? (
        <Stack gap="lg">
          <Skeleton style={styles.skeletonSectionTitle} />
          <Stack gap="md" style={styles.skeletonPanel}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} style={styles.skeletonActivityRow} />
            ))}
          </Stack>
        </Stack>
      ) : null}
    </Stack>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: "rgba(226, 232, 240, 0.7)",
    borderRadius: radius.sm,
  },
  skeletonActionTile: {
    borderRadius: radius.xl,
    flex: 1,
    height: layout.actionTileMinHeight,
    minWidth: "46%",
  },
  skeletonActivityRow: {
    height: 56,
    width: "100%",
  },
  skeletonBrand: {
    borderRadius: radius.sm,
    height: 28,
    width: 120,
  },
  skeletonGreeting: {
    height: 16,
    width: 160,
  },
  skeletonHero: {
    borderRadius: radius.xl,
    height: 72,
    width: "100%",
  },
  skeletonIconButton: {
    borderRadius: 20,
    height: 40,
    width: 40,
  },
  skeletonPanel: {
    backgroundColor: colors.surface.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
  skeletonSectionTitle: {
    height: 14,
    width: 112,
  },
  skeletonStatTile: {
    borderRadius: radius.xl,
    flex: 1,
    height: layout.overviewStatMinHeight,
    minWidth: "46%",
  },
  skeletonTitle: {
    height: 28,
    width: 224,
  },
});
