import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { SymbolView } from "expo-symbols";

import { DashboardSection } from "@/components/dashboard/dashboard-section";
import {
  formatActivityTimestamp,
  getFlatLabel,
  getVisitorName,
  getVisitorStatusMeta,
  titleize,
} from "@/features/guard/guard-utils";
import type { ModelsVisitorEntry } from "@/lib/api/generated-api";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { shadows } from "@/theme/shadows";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";

type DashboardActivityFeedProps = {
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  items: ModelsVisitorEntry[];
  onItemPress?: (entry: ModelsVisitorEntry) => void;
  onLoadMore: () => void;
  onViewAll: () => void;
  showFlat?: boolean;
  title?: string;
};

function ActivityPreviewCard({
  item,
  onPress,
  showFlat,
}: {
  item: ModelsVisitorEntry;
  onPress?: (entry: ModelsVisitorEntry) => void;
  showFlat: boolean;
}) {
  const name = getVisitorName(item);
  const statusMeta = getVisitorStatusMeta(item.status);
  const timestamp = formatActivityTimestamp(
    item.checked_out_at ?? item.checked_in_at ?? item.expected_at ?? item.created_at,
  );
  const purpose = item.purpose ? titleize(item.purpose) : "Visitor";
  const flatLabel = showFlat ? getFlatLabel(item) : null;
  const subtitle = [purpose, flatLabel, timestamp].filter(Boolean).join(" · ");

  const content = (
    <View style={styles.previewCard}>
      <View style={styles.previewAvatar}>
        <Text style={styles.previewAvatarText}>{name.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.previewCopy}>
        <Text numberOfLines={1} style={styles.previewName}>
          {name}
        </Text>
        <Text numberOfLines={2} style={styles.previewMeta}>
          {subtitle}
        </Text>
      </View>
      <View
        style={[
          styles.previewBadge,
          { backgroundColor: statusMeta.bg, borderColor: statusMeta.border },
        ]}
      >
        <Text style={[styles.previewBadgeText, { color: statusMeta.color }]}>
          {statusMeta.label}
        </Text>
      </View>
      <SymbolView
        name={{ ios: "chevron.right", android: "chevron_right", web: "chevron_right" }}
        size={14}
        tintColor={colors.guard.textMuted}
      />
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [pressed && styles.previewPressed]}
      onPress={() => onPress(item)}
    >
      {content}
    </Pressable>
  );
}

export function DashboardActivityFeed({
  hasMore,
  isLoading,
  isLoadingMore,
  items,
  onItemPress,
  onLoadMore,
  onViewAll,
  showFlat = false,
  title = "Today's Activity",
}: DashboardActivityFeedProps) {
  return (
    <DashboardSection actionLabel="View All" title={title} onAction={onViewAll}>
      <View style={styles.panel}>
        {isLoading && items.length === 0 ? (
          <View style={styles.centeredState}>
            <ActivityIndicator color={colors.guard.teal} size="small" />
          </View>
        ) : items.length === 0 ? (
          <View style={styles.centeredState}>
            <View style={styles.emptyIconWrap}>
              <SymbolView
                name={{ ios: "clock.fill", android: "schedule", web: "schedule" }}
                size={22}
                tintColor={colors.guard.teal}
              />
            </View>
            <Text style={styles.emptyTitle}>No activity yet today</Text>
            <Text style={styles.emptyText}>
              Visitor check-ins and movement will appear here as they happen.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {items.map((item) => (
              <ActivityPreviewCard
                key={`activity-${item.id}`}
                item={item}
                showFlat={showFlat}
                onPress={onItemPress}
              />
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
  centeredState: {
    alignItems: "center",
    gap: spacing.sm,
    justifyContent: "center",
    minHeight: 220,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing["2xl"],
  },
  emptyIconWrap: {
    alignItems: "center",
    backgroundColor: colors.guard.tealSoft,
    borderRadius: radius.full,
    height: 52,
    justifyContent: "center",
    marginBottom: spacing.sm,
    width: 52,
  },
  emptyText: {
    ...typography.bodySmall,
    color: colors.guard.textMuted,
    lineHeight: 20,
    textAlign: "center",
  },
  emptyTitle: {
    ...typography.subtitle,
    color: colors.text.primary,
    fontWeight: "700",
    textAlign: "center",
  },
  list: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
    paddingTop: spacing.xs,
  },
  loadingMore: {
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  loadMoreButton: {
    alignItems: "center",
    borderTopColor: colors.border.default,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: spacing.sm,
    paddingVertical: spacing.md,
  },
  loadMoreText: {
    color: colors.guard.teal,
    fontSize: 13,
    fontWeight: "600",
  },
  panel: {
    backgroundColor: colors.surface.card,
    borderRadius: radius["2xl"],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...shadows.card,
  },
  previewAvatar: {
    alignItems: "center",
    backgroundColor: colors.brand.orangeSoft,
    borderRadius: radius.full,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  previewAvatarText: {
    color: colors.brand.orange,
    fontSize: 18,
    fontWeight: "800",
  },
  previewBadge: {
    borderRadius: radius["2xl"],
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  previewBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  previewCard: {
    alignItems: "center",
    backgroundColor: colors.surface.secondary,
    borderColor: colors.border.default,
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  previewCopy: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  previewMeta: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  previewName: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: "700",
  },
  previewPressed: {
    opacity: 0.88,
  },
});
