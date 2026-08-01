import { Pressable, StyleSheet, Text, View } from "react-native";

import { Row } from "@/components/layout";
import { Button, Card } from "@/components/ui";
import type { ModelsVisitorEntry, ModelsVisitorPendingEntry, ModelsVisitorStatus } from "@/lib/api/generated-api";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";

import { formatDateTime, getFlatLabel, getVisitorName, titleize } from "../guard-utils";
import type { WaitingDurationTone } from "../guard-utils";

type VisitorEntryCardProps = {
  entry: ModelsVisitorEntry | ModelsVisitorPendingEntry;
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  onPress?: () => void;
  loading?: boolean;
  loadingEntryId?: number;
  waitingLabel?: string;
  waitingTone?: WaitingDurationTone;
};

function getVisitorStatusStyle(status?: ModelsVisitorStatus) {
  switch (status) {
    case "approved":
      return {
        backgroundColor: "#ecfdf5",
        borderColor: "#a7f3d0",
        color: "#065f46",
      };
    case "checked_in":
      return {
        backgroundColor: colors.guard.tealSoft,
        borderColor: "#99f6e4",
        color: "#115e59",
      };
    case "checked_out":
      return {
        backgroundColor: "#f1f5f9",
        borderColor: colors.border.default,
        color: colors.text.secondary,
      };
    case "waiting_approval":
      return {
        backgroundColor: colors.status.warningSoft,
        borderColor: "#fde68a",
        color: "#92400e",
      };
    case "rejected":
    case "cancelled":
    case "expired":
      return {
        backgroundColor: colors.status.errorSoft,
        borderColor: "#fecdd3",
        color: "#be123c",
      };
    default:
      return {
        backgroundColor: colors.surface.muted,
        borderColor: colors.border.default,
        color: colors.text.muted,
      };
  }
}

function waitingToneStyle(tone?: WaitingDurationTone) {
  switch (tone) {
    case "warning":
      return { backgroundColor: colors.status.warningSoft, borderColor: "#fde68a", color: colors.status.warning };
    case "error":
      return { backgroundColor: colors.status.errorSoft, borderColor: "#fecdd3", color: colors.status.error };
    default:
      return { backgroundColor: "#ecfdf5", borderColor: "#a7f3d0", color: colors.status.success };
  }
}

export function VisitorEntryCard({
  entry,
  loading,
  loadingEntryId,
  onPress,
  onPrimaryAction,
  onSecondaryAction,
  primaryActionLabel,
  secondaryActionLabel,
  waitingLabel,
  waitingTone,
}: VisitorEntryCardProps) {
  const isLoading = loading || loadingEntryId === entry.id;
  const statusStyle = getVisitorStatusStyle(entry.status);
  const waitStyle = waitingToneStyle(waitingTone);
  const hasActions = Boolean(primaryActionLabel || secondaryActionLabel);

  const header = (
    <View style={styles.header}>
      <View style={styles.copy}>
        <Text style={styles.visitorName}>{getVisitorName(entry)}</Text>
        <Text style={styles.visitDetail}>
          Visiting: {getFlatLabel(entry)}
          {entry.purpose ? ` · ${titleize(entry.purpose)}` : ""}
          {entry.delivery_partner ? ` · ${entry.delivery_partner}` : ""}
        </Text>
        <Text style={styles.timestamp}>
          {entry.expected_at
            ? `Expected ${formatDateTime(entry.expected_at)}`
            : entry.approved_at
              ? `Approved ${formatDateTime(entry.approved_at)}`
              : entry.created_at
                ? `Created ${formatDateTime(entry.created_at)}`
                : "Gate record"}
        </Text>
      </View>
      <View style={styles.badges}>
        {waitingLabel ? (
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: waitStyle.backgroundColor, borderColor: waitStyle.borderColor },
            ]}
          >
            <Text style={[styles.statusText, { color: waitStyle.color }]}>{waitingLabel}</Text>
          </View>
        ) : null}
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusStyle.backgroundColor, borderColor: statusStyle.borderColor },
          ]}
        >
          <Text style={[styles.statusText, { color: statusStyle.color }]}>
            {titleize(entry.status)}
          </Text>
        </View>
      </View>
    </View>
  );

  const body = (
    <>
      {onPress && hasActions ? (
        <Pressable accessibilityRole="button" onPress={onPress}>
          {header}
          {entry.notes ? <Text style={styles.notes}>{entry.notes}</Text> : null}
        </Pressable>
      ) : (
        <>
          {header}
          {entry.notes ? <Text style={styles.notes}>{entry.notes}</Text> : null}
        </>
      )}
    </>
  );

  const actions = hasActions ? (
    <Row align="center" gap="md" justify="flex-start">
      {secondaryActionLabel ? (
        <View style={styles.actionSlot}>
          <Button
            compact
            fullWidth
            title={secondaryActionLabel}
            variant="secondary"
            onPress={onSecondaryAction}
          />
        </View>
      ) : null}
      {primaryActionLabel ? (
        <View style={styles.actionSlot}>
          <Button
            compact
            fullWidth
            loading={isLoading}
            title={primaryActionLabel}
            onPress={onPrimaryAction}
          />
        </View>
      ) : null}
    </Row>
  ) : null;

  const card = (
    <Card style={styles.card}>
      {body}
      {actions}
    </Card>
  );

  if (onPress && !hasActions) {
    return (
      <Pressable accessibilityRole="button" onPress={onPress}>
        {card}
      </Pressable>
    );
  }

  return card;
}

const styles = StyleSheet.create({
  actionSlot: {
    flex: 1,
    minWidth: 0,
  },
  badges: {
    alignItems: "flex-end",
    gap: spacing.xs,
  },
  card: {
    gap: spacing.lg,
  },
  copy: {
    flex: 1,
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.lg,
    justifyContent: "space-between",
  },
  notes: {
    color: colors.text.secondary,
    fontSize: 14,
  },
  statusBadge: {
    borderRadius: radius["2xl"],
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  timestamp: {
    color: colors.text.muted,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  visitDetail: {
    color: colors.text.secondary,
    fontSize: 14,
    marginTop: spacing.xs,
  },
  visitorName: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: "700",
  },
});
