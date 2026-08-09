import { StyleSheet, Text, View } from "react-native";

import {
  getVisitorTimelineBlocks,
  type VisitorTimelineBlock,
} from "@/features/guard/guard-utils";
import type { ModelsVisitorEntry, ModelsVisitorPendingEntry } from "@/lib/api/generated-api";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";

type VisitorTimelineRowProps = {
  entry: ModelsVisitorEntry | ModelsVisitorPendingEntry;
  blocks?: VisitorTimelineBlock[];
};

function TimelineBlock({ block }: { block: VisitorTimelineBlock }) {
  if (!block.date && !block.time) {
    return null;
  }

  return (
    <View style={styles.block}>
      <Text style={styles.blockLabel}>{block.label}</Text>
      {block.date ? <Text style={styles.blockDate}>{block.date}</Text> : null}
      {block.time ? <Text style={styles.blockTime}>{block.time}</Text> : null}
    </View>
  );
}

export function VisitorTimelineRow({ blocks, entry }: VisitorTimelineRowProps) {
  const timeline = blocks ?? getVisitorTimelineBlocks(entry);

  if (timeline.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>No visit times recorded yet.</Text>
      </View>
    );
  }

  return (
    <View style={styles.row}>
      {timeline.map((block, index) => (
        <View key={`${block.label}-${index}`} style={styles.blockWrap}>
          <TimelineBlock block={block} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    alignItems: "center",
    backgroundColor: colors.surface.card,
    borderColor: colors.border.default,
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  blockDate: {
    ...typography.bodySmall,
    color: colors.text.primary,
    fontWeight: "700",
    textAlign: "center",
  },
  blockLabel: {
    ...typography.caption,
    color: colors.text.muted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    textAlign: "center",
    textTransform: "uppercase",
  },
  blockTime: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: "600",
    textAlign: "center",
  },
  blockWrap: {
    flex: 1,
    minWidth: 0,
  },
  emptyState: {
    alignItems: "center",
    backgroundColor: colors.surface.secondary,
    borderRadius: radius.xl,
    paddingVertical: spacing.lg,
  },
  emptyText: {
    ...typography.bodySmall,
    color: colors.text.muted,
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
  },
});
