import { StyleSheet, Text, View } from "react-native";
import { SymbolView } from "expo-symbols";

import { Stack } from "@/components/layout";
import { Card } from "@/components/ui";
import {
  formatDateTime,
  getFlatLabel,
  getVisitorDetailRows,
  getVisitorName,
  getVisitorStatusContextMessage,
  getVisitorStatusMeta,
  isVisitorCheckoutOverdue,
  titleize,
} from "@/features/guard/guard-utils";
import { VisitorTimelineRow } from "@/features/visitors/components/visitor-timeline-row";
import type { ModelsVisitorEntry, ModelsVisitorPendingEntry } from "@/lib/api/generated-api";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { shadows } from "@/theme/shadows";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";

type VisitorDetailsCardProps = {
  entry: ModelsVisitorEntry | ModelsVisitorPendingEntry;
  showTimeline?: boolean;
  variant?: "default" | "sheet";
};

function DetailListRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailRowLabel}>{label}</Text>
      <Text style={styles.detailRowValue}>{value}</Text>
    </View>
  );
}

export function VisitorDetailsCard({
  entry,
  showTimeline = true,
  variant = "default",
}: VisitorDetailsCardProps) {
  const statusMeta = getVisitorStatusMeta(entry.status);
  const detailRows = getVisitorDetailRows(entry);
  const contextMessage = getVisitorStatusContextMessage(entry);
  const checkoutOverdue = isVisitorCheckoutOverdue(entry);
  const visitorName = getVisitorName(entry);
  const purposeLabel = entry.purpose ? titleize(entry.purpose) : "Visitor";

  return (
    <Card style={[styles.card, variant === "sheet" && styles.cardSheet]}>
      <View style={styles.hero}>
        <View style={styles.avatarRing}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{visitorName.charAt(0).toUpperCase()}</Text>
          </View>
        </View>

        <Stack align="center" gap="xs" style={styles.heroCopy}>
          <Text style={styles.name}>{visitorName}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusMeta.bg, borderColor: statusMeta.border },
            ]}
          >
            <Text style={[styles.statusText, { color: statusMeta.color }]}>{statusMeta.label}</Text>
          </View>
          {checkoutOverdue ? (
            <View style={[styles.statusBadge, styles.overdueBadge]}>
              <Text style={styles.overdueText}>Overdue checkout</Text>
            </View>
          ) : null}
          <Text style={styles.meta}>
            {purposeLabel} · {getFlatLabel(entry)}
          </Text>
          {entry.created_at ? (
            <Text style={styles.subtle}>Created {formatDateTime(entry.created_at)}</Text>
          ) : null}
        </Stack>
      </View>

      {contextMessage ? (
        <View
          style={[
            styles.contextBanner,
            entry.status === "expired" || entry.status === "rejected"
              ? styles.contextBannerMuted
              : checkoutOverdue
                ? styles.contextBannerWarning
                : styles.contextBannerInfo,
          ]}
        >
          <SymbolView
            name={{
              ios: "info.circle.fill",
              android: "info",
              web: "info",
            }}
            size={16}
            tintColor={
              entry.status === "expired" || entry.status === "rejected"
                ? colors.status.error
                : checkoutOverdue
                  ? colors.status.warning
                  : colors.guard.teal
            }
          />
          <Text style={styles.contextText}>{contextMessage}</Text>
        </View>
      ) : null}

      {detailRows.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Visitor details</Text>
          <View style={styles.detailList}>
            {detailRows.map((row) => (
              <DetailListRow key={row.label} label={row.label} value={row.value} />
            ))}
          </View>
        </View>
      ) : null}

      {showTimeline ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Visit timeline</Text>
          <VisitorTimelineRow entry={entry} />
        </View>
      ) : null}

      {entry.notes ? (
        <View style={styles.notesBox}>
          <Text style={styles.notesLabel}>Notes</Text>
          <Text style={styles.notesValue}>{entry.notes}</Text>
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: "center",
    backgroundColor: colors.surface.card,
    borderRadius: radius.full,
    height: 72,
    justifyContent: "center",
    width: 72,
  },
  avatarRing: {
    alignItems: "center",
    backgroundColor: colors.brand.orangeSoft,
    borderRadius: radius.full,
    padding: 4,
  },
  avatarText: {
    color: colors.brand.orange,
    fontSize: 28,
    fontWeight: "800",
  },
  card: {
    gap: spacing["2xl"],
    padding: spacing["2xl"],
    ...shadows.card,
  },
  cardSheet: {
    padding: spacing.xl,
  },
  contextBanner: {
    alignItems: "flex-start",
    borderRadius: radius.xl,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  contextBannerInfo: {
    backgroundColor: colors.guard.tealSoft,
    borderColor: "#99f6e4",
  },
  contextBannerMuted: {
    backgroundColor: colors.status.errorSoft,
    borderColor: "#fecaca",
  },
  contextBannerWarning: {
    backgroundColor: colors.status.warningSoft,
    borderColor: "#fde68a",
  },
  contextText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    flex: 1,
    lineHeight: 20,
  },
  detailList: {
    backgroundColor: colors.surface.secondary,
    borderColor: colors.border.default,
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  detailRow: {
    borderBottomColor: colors.border.default,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 4,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  detailRowLabel: {
    ...typography.caption,
    color: colors.text.muted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  detailRowValue: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: "600",
  },
  hero: {
    alignItems: "center",
    gap: spacing.lg,
  },
  heroCopy: {
    alignItems: "center",
  },
  meta: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    textAlign: "center",
  },
  name: {
    ...typography.title,
    color: colors.text.primary,
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
  },
  notesBox: {
    backgroundColor: colors.brand.orangeSoft,
    borderRadius: radius.xl,
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  notesLabel: {
    color: colors.brand.orange,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  notesValue: {
    ...typography.body,
    color: colors.text.primary,
    lineHeight: 22,
  },
  overdueBadge: {
    backgroundColor: colors.status.warningSoft,
    borderColor: "#fde68a",
  },
  overdueText: {
    color: colors.status.warning,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    ...typography.eyebrow,
    color: colors.text.muted,
    fontSize: 11,
  },
  statusBadge: {
    borderRadius: radius["2xl"],
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  subtle: {
    ...typography.caption,
    color: colors.text.muted,
    textAlign: "center",
  },
});
