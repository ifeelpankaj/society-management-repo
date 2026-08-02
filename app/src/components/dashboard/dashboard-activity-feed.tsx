import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { DashboardActivityRow } from "@/components/dashboard/dashboard-activity-row";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import {
  formatActivityTimestamp,
  getFlatLabel,
  getVisitorName,
  getVisitorStatusMeta,
  titleize,
} from "@/features/guard/guard-utils";
import { ACTIVITY_LIST_HEIGHT } from "@/features/shared/activity-feed-config";
import type { ModelsVisitorEntry } from "@/lib/api/generated-api";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { shadows } from "@/theme/shadows";
import { spacing } from "@/theme/spacing";

type DashboardActivityFeedProps = {
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  items: ModelsVisitorEntry[];
  onLoadMore: () => void;
  onViewAll: () => void;
  showFlat?: boolean;
  title?: string;
};

function ItemSeparator() {
  return <View style={styles.separator} />;
}

function ActivityRow({
  item,
  showFlat,
}: {
  item: ModelsVisitorEntry;
  showFlat: boolean;
}) {
  const name = getVisitorName(item);
  const statusMeta = getVisitorStatusMeta(item.status);
  const timestamp = formatActivityTimestamp(
    item.checked_out_at ?? item.checked_in_at ?? item.updated_at ?? item.created_at,
  );
  const purpose = item.purpose ? titleize(item.purpose) : "Visitor";
  const flatLabel = showFlat ? getFlatLabel(item) : null;
  const meta = [flatLabel, timestamp].filter(Boolean).join(" - ");

  return (
    <DashboardActivityRow
      meta={meta || purpose}
      name={name}
      statusBg={statusMeta.bg}
      statusBorder={statusMeta.border}
      statusColor={statusMeta.color}
      statusLabel={statusMeta.label}
    />
  );
}

export function DashboardActivityFeed({
  hasMore,
  isLoading,
  isLoadingMore,
  items,
  onLoadMore,
  onViewAll,
  showFlat = false,
  title = "Today's Activity",
}: DashboardActivityFeedProps) {
  return (
    <DashboardSection actionLabel="View All" title={title} onAction={onViewAll}>
      <View style={styles.panel}>
        {isLoading && items.length === 0 ? (
          <View style={styles.centeredList}>
            <ActivityIndicator color={colors.guard.teal} size="small" />
          </View>
        ) : items.length === 0 ? (
          <View style={styles.emptyList}>
            <Text style={styles.emptyText}>No entries for today.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {items.map((item, index) => (
              <View key={`activity-${item.id}`}>
                {index > 0 ? <ItemSeparator /> : null}
                <ActivityRow item={item} showFlat={showFlat} />
              </View>
            ))}
            {isLoadingMore ? (
              <View style={styles.loadingMore}>
                <ActivityIndicator color={colors.guard.teal} size="small" />
              </View>
            ) : hasMore ? (
              <Pressable
                accessibilityRole="button"
                style={styles.loadMoreButton}
                onPress={onLoadMore}
              >
                <Text style={styles.loadMoreText}>Load more</Text>
              </Pressable>
            ) : null}
          </View>
        )}
      </View>
    </DashboardSection>
  );
}

const styles = StyleSheet.create({
  centeredList: {
    alignItems: "center",
    height: ACTIVITY_LIST_HEIGHT,
    justifyContent: "center",
  },
  emptyList: {
    height: ACTIVITY_LIST_HEIGHT,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  emptyText: {
    color: colors.guard.textMuted,
    fontSize: 13,
    textAlign: "center",
  },
  list: {
    minHeight: ACTIVITY_LIST_HEIGHT,
  },
  loadingMore: {
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  loadMoreButton: {
    alignItems: "center",
    borderTopColor: "rgba(226, 232, 240, 0.8)",
    borderTopWidth: 1,
    paddingVertical: spacing.md,
  },
  loadMoreText: {
    color: colors.guard.teal,
    fontSize: 13,
    fontWeight: "600",
  },
  panel: {
    backgroundColor: colors.surface.card,
    borderRadius: radius.xl,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    ...shadows.card,
  },
  separator: {
    backgroundColor: "rgba(226, 232, 240, 0.6)",
    height: 1,
    marginLeft: 56,
  },
});
