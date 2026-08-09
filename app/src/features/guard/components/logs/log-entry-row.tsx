import { Pressable, StyleSheet, Text, View } from "react-native";

import { VisitorTimelineRow } from "@/features/visitors/components/visitor-timeline-row";
import {
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

type LogEntryRowProps = {
  entry: ModelsVisitorEntry;
  isCheckingOut?: boolean;
  onCheckOut?: () => void;
  onPress?: () => void;
};

export function LogEntryRow({ entry, isCheckingOut, onCheckOut, onPress }: LogEntryRowProps) {
  const statusMeta = getVisitorStatusMeta(entry.status);
  const purpose = entry.purpose ? titleize(entry.purpose) : "Visitor";
  const hasCheckoutAction = entry.status === "checked_in" && Boolean(onCheckOut);

  const mainContent = (
    <>
      <View style={styles.titleRow}>
        <View style={styles.titleCopy}>
          <Text numberOfLines={1} style={styles.name}>
            {getVisitorName(entry)}
          </Text>
          <Text numberOfLines={1} style={styles.meta}>
            {purpose} · {getFlatLabel(entry)}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusMeta.bg, borderColor: statusMeta.border }]}>
          <Text style={[styles.statusText, { color: statusMeta.color }]}>{statusMeta.label}</Text>
        </View>
      </View>
      <VisitorTimelineRow entry={entry} />
    </>
  );

  return (
    <View style={styles.card}>
      {onPress ? (
        <Pressable
          accessibilityRole="link"
          style={({ pressed }) => [styles.detailPressable, pressed && styles.cardPressed]}
          onPress={onPress}
        >
          {mainContent}
        </Pressable>
      ) : (
        mainContent
      )}

      {hasCheckoutAction ? (
        <Pressable
          accessibilityRole="button"
          disabled={isCheckingOut}
          style={({ pressed }) => [styles.checkoutButton, pressed && styles.checkoutButtonPressed]}
          onPress={onCheckOut}
        >
          <Text style={styles.checkoutText}>{isCheckingOut ? "Checking out..." : "Check out"}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function LogEntryDivider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface.card,
    borderColor: colors.border.default,
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.md,
    padding: spacing.lg,
    ...shadows.card,
  },
  cardPressed: {
    opacity: 0.92,
  },
  checkoutButton: {
    alignItems: "center",
    backgroundColor: colors.brand.orangeSoft,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm,
  },
  checkoutButtonPressed: {
    opacity: 0.88,
  },
  checkoutText: {
    ...typography.bodySmall,
    color: colors.brand.orange,
    fontWeight: "700",
  },
  detailPressable: {
    gap: spacing.md,
  },
  divider: {
    height: spacing.sm,
  },
  fallbackTime: {
    ...typography.caption,
    color: colors.text.muted,
  },
  meta: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  name: {
    ...typography.subtitle,
    color: colors.text.primary,
    fontWeight: "700",
  },
  statusBadge: {
    borderRadius: radius["2xl"],
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  timeBlock: {
    alignItems: "center",
    backgroundColor: colors.dashboard.actionNeutralSoft,
    borderRadius: radius.lg,
    flex: 1,
    gap: 2,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
  },
  timeBlockDate: {
    ...typography.bodySmall,
    color: colors.text.primary,
    fontWeight: "700",
    textAlign: "center",
  },
  timeBlockLabel: {
    ...typography.caption,
    color: colors.text.muted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.6,
    textAlign: "center",
    textTransform: "uppercase",
  },
  timeBlockTime: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: "600",
    textAlign: "center",
  },
  timelineDivider: {
    alignSelf: "stretch",
    backgroundColor: colors.border.default,
    marginVertical: spacing.sm,
    width: StyleSheet.hairlineWidth,
  },
  timelineRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  titleCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  titleRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.sm,
  },
});
