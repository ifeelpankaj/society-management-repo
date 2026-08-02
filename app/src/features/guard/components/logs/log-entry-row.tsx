import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  formatActivityTimestamp,
  formatDateOnly,
  formatTimeOfDay,
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

function TimeBlock({
  date,
  label,
  time,
}: {
  date?: string;
  label: string;
  time?: string;
}) {
  if (!date && !time) {
    return null;
  }

  return (
    <View style={styles.timeBlock}>
      <Text style={styles.timeBlockLabel}>{label}</Text>
      {date ? <Text style={styles.timeBlockDate}>{date}</Text> : null}
      {time ? <Text style={styles.timeBlockTime}>{time}</Text> : null}
    </View>
  );
}

export function LogEntryRow({ entry, isCheckingOut, onCheckOut, onPress }: LogEntryRowProps) {
  const statusMeta = getVisitorStatusMeta(entry.status);
  const timestamp = formatActivityTimestamp(
    entry.checked_out_at ?? entry.checked_in_at ?? entry.updated_at ?? entry.created_at,
  );
  const purpose = entry.purpose ? titleize(entry.purpose) : "Visitor";
  const hasTimeline = Boolean(entry.checked_in_at || entry.checked_out_at);
  const hasCheckoutAction = entry.status === "checked_in" && Boolean(onCheckOut);

  const timeline = hasTimeline ? (
    <View style={styles.timelineRow}>
      {entry.checked_in_at ? (
        <TimeBlock
          date={formatDateOnly(entry.checked_in_at)}
          label="Check-in"
          time={formatTimeOfDay(entry.checked_in_at)}
        />
      ) : null}
      {entry.checked_in_at && entry.checked_out_at ? <View style={styles.timelineDivider} /> : null}
      {entry.checked_out_at ? (
        <TimeBlock
          date={formatDateOnly(entry.checked_out_at)}
          label="Checkout"
          time={formatTimeOfDay(entry.checked_out_at)}
        />
      ) : null}
    </View>
  ) : (
    <Text style={styles.fallbackTime}>{timestamp || "—"}</Text>
  );

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
      {timeline}
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
